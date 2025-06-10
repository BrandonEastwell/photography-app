from django.urls import path

from .views.image_views import ImagesView
from .views.image_id_views import image_by_id

urlpatterns = [
    path("images", ImagesView.as_view()),
    path("images/<int:image_id>/", image_by_id)
]