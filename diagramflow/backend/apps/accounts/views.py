import json
import os
import base64
from datetime import datetime

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.shortcuts import redirect

from google.oauth2 import id_token
from google.auth.transport import requests
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload

from .models import Diagram
from .serializer import DiagramSerializer

User = get_user_model()


class GoogleLoginView(APIView):
    """
    This GoogleLoginView handles the user login process from Google.
    It verifies the token received from the client and creates a user if it doesn't exist.
    """

    def post(self, request):
        try:
            # Get the token from the request
            print("Otrzymano żądanie autoryzacji Google")
            token = request.data.get('token')
            print(f"Token: {token[:20]}...")

            # Verify the token with Google
            idinfo = id_token.verify_oauth2_token(
                token,
                requests.Request(),
                os.environ.get('GOOGLE_CLIENT_ID'),
                clock_skew_in_seconds=300  # Zwiększ tolerancję do 5 minut
            )

            # Take the required information from the token
            email = idinfo['email']
            name = idinfo['name']
            picture = idinfo.get('picture')

            # Check if user exists
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,  # Use email as username
                    'name': name,
                    'image': picture,
                }
            )

            # Gen TOKEN JWT
            refresh = RefreshToken.for_user(user)

            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'image': user.image,
                }
            })
        except Exception as e:
            print(f"Błąd autoryzacji Google: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """
    This LoginView handles the user login process.
    It checks if the user exists and verifies the password.
    :param: email, password
    """

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)

            if not user.has_usable_password():
                return Response({'error': 'This account is linked to Google login. Please use Google login.'},
                                status=status.HTTP_400_BAD_REQUEST
                                )

            # If password correct
            if user.check_password(password):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'token': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'name': user.name,
                        'image': user.image,
                    }
                })
            # If password incorrect
            else:
                return Response({'error': 'Invalid password'},
                                status=status.HTTP_401_UNAUTHORIZED
                                )
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist'},
                            status=status.HTTP_404_NOT_FOUND
                            )


class RegisterView(APIView):
    """
    This RegisterView handles the user registration process.
    It creates a new user if the email does not already exist.
    """

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        name = request.data.get('name')

        try:
            # Check if user already exists
            if User.objects.filter(email=email).exists():
                return Response({'error': 'User with this email already exists'},
                                status=status.HTTP_409_CONFLICT
                                )

            # Create new user
            user = User.objects.create(
                email=email,
                username=email,  # For now, we use email as username
                name=name,
                password=make_password(password)  # Hash the password
            )

            # Generate JWT token
            refresh = RefreshToken.for_user(user)

            return Response({
                'token': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'name': user.name,
                    'image': user.image,
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR
                            )


class VerifyTokenView(APIView):
    """
    This VerifyTokenView checks if the user is authenticated.
    """
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def get(self, request):
        # If the user is authenticated, return a success response
        user = request.user

        return Response({'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name,
            'image': user.image,
        }},
            status=status.HTTP_200_OK
        )


class RefreshTokenView(APIView):
    """
    This RefreshTokenView handles the refresh token process.
    It generates a new access token using the refresh token.
    """

    def post(self, request):
        refresh = request.data.get('refresh')

        if not refresh:
            return Response({'error': 'Refresh token is required'},
                            status=status.HTTP_400_BAD_REQUEST
                            )

        try:
            # Decode the refresh token
            token = RefreshToken(refresh)

            # Generate a new access token
            new_access_token = str(token.access_token)

            return Response({
                'access': new_access_token,
                # 'refresh': str(token)
            }, status=status.HTTP_200_OK)

        except TokenError as e:
            return Response({'error': f'Bad refresh token: {str(e)}'},
                            status=status.HTTP_401_UNAUTHORIZED
                            )
        except Exception as e:
            return Response({'error': f'Error: {str(e)}'},
                            status=status.HTTP_400_BAD_REQUEST
                            )


class LogoutView(APIView):
    """
    This LogoutView handles the logout process.
    It blacklists the refresh token to prevent further use.
    """
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request):
        try:
            # Get the refresh token from the request
            refresh_token = request.data.get('refresh')

            # If the refresh token is provided, blacklist it
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()

            return Response({'message': 'Logged out successfully'},
                            status=status.HTTP_205_RESET_CONTENT
                            )
        except Exception as e:
            return Response({'error': str(e)},
                            status=status.HTTP_400_BAD_REQUEST
                            )


class SaveUserDiagramView(APIView):
    """
    Widok do zapisywania lub aktualizowania diagramu w bazie danych.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Zapisz lub nadpisz diagram w bazie danych.
        """
        data = request.data.copy()  # Kopiujemy dane, aby móc je modyfikować
        data['user'] = request.user.id  # Ustawiamy użytkownika na aktualnie zalogowanego

        # Pobieramy nazwę diagramu
        diagram_name = data.get('name')
        if not diagram_name:
            return Response({'error': 'Diagram name is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Sprawdzamy, czy diagram o danej nazwie już istnieje dla użytkownika
        try:
            existing_diagram = Diagram.objects.get(user=request.user, name=diagram_name)
            # Nadpisz istniejący diagram
            serializer = DiagramSerializer(existing_diagram, data=data, partial=True)
        except Diagram.DoesNotExist:
            # Stwórz nowy diagram
            serializer = DiagramSerializer(data=data)

        # Walidacja i zapis
        if serializer.is_valid():
            diagram = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FetchUserDiagramsView(generics.ListAPIView):
    """
    Widok do pobierania diagramów użytkownika.
    """
    permission_classes = [IsAuthenticated]  # Upewnij się, że użytkownik jest zalogowany
    serializer_class = DiagramSerializer

    def get_queryset(self):
        """
        Zwróć tylko diagramy dla aktualnie zalogowanego użytkownika.
        """
        return Diagram.objects.filter(user=self.request.user)


class ShareUserDiagramView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            print("=== ShareUserDiagramView START ===")
            print(f"User: {request.user.email}")
            print(f"Request data keys: {list(request.data.keys())}")

            # Sprawdź autoryzację - najpierw sesja, potem użytkownik
            access_token = request.session.get('google_drive_access_token')
            refresh_token = request.session.get('google_drive_refresh_token')

            print(f"Session access_token: {'YES' if access_token else 'NO'}")
            print(f"Session refresh_token: {'YES' if refresh_token else 'NO'}")

            if not access_token:
                print("Sprawdzam tokeny użytkownika...")
                if not check_google_drive_auth(request.user):
                    print("❌ Brak autoryzacji Google Drive")
                    return Response(
                        {'error': 'Wymagana autoryzacja Google Drive', 'requires_auth': True},
                        status=status.HTTP_403_FORBIDDEN
                    )
                access_token = request.user.google_drive_access_token
                refresh_token = request.user.google_drive_refresh_token
                print("✅ Używam tokenów użytkownika")
            else:
                print("✅ Używam tokenów z sesji")

            # Pobierz dane PNG z request
            png_data = request.data.get('png', '')
            diagram_name = request.data.get('name', 'diagram')

            print(f"Diagram name: '{diagram_name}'")
            print(f"PNG data length: {len(png_data)} znaków")
            print(f"PNG data starts with: {png_data[:50] if png_data else 'EMPTY'}")

            if not png_data:
                print("❌ Brak danych PNG")
                return Response(
                    {'error': 'Brak danych PNG diagramu'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Konwertuj base64 na dane binarne
            try:
                print("Dekodowanie base64...")
                if png_data.startswith('data:image/png;base64,'):
                    png_data = png_data.split(',')[1]
                    print("✅ Usunięto prefix data:image/png;base64,")

                png_binary = base64.b64decode(png_data)
                print(f"✅ Zdekodowano PNG: {len(png_binary)} bajtów")

            except Exception as e:
                print(f"❌ Błąd dekodowania PNG: {str(e)}")
                return Response(
                    {'error': f'Błąd dekodowania PNG: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Przygotuj credentials
            print("Tworzenie credentials...")
            credentials = Credentials(
                token=access_token,
                refresh_token=refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=os.environ.get('GOOGLE_CLIENT_ID'),
                client_secret=os.environ.get('GOOGLE_CLIENT_SECRET')
            )

            # Sprawdź czy token wygasł
            print(f"Token expired: {credentials.expired}")
            if credentials.expired:
                print("🔄 Token wygasł, odświeżam...")
                try:
                    credentials.refresh(requests.Request())
                    print("✅ Token odświeżony")
                    # Zapisz nowy token
                    request.session['google_drive_access_token'] = credentials.token
                    if hasattr(request.user, 'google_drive_access_token'):
                        request.user.google_drive_access_token = credentials.token
                        request.user.save()
                        print("✅ Nowy token zapisany")
                except Exception as e:
                    print(f"❌ Błąd odświeżania tokenu: {str(e)}")
                    return Response(
                        {'error': f'Błąd odświeżania tokenu: {str(e)}'},
                        status=status.HTTP_401_UNAUTHORIZED
                    )

            # Utwórz serwis Drive
            print("Tworzenie serwisu Google Drive...")
            try:
                service = build('drive', 'v3', credentials=credentials)
                print("✅ Serwis Google Drive utworzony")
            except Exception as e:
                print(f"❌ Błąd tworzenia serwisu: {str(e)}")
                return Response(
                    {'error': f'Błąd połączenia z Google Drive: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Znajdź lub utwórz folder FlowDraw
            folder_name = 'FlowDraw Diagrams'
            print(f"Szukam folderu: {folder_name}")

            try:
                # Sprawdź czy folder istnieje
                folder_query = f"name='{folder_name}' and mimeType='application/vnd.google-apps.folder' and trashed=false"
                folder_results = service.files().list(q=folder_query, fields='files(id, name)').execute()
                folders = folder_results.get('files', [])

                if folders:
                    folder_id = folders[0]['id']
                    print(f"✅ Znaleziono folder: {folder_name} (ID: {folder_id})")
                else:
                    print(f"📁 Tworzę nowy folder: {folder_name}")
                    folder_metadata = {
                        'name': folder_name,
                        'mimeType': 'application/vnd.google-apps.folder'
                    }
                    folder = service.files().create(body=folder_metadata, fields='id').execute()
                    folder_id = folder.get('id')
                    print(f"✅ Utworzono folder: {folder_name} (ID: {folder_id})")

            except Exception as e:
                print(f"⚠️  Błąd z folderem, zapisuję w root: {str(e)}")
                folder_id = None

            # Generuj nazwę pliku
            safe_name = "".join(c for c in diagram_name if c.isalnum() or c in (' ', '-', '_')).rstrip()
            if not safe_name:
                safe_name = 'diagram'

            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            file_name = f'{safe_name}_{timestamp}.png'
            print(f"Nazwa pliku: {file_name}")

            # Przygotuj metadane pliku
            file_metadata = {
                'name': file_name,
                'description': f'FlowDraw diagram: {diagram_name} - Created by {request.user.name or request.user.email}',
            }

            # Dodaj folder jako parent jeśli istnieje
            if folder_id:
                file_metadata['parents'] = [folder_id]
                print(f"📁 Plik zostanie zapisany w folderze: {folder_id}")
            else:
                print("📁 Plik zostanie zapisany w root")

            # Przygotuj plik do uploadu
            print("Przygotowuję upload...")
            media = MediaInMemoryUpload(
                png_binary,
                mimetype='image/png',
                resumable=True
            )
            print(f"✅ Media prepared: {len(png_binary)} bytes")

            # Zapisz plik na Google Drive
            print("🚀 Rozpoczynam upload do Google Drive...")
            try:
                file = service.files().create(
                    body=file_metadata,
                    media_body=media,
                    fields='id,webViewLink,name,size,parents'
                ).execute()

                print(f"🎉 SUKCES! Plik zapisany na Google Drive:")
                print(f"   - Nazwa: {file.get('name')}")
                print(f"   - ID: {file.get('id')}")
                print(f"   - Rozmiar: {file.get('size')} bajtów")
                print(f"   - Link: {file.get('webViewLink')}")
                print(f"   - Folder: {file.get('parents')}")

                return Response({
                    'success': True,
                    'message': 'Diagram zapisany na Google Drive',
                    'file_id': file.get('id'),
                    'file_name': file.get('name'),
                    'web_link': file.get('webViewLink'),
                    'file_size': file.get('size'),
                    'folder_id': folder_id,
                    'folder_name': folder_name if folder_id else 'Root'
                }, status=status.HTTP_200_OK)

            except Exception as e:
                print(f"❌ Błąd uploadu: {str(e)}")
                print(f"   Error type: {type(e).__name__}")
                if hasattr(e, 'content'):
                    print(f"   Error content: {e.content}")
                return Response(
                    {'error': f'Błąd uploadu do Google Drive: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        except Exception as e:
            print(f"💥 OGÓLNY BŁĄD w ShareUserDiagramView: {str(e)}")
            print(f"   Error type: {type(e).__name__}")
            import traceback
            print(f"   Traceback: {traceback.format_exc()}")
            return Response(
                {'error': f'Błąd serwera: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        finally:
            print("=== ShareUserDiagramView END ===\n")

def check_google_drive_auth(user):
    """Helper function to check if user has Google Drive authentication"""
    return bool(
        hasattr(user, 'google_drive_access_token') and
        hasattr(user, 'google_drive_refresh_token') and
        user.google_drive_access_token and
        user.google_drive_refresh_token
    )


class GoogleDriveAuthView(APIView):
    """
    Inicjuje proces uwierzytelniania OAuth 2.0 dla Google Drive.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            if check_google_drive_auth(request.user):
                return Response(
                    {'message': 'Użytkownik jest już zautoryzowany'},
                    status=status.HTTP_200_OK
                )

            client_config = {
                "web": {
                    "client_id": os.environ.get('GOOGLE_CLIENT_ID'),
                    "client_secret": os.environ.get('GOOGLE_CLIENT_SECRET'),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [
                        os.environ.get('GOOGLE_DRIVE_REDIRECT_URI',
                                       'http://localhost:8080/api/auth/google-drive-callback')
                    ]
                }
            }

            # Sprawdź czy wymagane zmienne środowiskowe są ustawione
            if not client_config["web"]["client_id"] or not client_config["web"]["client_secret"]:
                raise ValueError("Brak wymaganych zmiennych środowiskowych GOOGLE_CLIENT_ID lub GOOGLE_CLIENT_SECRET")

            flow = Flow.from_client_config(
                client_config,
                # ✅ TYLKO Google Drive scope - bez profile/email
                scopes=['https://www.googleapis.com/auth/drive.file']
            )

            flow.redirect_uri = client_config["web"]["redirect_uris"][0]

            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='false',  # ✅ Wyłącz automatyczne dodawanie scope
                prompt='consent'
            )

            # Zapisz state w sesji dla weryfikacji
            request.session['oauth_state'] = state

            print(f"Generated auth URL: {authorization_url}")
            print(f"State: {state}")

            return Response({'authorization_url': authorization_url})

        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            return Response(
                {'error': f'Błąd konfiguracji Google Drive: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GoogleDriveCallbackView(APIView):
    def get(self, request):
        try:
            print("=== Google Drive Callback START ===")
            code = request.GET.get('code')
            state = request.GET.get('state')
            received_scope = request.GET.get('scope', '')

            print(f"Received code: {code[:20] if code else 'None'}...")
            print(f"Received state: {state}")
            print(f"Received scope: {received_scope}")

            if not code:
                print("❌ Brak kodu autoryzacji")
                return redirect(f"{os.environ.get('FRONTEND_URL')}/dashboard?drive_error=no_code")

            # Weryfikacja state
            if 'oauth_state' in request.session:
                if state != request.session.get('oauth_state'):
                    print("❌ Nieprawidłowy state")
                    return redirect(f"{os.environ.get('FRONTEND_URL')}/dashboard?drive_error=invalid_state")

            client_config = {
                "web": {
                    "client_id": os.environ.get('GOOGLE_CLIENT_ID'),
                    "client_secret": os.environ.get('GOOGLE_CLIENT_SECRET'),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [os.environ.get('GOOGLE_DRIVE_REDIRECT_URI')]
                }
            }

            print("Tworzę flow...")
            flow = Flow.from_client_config(
                client_config,
                # ✅ Tylko Drive scope
                scopes=['https://www.googleapis.com/auth/drive.file']
            )
            flow.redirect_uri = os.environ.get('GOOGLE_DRIVE_REDIRECT_URI')

            print("Wymieniam kod na token...")
            # Exchange code for token
            flow.fetch_token(code=code)
            credentials = flow.credentials

            print(f"✅ Otrzymano credentials:")
            print(f"   - Access token: {credentials.token[:20]}...")
            print(f"   - Refresh token: {'YES' if credentials.refresh_token else 'NO'}")
            print(f"   - Expires: {credentials.expiry}")

            # Zapisz tokeny w sesji
            request.session['google_drive_access_token'] = credentials.token
            request.session['google_drive_refresh_token'] = credentials.refresh_token
            request.session['google_drive_authorized'] = True
            request.session['google_drive_expires'] = credentials.expiry.isoformat() if credentials.expiry else None

            print("✅ Tokeny zapisane w sesji")

            # Testuj od razu połączenie z Drive API
            try:
                from googleapiclient.discovery import build
                service = build('drive', 'v3', credentials=credentials)
                about = service.about().get(fields='user').execute()
                print(f"✅ Test Drive API - użytkownik: {about.get('user', {}).get('emailAddress')}")
            except Exception as e:
                print(f"⚠️  Test Drive API failed: {str(e)}")

            print("=== Google Drive Callback SUCCESS ===")
            return redirect(f"{os.environ.get('FRONTEND_URL')}/dashboard?drive_connected=true")

        except Exception as e:
            print(f"❌ Google Drive callback error: {str(e)}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            return redirect(f"{os.environ.get('FRONTEND_URL')}/dashboard?drive_error=callback_failed")


class CheckGoogleDriveAuthView(APIView):
    def get(self, request):
        # Sprawdź TYLKO sesję (bo tam są tokeny)
        is_authorized = bool(
            request.session.get('google_drive_access_token') and
            request.session.get('google_drive_authorized')
        )

        print(f"🔍 Google Drive auth check:")
        print(f"   - Session has access_token: {'YES' if request.session.get('google_drive_access_token') else 'NO'}")
        print(f"   - Session authorized flag: {'YES' if request.session.get('google_drive_authorized') else 'NO'}")
        print(f"   - Final result: {is_authorized}")

        return Response({'is_authorized': is_authorized})