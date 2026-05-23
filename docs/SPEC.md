# Specyfikacja Projektu: Wirtualny Asystent Garderoby (Virtual Wardrobe)

## 1. Cel Projektu

Aplikacja webowa typu SPA (Single Page Application) do zarządzania prywatną garderobą. Użytkownicy mogą:

- Dodawać posiadane ubrania do wirtualnej szafy
- Tagować je i kategoryzować
- Zestawiać outfity za pomocą interaktywnej karuzeli
- Wizualizować ubrania na własnej sylwetce przy użyciu modeli AI (Virtual Try-On)

Architektura **multi-tenant** na poziomie logiki — każdy użytkownik posiada własne, w pełni wyizolowane konto i dashboard.

---

## 2. Stos Technologiczny

| Warstwa       | Technologia                                              |
|---------------|----------------------------------------------------------|
| Frontend      | React lub Angular, CSS (scroll-snap dla karuzeli)        |
| Backend       | Java, Spring Boot (Web, Security, Data JPA)              |
| Baza danych   | PostgreSQL                                               |
| File storage  | MinIO (lokalny, kompatybilny z S3)                       |
| Autentykacja  | JWT (JSON Web Tokens)                                    |
| Integracja AI | Replicate API (IDM-VTON lub OOTDiffusion)                |

---

## 3. Architektura Systemu

```
[Frontend SPA]
     |
     | REST API + JWT w nagłówku Authorization
     v
[Spring Boot Backend]
     |              |
     v              v
[PostgreSQL]    [MinIO]
 (metadane)    (zdjęcia ubrań, zdjęcie bazowe usera)
                    |
                    v (przy Try-On)
            [Replicate API]
            (model AI VTON)
```

**Przepływ Try-On:**
1. Użytkownik wybiera ubranie i klika "Wizualizuj"
2. Backend pobiera `base_photo_url` użytkownika z MinIO
3. Backend pobiera `image_url` wybranego ubrania z MinIO
4. Backend wysyła oba pliki do Replicate API
5. Backend zwraca na frontend URL wygenerowanego zdjęcia

---

## 4. Model Danych

### Encje

#### `User`
| Pole             | Typ    | Opis                                    |
|------------------|--------|-----------------------------------------|
| id               | UUID   | PK                                      |
| email            | String | unikalny                                |
| password_hash    | String | bcrypt                                  |
| base_photo_url   | String | URL zdjęcia bazowego (MinIO) do AI      |
| created_at       | TS     |                                         |

#### `Category` (Enum)
- `HEAD`
- `TOP`
- `BOTTOM`
- `SHOES`
- `ACCESSORIES`

#### `Tag`
Predefiniowany słownik tagów, np.: `casual`, `smart`, `sport`, `zima`, `lato`

#### `Garment`
| Pole      | Typ    | Opis                                    |
|-----------|--------|-----------------------------------------|
| id        | UUID   | PK                                      |
| user_id   | UUID   | FK → User (izolacja multi-tenant)       |
| name      | String |                                         |
| brand     | String |                                         |
| color     | String |                                         |
| season    | String |                                         |
| category  | Enum   | Category                                |
| image_url | String | ścieżka w MinIO                         |

- Relacja **Many-to-Many** z `Tag`
- **Max 3 tagi** na ubranie — walidacja po stronie backendu

#### `Outfit`
| Pole       | Typ    | Opis                          |
|------------|--------|-------------------------------|
| id         | UUID   | PK                            |
| user_id    | UUID   | FK → User                    |
| name       | String |                               |
| created_at | TS     |                               |

#### `Outfit_Garment` (tabela łącząca)
| Pole        | Typ  |
|-------------|------|
| outfit_id   | UUID |
| garment_id  | UUID |

### Diagram relacji (uproszczony)

```
User 1──* Garment *──* Tag
User 1──* Outfit  *──* Garment
```

---

## 5. REST API

### Auth

| Metoda | Endpoint              | Opis                          | Auth |
|--------|-----------------------|-------------------------------|------|
| POST   | `/api/auth/register`  | Rejestracja nowego użytkownika | —    |
| POST   | `/api/auth/login`     | Logowanie, zwraca JWT          | —    |

### Garments

