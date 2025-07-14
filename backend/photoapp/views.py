import json
from datetime import timedelta

import environ
from accounts.models import Session
from django.http import JsonResponse, HttpResponseRedirect
from django.middleware.csrf import get_token
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from lib.auth_helpers import create_session, create_jwt, get_session, SessionNotFoundError

env = environ.Env()

def csrf(req):
    return JsonResponse({"csrfToken": get_token(req)})

# returns a session on every page load
@csrf_exempt
def session(req):
    try:
        session = get_session(req)
        if session:
            return JsonResponse({ "message": "Session already exists" }, status=200)

    except (ValueError, SessionNotFoundError):
        platform = req.META.get('HTTP_PLATFORM')
        session = create_session() # Create session
        if platform == "web":
            response = JsonResponse({ "session_id": session.id }, status=201)
            response.set_cookie(key="session_id", value=str(session.id), max_age=timedelta(weeks=1), samesite="None", secure=True, httponly=True)
            return response

        # Returns session in body for Mobile
        return JsonResponse({ "session_id": session.id }, status=201)

    except Exception as e:
        # Unexpected server error
        return JsonResponse({ "error": str(e) }, status=500)

# returns a new jwt if session is valid or redirects user to login page if login session is invalid
# session acts as the refresh token for the JWT access token
@csrf_exempt
def refresh_token(req):
    session = get_session(req)

    if session is None or session.expire_at < timezone.now():
        # Recreate updated session cookie
        response = HttpResponseRedirect("", content_type="application/json")
        session = create_session(response)
        response.write(json.dumps({"session_id": session.id}))
        return response

    # If user is not logged in
    if session.user_id is None:
        return JsonResponse({ "success": False }, status=400)

    token, expiry = create_jwt(session.user_id)

    return JsonResponse({
        "success": True,
        "auth_token_exp": expiry,
        "auth_token": token
    }, status=200)