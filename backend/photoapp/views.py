from datetime import timedelta

import environ
from django.http import JsonResponse, HttpResponse, HttpResponseRedirect
from django.middleware.csrf import get_token
from django.utils import timezone

from accounts.models import Session
from lib.auth_helpers import create_session, create_jwt

env = environ.Env()

def csrf(req):
    return JsonResponse({"csrfToken": get_token(req)})

# returns a session on every page load
def get_session(req):
    response = HttpResponse()
    if not req.COOKIES.get("session_id"):
        # Create session cookie
        create_session(response)
    return response

# returns a new jwt if session is valid or redirects user to login page if login session is invalid
# session acts as the refresh token for the JWT access token
def refresh_token(req):
    session = Session.objects.get(id=req.COOKIES.get("session_id"))

    if session is None or session.expire_at < timezone.now():
        # Recreate updated session cookie
        response = HttpResponseRedirect("")
        return create_session(response)

    # If user is not logged in
    if session.user_id is None:
        return HttpResponseRedirect("")

    response = HttpResponse()
    create_jwt(response, session.user_id)
    return response