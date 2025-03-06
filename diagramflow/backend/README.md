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
- Redis (opcjonalnie dla cachowania)

## Uruchomienie lokalne

```bash
# Instalacja zależności
pip install -r requirements/development.txt

# Migracje bazy danych
python manage.py migrate

# Uruchomienie serwera deweloperskiego
python manage.py runserver
```

## API Endpoints

Dokumentacja dostępna będzie pod adresem `/api/docs/` po uruchomieniu aplikacji.
