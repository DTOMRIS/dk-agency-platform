# ADR-001: Next.js + App Router

## Status
Accepted

## Context
Framework seçimi: React meta-frameworks (Next.js, Remix, Astro) arasında. SSR, ISR, API routes, middleware tələb olunur.

## Decision
Next.js (hazırda v16) App Router istifadə olunur. Pages Router deyil.

## Consequences
**Positive:**
- Server Components default (bundle size kiçik)
- Middleware ilə locale routing + auth guard
- API routes `/app/api/` qovluğunda
- Vercel/Hostinger deploy uyğunluğu

**Negative:**
- App Router öyrənmə əyrisi Pages-dən yüksək
- `'use client'` directive tələb olunur (hooks, browser API)

## References
- next.config.ts
- app/ directory structure

## Date
2026-02-01
