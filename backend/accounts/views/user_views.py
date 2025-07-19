import json
import logging

from accounts.models import Profile
from django.contrib.auth import get_user_model
from django.http import HttpResponseNotAllowed, JsonResponse
from media.models import Camera, Lens
from media.models import Photo
from photoapp.middleware.auth_middleware import JWTAuthenticationMiddleware

User = get_user_model()

@JWTAuthenticationMiddleware
def get_user_camera(req):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    user_id = req.user_id
    if user_id is None:
        return JsonResponse({ "success": False, "error": "User must be logged in" }, status=404)

    try:
        cameras = Camera.objects.filter(profile__user_id=user_id).values("camera_model")
        return JsonResponse( { "cameras": json.dumps(list(cameras)) }, status=200)
    except Exception as e:
        logging.exception(e)
        return JsonResponse( { "success": False, "error": "Unable to retrieve data at this time." }, status=500)


@JWTAuthenticationMiddleware
def get_user_lens(req):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    user_id = req.user_id
    if user_id is None:
        return JsonResponse({ "success": False, "error": "User must be logged in" }, status=404)

    try:
        lens = Lens.objects.filter(profile__user_id=user_id).values("lens_model")
        return JsonResponse( { "success": True, "lens": json.dumps(list(lens)) }, status=200)
    except Exception as e:
        logging.exception(e)
        return JsonResponse( { "success": False, "error": "Unable to retrieve data at this time." }, status=500)


@JWTAuthenticationMiddleware
def profile(req):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    user_id = req.user_id
    return get_user_profile(user_id)


def users_profile(req, user_id):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    return get_user_profile(user_id)


def get_user_profile(user_id):
    try:
        user_profile = Profile.objects.get(user__id=user_id)
        if user_profile is None:
            return JsonResponse( { "success": False, "error": "User does not exist." }, status=400)

        images = Photo.objects.filter(pk=user_id)
        user = {
            "username": user_profile.user.username,
            "description": user_profile.desc if user_profile.desc else None,
            "image": user_profile.image.url if user_profile.image else None,
            "photos": [
                {
                    "id": image.id,
                    "url": image.url
                }
                for image in images
            ]
        }

        return JsonResponse( { "success": True, "user": user }, status=200)
    except Exception as e:
        logging.exception(e)
        return JsonResponse( { "success": False, "error": "Unable to retrieve user at this time." }, status=500)