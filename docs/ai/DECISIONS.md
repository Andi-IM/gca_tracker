# Decisions

## ADR-001: Static-Only App

Status: Accepted

The app is plain HTML, CSS, and JavaScript. No Next.js, React, backend, or database is used.

## ADR-002: LocalStorage Only For Public URL

Status: Accepted

`localStorage` is used only to temporarily remember the user's public Skills Google URL in the same browser. Progress values and calculation results are not persisted.

## ADR-003: Prompt JSON Is Source Of Truth

Status: Accepted

The provided Sistem Poin JSON is the only scoring source. Missing rules must not be inferred.

## ADR-004: Bonus From Highest Milestone Only

Status: Accepted

Milestone bonus points are taken only from the highest valid milestone. Lower milestone bonuses are not accumulated.

## ADR-005: Strict Milestone Validation

Status: Accepted

A milestone is reached only when both Arcade Games and Badge Keahlian requirements are satisfied.
