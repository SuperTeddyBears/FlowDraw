# FlowDraw

Klon aplikacji draw.io stworzony w Django (backend) i React (frontend), wdrażany na platformie Azure.

## Opis projektu

DiagramFlow to aplikacja webowa do tworzenia różnego rodzaju diagramów, w tym flowchartów, diagramów UML i diagramów sieciowych. Pozwala na tworzenie, edycję, zapisywanie i udostępnianie diagramów innym użytkownikom.

## Funkcje

- Ponad 60 różnych kształtów do wykorzystania w diagramach
- Trzy typy diagramów: flowchart, UML, diagram sieciowy
- System rejestracji i logowania użytkowników
- Możliwość udostępniania diagramów innym użytkownikom
- Funkcje importu i eksportu diagramów

## Technologie

- **Backend**: Django, Django REST Framework, PostgreSQL
- **Frontend**: React, TypeScript, Tailwind CSS
- **Wdrożenie**: Azure Cloud, Docker

## Struktura projektu

```
diagramflow/
│
├── backend/                    # Aplikacja Django z API REST
│   ├── diagramflow/           # Główny projekt Django
│   ├── apps/                   # Moduły aplikacji
│   │   ├── accounts/          # Zarządzanie użytkownikami
│   │   ├── diagrams/          # Zarządzanie diagramami
│   │   └── sharing/           # System udostępniania
│   └── ...
│
├── frontend/                   # Aplikacja React
│   ├── src/
│   │   ├── components/        # Komponenty UI
│   │   ├── pages/             # Strony aplikacji
│   │   └── ...
│   └── ...
│
└── infrastructure/             # Konfiguracja wdrożenia
    ├── azure/                 # Konfiguracja Azure
    └── docker/                # Pliki Docker
```

## Rozwój lokalny

```bash
# Klonowanie repozytorium
git clone https://github.com/twojusername/diagramflow.git
cd diagramflow

# Uruchomienie środowiska deweloperskiego
docker-compose up
```

## Wdrażanie

Aplikacja jest przygotowana do wdrożenia na platformie Azure za pomocą Azure Web App Service i Azure Database for PostgreSQL.

## Licencja

[MIT](LICENSE)
