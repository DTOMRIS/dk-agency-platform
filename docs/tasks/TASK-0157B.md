# TASK-0157B: Dashboard locale route mirrors

**Status:** In Progress
**Branch:** `feat/task-0157b-dashboard-locale-mirrors`
**Depends on:** TASK-0157A (merged)

## Problem

Dashboard routes live under `app/dashboard/` without `[locale]` prefix.
Language switcher generates `/tr/dashboard/...` but no route exists there — 404.
Existing 2 ilanlar mirrors use `redirect()` which loses locale context.

## Solution

Route Mirrors (re-export pattern): create thin `app/[locale]/dashboard/` files that
re-export the real page components. The `[locale]/layout.tsx` provides
`NextIntlClientProvider` with correct locale messages, so `useTranslations` works.

## Scope

### Batch 1 — Pilot (3 files)
- `app/[locale]/dashboard/layout.tsx` — re-export auth guard
- `app/[locale]/dashboard/ilanlar/page.tsx` — redirect → re-export
- `app/[locale]/dashboard/ilanlar/[id]/page.tsx` — redirect → re-export

### Batch 2 — Bulk mirrors (36 files)
All remaining dashboard pages as 1-line re-exports.

### Batch 3 — Locale-aware links (2 files)
- `components/dashboard/DashboardSidebar.tsx` — withLocale() for nav links
- `components/dashboard/DashboardTopBar.tsx` — withLocale() for profile link

## Out of Scope
- Remaining 13 Pattern B → A i18n migration (TASK-0158+)
- Middleware changes (not needed — already handles `/(az|ru|en|tr)/:path*`)

## Pattern

```typescript
// Mirror re-export (1 line per file)
export { default } from '@/app/dashboard/<route>/page';
```

## Validation
- Build PASS
- HEAD 200: 4 locales × 6 pages = 24 checks
- Auth guard: unauthenticated /tr/dashboard → redirect to /auth/login
- Sidebar links preserve locale when navigating
