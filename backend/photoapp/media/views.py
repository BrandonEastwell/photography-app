from django.http import JsonResponse
from django.shortcuts import render

def image_upload(req):
    if req.method != "POST":
        return JsonResponse( { "error": "Request method invalid." }, status=405 )

    photo = req.FILES.get('image')