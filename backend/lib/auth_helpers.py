from datetime import timedelta, datetime

import environ
import jwt
from accounts.models import Session
from django.utils import timezone

env = environ.Env()

def create_session(response, session_id=None, user=None):
    session_expiry = timezone.now() + timedelta(weeks=1)
    session, created = Session.objects.update_or_create(id=session_id,
                                                        defaults={"user_id": user, "login_attempts": 0, "expire_at": session_expiry},
                                                        create_defaults={"expire_at": session_expiry})

    response.set_cookie(key="session_id", value=str(session.id), max_age=timedelta(weeks=1), samesite="Lax", httponly=True)
    return response

def create_jwt(user_id):
    token_age = int(env('AUTH_TOKEN_AGE'))
    expiry = datetime.now() + timedelta(seconds=token_age)
    token = jwt.encode({ "user_id": user_id, "exp": expiry }, env("JWT_SECRET"), algorithm="HS256")
    return token, expiry