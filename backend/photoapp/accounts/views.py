import datetime
import logging

import environ
import jwt
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpResponse, JsonResponse, HttpResponseNotAllowed
from django.contrib.auth import get_user_model

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
            return JsonResponse( { "error": "Username already exists" }, status=401 )

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

    token = jwt.encode({ "user_id": user.id }, env("JWT_SECRET"), algorithm="HS256")
    print(str(token))

    response.set_cookie(key="AUTH_TOKEN", value=str(token), max_age=env('AUTH_TOKEN_AGE'), samesite="Strict", httponly=True)
    return response


def logout_user(req):
    if req.method != "POST":
        return HttpResponseNotAllowed(["POST"])