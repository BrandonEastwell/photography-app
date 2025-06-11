import logging
import types
import uuid
from datetime import datetime, timedelta

import environ
import exifread
from django.contrib.auth import get_user_model
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point
from django.contrib.gis.measure import D
from django.db.models import Case, When, Value, Q, Sum, IntegerField
from django.http import JsonResponse, HttpResponseNotAllowed
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from photoapp.middleware.auth_middleware import JWTAuthenticationMiddleware

from ..models import Photo, Camera, Lens

env = environ.Env()
User = get_user_model()

def get_location(coordinates):
    if coordinates is None:
        return JsonResponse( { "error": "You must provide a location" }, status=404 )

    lat_str, lon_str = coordinates.split(",")
    lat = float(lat_str.strip())
    lon = float(lon_str.strip())

    return Point(lon, lat, srid=4326)

def filter_media_by_time(query_set, time_period):
    SORT_FIELDS_TIME = {
        "today": datetime.now() - timedelta(days=1),
        "this_week": datetime.now() - timedelta(weeks=1),
        "this_month": datetime.now() - timedelta(weeks=4),
        "this_year": datetime.now() - timedelta(weeks=56),
    }

    # Sort photos by time period
    time = SORT_FIELDS_TIME[time_period]
    if time:
        query_set = query_set.filter(uploaded_at__gte=time)
        return query_set

def get_filters_from_url(req):
    # TODO Filter options need to be sanitized + check if lens and camera exist in DB (predefined options)
    filter_options = {
        "camera__model": req.GET.get("camera"),
        "lens__model": req.GET.get("lens"),
        "ISO": req.GET.get("ISO"),
        "shutter_speed": req.GET.get("shutter_speed"),
        "focal_length": req.GET.get("focal_length"),
        "flash": req.GET.get("flash"),
        "aperture": req.GET.get("aperture")
    }

    return filter_options

def sort_media_by_exif(query_set, filters):
    # Sort photos by EXIF data
    conditions = []
    for field, value in filters.items():
        if value:
            if field == "camera__model":
                conditions.append(When(Q(camera__model=value), then=Value(4)))
            elif field == "lens__model":
                conditions.append(When(Q(lens__model=value), then=Value(4)))
            elif field == "ISO":
                # ISO Bucket match
                conditions.append(When(Q(ISO__lte=value+100) & Q(ISO__gte=value-100), then=value(3)))
            elif field == "focal_length":
                conditions.append(When(Q(focal_length=value), then=Value(3)))
            elif field == "shutter_speed":
                # ISO Bucket match
                conditions.append(When(Q(shutter_speed__lte=value+(value/2)) & Q(shutter_speed__gte=value-(value/2)), then=value(2)))
            else:
                conditions.append(When(Q(**{field: value}), then=Value(1)))

    if conditions:
        query_set.annotate(relevance=Sum(
            Case(*conditions, output_field=IntegerField())
        ))
        return query_set.order_by("-relevance", "-total_votes")

@method_decorator(csrf_exempt, name='dispatch')
class ImagesView(View):
    def post(self, req):
        return image_upload(req)

    def get(self, req):
        return image_search(req)

# URL params e.g. /images?sort_by_popularity=trending&sort_by_time=this_week&location=44.4647452,7.3553838&limit=20&page=1
def image_search(req):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    SORT_FIELDS_POPULARITY = {
        "relevance",
        "trending",
        "top",
    }

    items_limit = int(req.GET.get("limit"))
    query_set = Photo.objects.all()

    # Sort photos by location
    search_point = get_location(req.GET.get("location"))
    if search_point:
        query_set = query_set.annotate(distance=Distance("location", search_point))

    # Filter photos by time period
    time_period = req.GET.get("sort_by_time")
    query_set = filter_media_by_time(query_set, time_period)

    # Sort photos by EXIF data
    #filter_options = get_filters_from_url(req)
    #query_set = sort_media_by_exif(query_set, filter_options)

    images = query_set.all()[:items_limit]
    images_serialized = [
        {
            "user_id": image.user_id.id,
            "image_url": image.image.url,
            "camera_model": image.camera.camera_model,
            "camera_make": image.camera.camera_make,
            "lens": image.lens.lens_model if not types.NoneType else None,
            "ISO": image.ISO if not None else None,
            "shutter_speed": image.shutter_speed if not None else None,
            "focal_length": image.focal_length if not None else None,
            "votes": image.total_votes
        }
        for image in images
    ]

    results = {
        "items": len(images_serialized),
        "results": images_serialized
    }

    return JsonResponse(results, safe=False, status=200)

