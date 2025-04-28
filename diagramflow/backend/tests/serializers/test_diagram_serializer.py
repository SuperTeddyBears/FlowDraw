import pytest
from apps.accounts.models import Diagram
from apps.accounts.serializer import DiagramSerializer

@pytest.mark.django_db
def test_serializer_valid(user):
    payload = {"user": user.id, "data": {"nodes": [], "edges": []}}
    ser = DiagramSerializer(data=payload)
    assert ser.is_valid(), ser.errors
    instance = ser.save()
    assert isinstance(instance, Diagram)
    assert instance.user == user
