from datetime import datetime

import environ
import jwt
from django.http import JsonResponse
from django.utils import timezone
from django.utils.timezone import make_aware

env = environ.Env()

def JWTAuthenticationMiddleware(view_func):

    def middleware(request, *args, **kwargs):
        token = request.COOKIES.get("auth_token")

        if token is None:
            return token_expired()

        payload = jwt.decode(token, env("JWT_SECRET"), algorithms=['HS256'])
        exp_timestamp = payload.get('exp')
        exp_datetime = make_aware(datetime.fromtimestamp(exp_timestamp))
        if exp_datetime < timezone.now():
            return token_expired()

        request.user_id = payload.get('user_id')
        return view_func(request, *args, **kwargs)
    return middleware

def token_expired():
    response = JsonResponse({ "error": "token expired" }, status=401)
    response.headers["X-Token-Expired"] = True
    return response