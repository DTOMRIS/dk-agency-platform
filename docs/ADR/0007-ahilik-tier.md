# ADR-0007: Ahilik Guild Naming for Membership Tiers

## Status
Accepted

## Context
The platform offers a three-tier membership system for HoReCa professionals.
Generic names (Basic/Pro/Enterprise) lack cultural relevance for the Azerbaijani and Turkish market.
The Ahilik guild tradition (Ottoman-era craft brotherhood system) maps naturally to a professional development ladder.

## Decision
Name the three tiers SAGIRD (apprentice), KALFA (journeyman), USTA (master).
Each tier unlocks a subset of the 21 toolkit tools. SAGIRD: 7 tools. KALFA: 14 tools. USTA: all 21.
Tier names are used throughout the UI, emails, and API role claims.

## Consequences
**Positive:** Strong cultural resonance with TR/AZ audience. Differentiates the brand from generic SaaS naming. Creates a narrative of professional progression.
**Negative:** International audience (EN/RU locale) requires explanation of the tier names. Translation files must include glossary entries for SAGIRD/KALFA/USTA.

## References
- `lib/member-access.ts` (tier permission mapping)
- `messages/*.json` (tier name translations)
- `components/toolkit/` (tool access gates)

## Date
2026-04-01
