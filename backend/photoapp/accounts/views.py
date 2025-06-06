import datetime
import json
import logging
from datetime import timedelta

import environ
import jwt
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpResponse, JsonResponse, HttpResponseNotAllowed, HttpResponseRedirect, HttpRequest
from django.contrib.auth import get_user_model
from django.utils import timezone
from models import Session

User = get_user_model()
env = environ.Env()

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
            return JsonResponse( { "error": "Username is taken" }, status=409 )

        try:
            validate_password(password)
        except ValidationError as e:
            return JsonResponse( { "error": e.error_list[0].message }, status=401 )

        User.objects.create_user(first_name=first_name, last_name=last_name, username=username, password=password)

        return JsonResponse( { "message": "Successfully registered account" })

    except Exception as e:
        logging.exception(e)
        return JsonResponse({ "error": "Internal Server Error" }, status=500)

def login_user(req):
    if req.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    # Checks for a JWT
    jwt_token = req.COOKIES.get("AUTH_TOKEN")
    if jwt_token is not None:
        return JsonResponse({ "message": "You are already logged in to an account." }, status=200)

    # Validates login attempts
    login_attempts = req.session.get("login_attempts")
    last_login = req.session.get("last_login")
    req.session["last_login"] = timezone.now()
    if login_attempts is not None and int(login_attempts) >= 10:
        if last_login + timedelta(hours=2) > timezone.now():
            req.session["login_attempts"] = 0
        else:
            return JsonResponse({ "error": "Too many login attempts, try again later." }, status=400)

    try:
        response = HttpResponse(content_type="application/json")
        username = req.POST.get('username')
        password = req.POST.get('password')

        user = authenticate(username=username, password=password)
        if user is None:
            req.session["login_attempts"] = login_attempts + 1
            response.write(json.dumps({ "error": "Invalid username or password.", "login_attempts": str(login_attempts) }))
            response.status_code = 401
            return response

        token = jwt.encode({ "user_id": user.id, "exp": datetime.datetime.now() + datetime.timedelta(minutes=15) }, env("JWT_SECRET"), algorithm="HS256")
        response.set_cookie(key="AUTH_TOKEN", value=str(token), max_age=int(env('AUTH_TOKEN_AGE')), samesite="Strict", httponly=True)
        response.write(json.dumps({ "message": "You have successfully logged in." }))

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