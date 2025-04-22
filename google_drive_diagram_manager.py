import json
import os
import tempfile
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
import io
from typing import Dict, Any
import logging

# Konfiguracja loggera
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class GoogleDriveDiagramManager:
    """Klasa do zarządzania zapisywaniem i odczytywaniem diagramów na Dysku Google."""

    SCOPES = ['https://www.googleapis.com/auth/drive.file']
    CREDENTIALS_FILE = 'credentials.json'
    TOKEN_FILE = 'token.json'

    def __init__(self):
        """Inicjalizacja serwisu Google Drive."""
        self.service = self._authenticate()

    def _authenticate(self):
        """Uwierzytelnianie za pomocą OAuth 2.0."""
        creds = None
        if os.path.exists(self.TOKEN_FILE):
            creds = Credentials.from_authorized_user_file(self.TOKEN_FILE, self.SCOPES)

        if not creds or not creds.valid:
            flow = InstalledAppFlow.from_client_secrets_file(self.CREDENTIALS_FILE, self.SCOPES)
            creds = flow.run_local_server(port=0)
            with open(self.TOKEN_FILE, 'w') as token:
                token.write(creds.to_json())

        return build('drive', 'v3', credentials=creds)

    def save_diagram(self, diagram: Dict[str, Any], diagram_id: str) -> str:
        """
        Zapisuje diagram jako plik JSON na Dysku Google.

        Args:
            diagram: Słownik reprezentujący diagram.
            diagram_id: Unikalny identyfikator diagramu.

        Returns:
            ID pliku na Dysku Google.
        """
        try:
            # Konwersja diagramu do JSON
            json_data = json.dumps(diagram, indent=2)
            file_name = f'diagram_{diagram_id}.json'

            # Zapis do tymczasowego pliku
            with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as temp_file:
                temp_file.write(json_data)
                temp_file_path = temp_file.name

            # Przygotowanie pliku do przesłania
            file_metadata = {
                'name': file_name,
                'mimeType': 'application/json'
            }
            media = MediaFileUpload(
                temp_file_path,
                mimetype='application/json',
                resumable=True
            )

            # Wysłanie pliku na Dysk Google
            file = self.service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id'
            ).execute()

            # Usunięcie tymczasowego pliku
            os.unlink(temp_file_path)

            logger.info(f"Zapisano diagram {diagram_id} jako plik {file_name} (ID: {file.get('id')})")
            return file.get('id')

        except Exception as e:
            logger.error(f"Błąd podczas zapisywania diagramu {diagram_id}: {str(e)}")
            raise

    def load_diagram(self, file_id: str) -> Dict[str, Any]:
        """
        Odczytuje diagram JSON z Dysku Google.

        Args:
            file_id: ID pliku na Dysku Google.

        Returns:
            Słownik reprezentujący diagram.
        """
        try:
            request = self.service.files().get_media(fileId=file_id)
            file_io = io.BytesIO()
            downloader = MediaIoBaseDownload(file_io, request)

            done = False
            while not done:
                status, done = downloader.next_chunk()

            file_io.seek(0)
            diagram = json.loads(file_io.read().decode('utf-8'))

            logger.info(f"Odczytano diagram z pliku ID: {file_id}")
            return diagram

        except Exception as e:
            logger.error(f"Błąd podczas odczytywania diagramu z pliku ID {file_id}: {str(e)}")
            raise

    def delete_diagram(self, file_id: str) -> None:
        """
        Usuwa diagram z Dysku Google.

        Args:
            file_id: ID pliku na Dysku Google.
        """
        try:
            self.service.files().delete(fileId=file_id).execute()
            logger.info(f"Usunięto diagram z pliku ID: {file_id}")
        except Exception as e:
            logger.error(f"Błąd podczas usuwania pliku ID {file_id}: {str(e)}")
            raise


# Przykład użycia
if __name__ == "__main__":
    sample_diagram = {
        "diagramId": "12345",
        "nodes": [{"id": "n1", "type": "rect", "position": {"x": 100, "y": 200}}],
        "edges": [{"source": "n1", "target": "n2"}],
        "metadata": {"created": "2025-04-22", "author": "user1"}
    }

    manager = GoogleDriveDiagramManager()
    file_id = manager.save_diagram(sample_diagram, sample_diagram["diagramId"])
    loaded_diagram = manager.load_diagram(file_id)
    print("Odczytany diagram:", json.dumps(loaded_diagram, indent=2))
    manager.delete_diagram(file_id)

# Testy jednostkowe
import unittest
from unittest.mock import patch, MagicMock


class TestGoogleDriveDiagramManager(unittest.TestCase):
    def setUp(self):
        patcher = patch('googleapiclient.discovery.build')
        self.mock_build = patcher.start()
        self.addCleanup(patcher.stop)

        # Przygotuj fałszywy serwis i jego podmetody
        self.mock_service = MagicMock()
        self.mock_files = MagicMock()
        self.mock_build.return_value = self.mock_service
        self.mock_service.files.return_value = self.mock_files

        # Utwórz instancję klasy z zamockowanym serwisem
        self.manager = GoogleDriveDiagramManager()
        self.sample_diagram = {
            "diagramId": "test123",
            "nodes": [{"id": "n1", "type": "rect"}],
            "edges": [],
            "metadata": {"created": "2025-04-22"}
        }

    @patch('googleapiclient.http.MediaFileUpload')
    @patch('tempfile.NamedTemporaryFile')
    @patch('os.unlink')
    def test_save_diagram(self, mock_unlink, mock_tempfile, mock_media_upload):
        # przygotowanie
        mock_temp_file = MagicMock()
        mock_temp_file.name = 'temp_file.json'
        mock_tempfile.return_value.__enter__.return_value = mock_temp_file

        # stwórz fizyczny plik tymczasowy (konieczne!)
        with open('temp_file.json', 'w', encoding='utf-8') as f:
            json.dump(self.sample_diagram, f)

        mock_create = MagicMock()
        mock_create.execute.return_value = {'id': 'mock_file_id'}
        self.mock_files.create.return_value = mock_create

        file_id = self.manager.save_diagram(self.sample_diagram, self.sample_diagram["diagramId"])
        self.assertEqual(file_id, 'mock_file_id')
        mock_unlink.assert_called_once_with('temp_file.json')

        # sprzątanie
        os.remove('temp_file.json')

    @patch('googleapiclient.http.MediaIoBaseDownload')
    def test_load_diagram(self, mock_downloader):
        # Przygotowanie fałszywego pliku
        file_content = json.dumps(self.sample_diagram).encode('utf-8')
        fake_file = io.BytesIO()

        # Zamockowanie get_media() -> zwraca obiekt do pobierania
        mock_request = MagicMock()
        self.mock_files.get_media.return_value = mock_request

        # Mock downloader
        mock_downloader_instance = mock_downloader.return_value
        mock_downloader_instance.next_chunk.side_effect = lambda: (None, True)

        def fake_download(io_obj):
            io_obj.write(file_content)
            io_obj.seek(0)

        # Udajemy, że downloader działa poprawnie
        mock_downloader_instance._fd = fake_file
        mock_downloader.side_effect = lambda request, fh: fake_download(fh) or mock_downloader_instance

        loaded_diagram = self.manager.load_diagram('mock_file_id')
        self.assertEqual(loaded_diagram, self.sample_diagram)


if __name__ == "__main__":
    unittest.main()