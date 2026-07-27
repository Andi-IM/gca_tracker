---
name: Google Cloud Arcade Tracker
description: A calm milestone progress console for Google Skills Arcade Fasilitator participants.
colors:
  google-blue: "#1a73e8"
  google-blue-deep: "#155fc0"
  google-green: "#34a853"
  google-yellow: "#fbbc04"
  google-red: "#ea4335"
  ink: "#172033"
  muted: "#5f6b7a"
  line: "#d9e1ec"
  soft: "#f5f8fc"
  white: "#ffffff"
  page-blue-wash: "#eaf2ff"
  page-bg: "#f7f9fc"
  input-border: "#b9c5d5"
  readonly-bg: "#eef3f9"
  readonly-text: "#334155"
  status-blue-bg: "#f4f8ff"
  status-yellow-bg: "#fff8df"
  done-bg: "#dff4e7"
  done-text: "#137333"
  todo-bg: "#fff1cc"
  todo-text: "#8a5a00"
  priority-border: "#d2e3fc"
typography:
  display:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "clamp(34px, 5vw, 58px)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "0"
  hero:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "50px"
    fontWeight: 700
    lineHeight: 1.08
  resultTotal:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "48px"
    fontWeight: 800
    lineHeight: 1
  compactTotal:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "40px"
    fontWeight: 800
    lineHeight: 1
  compactDisplay:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.08
  metric:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1
  headline:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "22px"
    fontWeight: 700
  badge:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "18px"
    fontWeight: 800
    lineHeight: 1
  intro:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "17px"
    lineHeight: 1.5
  title:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "15px"
    fontWeight: 700
  body:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "14px"
    lineHeight: 1.55
  label:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    letterSpacing: "0"
  caption:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "12px"
    fontWeight: 700
  count:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "11px"
    fontWeight: 800
  micro:
    fontFamily: "Aptos, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 700
rounded:
  sm: "6px"
  md: "8px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "22px"
  xl: "36px"
components:
  button-primary:
    backgroundColor: "{colors.google-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
    padding: "7px 10px"
    height: "34px"
  button-primary-hover:
    backgroundColor: "{colors.google-blue-deep}"
    textColor: "{colors.white}"
    rounded: "{rounded.sm}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "7px 10px"
    height: "34px"
  input-url:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    height: "46px"
  card-panel:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "22px"
  chip-done:
    backgroundColor: "{colors.done-bg}"
    textColor: "{colors.done-text}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
  chip-todo:
    backgroundColor: "{colors.todo-bg}"
    textColor: "{colors.todo-text}"
    rounded: "{rounded.pill}"
    padding: "4px 8px"
---

# Design System: Google Cloud Arcade Tracker

## Overview

**Creative North Star: "Progress Console"**

Google Cloud Arcade Tracker uses a calm utility interface: structured, low-noise, and built for quick progress validation. The visual system treats the page as a compact operational console where every panel answers a practical question: what is my current score, what milestone counts, and what should I do next?

The incumbent design borrows Google product colors as functional status accents, not as decoration. White panels, pale blue page wash, restrained borders, and small dense labels keep attention on the milestone math and target lists.

**Key Characteristics:**
- Scan-first calculator layout with clear input, output, target, and rule zones.
- Google-color status accents used sparingly for action, success, warning, and error.
- Compact card rhythm with 8px corners, thin borders, and low ambient depth.
- Indonesian-first copy with direct labels and factual status messages.

## Colors

The palette is a functional Google-inspired utility palette: blue leads interaction and progress, green marks completion, yellow warns, red signals validation problems, and cool neutrals hold the dashboard structure.

### Primary
- **Console Blue**: Primary action, links, milestone pills, focus borders, and active status emphasis.
- **Pressed Console Blue**: Primary button hover state.

### Secondary
- **Completion Green**: Total success emphasis and completed state.
- **Caution Yellow**: Reward and rule caution surfaces.
- **Validation Red**: Validation errors and rule-breaking feedback.

### Neutral
- **Ink Slate**: Main text and high-emphasis labels.
- **Muted Slate**: Supporting copy, field labels, table headers, and secondary metadata.
- **Cloud Line**: Borders, dividers, and low-emphasis structure.
- **Soft Panel Fill**: Nested metric cards and target rows.
- **White Surface**: Primary panels, notices, and calculator containers.
- **Page Blue Wash / Page Background**: The page begins with a light blue wash and settles into a cool app background.

### Named Rules

**The Accent-As-State Rule.** Google colors should communicate state or action. Do not use them as broad decorative fills.

**The Quiet Neutral Rule.** Most of the screen stays white, soft blue-gray, ink, and muted text so milestone numbers remain easy to compare.

## Typography

**Display Font:** Aptos with Segoe UI and sans-serif fallback.
**Body Font:** Aptos with Segoe UI and sans-serif fallback.
**Label Font:** Aptos with Segoe UI and sans-serif fallback.

