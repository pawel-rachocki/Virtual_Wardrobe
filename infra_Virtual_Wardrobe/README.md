# Infrastruktura lokalna — Virtual Wardrobe

Lokalne usługi developerskie uruchamiane przez Docker Compose: **PostgreSQL** (metadane) i **MinIO** (pliki, zgodne z S3).

## Wymagania

- Docker + Docker Compose

## Uruchomienie

```bash
# 1. Skopiuj szablon zmiennych i (opcjonalnie) dostosuj wartości
cp .env.example .env

# 2. Wystartuj usługi w tle
docker compose up -d

# 3. Sprawdź status (oba kontenery powinny być "healthy")
docker compose ps
```

> `.env` jest ignorowany przez git (zawiera sekrety). Bez pliku `.env` Compose użyje wartości domyślnych zdefiniowanych w `docker-compose.yml`.

## Dostęp

| Usługa            | Adres                          | Dane logowania            |
|-------------------|--------------------------------|---------------------------|
| PostgreSQL        | `localhost:5432`               | `postgres` / `postgres`   |
| MinIO API (S3)    | `http://localhost:9000`        | `minioadmin` / `minioadmin` |
| MinIO Console     | `http://localhost:9001`        | `minioadmin` / `minioadmin` |

Bucket `wardrobe` jest tworzony automatycznie przy starcie backendu (`StorageInitializer`) z polityką publicznego odczytu (MVP).

## Zatrzymanie

```bash
docker compose down          # zatrzymuje kontenery (dane zostają w wolumenach)
docker compose down -v       # zatrzymuje i USUWA dane (pgdata, minio_data)
```

## Zmienne środowiskowe

Lista zmiennych w `.env.example`. Te same wartości (poprzez zmienne środowiskowe) czyta backend w `application.yml` — patrz blok `storage:`.
