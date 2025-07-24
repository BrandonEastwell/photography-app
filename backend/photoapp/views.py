import logging

import environ
from accounts.models import Session
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from lib.auth_helpers import create_session, create_jwt, get_session, SessionNotFoundError, set_token_to_response
from django.contrib.auth import get_user_model

User = get_user_model()
env = environ.Env()

def csrf(req):
    return JsonResponse({"csrfToken": get_token(req)})

# returns a session on every page load
@csrf_exempt
def session(req):
    try:
        session = get_session(req)
        if session:
            user = User.objects.only("username").filter(pk=session.user_id).first() if session.user_id is not None else None
            return JsonResponse({ "success": True, "message": "Session already exists",
                                  "user": { "username": user.username, "user_id": session.user_id } if user is not None else None }, status=200)

    except (ValueError, SessionNotFoundError):
        platform = req.META.get('HTTP_PLATFORM')
        session = create_session() # Create session
        if platform == "web":
            response = JsonResponse({ "success": True })
            expires_in_seconds = int((session.expire_at - timezone.now()).total_seconds())
            response.set_cookie(key="session_id", value=str(session.id), max_age=expires_in_seconds, samesite="None", secure=True, httponly=True)
            return response

        # Returns session in body for Mobile
        return JsonResponse({ "success": True, "session_id": session.id }, status=201)

    except Exception as e:
        # Unexpected server error
        logging.error(e)
        return JsonResponse({ "success": False, "error": str(e) }, status=500)

# returns a new jwt if session is valid or redirects user to login page if login session is invalid
# session acts as the refresh token for the JWT access token
@csrf_exempt
def refresh_token(req):
    session = get_session(req)

    # Session expired or doesnt exist
    if session is None or session.expire_at < timezone.now():
        return JsonResponse({ "success": False, "error": "Invalid session" }, status=400)

    # If user is not logged in
    if session.user_id is None:
        return JsonResponse({ "success": False }, status=400)

    token, expiry = create_jwt(session.user_id)

    platform = req.META.get('HTTP_PLATFORM')
    if platform == "web":
        response = JsonResponse({ "success": True }, status=200)
        set_token_to_response(response, token)
        return response

    return JsonResponse({
        "success": True,
        "auth_token_exp": expiry,
        "auth_token": token
    }, status=200)