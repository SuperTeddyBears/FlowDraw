from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def homepage(request):
    return HttpResponse("API działa poprawnie! - TEST")

urlpatterns = [
    path('', homepage, name='homepage'),
    path('admin/', admin.site.urls),
    path('api/', include('apps.accounts.urls')), # Include the accounts app URLs
]