from django.urls import path

from .views.user_views import get_user_camera, get_user_lens, get_user_profile, get_profile

urlpatterns = [
    #path('photos', get_user_photos),
    path('profile', get_profile),
    path('<int:user_id>/profile', get_user_profile),
    path('camera', get_user_camera),
    path('lens', get_user_lens)
]