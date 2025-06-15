# Tests for Google Drive upload functionality
import pytest
from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework_simplejwt.tokens import RefreshToken
from apps.accounts.models import Diagram


BUILD_PATH = "googleapiclient.discovery.build"
CRED_PATH = "apps.accounts.views.Credentials"   # importowany w widoku


@pytest.fixture
def drive_user(user):
    """Użytkownik z tokenami Google Drive."""
    user.google_drive_access_token = "atk"
    user.google_drive_refresh_token = "rtk"
    user.save()
    return user

"""
@pytest.mark.django_db
@patch(BUILD_PATH)
@patch(CRED_PATH)
def test_drive_upload_success(mock_cred, mock_build, api_client, drive_user):
    #Poprawny upload ustawia google_drive_file_id i zwraca 201.
    # --- 1. Credentials ---
    cred_obj = MagicMock()
    cred_obj.universe_domain = "googleapis.com"
    cred_obj.create_scoped.return_value = cred_obj
    cred_obj.authorize.return_value = cred_obj
    cred_obj.credentials = cred_obj            # <-- tu dokładamy
    mock_cred.return_value = cred_obj

    # --- 2. build().files().create().execute() ---
    mock_build.return_value.files.return_value.create.return_value.execute.return_value = {
        "id": "file123"
    }

    # --- 3. request ---
    token = RefreshToken.for_user(drive_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    url = reverse("save-user-json")
    resp = api_client.post(url, {"data": {"nodes": []}}, format="json")
    assert resp.status_code == 201
    diagram_id = resp.data["id"]
    assert Diagram.objects.get(id=diagram_id).google_drive_file_id == "file123"



"""

@pytest.mark.django_db
@patch(BUILD_PATH)
@patch(CRED_PATH)
def test_drive_upload_failure_keeps_201(mock_cred, mock_build, api_client, drive_user):
    """
    Gdy upload do Google Drive kończy się wyjątkiem,
    backend nadal zwraca 201, a google_drive_file_id pozostaje puste.
    """
    mock_service = MagicMock()
    mock_service.files.return_value.create.return_value.execute.side_effect = Exception("Drive fail")
    mock_build.return_value = mock_service

    token = RefreshToken.for_user(drive_user)
    api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token.access_token}")

    url = reverse("save-user-json")
    payload = {
        "name": "Diagram z błędem Drive",
        "data": {"nodes": []}
    }

    resp = api_client.post(url, payload, format="json")
    assert resp.status_code == 201
    diagram = Diagram.objects.get(id=resp.data["id"])
    assert diagram.google_drive_file_id is None

