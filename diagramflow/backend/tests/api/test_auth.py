# Tests for authentication and registration
# Tests for authentication and registration
import pytest
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
def test_register_and_login(api_client):
    """Happy-path: rejestracja, logowanie, verify."""
    reg_url = reverse("auth-register")
    login_url = reverse("auth-login")
    verify_url = reverse("auth-verify")

    # rejestracja
    resp = api_client.post(
        reg_url, {"email": "new@ex.com", "password": "pass1234", "name": "New"}
    )
    assert resp.status_code == 201

    # logowanie
    resp = api_client.post(
        login_url, {"email": "new@ex.com", "password": "pass1234"}
    )
    assert resp.status_code == 200
    access = resp.data["token"]

    # verify
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    resp = api_client.get(verify_url)
    assert resp.status_code == 200
    assert resp.data["user"]["email"] == "new@ex.com"


@pytest.mark.django_db
def test_register_duplicate_email(api_client):
    """Powtórna rejestracja z tym samym e-mailem zwraca 409."""
    url = reverse("auth-register")
    api_client.post(url, {"email": "dup@ex.com", "password": "a", "name": "Dup"})
    resp = api_client.post(url, {"email": "dup@ex.com", "password": "b", "name": "Dup2"})
    assert resp.status_code == 409


@pytest.mark.django_db
def test_login_wrong_password(api_client, user):
    """Błędne hasło zwraca 401."""
    url = reverse("auth-login")
    resp = api_client.post(url, {"email": user.email, "password": "wrong"})
    assert resp.status_code == 401


@pytest.mark.django_db
def test_login_unknown_email(api_client):
    """Nieistniejący e-mail zwraca 404."""
    url = reverse("auth-login")
    resp = api_client.post(url, {"email": "ghost@ex.com", "password": "x"})
    assert resp.status_code == 404


@pytest.mark.django_db
def test_verify_without_token(api_client):
    """Brak nagłówka Authorization zwraca 401."""
    url = reverse("auth-verify")
    resp = api_client.get(url)
    assert resp.status_code == 401


@pytest.mark.django_db
def test_refresh_token_flow(api_client, user):
    """Poprawny refresh zwraca nowy access-token."""
    refresh = RefreshToken.for_user(user)
    url = reverse("auth-refresh")
    resp = api_client.post(url, {"refresh": str(refresh)})
    assert resp.status_code == 200
    assert "access" in resp.data
    assert resp.data["access"] != str(refresh.access_token)


@pytest.mark.django_db
def test_refresh_invalid_token(api_client):
    """Zły refresh-token zwraca 400."""
    url = reverse("auth-refresh")
    resp = api_client.post(url, {"refresh": "bogus"})
    assert resp.status_code == 400
