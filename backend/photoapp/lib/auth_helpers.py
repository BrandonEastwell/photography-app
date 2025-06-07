from datetime import timedelta, datetime

import environ
import jwt

from accounts.models import Session
from django.utils import timezone
env = environ.Env()

def create_session(response, user_id=None):
    session_expiry = timezone.now() + timedelta(weeks=1)
    session = Session.objects.update_or_create(user_id=user_id, login_attempts=0, expire_at=session_expiry)
    response.set_cookie(key="session_id", value=str(session.id), max_age=timedelta(weeks=1), samesite="Lax", httponly=True)
    return response

def create_jwt(response, user_id):
    token_age = int(env('AUTH_TOKEN_AGE'))
    token = jwt.encode({ "user_id": user_id, "exp": datetime.now() + timedelta(seconds=token_age) }, env("JWT_SECRET"), algorithm="HS256")
    response.set_cookie(key="AUTH_TOKEN", value=str(token), max_age=token_age, samesite="Lax", httponly=True)