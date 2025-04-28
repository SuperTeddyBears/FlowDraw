# Tests for DiagramSerializer

import pytest
from django.contrib.auth import get_user_model
from apps.accounts.models import Diagram
from apps.accounts.serializer import DiagramSerializer

User = get_user_model()


@pytest.mark.django_db
def test_serializer_valid_minimal(user):
    """
    Sprawdza happy-path:
    - payload zawiera obowiązkowe pola (`user`, `data`)
    - serializer przechodzi walidację
    - obiekt zapisuje się w DB i jest poprawnie zmapowany
    """
    payload = {"user": user.id, "data": {"nodes": [], "edges": []}}

    ser = DiagramSerializer(data=payload)
    assert ser.is_valid(), ser.errors

    instance = ser.save()
    assert isinstance(instance, Diagram)
    assert instance.user == user
    assert instance.data == payload["data"]


@pytest.mark.django_db
def test_serializer_missing_data_field(user):
    """
    Brak pola `data` → serializer powinien być niepoprawny.
    """
    ser = DiagramSerializer(data={"user": user.id})
    assert not ser.is_valid()
    assert "data" in ser.errors


@pytest.mark.django_db
def test_serializer_missing_user_field():
    """
    Brak pola `user` → serializer powinien zwrócić błąd.
    """
    ser = DiagramSerializer(data={"data": {"nodes": []}})
    assert not ser.is_valid()
    assert "user" in ser.errors


@pytest.mark.django_db
def test_serializer_rejects_extra_fields(user):
    """
    Payload zawiera nieznane pole `mariusz` → serializer powinien je odrzucić.
    """
    payload = {
        "user": user.id,
        "data": {"nodes": []},
        "mariusz": "pudzianowski"
    }
    ser = DiagramSerializer(data=payload)
    assert not ser.is_valid()
    assert "mariusz" in ser.errors


@pytest.mark.django_db
def test_serializer_output_representation(user):
    """
    Po zapisaniu serializer zwraca reprezentację z kluczem `id` i bez klucza `mariusz`.
    """
    payload = {"user": user.id, "data": {"nodes": []}}
    instance = DiagramSerializer(data=payload)
    assert instance.is_valid()
    diagram = instance.save()

    serialized = DiagramSerializer(diagram).data
    assert serialized["id"] == diagram.id
    assert "mariusz" not in serialized