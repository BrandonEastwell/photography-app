import json
import logging

from django.http import HttpResponseNotAllowed, JsonResponse, HttpRequest

from photoapp.middleware.auth_middleware import JWTAuthenticationMiddleware
from django.contrib.auth import get_user_model
from media.models import Camera, Lens
from accounts.models import Profile

User = get_user_model()

@JWTAuthenticationMiddleware
def get_user_camera(req):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    user_id = req.user_id
    if user_id is None:
        return JsonResponse({ "error": "User must be logged in" }, status=404)

    try:
        cameras = Camera.objects.filter(profile__user_id=user_id).values("camera_model")
        return JsonResponse( { "cameras": json.dumps(list(cameras)) }, status=200)
    except Exception as e:
        logging.exception(e)
        return JsonResponse( { "error": "Unable to retrieve data at this time." }, status=500)

@JWTAuthenticationMiddleware
def get_user_lens(req):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    user_id = req.user_id
    if user_id is None:
        return JsonResponse({ "error": "User must be logged in" }, status=404)

    try:
        lens = Lens.objects.filter(profile__user_id=user_id).values("lens_model")
        return JsonResponse( { "lens": json.dumps(list(lens)) }, status=200)
    except Exception as e:
        logging.exception(e)
        return JsonResponse( { "error": "Unable to retrieve data at this time." }, status=500)

def get_user(req, user_id):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    try:
        user_profile = Profile.objects.get(user__id=user_id)

        if user_profile is None:
            return JsonResponse( { "error": "User does not exist." }, status=400)

        return JsonResponse( { json.dumps(user_profile) }, status=200)
    except Exception as e:
        logging.exception(e)
        return JsonResponse( { "error": "Unable to retrieve user at this time." }, status=500)
