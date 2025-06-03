from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import HttpResponse, HttpRequest, JsonResponse
from django.contrib.auth.models import User
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken


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
        return JsonResponse( { "error": ValidationError } )

    user = User.objects.create_user(username, password)
    user.first_name = first_name
    user.last_name = last_name
    user.save()

def login_user(req):
    if req.method != "POST":
        return JsonResponse( { "error": "Request method invalid." }, status=405 )

    data = req.POST
    username = data.get('username')
    password = data.get('password')

    user = authenticate(username, password)
    if user is None:
        return JsonResponse( { "error": "Invalid username or password" }, status=401 )

    token = RefreshToken.for_user(user)

    response = HttpResponse( status=200 )
    response.set_cookie(key="AUTH_COOKIE", value=str(token), samesite="Strict", httponly=True)
    return response



def logout_user(req):
    if req.method != "POST":
        return JsonResponse( { "error": "Request method invalid." }, status=405 )
