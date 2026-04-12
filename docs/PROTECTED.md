# Protected Files — Toxunulmaz

Bu fayllar yalnız açıq TASK tapşırığı və CTO icazəsi ilə dəyişdirilə bilər.
Hər prompt başında bu siyahını oxu.

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
- `package.json` — ALLOW_PROTECTED=1 lazım
