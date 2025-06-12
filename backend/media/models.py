from django.contrib.gis.db import models as geomodels
from django.db import models

class Camera(models.Model):
    id = models.AutoField(primary_key=True)
    make = models.CharField(max_length=25, blank=False)
    model = models.CharField(max_length=25, blank=False, unique=True, db_index=True)

class Lens(models.Model):
    id = models.AutoField(primary_key=True)
    model = models.CharField(max_length=25, blank=False, unique=True, db_index=True)

class Photo(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, null=False)
    image = models.ImageField(upload_to='photos/', null=False, blank=False)
    location = geomodels.PointField(geography=True, null=False)
    camera = models.ForeignKey(Camera, on_delete=models.SET_NULL, null=True)
    lens = models.ForeignKey(Lens, on_delete=models.SET_NULL, null=True)
    f_stop = models.CharField(max_length=25, null=True)
    ISO = models.IntegerField(null=True)
    shutter_speed = models.CharField(max_length=10, null=True)
    focal_length = models.IntegerField(null=True)
    flash = models.BooleanField(default=False)
    taken_at = models.DateTimeField(null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    total_votes = models.IntegerField(default=0, null=False)
