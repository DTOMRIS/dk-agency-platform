# ADR-0006: Four-Locale i18n Strategy

## Status
Accepted

## Context
DK Agency serves clients in Azerbaijan, Turkey, Russia, and English-speaking markets.
The platform must support content in all four languages without separate deployments.
Next.js with next-intl provides locale-aware routing and server-side translations.

## Decision
Support four locales: `az` (default), `ru`, `en`, `tr`.
Routing via next-intl with `[locale]` path prefix. Default locale (`az`) has no prefix in production.
All translation keys stored in `messages/*.json` (one file per locale).
Geo-detection in middleware sets initial locale; user preference stored in `preferred_locale` cookie.

## Consequences
**Positive:** Single deployment serves all locales. Geo-detection improves first-visit experience. Cookie persists manual language selection.
**Negative:** Every new translation key must be added to all four JSON files. Missing keys fall back silently, which can hide untranslated content in non-default locales.

## References
- `messages/az.json`, `messages/ru.json`, `messages/en.json`, `messages/tr.json`
- `i18n/routing.ts`
- `middleware.ts` (geo-detection logic)

## Date
2026-02-01
