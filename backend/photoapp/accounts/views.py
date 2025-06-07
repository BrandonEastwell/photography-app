import datetime
import json
import logging
from datetime import timedelta

import environ
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpResponse, JsonResponse, HttpResponseNotAllowed, HttpResponseRedirect
from django.utils import timezone

from .models import Session
from lib.auth_helpers import create_jwt, create_session

User = get_user_model()
env = environ.Env()

def valid_login_attempt(session):
    # Validates login attempts
    session.last_login_attempt = timezone.now()
    if session.login_attempts is not None and int(session.login_attempts) >= 10:
        if session.last_login_attempt + timedelta(hours=2) > timezone.now():
            session.login_attempts = 0
        else:
            return False
    return True


def get_user(req):
    if req.method != "GET":
        return HttpResponseNotAllowed(["GET"])

    token = req.COOKIES.get("AUTH_TOKEN")
    if token is None:
        user_id = req.session.get("user_id")


def create_user(req):
    if req.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        data = req.POST
        first_name = data.get('first_name')
        last_name = data.get('last_name')
        username = data.get('username')
        password = data.get('password')

        user_exists = User.objects.filter(username=username).exists()
        if user_exists:
            return JsonResponse( { "error": "Username is taken." }, status=409 )

        try:
            validate_password(password)
        except ValidationError as e:
            return JsonResponse( { "error": e.error_list[0].message }, status=401 )

        User.objects.create_user(first_name=first_name, last_name=last_name, username=username, password=password)

        return JsonResponse( { "message": "Successfully registered account." })

    except Exception as e:
        logging.exception(e)
        return JsonResponse({ "error": "Internal Server Error" }, status=500)


def login_user(req):
    if req.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    session_id = req.COOKIES.get("session_id")

    # Checks if user is already logged in
    user_session = Session.objects.get(id=session_id)
    if user_session.user_id and user_session.expire_at < timezone.now():
        return JsonResponse({ "message": "You are already logged in to an account." }, status=200)

    valid_login = valid_login_attempt(user_session)
    if valid_login is False:
        return JsonResponse({ "error": "Too many login attempts, try again later." }, status=400)

    try:
        response = HttpResponse(content_type="application/json")
        username = req.POST.get('username')
        password = req.POST.get('password')

        user = authenticate(username=username, password=password)
        if user is None:
            user_session.login_attempts = user_session.login_attempts + 1
            response.write(json.dumps({ "error": "Invalid username or password.", "login_attempts": str(user_session.login_attempts) }))
            response.status_code = 401
            return response

        create_jwt(response, user.id)
        response.write(json.dumps({ "message": "You have successfully logged in." }))

        # Create session cookie to revalidate JWT
        create_session(response, user_session.user_id)

        user.last_login = timezone.now()
        user.save(update_fields=["last_login"])
        return response

    except Exception as error:
        logging.exception(error)
        return JsonResponse({ "error": "Internal Server Error" }, status=500)


def logout_user(req):
    if req.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    jwt_token = req.COOKIES.get("AUTH_TOKEN")
    if jwt_token is None:
        return JsonResponse({ "message": "You are already logged out." }, status=200)

    res = HttpResponseRedirect(env("ORIGIN"))
    res.delete_cookie("AUTH_TOKEN")
    res.status_code = 200
    return res