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
    Widok do zapisywania nowego diagramu do bazy danych i Google Drive.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Zapisz nowy diagram do bazy danych i Google Drive.
        """
        data = request.data
        data['user'] = request.user.id  # Ustaw użytkownika na aktualnie zalogowanego

        # Serializuj dane
        serializer = DiagramSerializer(data=data)

        if serializer.is_valid():
            # Zapisz diagram do bazy danych
            diagram = serializer.save()

            # Save to Google Drive if user has authenticated
            if request.user.google_drive_access_token:
                try:
                    # Create or refresh credentials
                    credentials = Credentials(
                        token=request.user.google_drive_access_token,
                        refresh_token=request.user.google_drive_refresh_token,
                        token_uri='https://oauth2.googleapis.com/token',
                        client_id=os.environ.get('GOOGLE_CLIENT_ID'),
                        client_secret=os.environ.get('GOOGLE_CLIENT_SECRET')
                    )

                    # Build Google Drive service
                    drive_service = build('drive', 'v3', credentials=credentials)

                    # Create file metadata
                    file_metadata = {
                        'name': f'Diagram_{diagram.id}.json',
                        'mimeType': 'application/json'
                    }

                    # Convert diagram data to JSON string
                    diagram_data = json.dumps(serializer.data)

                    # Create media upload
                    media = MediaInMemoryUpload(
                        diagram_data.encode('utf-8'),
                        mimetype='application/json',
                        resumable=True
                    )

                    # Upload to Google Drive
                    file = drive_service.files().create(
                        body=file_metadata,
                        media_body=media,
                        fields='id'
                    ).execute()

                    # Save Google Drive file ID to the diagram
                    diagram.google_drive_file_id = file.get('id')
                    diagram.save()

                except Exception as e:
                    print(f"Błąd zapisu na Google Drive: {str(e)}")
                    # Continue even if Google Drive save fails
                    pass

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


class GoogleDriveAuthView(APIView):
    """
    Initiates Google Drive OAuth 2.0 authentication flow.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        flow = InstalledAppFlow.from_client_secrets_file(
            'path/to/client_secrets.json',  # Update with the path to your credentials file
            scopes=['https://www.googleapis.com/auth/drive.file']
        )
        flow.redirect_uri = os.environ.get('GOOGLE_DRIVE_REDIRECT_URI',
                                           'http://localhost:8000/auth/google-drive-callback')

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true'
        )

        # Store state in session to verify later
        request.session['oauth_state'] = state
        return Response({'authorization_url': authorization_url}, status=status.HTTP_200_OK)


class GoogleDriveCallbackView(APIView):
    """
    Handles the Google Drive OAuth 2.0 callback.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        state = request.GET.get('state')
        if state != request.session.get('oauth_state'):
            return Response({'error': 'Invalid state parameter'}, status=status.HTTP_400_BAD_REQUEST)

        flow = InstalledAppFlow.from_client_secrets_file(
            'path/to/client_secrets.json',  # Update with the path to your credentials file
            scopes=['https://www.googleapis.com/auth/drive.file']
        )
        flow.redirect_uri = os.environ.get('GOOGLE_DRIVE_REDIRECT_URI',
                                           'http://localhost:8000/auth/google-drive-callback')

        # Fetch the token
        flow.fetch_token(authorization_response=request.build_absolute_uri())
        credentials = flow.credentials

        # Save tokens to the user
        user = request.user
        user.google_drive_access_token = credentials.token
        user.google_drive_refresh_token = credentials.refresh_token
        user.save()

        return Response({'message': 'Google Drive authentication successful'}, status=status.HTTP_200_OK)