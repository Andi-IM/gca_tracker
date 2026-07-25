# Panduan Deployment Hybrid (EdgeOne Pages + VPS/Lighthouse)

Dokumen ini menjelaskan cara men-deploy proyek **Arcade Tracker** dengan arsitektur hybrid:
1. **Frontend (Astro)** di-host di **Tencent Cloud EdgeOne Pages** (hosting statik global berbasis CDN).
2. **Backend API (Python + httpx + lxml)** di-host di server konvensional (seperti **Tencent Cloud Lighthouse**, VPS, Docker, Render, dll.) untuk mengambil dan mem-parse profil publik.

---

## Arsitektur Aliran Data

```mermaid
graph LR
    User([Pengguna]) -->|Akses Website| EdgeOne[EdgeOne Pages]
    EdgeOne -->|Kirim HTML/JS Statik| User
    User -->|Kirim Request Scrape| Backend[VPS / Lighthouse API Server]
    Backend -->|HTTP request| Google[Google Skills Profile]
    Google -->|Kirim HTML Profil| Backend
    Backend -->|Kembalikan JSON Hasil Analisis| User
```

---

## Langkah 1: Deploy Backend API

Karena API menggunakan Python, `httpx`, dan `lxml`, backend bisa dijalankan sebagai service ringan tanpa headless browser. Dependency dikelola melalui `uv`, bukan instalasi Python global.

### Opsi A: Menggunakan Docker (Direkomendasikan untuk VPS/Lighthouse)
Jika Anda ingin menjalankan via kontainer, gunakan `api/Dockerfile` yang sudah memakai `uv` dan virtual environment terisolasi.

1. Buat kontainer dan jalankan:
   ```bash
   docker build -f api/Dockerfile -t arcade-tracker-api .
   docker run -d -p 3001:3001 --name arcade-api arcade-tracker-api
   ```
2. Pastikan port `3001` terbuka di firewall server Anda.

### Opsi B: Jalankan Manual di Server
1. Clone repositori ke server Anda.
2. Dari root repositori, buat virtual environment dan install dependensi dengan `uv`:
   ```bash
   uv sync --frozen --no-dev
   ```
3. Jalankan server (gunakan systemd, supervisor, atau process manager lain agar berjalan di background):
   ```bash
   uv run --no-sync python -m api.server
   ```

Setelah berhasil, uji API Anda melalui browser: `http://<IP-SERVER-ANDA>:3001/api/health`.

---

## Langkah 2: Deploy Frontend ke EdgeOne Pages

1. Masuk ke konsol **Tencent Cloud EdgeOne**.
2. Pilih menu **EdgeOne Makers** > **Pages** > **Create Project**.
3. Hubungkan repositori GitHub Anda.
4. Konfigurasikan build settings untuk Astro:
   * **Framework Preset:** `Astro` (atau pilih `Create React App / Static` jika tidak ada, kemudian sesuaikan command-nya).
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
5. Tambahkan **Environment Variable** di pengaturan build EdgeOne Pages:
   * Nama: `PUBLIC_API_URL`
   * Nilai: `http://<IP-SERVER-ANDA-ATAU-DOMAIN-API>:3001` (tanpa slash di akhir).
6. Klik **Save and Deploy**.

Gunakan URL HTTPS untuk `PUBLIC_API_URL` pada production. Jika backend masih
berjalan pada port `3001`, arahkan domain API atau reverse proxy HTTPS ke port
tersebut; browser akan memblokir request HTTP dari halaman EdgeOne HTTPS.

---

## Langkah 3: Konfigurasi CORS (Opsional)

Secara bawaan, file `api/server.py` mengizinkan akses CORS dari semua origin.
Untuk keamanan di lingkungan produksi, Anda disarankan untuk membatasi origin hanya dari domain EdgeOne Pages Anda:

Set environment variable berikut pada server backend:

```bash
ALLOWED_ORIGIN=https://domain-edgeone-anda.example.com
```

Restart backend setelah mengubah konfigurasi CORS.
