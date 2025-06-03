import datetime

import environ
import jwt
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import get_user_model

env = environ.Env()

def create_user(req):
    if req.method != "POST":
        return JsonResponse( { "error": "Request method invalid." }, status=405 )

    data = req.POST
    first_name = data.get('firstName')
    last_name = data.get('lastName')
    username = data.get('username')
    password = data.get('password')

    user_exists = User.objects.get(username)
    if user_exists:
        return JsonResponse( { "error": "Username already exists" }, status=401 )

    try:
        validate_password(password)
    except ValidationError:
        return JsonResponse( { "error": ValidationError }, status=401 )

    user = User.objects.create_user(username, password)
    user.first_name = first_name
    user.last_name = last_name
    user.date_joined = datetime.datetime.now()
    user.save()

    return JsonResponse( { "message": "Successfully registered account" })

def login_user(req):
    if req.method != "POST":
        return JsonResponse( { "error": "Request method invalid." }, status=405 )

    login_attempts = req.COOKIES["LOGIN_ATTEMPTS"]
    if login_attempts >= 10:
        return JsonResponse({ "error": "Too many login attempts, try again later." }, status=400)

    response = HttpResponse()
    data = req.POST
    username = data.get('username')
    password = data.get('password')

    user = authenticate(username, password)
    if user is None:
        if login_attempts is None:
            response.set_cookie(key="LOGIN_ATTEMPTS", value="1", max_age=env('LOGIN_COOLDOWN'), samesite="Strict", httponly=True)
        else:
            response.set_cookie(key="LOGIN_ATTEMPTS", value=str(int(login_attempts)+1), max_age=env('LOGIN_COOLDOWN'), samesite="Strict", httponly=True)

        response.content({ "error": "Invalid username or password" })
        response.status_code = 401
        return response

    user.last_login = datetime.datetime.now()
    user.save()

    token = jwt.encode({ "username": user.id }, env("JWT_SECRET"), algorithm="HS256")
    print(str(token))

    response.set_cookie(key="AUTH_TOKEN", value=str(token), max_age=env('AUTH_TOKEN_AGE'), samesite="Strict", httponly=True)
    return response


def logout_user(req):
    if req.method != "POST":
        return JsonResponse( { "error": "Request method invalid." }, status=405 )
