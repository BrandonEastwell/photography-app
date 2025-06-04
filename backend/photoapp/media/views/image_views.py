from datetime import datetime, timedelta
import jwt
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

    # Filter options
    # location
    # camera
    # lens
    # ISO
    # shutter_speed
    # focal_length
    # flash
    # aperture

    # URL params e.g. /images?sort_by_popularity=trending&sort_by_time=this_week&filters=true&location=44.4647452,7.3553838&limit=20&page=1
    def get(self, req):
        filters = req.GET.get("filters")
        if not filters:
            # if no filters applied, return content based on users gear
            # if no user gear found, return any content

        items_limit = req.GET.get("limit")
        filter_options = {
            "location": get_location(req.GET.get("location")),
            "camera": req.GET.get("camera"),
            "lens": req.GET.get("lens"),
            "ISO": req.GET.get("ISO"),
            "shutter_speed": req.GET.get("shutter_speed"),
            "focal_length": req.GET.get("focal_length"),
            "flash": req.GET.get("flash"),
            "aperture": req.GET.get("aperture")
        }

        SORT_FIELDS_TIME = {
            "this_week": datetime.now() - timedelta(weeks=1),
            "this_month": datetime.now() - timedelta(weeks=4),
            "this_year": datetime.now() - timedelta(weeks=56),
        }

        SORT_FIELDS_POPULARITY = {
            "trending",
            "newest",
            "top",
        }

        images = Photo.objects.all()

        if filter_options["location"]:
            max_distance = 1000
            distance = 2
            while distance < max_distance:
                images = Photo.objects.filter(location__distance_lte=(filter_options["location"], D(m=distance))).values("id", "image", "user_id")
                if images.count() == items_limit:
                    break
                distance *= 2

        sort_by_time = req.GET.get("sort_by_time")
        time = SORT_FIELDS_TIME[sort_by_time]
        if time:
            images = images.filter(uploaded_at__gte=time)


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
