from django.urls import path
from .views import (
    GoogleLoginView,
    LoginView,
    RegisterView,
    VerifyTokenView,
    RefreshTokenView,
    LogoutView,
    FetchUserDiagramsView,
    SaveUserDiagramView,
    GoogleDriveAuthView,
    GoogleDriveCallbackView
)

# This is the URL configuration for the accounts' app.
urlpatterns = [
    path('auth/google', GoogleLoginView.as_view(), name='auth-google'),
    path('auth/login', LoginView.as_view(), name='auth-login'),
    path('auth/register', RegisterView.as_view(), name='auth-register'),
    path('auth/verify', VerifyTokenView.as_view(), name='auth-verify'),
    path('auth/refresh', RefreshTokenView.as_view(), name='auth-refresh'),
    path('auth/logout', LogoutView.as_view(), name='auth-logout'),
    path('user/diagrams', FetchUserDiagramsView.as_view(), name='fetch-user-jsons'),
    path('user/save_diagram', SaveUserDiagramView.as_view(), name='save-user-json'),
    path('auth/google-drive', GoogleDriveAuthView.as_view(), name='auth-google-drive'),
    path('auth/google-drive-callback', GoogleDriveCallbackView.as_view(), name='google-drive-callback'),
]