from django.contrib import admin
from django.urls import path
from .views import create_user, login_user, logout_user

urlpatterns = [
    path('login', login_user),
    path('logout', logout_user),
    path('register', create_user)
]