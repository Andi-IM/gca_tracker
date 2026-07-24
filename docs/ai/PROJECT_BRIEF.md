# Google Skills Arcade Fasilitator Milestone Calculator

## Goal

Build a static single-page calculator for Google Skills Arcade Fasilitator Sistem Poin. The app must calculate Arcade Points, Bonus Points, the highest valid milestone, next milestone gap, and reward notice using only the provided milestone rules.

## Audience

- Peserta Google Skills Arcade Fasilitator.
- Pengguna yang ingin memvalidasi milestone dan total poin.

## V1 Success

- Inputs: URL publik Skills Google dan status Bonus Milestone selesai.
- Arcade Games selesai dan Badge Keahlian selesai harus diisi dari hasil pembacaan profil publik, bukan input manual.
- The UI must show target badge lists, not only numeric counts.
- Outputs: poin game, poin badge, Arcade Points dasar, milestone tertinggi, bonus milestone, bonus tambahan, total akhir, status milestone berikutnya, dan catatan hadiah.
- Milestone valid hanya jika syarat game dan badge terpenuhi bersamaan.
- Bonus milestone tidak diakumulasi dari milestone lebih rendah.
- Badge points selalu memakai `Math.floor(skill_badges / 2)`.
- Target section shows completed/missing July Arcade Games and next Skill Badge slots.

## Out Of Scope

- Tracker cohort atau participant detail.
- Database, login, scraping, CSV import, atau backend sync.
- Penyimpanan progres/hasil kalkulasi. `localStorage` hanya untuk URL publik Skills Google sementara.
- Aturan tambahan di luar JSON Sistem Poin yang diberikan user.

## Source Of Truth

Milestone data and formulas live in `app.js`. Tests in `tests/run-cases.js` must mirror the example cases from the prompt.
