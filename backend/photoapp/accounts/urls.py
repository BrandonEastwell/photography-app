from django.urls import path

from backend.photoapp.accounts.views.account_views import create_user, login_user, logout_user
from backend.photoapp.accounts.views.user_views import get_user_camera, get_user, get_user_lens

urlpatterns = [
    path('login', login_user),
    path('logout', logout_user),
    path('register', create_user),
    path('user/<int:user_id>', get_user),
    path('user/camera', get_user_camera),
    path('user/lens', get_user_lens)
]