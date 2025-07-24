import json
import logging
import types

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


def get_user_with_username(req, username):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    try:
        user_id = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse( { "success": False, "error": "User does not exist." }, status=404)

    return get_user_profile(user_id)

def get_user_with_id(req, user_id):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    return get_user_profile(user_id)


def get_user_profile(user_id):
    try:
        user_profile = Profile.objects.get(user__id=user_id)
        if user_profile is None:
            return JsonResponse( { "success": False, "error": "User does not exist." }, status=404)

        images = Photo.objects.filter(user_id=user_id)
        user = {
            "username": user_profile.user.username,
            "firstName": user_profile.user.first_name,
            "lastName": user_profile.user.last_name,
            "description": user_profile.desc if user_profile.desc else None,
            "image": user_profile.image.url if user_profile.image else None,
            "photos": [
                {
                    "image_url": image.image.url,
                    "latitude": image.location.y if not types.NoneType else None,
                    "longitude": image.location.x if not types.NoneType else None,
                    "camera_model": image.camera.model,
                    "camera_make": image.camera.make,
                    "flash": image.flash,
                    "f_stop": image.f_stop if not types.NoneType else None,
                    "lens": image.lens.model if not types.NoneType else None,
                    "ISO": image.ISO if not None else None,
                    "shutter_speed": image.shutter_speed if not None else None,
                    "focal_length": image.focal_length if not None else None,
                    "votes": image.total_votes
                }
                for image in images
            ]
        }

        return JsonResponse( { "success": True, "user": user }, status=200)

    except Profile.DoesNotExist:
        return JsonResponse( { "success": False, "error": "User does not exist." }, status=404)

    except Exception as e:
        logging.exception(e)
        return JsonResponse( { "success": False, "error": "Unable to retrieve user at this time." }, status=500)