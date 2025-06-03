import json
from tokenize import TokenError

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Diagram
from .serializer import DiagramSerializer
from google_auth_oauthlib.flow import InstalledAppFlow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaInMemoryUpload
import base64
from datetime import datetime
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

    def get_queryset(self):
        """
        Zwróć tylko diagramy dla aktualnie zalogowanego użytkownika.
        """
        return Diagram.objects.filter(user=self.request.user)

    serializer_class = DiagramSerializer


class ShareUserDiagramView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if check_google_drive_auth(request.user):
                return Response(
                    {'message': 'Użytkownik jest już zautoryzowany'},
                    status=status.HTTP_200_OK
                )
            # Pobierz dane PNG z formData
            png_data = request.data.get('png', '')

            # Konwertuj base64 na dane binarne
            if png_data.startswith('data:image/png;base64,'):
                png_data = png_data.split(',')[1]
            png_binary = base64.b64decode(png_data)

            # Generuj nazwę pliku
            file_name = f'diagram_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'

            # Sprawdź czy użytkownik ma token Google Drive
            if not request.user.google_drive_access_token:
                return Response({'error': 'Wymagana autoryzacja Google Drive'},
                                status=status.HTTP_403_FORBIDDEN)

            # Przygotuj credentials
            credentials = Credentials(
                token=request.user.google_drive_access_token,
                refresh_token=request.user.google_drive_refresh_token,
                token_uri='https://oauth2.googleapis.com/token',
                client_id=os.environ.get('GOOGLE_CLIENT_ID'),
                client_secret=os.environ.get('GOOGLE_CLIENT_SECRET')
            )

            # Utwórz serwis Drive
            service = build('drive', 'v3', credentials=credentials)

            # Przygotuj metadane i plik
            file_metadata = {'name': file_name}
            media = MediaInMemoryUpload(
                png_binary,
                mimetype='image/png',
                resumable=True
            )

            # Zapisz plik na Google Drive
            file = service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id,webViewLink'
            ).execute()

            return Response({
                'file_id': file.get('id'),
                'web_link': file.get('webViewLink')
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Błąd zapisu na Google Drive: {str(e)}")
            return Response(
                {'error': f'Błąd zapisu na Google Drive: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


def check_google_drive_auth(user):
    return bool(user.google_drive_access_token and user.google_drive_refresh_token)


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

            flow = InstalledAppFlow.from_client_config(
                client_config,
                scopes=['https://www.googleapis.com/auth/drive.file']
            )

            flow.redirect_uri = client_config["web"]["redirect_uris"][0]

            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true'
            )

            request.session['oauth_state'] = state
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
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            state = request.GET.get('state')
            if state != request.session.get('oauth_state'):
                return Response(
                    {'error': 'Nieprawidłowy parametr state'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            client_config = {
                "web": {
                    "client_id": os.environ.get('GOOGLE_CLIENT_ID'),
                    "client_secret": os.environ.get('GOOGLE_CLIENT_SECRET'),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            }

            flow = InstalledAppFlow.from_client_config(
                client_config,
                scopes=['https://www.googleapis.com/auth/drive.file']
            )

            flow.redirect_uri = os.environ.get('GOOGLE_DRIVE_REDIRECT_URI',
                                               'http://localhost:8080/api/auth/google-drive-callback')

            flow.fetch_token(authorization_response=request.build_absolute_uri())
            credentials = flow.credentials

            user = request.user
            user.google_drive_access_token = credentials.token
            user.google_drive_refresh_token = credentials.refresh_token
            user.save()

            return Response({'message': 'Autoryzacja Google Drive zakończona sukcesem'})

        except Exception as e:
            return Response(
                {'error': f'Błąd podczas callback Google Drive: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class CheckGoogleDriveAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        is_authorized = bool(
            request.user.google_drive_access_token and
            request.user.google_drive_refresh_token
        )
        return Response({'is_authorized': is_authorized})