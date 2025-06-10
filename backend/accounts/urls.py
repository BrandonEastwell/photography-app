from django.urls import path

from .views.account_views import create_user, login_user, logout_user
from .views.user_views import get_user_camera, get_user, get_user_lens

urlpatterns = [
    path('login', login_user),
    path('logout', logout_user),
    path('register', create_user),
    path('<int:user_id>', get_user),
    path('camera', get_user_camera),
    path('lens', get_user_lens)
]