# DiagramFlow Backend

Backend aplikacji DiagramFlow, napisany w Django i Django REST Framework.

## Struktura aplikacji

- `diagramflow/` - główny projekt Django
- `apps/` - moduły aplikacji:
  - `accounts/` - zarządzanie użytkownikami i autentykacja
  - `diagrams/` - zarządzanie diagramami i elementami
  - `sharing/` - system udostępniania i uprawnień

## Wymagania

- Python 3.8+
- PostgreSQL 12+
- Django i Django REST Framework
- Google OAuth dla autentykacji (opcjonalnie)

## Konfiguracja środowiska

Utwórz plik `.env` w katalogu głównym z następującymi zmiennymi:

```
GOOGLE_CLIENT_ID=twoj_google_client_id
GOOGLE_CLIENT_SECRET=twoj_google_client_secret
SECRET_KEY=twoj_tajny_klucz_django
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
DATABASE_URL=postgresql://uzytkownik:haslo@host:port/nazwa_bazy
```

## Uruchomienie lokalne

```bash
# Instalacja zależności
poetry install

# Migracje bazy danych - TYLKO PRZY PIERWSZYM URUCHOMIENIU
python manage.py makemigrations
python manage.py migrate

# Uruchomienie serwera deweloperskiego
python manage.py runserver 8080
```

## Endpointy API dla autentykacji

- `POST /api/auth/google` - logowanie przez Google OAuth
- `POST /api/auth/login` - standardowe logowanie (email/hasło)
- `POST /api/auth/register` - rejestracja nowego użytkownika
- `GET /api/auth/verify` - weryfikacja tokenu JWT
- `POST /api/auth/refresh` - odświeżenie tokenu JWT
- `POST /api/auth/logout` - wylogowanie (unieważnienie tokenu)

## Integracja z frontendem

Aby zintegrować backend z frontendem React:

1. Upewnij się, że CORS jest poprawnie skonfigurowany
2. Frontend powinien wysyłać żądania do `http://localhost:8080/api/...`
3. Po uwierzytelnieniu, zapisuj token JWT i używaj go w nagłówku `Authorization: Bearer {token}` dla kolejnych żądań

## Rozwiązywanie problemów

- Jeśli występują problemy z CORS, upewnij się, że odpowiednie nagłówki są akceptowane
- Przy problemach z autentykacją Google, sprawdź czy konfiguracja OAuth w Google Cloud Console jest poprawna
- W przypadku błędów z bazą danych, sprawdź poprawność `DATABASE_URL` i czy baza jest dostępna

## Dokumentacja API

Pełna dokumentacja API będzie dostępna w przyszłości pod adresem `/api/docs/` po dodaniu Swagger/OpenAPI.