| Metoda | Endpoint              | Opis                                                         | Auth |
|--------|-----------------------|--------------------------------------------------------------|------|
| GET    | `/api/garments`       | Lista ubrań usera; query params: `?category=TOP&tag=casual`  | JWT  |
| POST   | `/api/garments`       | Dodanie ubrania (`multipart/form-data`: zdjęcie + metadane)  | JWT  |
| PUT    | `/api/garments/{id}`  | Edycja metadanych ubrania                                    | JWT  |
| DELETE | `/api/garments/{id}`  | Usunięcie ubrania + pliku z MinIO                            | JWT  |

### Outfits

| Metoda | Endpoint              | Opis                                         | Auth |
|--------|-----------------------|----------------------------------------------|------|
| GET    | `/api/outfits`        | Lista zapisanych outfitów                    | JWT  |
| POST   | `/api/outfits`        | Nowy outfit (body: lista `garment_id`)       | JWT  |
| DELETE | `/api/outfits/{id}`   | Usunięcie zestawu                            | JWT  |

### Try-On (AI) — strategia: Polling

| Metoda | Endpoint                    | Opis                                                                 | Auth |
|--------|-----------------------------|----------------------------------------------------------------------|------|
| POST   | `/api/try-on`               | Body: `garment_id`. Tworzy job w Replicate, zwraca `{ jobId, status: "PENDING" }` | JWT  |
| GET    | `/api/try-on/{jobId}/status` | Odpytywanie statusu joba. Zwraca `{ status, resultUrl? }`           | JWT  |

**Przepływ:**
1. Frontend `POST /api/try-on` → dostaje `jobId`
2. Frontend co ~3s woła `GET /api/try-on/{jobId}/status`
3. Gdy `status: "DONE"` — frontend podmienia zdjęcie na `resultUrl`

---

## 6. Interfejs Użytkownika

### Dashboard (Szafa)
- Widok **Grid** wszystkich ubrań użytkownika
- Przyciski filtrowania u góry: `Buty | Dół | Góra | Głowa | Akcesoria`
- Przycisk "Dodaj ubranie" otwierający formularz / modal

### Kreator Outfitu (Karuzela)
- Ekran roboczy podzielony w pionie na **5 rzędów** (jedna kategoria = jeden rząd)
- Każdy rząd to pozioma lista z obsługą:
  - **swipe** na mobile
  - **scroll** na desktopie (CSS `scroll-snap`)

### Moduł Wizualizacji (Try-On)
- Karta z bazowym zdjęciem użytkownika (obok lub pod karuzelą)
- Po kliknięciu "Wizualizuj na mnie":
  - Wyświetla się **loader**
  - Po odpowiedzi AI — zdjęcie zastępowane wynikiem z modelu VTON

### UX / Makiety
- Zalecane przygotowanie makiet w **Figmie** przed kodowaniem
- Od razu definiować zmienne dla **trybu jasnego i ciemnego** (light/dark mode)

---

## 7. Bezpieczeństwo

- Każdy endpoint (poza `/api/auth/*`) wymaga ważnego JWT
- Backend zawsze filtruje zasoby po `user_id` z tokenu — uniemożliwia dostęp do danych innych użytkowników
- Walidacja backendu: max 3 tagi na ubranie, poprawność `category`, istnienie `garment_id` przy tworzeniu outfitu
- Hasła hashowane (bcrypt)
- MinIO — zdjęcia przechowywane wewnętrznie, URL-e podpisane lub dostępne tylko przez backend

---

## 8. Decyzje Techniczne

| Kwestia                        | Decyzja                                                    |
|--------------------------------|------------------------------------------------------------|
| Frontend                       | **React**                                                  |
| Backend                        | **Java 17, Spring Boot 4.0.x**                             |
| URL-e MinIO                    | **Publiczne URL-e** (MVP; presigned URLs jako future work) |
| Tagi                           | Predefiniowane + **użytkownik może tworzyć własne**        |
| Max liczba ubrań               | Brak limitu                                                |
| Max rozmiar zdjęcia            | Do ustalenia (TBD)                                         |
| Try-On — strategia komunikacji | **Polling** (MVP); webhook/SSE jako future work            |

---

## 9. Kolejne Kroki (Proponowana Kolejność)

1. Makiety UI (Figma) — light/dark mode
2. Inicjalizacja projektu (Spring Boot Initializr + frontend scaffold)
3. Baza danych: migracje Flyway/Liquibase, encje JPA
4. Auth: rejestracja, logowanie, JWT filter
5. CRUD Garments + integracja MinIO
6. CRUD Outfits
7. Widok Dashboard + Karuzela (frontend)
8. Integracja Try-On (Replicate API)
9. Testy, code review, deploy

---

*Ostatnia aktualizacja: 2026-05-17*
