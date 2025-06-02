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

@override_settings(REST_FRAMEWORK=THROTTLE_CONF)
@pytest.mark.django_db
def test_save_diagram_rate_throttle(user):
    """Szóste żądanie w minucie zwraca 429 Too Many Requests."""
    client = APIClient()
    token = RefreshToken.for_user(user)
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")
    url = reverse("save-user-json")
    payload = {"data": {"nodes": []}}

    # pierwsze 5 przechodzi (201)
    for _ in range(5):
        assert client.post(url, payload, format="json").status_code == 201

    # szóste → 429
    res = client.post(url, payload, format="json")
    assert res.status_code == 429
