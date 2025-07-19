from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from media.models import Camera, Lens

class CustomUser(AbstractUser):
    username = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.username

class Session(models.Model):
    id = models.AutoField(primary_key=True, auto_created=True)
    user = models.ForeignKey(CustomUser, null=True, on_delete=models.SET_NULL)
    expire_at = models.DateTimeField(null=False)
    login_attempts = models.SmallIntegerField(default=0)
    last_login_attempt = models.DateTimeField(null=True)

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    image = models.ImageField(upload_to='pp/', null=True)
    desc = models.CharField(max_length=150, null=True)
    camera = models.ManyToManyField(Camera, blank=True)
    lens = models.ManyToManyField(Lens, blank=True)

