from django.http import JsonResponse
from django.shortcuts import render
from PIL import Image
from PIL.ExifTags import TAGS

def image_upload(req):
    if req.method != "POST":
        return JsonResponse( { "error": "Request method invalid." }, status=405 )

    image_file = req.FILES.get('image')
    image = Image.open(image_file)
    exif_data = image.getexif()
    image_tags = {}

    for tag_id in exif_data:
        tag_name = TAGS.get(tag_id, tag_id)
        tag_value = exif_data.get(tag_id)
        image_tags[tag_name] = tag_value
