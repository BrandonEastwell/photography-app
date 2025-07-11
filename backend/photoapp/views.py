import json
import logging
from datetime import timedelta

import environ
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.middleware.csrf import get_token
from django.utils import timezone

from accounts.models import Session
from django.views.decorators.csrf import csrf_exempt
from lib.auth_helpers import create_session, create_jwt

env = environ.Env()

def csrf(req):
    return JsonResponse({"csrfToken": get_token(req)})

# returns a session on every page load
@csrf_exempt
def get_session(req):
    response = HttpResponse()
    if not req.COOKIES.get("session_id"):
        # Create session cookie
        create_session(response)
        return response
    return JsonResponse({ "message": "Session already exists" }, status=200)

# returns a new jwt if session is valid or redirects user to login page if login session is invalid
# session acts as the refresh token for the JWT access token
@csrf_exempt
def refresh_token(req):
    session = Session.objects.get(id=req.COOKIES.get("session_id"))

    if session is None or session.expire_at < timezone.now():
        # Recreate updated session cookie
        response = HttpResponseRedirect("", content_type="application/json")
        session_id = create_session(response)
        response.write(json.dumps({"session_id": session_id}))
        return response

    # If user is not logged in
    if session.user_id is None:
        return HttpResponseRedirect("")

    token, expiry = create_jwt(session.user_id)

    return JsonResponse({
        "session_id": session.id,
        "auth_token_exp": expiry,
        "auth_token": token
    })