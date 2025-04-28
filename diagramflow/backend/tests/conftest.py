import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="john@example.com",
        username="john@example.com",
        password="secret123"
    )

@pytest.fixture
def api_client():
    return APIClient()
