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
    location = geomodels.PointField(geography=True, null=True, blank=True)
    camera = models.ForeignKey(Camera, on_delete=models.DO_NOTHING, null=True)
    lens = models.ForeignKey(Lens, on_delete=models.DO_NOTHING, null=True)
    f_stop = models.CharField(max_length=25, blank=False)
    ISO = models.IntegerField(blank=False)
    exposure = models.CharField(max_length=25, blank=False)
    focal_length = models.IntegerField(blank=False)
    aperture = models.CharField(max_length=25, blank=False)
    flash = models.BooleanField(default=False)
    created_at = models.DateTimeField()