from datetime import timedelta, datetime

import environ
import jwt
from accounts.models import Session
from django.utils import timezone

env = environ.Env()

class SessionNotFoundError(Exception):
    pass

def create_session(session_id=None, user=None):
    session_expiry = timezone.now() + timedelta(days=3)
    session, created = Session.objects.update_or_create(id=session_id,
                                                        defaults={"user_id": user, "login_attempts": 0, "expire_at": session_expiry},
                                                        create_defaults={"expire_at": session_expiry})

    return session

def create_jwt(user_id):
    token_age = int(env('AUTH_TOKEN_AGE'))
    expiry = datetime.now() + timedelta(seconds=token_age)
    token = jwt.encode({ "user_id": user_id, "exp": expiry }, env("JWT_SECRET"), algorithm="HS256")
    return token, expiry

def get_session(req):
    session_id = req.META.get('HTTP_SESSION') or req.COOKIES.get('session_id')

    if not session_id:
        raise ValueError("Expected session ID in 'Session' header")

    try:
        return Session.objects.get(id=session_id)
    except Session.DoesNotExist:
        raise SessionNotFoundError("Session does not exist")

def set_token_to_response(response, token):
    response.set_cookie(key="auth_token", value=str(token), max_age=int(env('AUTH_TOKEN_AGE')), samesite="None", secure=True, httponly=True)
    return response