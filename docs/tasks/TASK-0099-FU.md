# TASK-0099-FU
- Scope: Add missing non-locale route wrappers for /haqqimizda and /elaqe
- Affected files: app/haqqimizda/page.tsx (new), app/elaqe/page.tsx (new)
- Root cause: AZ is default locale, withLocale('az', '/haqqimizda') returns '/haqqimizda' without prefix, but no non-locale route existed
- Done criteria: /haqqimizda and /elaqe render correctly without [locale] prefix
- Owner: Dogan
- Date: 2026-05-09
