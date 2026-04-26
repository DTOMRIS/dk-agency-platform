# Protected Files - Toxunulmaz

Bu fayllar yalniz aciq TASK tapsirigi ve CTO icazesi ile deyisdirile biler.
Her prompt basinda bu siyahini oxu.

## Single Source of Truth
- `lib/data/listingFieldConfig.ts` - field config, duplicate logic qadaqandir

## Database Schema
- `lib/db/schema.ts` - migration olmadan deyismez

## Auth System
- `lib/member-access.ts` - member auth
- `app/api/member/auth/route.ts` - auth endpoint
- **NextAuth PROHIBITED** - hec vaxt qurasdirma

## Status Workflow
- `lib/utils/listingStatus.ts` - status and transitions

## Config
- `middleware.ts` - route middleware
- `package.json` - ALLOW_PROTECTED=1 lazim
- `next.config.ts` - Hostinger image policy and runtime-safe settings must be changed carefully
