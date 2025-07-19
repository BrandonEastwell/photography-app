from django.urls import path

from .views.account_views import create_user, login_user, logout_user

urlpatterns = [
    path('login', login_user),
    path('logout', logout_user),
    path('register', create_user),
]