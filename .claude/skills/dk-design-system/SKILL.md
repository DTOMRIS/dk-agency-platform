---
name: dk-design-system
description: DK Agency design system rules — read before building or restyling any UI,
  page, or component. Covers brand identity, color tokens, typography, the global
  Header/Footer rule, premium tone, and the "no invisible change" workflow.
when_to_use: building/restyling a page or component, choosing colors/typography,
  adding navigation, redesigning the homepage or a landing/dashboard surface.
---

# Design system (DK Agency)

Premium, sophisticated, high-tech B2B platform (investment / holding / agency / HoReCa).
**Not** a restaurant management system — avoid hardcoded restaurant/food-cost/AQTA content on
core landing pages unless the task is explicitly a sub-module.

## Tone & theme
- Dashboard: **premium light.** Landing: dark glassmorphism allowed on hero/CTA.
- Primary: `brand-red` `#E11D48` (CTA `#E94560`). Navy `#1A1A2E`. Gold `#C5A022`.
  BG `#FAFAF8`. Surface `#F9FAFB`. Muted text `#6B7280`. Border `#E5E7EB`.
- Typography: `Inter` (sans) + `Playfair Display` (display/serif). (Body may use DM Sans where established.)
- Illustration: hairline, petroleum `#2C2C2A`, terracotta accent `#C07A50`, flat, lots of whitespace.

## Hard rules
- **Global nav is always `components/layout/Header.tsx`.** Never bypass it; never use `HospitalityHeader.tsx` for core UI.
- `Header.tsx`, `Footer.tsx`, `app/layout.tsx` are PROTECTED — need ALLOW_PROTECTED=1 + Doğan's approval.
- No `Agentlik`, `Holdinq`, `CRM` wording in product UI.
- Contrast: see the `dk-i18n-pattern` skill (light bg ⇒ dark text; WCAG AA on interactive elements).

## "Görünməyən dəyişiklik = dəyişiklik deyil" (L of TASK-0232)
A subtle restyle that blends in reads as "heç nə dəyişməyib" to the user. For a redesign, make the
transformation **visibly obvious** (e.g. a dark hero zone against light sections), not a timid tweak.

## Visual-change workflow
1. Build on a branch. 2. Doğan reviews **locally** (`git pull` + `npm run dev`). 3. Then merge.
Never blind-merge a visual change. Don't claim a UI change is done from build success alone — it must be seen.

## Key files
`Header.tsx`, `Footer.tsx`, `MegaMenu.tsx`, `Hero.tsx`, `StageSelector.tsx`, `ToolkitShowcase.tsx`,
`CTASections.tsx`, `app/[locale]/page.tsx`. Full design doc: `CLAUDE-DESIGN.md`, `docs/BRAND-GUIDE.md`.
