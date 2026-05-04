# DK Agency Platform — Dev Log

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
