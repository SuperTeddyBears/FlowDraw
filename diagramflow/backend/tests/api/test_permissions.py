# Tests for API permissions
import pytest
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.accounts.models import Diagram

User = get_user_model()


@pytest.mark.django_db
def test_fetch_diagrams_returns_only_owner_items(api_client, user):
    """Lista diagramów zwraca tylko obiekty właściciela."""
    other = User.objects.create_user("o@ex.com", "o@ex.com", "pass")
    Diagram.objects.create(user=other, data={})
    mine = Diagram.objects.create(user=user, data={})

    token = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    url = reverse("fetch-user-jsons")
    res = api_client.get(url)

    ids = [d["id"] for d in res.data]
    assert ids == [mine.id]


@pytest.mark.django_db
def test_save_diagram_requires_authentication(api_client):
    """Brak tokenu przy zapisywaniu diagramu -> HTTP 401."""
    url = reverse("save-user-json")
    res = api_client.post(url, {"data": {"nodes": []}}, format="json")
    assert res.status_code == 401

@pytest.mark.django_db
def test_fetch_diagrams_requires_token(api_client):
    """Wywołanie /user/diagrams bez tokenu zwraca 401."""
    url = reverse("fetch-user-jsons")
    res = api_client.get(url)
    assert res.status_code == 401
