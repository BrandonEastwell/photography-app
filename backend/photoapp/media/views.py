import os

import jwt
from django.http import JsonResponse, HttpRequest
from PIL import Image
from PIL.ExifTags import TAGS
from backend.photoapp.media.models import Photo

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

    required_tags = ["Make", "Model"]
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

    photo = Photo.objects.create(user_id=user_data["user_id"], image=image_file)

