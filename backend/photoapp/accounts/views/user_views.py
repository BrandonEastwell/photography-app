from django.http import HttpResponseNotAllowed, JsonResponse

from backend.photoapp.photoapp.middleware.auth_middleware import JWTAuthenticationMiddleware
from django.contrib.auth import get_user_model
from backend.photoapp.media.models import Camera, Lens

User = get_user_model()

@JWTAuthenticationMiddleware
def get_user_camera(req):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    user_id = req.user_id
    if user_id is None:
        return JsonResponse({ "error": "user must be logged in" }, status=404)

    camera_model = Camera.objects.select_related("camera")

@JWTAuthenticationMiddleware
def get_user_lens(req):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

def get_user(req):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    token = req.COOKIES.get("AUTH_TOKEN")
    if token is None:
        user_id = req.session.get("user_id")