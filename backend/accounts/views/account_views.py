import logging
from datetime import timedelta

import logging
from datetime import timedelta

import environ
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import JsonResponse, HttpResponseNotAllowed, HttpResponseRedirect
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from lib.auth_helpers import create_jwt, create_session, get_session, set_token_to_response

from ..models import Profile

User = get_user_model()
env = environ.Env()

@csrf_exempt
def create_user(req):
    if req.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        data = req.POST
        first_name = data.get('firstName')
        last_name = data.get('lastName')
        username = data.get('username')
        password = data.get('password')

        user_exists = User.objects.filter(username=username).exists()
        if user_exists:
            return JsonResponse( { "success": False, "error": "Username is taken." }, status=409 )

        try:
            validate_password(password)
        except ValidationError as e:
            return JsonResponse( { "success": False, "error": e.error_list[0].message }, status=401 )

        user = User.objects.create_user(first_name=first_name, last_name=last_name, username=username, password=password)
        Profile.objects.create(user=user)

        return JsonResponse( { "success": True, "message": "Successfully registered account." })

    except Exception as e:
        logging.exception(e)
        return JsonResponse({ "success": False, "error": "Internal Server Error" }, status=500)

def valid_login_attempt(session):
    # Validates login attempt
    session.login_attempts = 0
    if session.login_attempts is not None and int(session.login_attempts) >= 10:
        if session.last_login_attempt + timedelta(hours=1) < timezone.now():
            session.login_attempts = 0
        else:
            return False

    session.last_login_attempt = timezone.now()
    session.login_attempts = session.login_attempts + 1
    session.save()
    return True

@csrf_exempt
def login_user(req):
    if req.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        session = get_session(req)
        if session.user_id and session.expire_at > timezone.now():
            return JsonResponse({ "success": False, "error": "You are already logged in to an account." }, status=400)

        valid_login = valid_login_attempt(session)
        if valid_login is False:
            return JsonResponse({ "success": False, "error": "Too many login attempts, try again later." }, status=400)

    except Exception as e:
        return JsonResponse({ "success": False, "error": "Session expired. Please try again." }, status=400)

    try:
        username = req.POST.get('username')
        password = req.POST.get('password')

        user = authenticate(username=username, password=password)
        if user is None:
            return JsonResponse({ "error": "Invalid username or password.", "login_attempts": str(session.login_attempts) }, status=401)

        # Create new session / add to response body
        session = create_session(session.id, user)
        token, expiry = create_jwt(user.id)

        platform = req.META.get('HTTP_PLATFORM')
        if platform == "web":
            response = JsonResponse({ "success": True, "message": "You have successfully logged in." })
            set_token_to_response(response, token, expiry)
            expires_in_seconds = int((session.expire_at - timezone.now()).total_seconds())
            response.set_cookie(key="session_id", value=str(session.id), max_age=expires_in_seconds, samesite="None", secure=True, httponly=True)
            return response

        response = JsonResponse({
            "success": True,
            "session_id": session.id,
            "auth_token_exp": expiry,
            "auth_token": token,
            "message": "You have successfully logged in."
        })

        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])
        return response

    except Exception as error:
        logging.exception(error)
        return JsonResponse({ "success": False, "error": "Internal Server Error" }, status=500)


def logout_user(req):
    if req.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    jwt_token = req.COOKIES.get("auth_token")
    if jwt_token is None:
        return JsonResponse({ "message": "You are already logged out." }, status=200)

    res = HttpResponseRedirect(env("ORIGIN"))
    res.delete_cookie("auth_token")
    res.status_code = 200
    return res