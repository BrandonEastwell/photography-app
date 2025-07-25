from django.urls import path

from .views.user_views import get_user_camera, get_user_lens, get_user_with_username, get_user_with_id

urlpatterns = [
    #path('photos', get_user_photos),
    path('username/<str:username>', get_user_with_username),
    path('id/<int:user_id>', get_user_with_id),
    path('camera', get_user_camera),
    path('lens', get_user_lens)
]