**Character:** The typography is utilitarian and browser-native. It favors short labels, strong numeric readouts, and compact headings over editorial flourish.

### Hierarchy
- **Display** (700, responsive clamp or 50px desktop / 34px compact, 1.02-1.08 line-height): Hero title only.
- **Headline** (700, 22px): Panel and section headings.
- **Title** (700, 15px): Status box and subsection headings.
- **Body** (14px to 17px, 1.5-1.65 line-height): Intro copy, notes, descriptions, and status messages.
- **Label / Caption / Count** (700 to 800, 10px to 14px, no letter spacing except uppercase table headings): Field labels, chips, table headers, links, counts, and compact controls.
- **Metric** (26px, 40px, 48px): Numeric result emphasis inside result panels only.

### Named Rules

**The Numbers Need Air Rule.** Metric values are the largest text inside panels and sit below compact labels; do not bury calculated results in paragraph copy.

## Layout

The main page uses a constrained 1180px container with 32px desktop gutters and 20px mobile gutters. Desktop starts with a two-column hero, then a calculator grid with a 360px input column and flexible output area. Target lists use a three-column grid, while result metrics use three equal columns.

Spacing is regular and compact: 20px to 28px between major panels, 12px to 18px inside grouped controls, and 22px panel padding on desktop. At 900px, major grids collapse to one column. At 560px, panel padding tightens to 16px and action rows stack vertically.

## Elevation & Depth

The system is soft layered. Depth comes from white surfaces over a pale page wash, thin borders, and one low ambient shadow. Nested rows and metric cards rely more on tonal background shifts than stronger elevation.

### Shadow Vocabulary
- **Panel Ambient** (`0 8px 24px rgba(23, 32, 51, 0.06)`): Used on notices, panels, and warning containers to separate primary surfaces from the page.
- **Focus Glow** (`0 0 0 3px rgba(26, 115, 232, 0.14)`): Used only for focused text and URL inputs.

### Named Rules

**The Soft Layer Rule.** Use one ambient shadow for top-level surfaces and tonal fills for nested content; do not stack multiple shadow styles inside the calculator.

## Shapes

Corners are gently utilitarian. Primary surfaces and repeated row items use 8px radius, inputs and status boxes use 6px radius, and status chips use pill corners. Borders are light and structural rather than decorative.

## Components

### Buttons
- **Shape:** Compact rectangle with gently rounded corners (6px).
- **Primary:** Console Blue background with white text, 34px minimum height, bold 13px label, and compact 7px by 10px padding.
- **Hover / Focus:** Primary hover deepens to Pressed Console Blue. Inputs use a blue border and focus glow; buttons keep the same compact shape.
- **Secondary:** White background, Cloud Line border, Ink Slate text, and Soft Panel Fill hover.

### Chips
- **Style:** Pill badges with 4px by 8px padding, 12px bold text, and high-contrast status colors.
- **State:** Done chips use green tint and green text. Todo chips use yellow tint and brown text. Milestone chips use pale blue and Console Blue.

### Cards / Containers
- **Corner Style:** Gently rounded cards (8px).
- **Background:** White for top-level panels; Soft Panel Fill for nested metrics and target rows.
- **Shadow Strategy:** Top-level panels use Panel Ambient. Nested cards use borders and fills without extra shadows.
- **Border:** One-pixel Cloud Line borders are the default structural divider.
- **Internal Padding:** 22px for panels, 16px for result cards, 10px to 12px for target rows.

### Inputs / Fields
- **Style:** Full-width fields with 46px minimum height, 6px radius, white background, Ink Slate text, and Input Border stroke.
- **Focus:** Console Blue border plus Focus Glow.
- **Read-only:** Read-only numeric values use a pale blue-gray fill and slate text to signal profile-derived data.
- **Error:** Validation copy uses Validation Red, bold 14px text, and a reserved minimum height to reduce layout shift.

### Tables
- **Style:** Full-width rule table with an 820px minimum width and horizontal overflow on small screens.
- **Headers:** Soft Panel Fill background, Muted Slate uppercase 12px labels.
- **Rows:** Thin Cloud Line dividers and 13px by 12px cell padding.

### Target Lists
- **Style:** Compact rows with Soft Panel Fill, 8px radius, Cloud Line border, and right-aligned status chip.
- **Behavior:** Links use Console Blue and bold 12px text; missing links use muted text.

## Do's and Don'ts

### Do:
- **Do** keep the page organized around the current workflow: input profile, read results, inspect targets, verify rules.
- **Do** reserve strong color for action, status, validation, and milestone emphasis.
- **Do** keep nested content compact and scannable with borders, pale fills, and short labels.
- **Do** preserve Indonesian labels and factual reward language.

### Don't:
- **Don't** turn this into a marketing landing page or oversized hero experience.
- **Don't** add decorative gradients, illustrations, or color blocks that compete with calculation output.
- **Don't** invent visual proof, testimonials, partner claims, or reward guarantees.
- **Don't** use additional scoring states or progress concepts that are not represented in the app behavior.
