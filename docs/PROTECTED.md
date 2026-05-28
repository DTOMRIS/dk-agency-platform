# Protected Files — Toxunulmaz

Bu fayllar yalnız açıq TASK tapşırığı və CTO icazəsi ilə dəyişdirilə bilər.
Hər prompt başında bu siyahını oxu.

> **SİNXRON QAYDA:** Bu siyahı `.claude/settings.json` → `protectedFiles` ilə
> eyni olmalıdır. Biri dəyişəndə digəri də yenilənməlidir.

## Single Source of Truth
- `lib/data/listingFieldConfig.ts` — field config, duplicate logic QADAĞAN

## Database Schema
- `lib/db/schema.ts` — migration olmadan dəyişməz

## Auth System
- `lib/member-access.ts` — member auth
- `app/api/member/auth/route.ts` — auth endpoint
- **NextAuth PROHIBITED** — heç vaxt quraşdırma

## Status Workflow
- `lib/utils/listingStatus.ts` — status + transitions

## Config
- `middleware.ts` — route middleware
- `package.json` — dependencies + scripts
- `next.config.ts` — build configuration
- `tsconfig.json` — TypeScript configuration

## Global Layout
- `app/layout.tsx` — root layout, fonts, providers
- `app/globals.css` — CSS variables, theme palette
- `components/layout/Header.tsx` — global navigation
- `components/layout/Footer.tsx` — global footer
- `components/layout/MobileBottomNav.tsx` — mobile bottom navigation
