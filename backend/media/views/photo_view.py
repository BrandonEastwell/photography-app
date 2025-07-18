import logging
import types
import uuid
from datetime import datetime

import environ
import exifread
from django.contrib.auth import get_user_model
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.http import JsonResponse, HttpResponseNotAllowed
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from photoapp.middleware.auth_middleware import JWTAuthenticationMiddleware
from ..lib.PhotoManager import PhotoService
from ..lib.helpers import get_search_point, get_filters, _convert_to_degrees

from ..models import Photo, Camera, Lens

env = environ.Env()
User = get_user_model()

@method_decorator(csrf_exempt, name='dispatch')
class ImageView(View):
    def post(self, req):
        return image_upload(req)

    def get(self, req):
        return image_search(req)

# URL params e.g. /images?sort_by=trending&sort_by_time=this_week&location=44.4647452,7.3553838&limit=20&page=1
def image_search(req):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    SORT_FIELD_OPTIONS = [
        "relevance",
        "trending"
    ]

    message_response = None
    sort_by = req.GET.get("sort_by") if SORT_FIELD_OPTIONS.count(req.GET.get("sort_by")) == 1 else "relevance"
    items_limit = int(req.GET.get("limit")) if req.GET.get("limit") is not None else 20
    search_point = get_search_point(req.GET.get("location")) if req.GET.get("location") is not None else None
    time_period = req.GET.get("sort_by_time")

    try:
        primary_qs = Photo.objects # Base query set

        # Filter photos by time period
        time_filtered = PhotoService.filter_by_time(primary_qs, time_period)
        primary_qs = time_filtered

        # Filter photos by EXIF data
        search_filters = get_filters(req)
        primary_qs = PhotoService.filter_by_exif(primary_qs, search_filters) if search_filters else primary_qs

        # Calculate distances from geo point
        primary_qs = primary_qs.annotate(distance=Distance("location", search_point)) if search_point else primary_qs

        fallback_qs = None
        if primary_qs.count() < items_limit:
            message_response = "We couldn't find much, I hope you like what we found instead.."
            fallback_qs = PhotoService.sort_by_exif(time_filtered, search_filters, search_point)


        if sort_by == "relevance":
            if search_point:
                primary_qs = primary_qs.order_by("-distance")
            # TODO if no location given, recommend based on users gear
        elif sort_by == "trending":
            # TODO Track votes and views in given time period
            if search_point:
                primary_qs = primary_qs.order_by("-total_votes", "distance")


        if fallback_qs:
            # Merge the fallback set to the original query set
            primary_ids = set(primary_qs.values_list("id", flat=True))
            fallback_qs = fallback_qs.exclude(id__in=primary_ids)
            primary_qs = list(primary_qs) + list(fallback_qs)

        images = primary_qs[:items_limit]
        images_serialized = [
            {
                "user_id": image.user.id,
                "relevance_score": image.relevance if hasattr(image, "relevance") else None,
                "image_url": image.image.url,
                "distance": str(image.distance) if hasattr(image, "distance") and image.distance is not None else None,
                "camera_model": image.camera.model,
                "camera_make": image.camera.make,
                "lens": image.lens.model if not types.NoneType else None,
                "ISO": image.ISO if not None else None,
                "shutter_speed": image.shutter_speed if not None else None,
                "focal_length": image.focal_length if not None else None,
                "votes": image.total_votes
            }
            for image in images
        ]

        results = {
            "message": message_response,
            "items": len(images_serialized),
            "results": images_serialized
        }

        return JsonResponse(results, safe=False, status=200)
    except Exception as e:
        logging.exception(e)
        JsonResponse({ "error": "Could not find any results at this time." }, status=500)

@JWTAuthenticationMiddleware
def image_upload(req):
    if req.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    user_id = req.user_id
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({ "error": "Your account does not exist." }, status=400)

    image_file = req.FILES.get('image') if req.FILES.get('image') is not None else req.POST.get('image')
    if image_file is None:
        return JsonResponse({ "error": "Please upload a photo" }, status=400)

    try:
        required_tags = ["Make", "Model", "GPSLatitude", "GPSLongitude"]
        image_tags = {
            "Make": None,
            "Model": None,
            "LensModel": None,
            "FocalLength": None,
            "Flash": None,
            "FNumber": None,
            "GPSLatitude": None,
            "GPSLongitude": None,
            "ISOSpeedRatings": None,
            "ShutterSpeedValue": None,
            "DateTimeOriginal": None,
        }

        for tag in image_tags:
            if req.POST.get(tag) != 'undefined' and not None:
                image_tags[tag] = req.POST.get(tag)

        if image_tags["GPSLatitude"] and image_tags["GPSLongitude"] is not None and not float:
            image_tags["GPSLongitude"] = _convert_to_degrees(image_tags["GPSLongitude"])
            image_tags["GPSLatitude"] = _convert_to_degrees(image_tags["GPSLatitude"])

        missing_tags = []
        for tag in required_tags:
            if image_tags[tag] is None:
                image_tags[tag] = req.POST.get(tag) if not None else missing_tags.append(tag)


        if len(missing_tags) > 0:
            return JsonResponse( { "missing_tags": missing_tags, "error": "Missing tags from image" }, status=400 )

        camera, _ = Camera.objects.get_or_create(model=image_tags["Model"], defaults={"make": image_tags["Make"]})

        lens = None
        if image_tags["LensModel"]:
            lens, _ = Lens.objects.get_or_create(model=image_tags["LensModel"])

        # Rename file with random UUID
        ext = str(image_file).split(".")[1]
        image_file.name = fr"{uuid.uuid4().hex}.{ext}"

        Photo.objects.create(user_id=user.id, image=image_file, location=Point(float(image_tags["GPSLongitude"]), float(image_tags["GPSLatitude"]), srid=4326),
                             camera=camera, lens=lens, f_stop=image_tags['FNumber'], flash=image_tags['Flash'] not in (0, None),
                             focal_length = image_tags['FocalLength'], ISO = image_tags['ISOSpeedRatings'],
                             taken_at = timezone.make_aware(datetime.strptime(str(image_tags['DateTimeOriginal']), "%Y:%m:%d %H:%M:%S"))
                             if image_tags['DateTimeOriginal'] is not None else None,
                             shutter_speed = image_tags['ShutterSpeedValue'])

        return JsonResponse({ "message": "Photo successfully uploaded" }, status=200)
    except Exception as e:
        logging.exception(e)
        return JsonResponse({ "error": "Could not upload photo at this time." }, status=500)



