# Tests for API limits
import json
import pytest
from django.urls import reverse
from django.test.utils import override_settings
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken


@pytest.mark.django_db
def test_save_diagram_payload_too_large(api_client, user):
    """Payload >1 MB ma zwrócić 413."""
    token = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    # generujemy ~1.2 MB JSON
    big_nodes = [{"id": i, "label": "x"*50} for i in range(25_000)]
    payload = {"data": {"nodes": big_nodes}}

    url = reverse("save-user-json")
    res = api_client.post(url, payload, format="json")
    assert res.status_code in (400, 413)   # 413 zalecane, 400 akceptowalne

# Rate-throttling – 5 żądań na minutę

THROTTLE_CONF = {
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "user": "5/min",
    },
}

# api/test_limits.py
@override_settings(REST_FRAMEWORK=THROTTLE_CONF)
@pytest.mark.django_db
def test_save_diagram_rate_throttle(user):
    """
    Szóste żądanie zapisania diagramu w ciągu minuty zwraca 429 Too Many Requests.
    Poprzednie pięć zakończone sukcesem (201).
    """
    client = APIClient()
    token = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
    url = reverse("save-user-json")

    payload = {
        "name": "Diagram testowy throttling",
        "data": {"nodes": []}
    }

    # pierwsze 5 żądań → 201
    for i in range(5):
        response = client.post(url, {**payload, "name": f"{payload['name']} {i}"}, format="json")
        assert response.status_code == 201

    # szóste żądanie → 429
    res = client.post(url, {**payload, "name": f"{payload['name']} 5"}, format="json")
    assert res.status_code == 429

