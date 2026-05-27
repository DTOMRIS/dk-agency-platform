# ADR-0010: Yandex Metrica with KVKK Consent Gating

## Status
Accepted

## Context
Analytics is required to measure funnel performance and user behavior (Webvisor heatmaps).
Google Analytics 4 has weaker adoption among AZ/TR market analysis teams.
Yandex Metrica is the standard analytics tool in the AZ/RU market and includes Webvisor session recording.
KVKK (Turkish data protection law) requires explicit user consent before any tracking scripts load.

## Decision
Use Yandex Metrica as the sole analytics provider.
The Metrica script is not loaded by default. It loads only after the user accepts cookies via the consent banner.
Consent state stored in `analytics_consent` cookie. Middleware and the banner component check this cookie before injecting the Metrica tag.

## Consequences
**Positive:** Aligns with AZ/TR market standard tooling. Webvisor provides session-level UX insights. KVKK-compliant by default — no tracking without consent.
**Negative:** Content Security Policy must whitelist `mc.yandex.ru` and related Metrica domains. Users who decline consent produce no analytics data.

## References
- `components/shared/CookieBanner.tsx`
- `lib/analytics.ts`
- CSP headers in `next.config.ts`

## Date
2026-05-27
