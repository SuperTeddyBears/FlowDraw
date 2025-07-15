# Tests for Diagram model

import pytest
from django.utils import timezone
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from apps.accounts.models import Diagram

User = get_user_model()


# models/test_models_diagram.py
@pytest.mark.django_db
def test_diagram_str():
    """
    Sprawdza reprezentację tekstową obiektu Diagram.
    Oczekujemy: "Diagram <name> for <email>"
    """
    user = User.objects.create(email="str@ex.com", username="str@ex.com")
    diagram = Diagram.objects.create(user=user, name="New Flowchart Diagram", data={"x": 1})
    expected = f"Diagram {diagram.name} for {user.email}"
    assert str(diagram) == expected


@pytest.mark.django_db
def test_created_at_auto_now_add():
    user = User.objects.create(email="time@ex.com", username="time@ex.com")
    before = timezone.now()
    diagram = Diagram.objects.create(user=user, data={})
    assert diagram.created_at >= before


# models/test_models_diagram.py
@pytest.mark.django_db
def test_google_drive_file_id_optional():
    """
    Pole `google_drive_file_id` jest opcjonalne.
    Tworzymy dwa diagramy:
    - jeden bez file_id
    - drugi z file_id
    """
    user = User.objects.create(email="drive@ex.com", username="drive@ex.com")

    d1 = Diagram.objects.create(
        user=user,
        name="Diagram bez Drive",
        data={}
    )
    d2 = Diagram.objects.create(
        user=user,
        name="Diagram z Drive",
        data={},
        google_drive_file_id="file123"
    )

    assert d1.google_drive_file_id is None
    assert d2.google_drive_file_id == "file123"



@pytest.mark.django_db
def test_diagrams_deleted_with_user():
    """
    Cascade: usunięcie użytkownika powinno usuwać jego diagramy.
    """
    user = User.objects.create(email="cascade@ex.com", username="cascade@ex.com")
    Diagram.objects.create(user=user, data={})
    user.delete()
    assert Diagram.objects.count() == 0
