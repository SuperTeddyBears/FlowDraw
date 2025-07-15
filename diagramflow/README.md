# DiagramFlow

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

Projekt jest podzielony na dwie główne części:

- `backend/` - aplikacja Django z API REST
- `frontend/` - aplikacja React

## Rozwój lokalny

Instrukcje dotyczące konfiguracji środowiska deweloperskiego i uruchamiania aplikacji lokalnie.

```bash
# Klonowanie repozytorium
git clone https://github.com/twojusername/diagramflow.git
cd diagramflow

# Uruchomienie z Docker Compose
docker-compose up
```

## Licencja

[MIT](LICENSE)
