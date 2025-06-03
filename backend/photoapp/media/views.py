import jwt
from django.http import JsonResponse, HttpRequest
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from backend.photoapp.media.models import Photo, Camera, Lens
from django.contrib.gis.geos import Point, MultiPoint

import environ
env = environ.Env()

def image_upload(req):
    if req.method != "POST":
        return JsonResponse( { "error": "Request method invalid." }, status=405 )

    encoded_jwt = HttpRequest.COOKIES.get("AUTH_TOKEN")
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


    photo = Photo.objects.create(user_id=user_data["user_id"], image=image_file)
    photo.camera = camera_model
    photo.location = MultiPoint(gps_lat, gps_lon)
    photo.f_stop = image_tags['FNumber']
    photo.flash = image_tags['Flash']
    photo.focal_length = image_tags['FocalLength']
    photo.aperture = image_tags['ApertureValue']
    photo.ISO = image_tags['ISOSpeedRatings']
    photo.created_at = image_tags['DateTimeOriginal']
    photo.shutter = image_tags['ShutterSpeedValue']
    photo.save()
