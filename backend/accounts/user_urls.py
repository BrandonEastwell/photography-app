from django.urls import path

from .views.user_views import get_user_camera, get_user_lens, users_profile, profile

urlpatterns = [
    #path('photos', get_user_photos),
    path('profile', profile),
    path('<int:user_id>/profile', users_profile),
    path('camera', get_user_camera),
    path('lens', get_user_lens)
]