# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are peserta Google Skills Arcade Fasilitator in Indonesia who want to check their own public Skills Google profile progress and understand the next concrete targets toward milestone completion.

## Product Purpose

Google Cloud Arcade Tracker (GCA Tracker) is a static single-page calculator for Google Skills Arcade Fasilitator Sistem Poin. It reads a public Skills Google profile URL through the local app flow, calculates Arcade Points, Bonus Points, the highest valid milestone, the gap to the next milestone, and a reward notice from the provided milestone rules.

Success means a participant can see current milestone status and the specific Arcade Games or Skill Badge targets still missing without manually reinterpreting the program rules.

## Positioning

GCA Tracker is a local, privacy-light milestone checker that applies only the provided Sistem Poin rules and treats the implemented milestone data in `app.js` as the source of truth. It differs from a generic tracker by showing concrete completed and missing target badge lists while avoiding accounts, databases, cohort tracking, and persistent progress storage.

## Operating Context

Users run the app locally with `npm start` and open the served page in a browser. They enter a public Skills Google profile URL, click `Baca Profil`, review read-only progress counts, optionally mark Bonus Milestone completion, and inspect milestone totals plus target lists.

The app remains usable as static files, but profile scraping is routed through the same local `npm start` server endpoint.

## Capabilities and Constraints

- UI language is Indonesian.
- Milestone rules, formulas, warnings, and program data live in `app.js`.
- The app calculates game points, badge points, base Arcade Points, the highest valid milestone, milestone bonus points, optional Bonus Milestone points, total points, next milestone gap, and reward notice.
- Arcade Games and Badge Keahlian counts are derived from the public profile flow, not manual user input.
- The UI shows completed and missing target lists, including July 2026 Arcade Games and Skill Badge syllabus targets.
- Do not add scoring rules that are not present in the provided Sistem Poin JSON.
- Do not introduce database, login, scraping backend services, cohort tracking, participant detail storage, CSV import, or backend sync.
- Use `localStorage` only for the temporary public Skills Google URL.
- Calculation changes must be verified with `npm test`.

## Brand Commitments

The product name is Google Cloud Arcade Tracker, abbreviated as GCA Tracker. Existing product copy should stay factual, compact, and Indonesian-first.

## Evidence on Hand

- Implementation source of truth: `app.js`.
- Product and implementation guidance: `docs/ai/PROJECT_BRIEF.md`, `docs/ai/IMPLEMENTATION_PLAN.md`, and `docs/ai/PROGRESS_LEDGER.md`.
- Official syllabus assertion fixture: `data/syllabus-assertions.json`.
- Tests for milestone behavior: `tests/run-cases.js`.
- There are no testimonials, user accounts, cohort records, or reward eligibility guarantees on hand; future work must not fabricate them.

## Product Principles

- Apply only verified Sistem Poin rules.
- Make milestone status explainable through visible requirements and target gaps.
- Keep profile handling local and minimal.
- Preserve the app as a static, lightweight calculator with one local server entrypoint.
- Prefer concrete target lists over opaque numeric summaries.

## Accessibility & Inclusion

The interface should remain keyboard-usable, readable on mobile and desktop, and understandable in Indonesian for participants checking their own progress.
