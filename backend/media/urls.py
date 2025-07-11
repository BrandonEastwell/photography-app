from django.urls import path

from .views.camera_view import CameraView
from .views.lens_view import LensView
from .views.photo_view import ImageView
from .views.photo_id_view import get_or_delete_photo

urlpatterns = [
    path("photos", ImageView.as_view()),
    path("photo/<int:image_id>/", get_or_delete_photo),
    path("cameras", CameraView.as_view()),
    path("lens", LensView.as_view())
]