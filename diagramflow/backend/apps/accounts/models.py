from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings


class User(AbstractUser):
    """
    Custom User model that extends the default Django User model.
    """
    name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    image = models.URLField(max_length=500, blank=True, null=True)
    google_drive_access_token = models.TextField(blank=True, null=True)
    google_drive_refresh_token = models.TextField(blank=True, null=True)
    USERNAME_FIELD = 'email'


    REQUIRED_FIELDS = ['username']

    # THIS IS THE DEFAULT USER MODEL
    def __str__(self):
        return self.email

class Diagram(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='diagrams')
    name = models.CharField(max_length=255, default="New Flowchart Diagram")
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    google_drive_file_id = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Diagram {self.name} for {self.user.email}"

    class Meta:
        unique_together = ('user', 'name')