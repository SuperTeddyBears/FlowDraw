# Tests for User model
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


@pytest.mark.django_db
def test_blank_name_allowed():
    """
    Pole name ma `blank=True` i może być puste.
    """
    user = User.objects.create_user(
        email="noname@ex.com",
        username="noname@ex.com",
        password="pass123",
        name=""
    )
    assert user.name == ""


@pytest.mark.django_db
def test_default_flags_and_is_active():
    """
    Nowo utworzony użytkownik powinien być aktywny i zwykły (nie staff, nie superuser).
    """
    user = User.objects.create_user(
        email="flags@ex.com",
        username="flags@ex.com",
        password="pass123"
    )
    assert user.is_active
    assert not user.is_staff
    assert not user.is_superuser
