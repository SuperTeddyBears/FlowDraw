import pytest
from django.urls import reverse

@pytest.mark.django_db
def test_register_and_login(api_client):
    reg_url = reverse("auth-register")
    login_url = reverse("auth-login")
    verify_url = reverse("auth-verify")

    # rejestracja
    resp = api_client.post(
        reg_url,
        {"email": "new@ex.com", "password": "pass1234", "name": "New"}
    )
    assert resp.status_code == 201
    token = resp.data["token"]

    # logowanie
    resp = api_client.post(
        login_url,
        {"email": "new@ex.com", "password": "pass1234"}
    )
    assert resp.status_code == 200
    access = resp.data["token"]

    # weryfikacja
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    resp = api_client.get(verify_url)
    assert resp.status_code == 200
    assert resp.data["user"]["email"] == "new@ex.com"
