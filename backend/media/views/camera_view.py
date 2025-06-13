import json
import logging

from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from media.models import Camera

@method_decorator(csrf_exempt, name='dispatch')
class CameraView(View):
    def post(self, req):
        return get_cameras(req)

    def get(self, req):
        return get_cameras(req)

def get_cameras(req):
    try:
        cameras = Camera.objects.all()
        cameras_serialized = [
            {
                "id": camera.id,
                "model": camera.model,
                "make": camera.make
            }
            for camera in cameras
        ]
        return JsonResponse({ "items": len(cameras_serialized), "results": cameras_serialized }, safe=False, status=200)
    except Exception as e:
        logging.exception(e)
        return JsonResponse({ "error": "Cannot retrieve cameras at this time." }, status=500)

