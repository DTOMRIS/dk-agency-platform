---
name: dk-deploy-reality
description: DK Agency deploy and routing reality — read when a page returns 404/503
  on the live site (dkagency.com.tr), when adding a new route, or when "merge etdim
  amma çıxmadı / deploy olmadı" comes up. Covers Hostinger merge≠live gap, 503/OOM
  resource limits, and the L-038 root-mirror rule for default-locale routes.
when_to_use: 404 on a no-prefix URL, 503 on the live site, "çıxmadı/deploy olmadı",
  adding any app/[locale]/* route, diagnosing why a fix isn't live.
---

# Deploy & routing reality (DK Agency)

Deploy target: **Hostinger Web Apps, auto-deploy from `main`.** Not Vercel.

## merge ≠ canlı
Merging to `main` does NOT make a change live. Hostinger must (1) pull, (2) `npm run build`,
(3) **restart the Node process**. The build memory spike kills shared-plan RAM; a half/OOM
build leaves the old `.next` → stale serve.

When the user says "çıxmadı / deploy olmadı", diagnose in THIS order — never assume new code is needed:
1. Is the fix merged to `main`? (check the PR is `merged`)
2. Has Hostinger redeployed? (build log: `✓ Compiled successfully`, not `Killed`/OOM)
3. Was the Node app **restarted**? (most common miss → stale `.next`)
4. Hard refresh / incognito (browser cache).

## 503 = resurs/OOM, kod deyil
Shared plan + many sites + `next build` (4 GB heap) → app killed → 503. This is **infra, not code**.
Verify code health by building `main` locally: clean build ⇒ the 503 is server-side
(restart/OOM/plan). Ask for the Hostinger **build log + runtime log** before touching code.

## L-038 — ROOT-MIRROR (default-locale routing)
Default-locale (az) prefix-less routes are served by **root-level mirrors**, NOT middleware rewrite.
`localePrefix: 'as-needed'` redirects `/az/X` → `/X`; if `app/X` doesn't exist → **404**.

For EVERY new `app/[locale]/X/page.tsx` you MUST also create the root mirror:
```ts
// app/X/page.tsx
export { default } from '@/app/[locale]/X/page';
// if it has generateMetadata / [slug], re-export those too:
// export { default, generateMetadata } from '@/app/[locale]/X/[slug]/page';
```
In the `[locale]` page, read locale via `getLocale()` (next-intl/server), NOT `params.locale`,
so the mirror (which has no locale param) also resolves.

**Always test the prefix-less URL** (`/sektor/otel`, `/marketinq/menyu-analitik`), never only `/en/...`.
Diagnostic: `next build` + check `app-paths-manifest.json` has the locale-less `/X` entry.

## Build in this sandbox
`next build` needs `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` (Google Fonts TLS),
otherwise it fails on fonts — that is an env quirk, not a code bug.

## Related
`@types/*` must be in `dependencies` (Hostinger skips devDeps) — L-005.
Hostinger kills idle process → external ping needed (`scripts/keep-alive.sh`) — L-034.
Full detail: `docs/LESSONS.md` (L-005, L-034, L-036, L-038).
