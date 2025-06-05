from django.contrib.gis.db import models as geomodels
from django.db import models

class Camera(models.Model):
    id = models.AutoField(primary_key=True)
    camera_make = models.CharField(max_length=25, blank=False)
    camera_model = models.CharField(max_length=25, blank=False, unique=True, db_index=True)

class Lens(models.Model):
    id = models.AutoField(primary_key=True)
    lens_model = models.CharField(max_length=25, blank=False, unique=True, db_index=True)

class Photo(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey('accounts.CustomUser', on_delete=models.CASCADE, null=False)
    image = models.ImageField(upload_to='photos/', null=False, blank=False)
    location = geomodels.MultiPointField(geography=True, null=False, blank=True)
    camera = models.ForeignKey(Camera, on_delete=models.SET_NULL, null=True)
    lens = models.ForeignKey(Lens, on_delete=models.SET_NULL, null=True)
    f_stop = models.CharField(max_length=25, null=True)
    ISO = models.IntegerField(null=True)
    shutter_speed = models.CharField(max_length=10, null=True)
    focal_length = models.IntegerField(null=True)
    aperture = models.DecimalField(max_digits=4, decimal_places=2, null=True)
    flash = models.BooleanField(default=False)
    taken_at = models.DateTimeField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    total_votes = models.IntegerField(default=0, null=False)
