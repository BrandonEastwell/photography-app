from datetime import datetime, timedelta
import jwt
from django.db.models import Case, When, Value, Q, Sum, IntegerField
from django.http import JsonResponse, HttpRequest, HttpResponseNotAllowed
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from django.views import View
from django.contrib.gis.measure import D

from backend.photoapp.media.models import Photo, Camera, Lens
from django.contrib.gis.geos import Point, MultiPoint

import environ
env = environ.Env()


class ImagesView(View):
    def post(self, req):
        image_upload(req)

    # URL params e.g. /images?sort_by_popularity=trending&sort_by_time=this_week&filters=true&location=44.4647452,7.3553838&limit=20&page=1
    def get(self, req):
        SORT_FIELDS_TIME = {
            "this_week": datetime.now() - timedelta(weeks=1),
            "this_month": datetime.now() - timedelta(weeks=4),
            "this_year": datetime.now() - timedelta(weeks=56),
        }
        SORT_FIELDS_POPULARITY = {
            "trending",
            "top",
        }

        filters = req.GET.get("filters")
        if not filters:
            # if no filters applied, return content based on users gear
            # if no user gear found, return any content

        items_limit = req.GET.get("limit")
        images = Photo.objects.all()

        # Sort photos by location
        location = get_location(req.GET.get("location")),
        if location:
            max_distance = 1000
            distance = 2
            while distance < max_distance:
                images = Photo.objects.filter(location__distance_lte=(location, D(m=distance)))
                if images.count() >= items_limit:
                    break
                distance *= 2

        # Sort photos by time period
        sort_by_time = req.GET.get("sort_by_time")
        time = SORT_FIELDS_TIME[sort_by_time]
        if time:
            images = images.filter(uploaded_at__gte=time)


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

        conditions = []
        for field, value in filter_options.items():
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
            images.annotate(relevance=Sum(
                Case(*conditions, output_field=IntegerField())
            )).order_by("-relevance")






def get_location(coordinates):
    if coordinates is None:
        return JsonResponse( { "error": "You must have a location set" }, status=404 )

    lat_str, lon_str = coordinates.split(",")
    latitude = float(lat_str.strip())
    longitude = float(lon_str.strip())

    return Point(latitude, longitude)



def image_upload(req):
    encoded_jwt = req.COOKIES.get("AUTH_TOKEN")
    if encoded_jwt is None:
        return JsonResponse( { "error": "You must be logged in to upload photos" }, status=404 )

    user_data = jwt.decode(encoded_jwt, env("JWT_SECRET"), algorithms=["HS256"])
    if user_data["user_id"] is None:
        return JsonResponse( { "error": "You must be logged in to upload photos" }, status=404 )

    image_file = req.FILES.get('image')
    image = Image.open(image_file)
    exif_data = image.getexif()

    required_tags = ["Make", "Model", "GPSInfo"]
    image_tags = {
        "Make": None,
        "Model": None,
        "LensModel": None,
        "FocalLength": None,
        "Flash": None,
        "FNumber": None,
        "GPSInfo": None,
        "ISOSpeedRatings": None,
        "ApertureValue": None,
        "ShutterSpeedValue": None,
        "DateTimeOriginal": None,
        "ExifImageWidth": None,
        "ExifImageHeight": None
    }

    for tag_id in exif_data:
        tag_name = TAGS.get(tag_id, tag_id)
        tag_value = exif_data.get(tag_id)
        if image_tags.get(tag_name) is not None:
            image_tags[tag_name] = tag_value

    missing_tags = []
    for tag in required_tags:
        if image_tags[tag] is None:
            missing_tags.append(tag)

    if len(missing_tags) > 0:
        return JsonResponse( { "missing_tags": missing_tags, "error": "Missing tags from image" }, status=400 )

    gps_info = {}
    for key in image_tags["GPSInfo"]:
            decode = GPSTAGS.get(key, key)
            gps_info[decode] = image_tags["GPSInfo"][key]

    gps_lat = Point(gps_info['GPSLatitude'])
    gps_lon = Point(gps_info['GPSLongitude'])

    camera_model = Camera.objects.get(camera_model=image_tags["Model"])
    if camera_model is None:
        camera_model = Camera.objects.create(camera_model=image_tags["Model"], camera_make=image_tags["Make"])

    lens_model = Lens.objects.get(lens_model=image_tags["LensModel"])
    if lens_model is None:
        lens_model = Lens.objects.create(lens_model=image_tags["LensModel"])

    photo = Photo.objects.create(user_id=user_data["user_id"], image=image_file)
    photo.camera = camera_model
    photo.lens = lens_model
    photo.location = MultiPoint(gps_lat, gps_lon)
    photo.f_stop = image_tags['FNumber']
    photo.flash = image_tags['Flash'] not in (0, None)
    photo.focal_length = image_tags['FocalLength']
    photo.aperture = image_tags['ApertureValue']
    photo.ISO = image_tags['ISOSpeedRatings']
    photo.created_at = image_tags['DateTimeOriginal']
    photo.shutter = image_tags['ShutterSpeedValue']
    photo.save()
