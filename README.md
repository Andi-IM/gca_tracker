# Arcade Tracker

Kalkulator satu halaman untuk membaca profil publik Google Skills, menghitung progres, dan menampilkan target milestone Google Skills Arcade Fasilitator.

## Getting Started

Jalankan aplikasi dari satu entrypoint:

```bash
npm install
npm start
```

Lalu buka:

```text
http://127.0.0.1:5199
```

Jika port `5199` sudah dipakai:

```bash
PORT=5200 npm start
```

Di PowerShell:

```powershell
$env:PORT=5200
npm start
```

## Cara Pakai

1. Buka `http://127.0.0.1:5199`.
2. Masukkan URL publik Skills Google.
3. Klik `Baca Profil`.
4. Aplikasi akan menampilkan progres, poin, milestone, badge selesai, dan target badge yang perlu dikerjakan.

URL publik disimpan sementara di `localStorage` browser. Nilai Arcade Games dan Badge Keahlian tidak diisi manual; nilainya dibaca dari profil publik melalui endpoint scraper lokal.

## Scrape Profil Publik

Tombol `Baca Profil` memakai endpoint Playwright di server yang sama:

```text
GET /api/scrape?url=<url-profil-publik>
```

Jadi aplikasi harus dijalankan dengan:

```bash
npm start
```

Setelah profil terbaca, aplikasi menampilkan:

- daftar Arcade Games Juli yang sudah selesai dan yang perlu dikerjakan,
- daftar Badge Keahlian dari silabus resmi yang sudah cocok sebagai selesai,
- daftar Badge Keahlian dari silabus resmi yang belum selesai dengan tautan langsung ke lab Skills Google,
- jumlah kekurangan game dan badge menuju milestone berikutnya.

Jika Playwright belum punya browser lokal:

```bash
npx playwright install chromium
```

## Core Docs

AI and implementation guidance lives in `docs/ai/`. Start with:

- `docs/ai/PROJECT_BRIEF.md`
- `docs/ai/IMPLEMENTATION_PLAN.md`
- `docs/ai/PROGRESS_LEDGER.md`

## Verification

```bash
npm test
```

Aplikasi tidak memakai database atau framework frontend. Server lokal hanya melayani halaman app dan endpoint scraper Playwright dalam satu proses. `localStorage` hanya dipakai untuk menyimpan sementara URL publik Skills Google di browser pengguna. Semua aturan milestone ada di `app.js`.

Data asersi silabus untuk kebutuhan scraping URL publik disimpan di `data/syllabus-assertions.json`. Enam Arcade Games di fixture tersebut adalah rilis Juli 2026 saja; badge game bulan Agustus dan bulan berikutnya harus dicatat sebagai rilis terpisah. Fixture juga memuat 51 placeholder Badge Keahlian dengan status `completed: false`.

Jumlah Arcade Games dan Badge Keahlian di form ditujukan untuk diisi dari tombol `Baca Profil`, bukan dihitung manual.

Periode program yang dipakai aplikasi: 13 Juli 2026 10:00 WIB sampai 14 September 2026 23:59 WIB. Nama dan URL Skill Badge di fixture diambil dari halaman Silabus resmi RSVP Google Skills Arcade Fasilitator 2026.
