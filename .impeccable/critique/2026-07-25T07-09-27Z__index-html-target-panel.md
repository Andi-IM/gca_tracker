---
target: badge selesai dan target berikutnya
total_score: 18
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 1
p2_count: 1
p3_count: 2
timestamp: 2026-07-25T07-09-27Z
slug: index-html-target-panel
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Summary updates after scrape, status pills per item — but no progress bar or "N of M" at section level |
| 2 | Match Between System and Real World | 2 | "Badge Selesai dan Target Berikutnya" conflates two states; three-column layout doesn't mirror "what do I need next?" |
| 3 | User Control and Freedom | 1 | Zero interactivity — no filtering, sorting, collapse, or "focus on what I need" toggle |
| 4 | Consistency and Standards | 3 | Consistent card/pill styling. Minor: "Kerjakan" vs "Target" for same incomplete state |
| 5 | Error Prevention | 2 | Graceful "Link belum tersedia" fallback, but no guard against 51-item scroll wall |
| 6 | Recognition Rather Than Recall | 1 | All 51 badges render at once; no level grouping, no "next 3" highlight, no sticky summary |
| 7 | Flexibility and Efficiency of Use | 1 | No keyboard shortcuts, filtering, search, or "hide completed" toggle |
| 8 | Aesthetic and Minimalist Design | 2 | Card treatment clean, but 51+ items in unchunked list is not minimalist — it's exhausting |
| 9 | Error Recovery | 2 | "Belum ada badge silabus yang cocok" handles no-match well. No help for name-mismatch confusion |
| 10 | Help and Documentation | 1 | No tooltips on status pills, no explanation of matching logic, summary paragraph repeats input instruction |
| **Total** | | **18/40** | **Poor** |

---

## Design Specificity Verdict

**Medium-specific.** The section references "Arcade Games Juli 2026" directly and populates from a syllabus fixture — clearly built for Google Skills Arcade Fasilitator. However, the layout pattern (three parallel lists: games, done badges, todo badges) is a generic task-tracking pattern. Nothing about the visual treatment, interaction model, or information architecture is unique to the product's domain. The specificity is in the data, not the design.

**Deterministic scan:** The CLI detector found 0 findings in `index.html` and 3 advisory findings in the target section's CSS (all `design-system-font-size: 12px` — false positives for metadata text). No actionable detector issues. The detector is calibrated for visual-system antipatterns; the problems here are flow and information architecture, which fall outside its scope.

---

## Overall Impression

The target panel is a well-structured data dump. It's clean, correctly styled, and faithfully renders the syllabus data. But it answers "what exists?" instead of "what should I do next?" — the one question every participant is asking. The biggest opportunity is transforming this from a catalog view into a prioritized action list.

---

## What's Working

1. **Status pill vocabulary is product-specific and clear.** "Selesai" / "Kerjakan" / "Target" — each state has a distinct label and color. The green/yellow pairing maps to Google brand palette and is universally readable.

2. **Graceful handling of no-match state.** "Belum ada badge silabus yang cocok sebagai selesai" with explanation of why prevents the user from thinking the tool is broken. This is thoughtful error-state design.

3. **Each item is actionable.** Every arcade game and skill badge has a direct link to its Skills Google page ("Buka Game" / "Buka Lab"). This transforms a passive list into an actionable to-do.

---

## Priority Issues

### P0 — The 51-badge wall kills the user flow
**What:** The "Badge Silabus Belum Selesai" column renders all remaining skill badges in a single ungrouped list. No filtering, no collapse, no level grouping.

**Why it matters:** The user's core question is "what do I need next?" The answer is "3 badges." But they have to scroll past 48 irrelevant badges to find them. The gap-to-effort ratio is catastrophic — 3 seconds of clarity (gap number) followed by 30 seconds of scrolling fatigue.

**Fix:** Group badges by level (Beginner / Intermediate / Advanced) with collapsible sections and a count badge on each. Default-expand only the levels relevant to the user's next milestone gap. Add a "Fokus Berikutnya" section at the top showing only the items that close the gap.

**Suggested command:** `$impeccable shape` to redesign the target panel information architecture

### P1 — No "next actions" synthesis
**What:** The gap says "2 Arcade Games dan 3 Badge Keahlian" but the target panel doesn't surface those specific items.

**Why it matters:** The gap number creates an expectation of specificity. The user expects to see "these 2 games and these 3 badges" highlighted or isolated. Instead they get the full catalog.

