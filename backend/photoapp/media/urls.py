from django.urls import path

from backend.photoapp.media.views.image_views import ImagesView

urlpatterns = [
    path("images", ImagesView.as_view())
]