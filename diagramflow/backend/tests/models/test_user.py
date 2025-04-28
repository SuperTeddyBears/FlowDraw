# Test user model
import pytest
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
def test_user_str():
    user = User.objects.create(email="a@b.com", username="a@b.com")
    assert str(user) == "a@b.com"

@pytest.mark.django_db
def test_email_unique_constraint():
    User.objects.create(email="dup@ex.com", username="dup@ex.com")
    with pytest.raises(Exception):
        User.objects.create(email="dup@ex.com", username="another")