**Fix:** Add a "Prioritas Berikutnya" row above the three columns that shows exactly the N items needed to close the gap, pulled from `remainingArcadeTargets` and `remainingSkillTargets` (which already exist in `getNextTargetPlan` but are never rendered).

**Suggested command:** `$impeccable shape` to design the next-actions synthesis

### P2 — Section heading doesn't orient after scrape
**What:** The `#target-summary` paragraph switches from a static instruction to a dense sentence mixing gap info, match count, and program period dates.

**Why it matters:** The summary tries to do three jobs at once (orient, motivate, inform about dates). Users will scan for the gap number and ignore the rest, but the visual density makes it hard to find.

**Fix:** Split into a prominent gap callout ("Fokus: 2 Arcade Games + 3 Badge Keahlian") and a smaller secondary line for period/match details. Use the gap numbers as a visual anchor, not buried text.

**Suggested command:** `$impeccable clarify` to improve the summary heading hierarchy

### P3 — Missing skill badge list has no level grouping
**What:** `buildSkillBadgeTargets` returns a flat array of all badges. The renderer (`renderTargetPlan`) dumps them into a single `<ul>`.

**Why it matters:** The syllabus has a natural 3-tier hierarchy (Beginner → Intermediate → Advanced). Flattening it removes the user's ability to scope by difficulty or plan a progression path.

**Fix:** Group the `skillTargets` array by `badge.level` before rendering. Add an H4 or visual divider for each level with a count.

**Suggested command:** `$impeccable layout` to add level-based grouping and visual hierarchy

### P3 — Inconsistent status vocabulary
**What:** Arcade game items show "Kerjakan" for incomplete items. Skill badge items show "Target" for incomplete items. Both mean "not done, go do it."

**Why it matters:** Inconsistent labels for the same state create subtle confusion. "Target" sounds like something you aim for; "Kerjakan" sounds like an action verb.

**Fix:** Unify to one word. "Kerjakan" (do it) is more actionable for both.

**Suggested command:** `$impeccable clarify` to unify status vocabulary

---

## Persona Red Flags

### Jordan (First-Timer)
- **51 ungrouped badges** — overwhelming. Will not know where to start or which level to focus on. High abandonment risk after scrolling.
- **Summary paragraph is dense** — Jordan reads every word but struggles to extract "what should I do now?" from the mixed gap/date/match info.
- **No explanation of matching logic** — "Why is this badge not on my list?" confusion when name normalization misses an alias. No tooltip or help text.

### Sam (Accessibility-Dependent User)
- **No `aria-live` region** on target lists — screen readers won't announce when lists populate after scrape.
- **Color is the only state differentiator** — green/yellow pills rely on color alone (though text labels mitigate this partially).
- **51 items in a single list** — extremely long tab order for keyboard navigation.

### Casey (Distracted Mobile User)
- **Three-column layout stacks to one column at 900px** — on mobile, this is a very long vertical scroll past games, completed badges, then all missing badges.
- **No sticky summary or back-to-score** — after scrolling through 51 badges, loses sight of their gap number.
- **No state persistence on interruption** — if Casey switches apps and returns, the scroll position may reset.

---

## Minor Observations

- `.target-link.missing` uses only `color: var(--muted)` — visually identical to dead text, no cursor change or dashed underline to signal "this was supposed to be a link."
- `renderTargetLink` uses `target="_blank" rel="noreferrer"` — good security practice, but no `aria-label` to indicate the link opens externally.
- The summary text after scrape mentions "14 September 2026 23:59 WIB" — helpful for urgency but could be more prominent if the deadline matters.
- At 560px breakpoint, panel padding tightens to 16px — acceptable but the 51-badge list benefits from every pixel of breathing room.

---

## Questions to Consider

1. **Does the user ever need to see all 51 badges at once?** If not, what's the default view? If yes, is there a "Tampilkan Semua" toggle that starts collapsed?

2. **What happens when August games are added?** The fixture note says monthly releases need separate fixtures. The section heading says "Arcade Games Juli 2026" — will this become "Arcade Games Agustus 2026" or show all months? The layout needs to plan for multi-month views.

3. **Should the "Badge Silabus Selesai" column exist at all?** It validates the user's effort, but it also duplicates information already visible on their Google Skills profile. Would a simple count ("5 dari 51 selesai") be sufficient?

4. **Is the three-column layout the right structure?** A two-column layout (Action Required | Already Done) or a single prioritized list might serve the "what do I need next?" question better.
