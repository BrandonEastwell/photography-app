from django.contrib import admin
from django.urls import path
from views import create_user, login_user, logout_user

urlpatterns = [
    path('api/accounts/login', login_user),
    path('api/accounts/logout', logout_user),
    path('api/accounts/register', create_user)
]