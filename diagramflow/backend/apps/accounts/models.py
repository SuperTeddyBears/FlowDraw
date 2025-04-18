from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User model that extends the default Django User model.
    """
    name = models.CharField(max_length=255, null=True, blank=True)
    email = models.EmailField(unique=True)
    image = models.URLField(max_length=500, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    # THIS IS THE DEFAULT USER MODEL
    def __str__(self):
        return self.email
