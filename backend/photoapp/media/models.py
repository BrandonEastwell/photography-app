from django.contrib.gis.db import models as geomodels
from django.db import models

class Camera(models.Model):
    id = models.AutoField(primary_key=True)
    camera_make = models.CharField(max_length=25, blank=False)
    camera_model = models.CharField(max_length=25, blank=False, unique=True, db_index=True)

class Lens(models.Model):
    id = models.AutoField(primary_key=True)
    lens_make = models.CharField(max_length=25, blank=False)
    lens_model = models.CharField(max_length=25, blank=False, unique=True, db_index=True)

class Photo(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='photos/', null=False, blank=False)
    location = geomodels.MultiPointField(geography=True, null=True, blank=True)
    camera = models.ForeignKey(Camera, on_delete=models.SET_NULL, null=True)
    lens = models.ForeignKey(Lens, on_delete=models.SET_NULL, null=True)
    f_stop = models.CharField(max_length=25, blank=False)
    ISO = models.IntegerField(blank=False)
    shutter_speed = models.DecimalField(blank=False)
    focal_length = models.DecimalField(blank=False)
    aperture = models.DecimalField(blank=False)
    flash = models.BooleanField(default=False)
    created_at = models.DateTimeField()