def _convert_to_degrees(value):
    # Each value is a Ratio object (ex: 52/1, 30/1)
    d = float(value[0].num) / float(value[0].den)
    m = float(value[1].num) / float(value[1].den)
    s = float(value[2].num) / float(value[2].den)
    return d + (m / 60.0) + (s / 3600.0)

@JWTAuthenticationMiddleware
def image_upload(req):
    if req.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    user_id = req.user_id
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return JsonResponse({ "error": "Your account does not exist." }, status=400)

    image_file = req.FILES.get('image')
    if image_file is None:
        return JsonResponse({ "error": "Please upload a photo" }, status=400)

    try:
        tags = exifread.process_file(image_file.file)

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
            "ExifImageWidth": None,
            "ExifImageHeight": None
        }

        for tag_id in tags:
            tag_name = tag_id.split(" ")[1]
            if tag_name in image_tags:
                if tag_name == "ISOSpeedRatings" or "FocalLength":
                    image_tags[tag_name] = tags[tag_id].values[0] if isinstance(tags[tag_id].values, list) else tags[tag_id].values
                elif tag_name == "FocalLength":
                    image_tags[tag_name] = tags[tag_id].values[0] if isinstance(tags[tag_id].values, list) else tags[tag_id].values
                else:
                    image_tags[tag_name] = tags[tag_id]

        if image_tags["GPSLatitude"] and image_tags["GPSLongitude"] is not None:
            image_tags["GPSLongitude"] = _convert_to_degrees(image_tags["GPSLongitude"])
            image_tags["GPSLatitude"] = _convert_to_degrees(image_tags["GPSLatitude"])
        else:
            # Falls back to user uploaded GPS location
            image_tags["GPSLongitude"] = req.POST.get("lon")
            image_tags["GPSLatitude"] = req.POST.get("lat")

        missing_tags = []
        for tag in required_tags:
            if image_tags[tag] is None:
                missing_tags.append(tag)

        if len(missing_tags) > 0:
            return JsonResponse( { "missing_tags": missing_tags, "error": "Missing tags from image" }, status=400 )

        camera, _ = Camera.objects.get_or_create(camera_model=image_tags["Model"], defaults={"camera_make": image_tags["Make"]})

        lens = None
        if image_tags["LensModel"]:
            lens, _ = Lens.objects.get_or_create(lens_model=image_tags["LensModel"])

        # Rename file with random UUID
        ext = str(image_file).split(".")[1]
        image_file.name = fr"{uuid.uuid4().hex}.{ext}"

        Photo.objects.create(user_id=user, image=image_file, location=Point(float(image_tags["GPSLongitude"]), float(image_tags["GPSLatitude"]), srid=4326),
                             camera=camera, lens=lens, f_stop=image_tags['FNumber'], flash=image_tags['Flash'] not in (0, None),
                             focal_length = image_tags['FocalLength'], ISO = image_tags['ISOSpeedRatings'],
                             taken_at = timezone.make_aware(datetime.strptime(str(image_tags['DateTimeOriginal']), "%Y:%m:%d %H:%M:%S")),
                             shutter_speed = image_tags['ShutterSpeedValue'])

        return JsonResponse({ "message": "Photo successfully uploaded" }, status=200)
    except Exception as e:
        logging.exception(e)
        return JsonResponse({ "error": "Could not upload photo at this time." }, status=500)



