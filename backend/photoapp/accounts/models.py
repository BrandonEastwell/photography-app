import datetime
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class CustomUser(AbstractUser):
    username = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.username

class Session(models.Model):
    id = models.AutoField(primary_key=True, auto_created=True)
    user_id = models.ForeignKey(CustomUser, null=True, on_delete=models.SET_NULL)
    expire_at = models.DateTimeField(null=False)
    login_attempts = models.SmallIntegerField(default=0)
    last_login_attempt = models.DateTimeField()
