from tokenize import TokenError

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from google.oauth2 import id_token
from google.auth.transport import requests
import os
from rest_framework.permissions import IsAuthenticated

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
    """

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        try:
            user = User.objects.get(email=email)

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
