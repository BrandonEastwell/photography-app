from django.urls import path

from .views.camera_view import CameraView
from .views.lens_view import LensView
from .views.photo_view import ImageView
from .views.photo_id_view import ImageIdView

urlpatterns = [
    path("photos", ImageView.as_view()),
    path("photo/<int:image_id>", ImageIdView.as_view()),
    path("cameras", CameraView.as_view()),
    path("lens", LensView.as_view())
]