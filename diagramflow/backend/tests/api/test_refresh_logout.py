# Tests for authentication endpoints
import pytest
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
def test_refresh_token_flow(api_client, user):
    """Poprawny refresh zwraca nowy access token."""
    refresh = RefreshToken.for_user(user)
    url = reverse("auth-refresh")

    res = api_client.post(url, {"refresh": str(refresh)})
    assert res.status_code == 200
    assert "access" in res.data
    assert res.data["access"] != str(refresh.access_token)


@pytest.mark.django_db
def test_logout_blocks_refresh_only(api_client, user):
    """Wylogowanie blokuje refresh-token, ale access pozostaje ważny."""
    refresh = RefreshToken.for_user(user)
    access  = str(refresh.access_token)

    # logout – blacklist refresh
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    logout_url = reverse("auth-logout")
    api_client.post(logout_url, {"refresh": str(refresh)})

    # verify z tym samym access -> nadal 200
    verify_url = reverse("auth-verify")
    res_ok = api_client.get(verify_url)
    assert res_ok.status_code == 200

    # próba odświeżenia tym refresh-tokenem -> 401
    refresh_url = reverse("auth-refresh")
    res_fail = api_client.post(refresh_url, {"refresh": str(refresh)})
    assert res_fail.status_code == 401 or res_fail.status_code == 400
