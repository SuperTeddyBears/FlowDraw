# Test Google Auth API
import pytest
from unittest.mock import patch
from django.urls import reverse
from django.contrib.auth import get_user_model

User = get_user_model()


GOOGLE_PATH = "google.oauth2.id_token.verify_oauth2_token"


@pytest.mark.django_db
@patch(GOOGLE_PATH)
def test_google_login_success(mock_verify, api_client):
    """Poprawny token Google zwraca 200 i tworzy/isntancjuje konto."""
    mock_verify.return_value = {
        "email": "g@ex.com",
        "name": "G User",
        "picture": "url",
    }
    url = reverse("auth-google")
    res = api_client.post(url, {"token": "good"})
    assert res.status_code == 200
    assert User.objects.filter(email="g@ex.com").exists()


@pytest.mark.django_db
@patch(GOOGLE_PATH)
def test_google_login_invalid_audience(mock_verify, api_client):
    """Token z innej aplikacji zwraca 400."""
    mock_verify.side_effect = ValueError("Wrong audience")
    url = reverse("auth-google")
    res = api_client.post(url, {"token": "bad"})
    assert res.status_code == 400


@pytest.mark.django_db
@patch(GOOGLE_PATH)
def test_google_login_expired_token(mock_verify, api_client):
    """Przeterminowany token zwraca 400."""
    mock_verify.side_effect = ValueError("Token expired")
    url = reverse("auth-google")
    res = api_client.post(url, {"token": "expired"})
    assert res.status_code == 400
