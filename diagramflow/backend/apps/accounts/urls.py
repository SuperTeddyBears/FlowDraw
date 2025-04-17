from django.urls import path
from .views import (
    GoogleLoginView,
    LoginView,
    RegisterView,
    VerifyTokenView,
    RefreshTokenView,
    LogoutView
)

urlpatterns = [
    path('auth/google', GoogleLoginView.as_view(), name='auth-google'),
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/register', RegisterView.as_view(), name='auth-register'),
    path('auth/verify', VerifyTokenView.as_view(), name='auth-verify'),
    path('auth/refresh', RefreshTokenView.as_view(), name='auth-refresh'),
    path('auth/logout', LogoutView.as_view(), name='auth-logout'),
]