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

# returns a session on every initial page load
@csrf_exempt
def get_session(req):
    if not req.body:
        return JsonResponse({ "message": "Expected session id or null" }, status=400)

    data = json.loads(req.body)
    if not data.get("session_id"):
        return JsonResponse({ "message": "Expected session id or null" }, status=400)

    # Create session
    session_id = create_session()
    return JsonResponse({ "session_id": session_id })

# returns a new jwt if session is valid or redirects user to login page if login session is invalid
# session acts as the refresh token for the JWT access token
@csrf_exempt
def refresh_token(req):
    try:
        data = json.loads(req.body)
        session_id = data.get("session_id")
        session = Session.objects.get(id=session_id)
    except Exception as e:
        logging.error(e)
        return HttpResponseRedirect("")


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