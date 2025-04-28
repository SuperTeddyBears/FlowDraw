import pytest
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken

@pytest.mark.django_db
def test_save_diagram_logged_in(api_client, user):
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")

    url = reverse("save-user-json")
    payload = {"data": {"nodes": [{"id": 1}]}}
    resp = api_client.post(url, payload, format="json")

    assert resp.status_code == 201
    assert resp.data["user"] == user.id
    assert resp.data["data"]["nodes"][0]["id"] == 1
