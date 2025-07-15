# Tests for authentication endpoints
import pytest
from django.urls import reverse


@pytest.mark.django_db
def test_login_wrong_password(user, api_client):
    """Zły password → HTTP 401 i komunikat o błędzie."""
    url = reverse("auth-login")
    res = api_client.post(url, {"email": user.email, "password": "invalid"})
    assert res.status_code == 401
    assert res.data["error"] == "Invalid password"


@pytest.mark.django_db
def test_login_unknown_email(api_client):
    """Nieistniejący email → HTTP 404."""
    url = reverse("auth-login")
    res = api_client.post(url, {"email": "ghost@ex.com", "password": "abc"})
    assert res.status_code == 404
    assert res.data["error"] == "User with this email does not exist"


@pytest.mark.django_db
def test_login_google_account_with_password(api_client, user, monkeypatch):
    """Konto powiązane z Google bez hasła → HTTP 400."""
    user.set_unusable_password()
    user.save()

    url = reverse("auth-login")
    res = api_client.post(url, {"email": user.email, "password": "whatever"})
    assert res.status_code == 400
    assert "linked to Google" in res.data["error"]
