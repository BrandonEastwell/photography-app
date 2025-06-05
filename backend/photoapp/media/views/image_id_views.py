import logging

from django.http import HttpResponseNotAllowed, JsonResponse
from ..models import Photo

def image_by_id(req, image_id):
    if req.method == "GET":
        try:
            image = Photo.objects.get(id=image_id)
        except Exception as e:
            logging.exception(e)
            return JsonResponse({ "error": "Internal Server Error" }, status=500)

        if image is None:
            return JsonResponse({ "error": "Image does not exist" }, status=404)
        return JsonResponse(image, status=200)
    elif req.method == "DELETE":
        try:
            image = Photo.objects.get(id=image_id)
            image.delete()
            return JsonResponse({ "message": "Image deleted" }, status=200)
        except Exception as e:
            logging.exception(e)
            return JsonResponse({ "error": "Internal Server Error" }, status=500)
    else:
        return HttpResponseNotAllowed(["GET", "DELETE"])



