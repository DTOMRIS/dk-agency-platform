# DK Agency Platform — Dev Log

## 2026-05-15 — TASK-0130 Reklam Yazıcısı

### What
AI ad copy generator for Instagram, Facebook, TikTok, Google Ads. 3 tones (attention/informative/sales) with platform-specific character limits and hashtags.

### Pattern
- Copied complaint-response route.ts line-by-line for auth/DB contract (L-002 lesson applied)
- Same wrapper pattern: ReklamYazicisiPage (pageCopy, viewMode, ToolInfoBox)
- Prompt builder: platform limits, Ahilik values, 2 few-shot examples
- Config: reklam-yazicisi status changed from 'planned' to 'live'
- Rate limit: 30/day/user (vs 20 for complaint handler)

## 2026-05-15 — TASK-0128 Şikayət Cavablandırıcı

### What
AI tool that generates 3-tone responses (formal/friendly/short) to restaurant review complaints from Google, TripAdvisor, Yandex.

### Pattern
- Followed PnlSimulatorPage wrapper pattern (pageCopy per locale, view state machine, ToolInfoBox)
- API follows sikayet-analitigi route pattern (Zod validation, checkToolAccess gating, callAIJson with DeepSeek primary + Claude fallback)
- Prompt builder uses Ahilik values: apology + concrete solution + re-invitation
- 4 locale translations added to messages/*.json under `toolkit.complaint-handler`
- In-memory rate limit (20/day/user) instead of Redis

### Files created
- `components/marketinq-ocagi/sikayet-cavablandirici/` (3 components)
- `lib/ai/complaint-prompt-builder.ts`
- `app/api/ai/complaint-response/route.ts`
- `e2e/sikayet-cavablandirici.spec.ts`

### Files modified
- `lib/marketing-tools-config.ts` — new tool entry
- `app/dashboard/marketinq-ocagi/page.tsx` — 4-locale title/subtitle
- `app/dashboard/marketinq-ocagi/[slug]/page.tsx` — import + routing
- `messages/*.json` (4 files) — complaint-handler namespace

## 2026-05-04 — Auth redirect / hostname fix package

### Problem

Hostinger runs Next.js standalone behind a reverse proxy. The internal server binds to `0.0.0.0` with no knowledge of the public hostname. When `app/api/auth/confirm/route.ts` called `request.nextUrl.origin` to build the redirect target, it got the internal address (e.g. `http://0.0.0.0:3001`) instead of `https://dkagency.com.tr`. Same issue affected password-reset and email confirmation links that fell through to `http://localhost:3000` when `NEXT_PUBLIC_APP_URL` was missing.

### Root cause

- `confirm/route.ts` used `request.nextUrl.origin` — which reflects the internal binding address, not the public domain.
- `register/route.ts` and `route.ts` used `process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'` inline — inconsistent fallback chain.
- Next.js was not configured to trust `X-Forwarded-Host` headers from the proxy.
- Two conflicting PostCSS configs existed (`postcss.config.js` CJS + `postcss.config.mjs` ESM).

### Fix (TASK-0030 to TASK-0034)

1. **TASK-0030** — Added `experimental.trustHostHeader: true` to `next.config.ts`. This makes Next.js standalone use the `X-Forwarded-Host` header from Hostinger's proxy when determining the request origin.

2. **TASK-0031** — Replaced all `request.nextUrl.origin` and inline `process.env.NEXT_PUBLIC_APP_URL` patterns in auth routes with `getBaseUrl()`.
   - `app/api/auth/confirm/route.ts` — `redirectWithMessage()` now uses `getBaseUrl()`.
   - `app/api/auth/register/route.ts` — confirm URL now uses `getBaseUrl()`.
   - `app/api/auth/route.ts` — both `handleRegister` and `handlePasswordResetRequest` now use `getBaseUrl()`.

3. **TASK-0032** — Extracted `lib/utils/get-base-url.ts`:
   ```ts
   export function getBaseUrl(): string {
     return process.env.NEXT_PUBLIC_APP_URL || 'https://dkagency.com.tr';
   }
   ```
   Single source of truth. No more scattered env var reads.

4. **TASK-0033** — Deleted `postcss.config.js` (CJS). Only `postcss.config.mjs` (ESM) remains.

5. **TASK-0034** — Added `.nvmrc` (value: `22`) and `engines: { "node": ">=22" }` to `package.json`.

### Hostinger operator checklist

- Remove `HOSTNAME` env var from Hostinger panel if it exists.
- Ensure `NEXT_PUBLIC_APP_URL=https://dkagency.com.tr` is set in Hostinger environment variables.
- Do NOT set `NEXT_PUBLIC_APP_URL` to an IP address or internal hostname.

## 2026-05-09 - TASK-0102 Contact lead funnel

### Changed
- Contact page now uses Pattern A (`useTranslations('contact')` + `messages/*.json`) instead of inline page copy.
- Visible phone contact card was removed. Primary contact actions are now KAZAN AI, WhatsApp, and Telegram.
- WhatsApp keeps a prefilled handoff through a same-origin redirect, so the number is not shown on the contact page.

### Added
- `POST /api/leads/track` records anonymous contact CTA clicks into `leads`.
- `leads.source`, `leads.channel`, `leads.locale`, `leads.user_agent`, and `leads.ip_hash` track attribution without storing raw IP.
- KAZAN AI listens for `kazan:open` and opens directly from the contact page with contact context.
- Playwright coverage for 4 locale rendering and WhatsApp tracking payload.
- Deploy note: add `IP_HASH_SALT` in Hostinger before release.

## 2026-05-09 - TASK-0100 P&L Simulator i18n

### Changed
- P&L Simulator now uses Pattern A (`useTranslations('toolkit.pnl')`) instead of hardcoded AZ copy.
- Added `toolkit.pnl` translations for AZ/RU/EN/TR.
- Currency and percent values are formatted with `Intl.NumberFormat`.
- Numeric inputs parse EN comma thousands and AZ/RU/TR comma decimals.

### Added
- `/toolkit/pnl-simulator` aliases for existing P&L page compatibility.
- Playwright smoke tests for 4 locale rendering and number formatting.
