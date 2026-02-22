# QuickBite – Food Ordering & Delivery Platform

## Opis aplikacije

U procesu poručivanja hrane često se javljaju problemi kao što su neorganizovana komunikacija između kupca, prodavnice i dostavljača, nedovoljno jasan pregled toka porudžbine, kao i neizvesnost oko vremena dostave. Korisnici često nemaju tačnu informaciju da li je porudžbina prihvaćena, da li je u pripremi, da li je spremna za preuzimanje ili je već na putu, što stvara frustraciju i dodatne upite prema prodavnici.

Sa druge strane, prodavnice i dostavljači često nemaju centralizovan pregled obaveza, pa se proces oslanja na ručne dogovore i nepraktične kanale komunikacije. Zbog toga je potrebno rešenje koje omogućava jednostavno poručivanje, brzu obradu porudžbina i transparentno praćenje dostave, uz prikaz lokacija prodavnica na mapi i povezivanje lokacije prodavnice sa lokacijom isporuke.

**QuickBite** je veb aplikacija koja digitalizuje i pojednostavljuje proces poručivanja hrane kroz jedinstven sistem u kome se porudžbina kreira, obrađuje i isporučuje kroz jasno definisan tok statusa. Cilj aplikacije je da smanji broj ručnih koraka i nejasnoća u procesu, omogući prodavnici bržu obradu (prihvatanje/odbijanje i priprema), dostavljaču jasan uvid u porudžbine spremne za dostavu, a kupcu stalan uvid u stanje porudžbine.

Poseban fokus aplikacije je rad sa mapom: prodavnice/restorani su prikazani na mapi, kupac unosi lokaciju isporuke, a sistem koristi geolokacijske podatke za procenu udaljenosti i vremena dostave (ETA), čime se povećava transparentnost i korisničko zadovoljstvo.

### Uloge u sistemu

Sistem koriste četiri grupe korisnika:

- **Kupac (buyer)** – pregled prodavnica, izbor menija, kreiranje porudžbine, praćenje i otkazivanje porudžbine.
- **Prodavnica / restoran (shop owner)** – upravljanje proizvodima i obrada porudžbina kroz statuse (accepted, preparing, ready_for_delivery…).
- **Dostavljač (delivery)** – pregled porudžbina spremnih za dostavu, preuzimanje i potvrda isporuke (delivering → delivered).
- **Administrator (admin)** – nadzor nad sistemom i upravljanje korisnicima (pregled + brisanje).

### Funkcionalnosti (sažetak)

- Registracija, prijava i odjava korisnika
- Prikaz prodavnica na mapi + filtriranje/pretraga
- Pregled menija prodavnice i kreiranje porudžbine sa stavkama
- Praćenje statusa porudžbine i otkazivanje (kupac)
- Obrada porudžbina (shop owner) i tok dostave (delivery)
- Admin ekran za pregled/brisanje korisnika

### Slučajevi korišćenja (SK)

**Opšti (svi korisnici):**
- SK1: Registracija
- SK2: Prijava
- SK3: Logout

**Kupac:**
- SK4: Pregled prodavnica i filtriranje
- SK5: Pregled menija prodavnice (products po jednoj prodavnici)
- SK6: Kreiranje porudžbine
- SK7: Pregled mojih porudžbina
- SK8: Detalji jedne porudžbine
- SK9: Otkazivanje porudžbine (promena statusa)

**Prodavnica:**
- SK10: Kreiranje proizvoda
- SK11: Izmena proizvoda
- SK12: Brisanje proizvoda
- SK13: Pregled svih proizvoda
- SK14: Pregled porudžbina za prodavnicu
- SK15: Promena statusa porudžbine (accepted/canceled/preparing/ready_for_delivery)

**Dostavljač:**
- SK16: Pregled porudžbina spremnih za dostavu (ready_for_delivery)
- SK17: Preuzimanje porudžbine (delivering)
- SK18: Potvrda isporuke (delivered)

**Admin:**
- SK19: Pregled korisnika
- SK20: Brisanje korisnika

---

## Tehnologije korišćene

- **Frontend:** React (CRA) + JavaScript, axios
- **Backend:** Laravel (PHP) – REST API, JSON odgovori
- **Baza:** MySQL
- **Autentikacija:** Token-based (Laravel Sanctum / Bearer token)
- **Mape:** Leaflet + react-leaflet (OpenStreetMap tile layer)
- **Integracije (javni servisi):**
  - **Pexels API** – dinamički banner/hero sadržaj (fotografije visoke rezolucije)
  - **OpenStreetMap / Nominatim** – prikaz mape + geokodiranje adrese (tekst → lat/lng)
- **Dev alatke:** Node.js, Composer, (opciono XAMPP za lokalni MySQL/PHP setup)
- **Docker:** Dockerfile + docker-compose (frontend, backend, MySQL)

---

## Pokretanje projekta lokalno (bez Docker-a)

> instalirani **Node.js 18+**, **PHP 8.2+**, **Composer**, i **MySQL** (npr. kroz XAMPP).

### 1) Kloniranje repozitorijuma

```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-aplikacijazanarucivanjehrane_2018_0124
```

### 2) Backend (Laravel)

```bash
cd quickbite-be
composer install
cp .env.example .env
php artisan key:generate
```

Zatim u `.env` podesi konekciju ka bazi (primer):

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=quickbite_db
DB_USERNAME=root
DB_PASSWORD=
```

Pokreni migracije i seed:

```bash
php artisan migrate:fresh --seed
php artisan serve
```

Backend API (podrazumevano) radi na:
- `http://127.0.0.1:8000/api`

### 3) Frontend (React)

```bash
cd quickbite-fe
npm install
npm start
```

Frontend radi na:
- `http://localhost:3000`

### 4) (Opcionalno) Environment promenljive za frontend

Ako koristiš Pexels API na frontendu, u `frontend/.env` dodaj:

```env
REACT_APP_PEXELS_API_KEY=YOUR_PEXELS_KEY
```

---

## Pokretanje projekta uz Docker (docker-compose)

> Pretpostavke: instaliran i pokrenut **Docker Desktop**.  

### 1) Kloniranje repozitorijuma

```bash
git clone https://github.com/elab-development/internet-tehnologije-2025-aplikacijazanarucivanjehrane_2018_0124
```

### 2) Build i pokretanje servisa

```bash
docker compose down -v
docker compose up --build
```

U tipičnoj docker-compose postavci podižu se sledeći servisi:
- **frontend** (React)
- **backend** (Laravel API)
- **db** (MySQL)

### 3) Pristup aplikaciji

Nakon podizanja kompozicije:
- Frontend: `http://localhost:3000`
- Backend API: `http://127.0.0.1:8000/api`

---

## Napomene

- Sistem koristi role-based pristup (buyer/shop/delivery/admin) i vraća JSON odgovore u standardizovanom formatu (`success`, `message`, `data`).
- Mapa koristi OpenStreetMap tile sloj i prikazuje markere prodavnica na osnovu `lat/lng` koordinata.
- Pexels integracija služi za vizuelno obogaćivanje UI-a (banner slike), bez potrebe za čuvanjem slika u projektu.
