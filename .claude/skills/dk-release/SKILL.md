---
name: dk-release
description: DK Agency release gate — run before merging and after merging to confirm
  a change is actually live on dkagency.com.tr, not just merged. Prevents the
  "merge etdim amma çıxmadı" deploy gap.
when_to_use: finishing a task, preparing to merge, or confirming a deploy reached prod.
disable-model-invocation: true
---

# Release gate (DK Agency)

Deploy target: **Hostinger auto-deploy from `main`.** See `dk-deploy-reality` for the why.

## A. Before merge (Definition of Done — every item, raw output)
1. `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build` → 0 TS error
2. `npm run lint` → 0 new error
3. `npm run verify:staged` → pass
4. Playwright @smoke **executed** (not just written)
5. Route HEAD → 200/307 on the **prefix-less** URL (404/500 = fail)
6. Gated API POST → 401 without auth (gating proof)
7. New component: `grep` hardcoded AZ/TR → 0 hits
8. `docs/CHANGELOG.md` + `docs/DEVLOG.md` updated
9. `npm run dk:validate` → 8/8 PASS visible in PR/commit (skip only with stated technical reason)
10. Each task = branch + PR + dk-validator. Never `--no-verify`.

## B. After merge — prove it's LIVE (do not stop at "merged")
Merging ≠ live. When the user expects the change on prod:
1. Confirm PR `merged` to `main`.
2. Hostinger redeployed? build log `✓ Compiled successfully` (not `Killed`/OOM).
3. **Node app restarted** (most common miss → stale `.next` → old behavior / 404 / 503).
4. Verify the live URL (prefix-less) returns the new behavior; hard-refresh / incognito.

If a route 404s or the site 503s after deploy, switch to the `dk-deploy-reality` skill and
diagnose merge→build→restart→cache in that order before touching code.
