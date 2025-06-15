# Tests for the diagram endpoints
import pytest
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.accounts.models import Diagram

User = get_user_model()


# api/test_api_diagram.py
@pytest.mark.django_db
def test_save_diagram_logged_in(api_client, user):
    """
    Zalogowany użytkownik zapisuje diagram.
    Pole `name` jest wymagane
    """
    token = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    url = reverse("save-user-json")
    payload = {
        "user": user.id,
        "name": "Mój pierwszy diagram",
        "data": {"nodes": [{"id": 1}]},
    }

    resp = api_client.post(url, payload, format="json")

    assert resp.status_code == 201
    assert resp.data["user"] == user.id
    assert resp.data["name"] == payload["name"]
    assert resp.data["data"]["nodes"][0]["id"] == 1


# api/test_api_diagram.py
@pytest.mark.django_db
def test_save_diagram_missing_data(api_client, user):
    """
    Brak pola `data` i `name`, backend zwraca 400 z błędem dotyczącym `name`.
    """
    token = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    url = reverse("save-user-json")
    resp = api_client.post(url, {"user": user.id}, format="json")

    assert resp.status_code == 400
    assert "error" in resp.data
    assert "name" in resp.data["error"].lower()


@pytest.mark.django_db
def test_save_diagram_missing_data(api_client, user):
    """Brak obowiązkowego pola data zwraca 400."""
    token = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    url = reverse("save-user-json")
    resp = api_client.post(url, {"user": user.id}, format="json")
    assert resp.status_code == 400
    assert "error" in resp.data
    assert "name" in resp.data["error"].lower()


@pytest.mark.django_db
def test_save_diagram_wrong_data_type(api_client, user):
    """Pole data w złym typie (string) zwraca 400."""
    token = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    url = reverse("save-user-json")
    resp = api_client.post(
        url,
        {"user": user.id, "data": "string instead of JSON"},
        format="json",
    )
    assert resp.status_code == 400


@pytest.mark.django_db
def test_fetch_only_owned_diagrams(api_client, user):
    """/user/diagrams zwraca tylko diagramy właściciela."""
    other = User.objects.create_user("o@ex.com", "o@ex.com", "pass")
    Diagram.objects.create(user=other, data={})
    mine = Diagram.objects.create(user=user, data={})

    token = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    url = reverse("fetch-user-jsons")
    res = api_client.get(url)
    ids = [d["id"] for d in res.data]
    assert ids == [mine.id]
