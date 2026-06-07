---
name: dk-new-tool
description: Scaffold a new DK Agency calculator/tool the correct way (toolkit or
  marketinq), so it never 404s and reuses the shared AI insight. Encodes the
  root-mirror (L-038), AI-insight-reuse (L-009), and i18n (Pattern A) rules.
when_to_use: building a new toolkit calculator or marketinq aləti, "yeni alət",
  "kalkulyator əlavə et".
argument-hint: [slug] [area: toolkit|marketinq] [tier: sagird|kalfa|usta]
disable-model-invocation: true
---

# Add a new tool (DK Agency)

Build in this order. Do not skip the root mirror or the AI-insight reuse.

## 1. Component
`components/<area>-ocagi/<slug>/<Name>Page.tsx` (marketinq) or a `toolkit` component.
- `'use client'` if it has interactive calc. Pattern A i18n (`useTranslations('<area>.<slug>')`).
- No hardcoded AZ/TR strings. No `any` → `unknown`. No `console.log`.

## 2. Route + ROOT MIRROR (L-038 — both required)
```ts
// app/[locale]/<area>/<slug>/page.tsx  — has metadata, reads locale via getLocale()
// app/<area>/<slug>/page.tsx           — root mirror:
export { default } from '@/app/[locale]/<area>/<slug>/page';
```
The root mirror is mandatory or the prefix-less az URL 404s. (See `dk-deploy-reality`.)

## 3. AI insight — REUSE, no new API route (L-009)
Do NOT create `app/api/...`. Instead:
- Add a prompt to `TOOL_PROMPTS` in `app/actions/toolkit-insight.ts` (key = slug).
- Call `getToolkitInsight({ toolId: '<slug>', ... })` from the client.
Rate-limit (20/hr cookie), injection-sanitize, DeepSeek→Claude fallback are already handled there.

## 4. i18n keys (all 4 langs)
Add `<area>.<slug>` namespace to `messages/{az,ru,en,tr}.json`. Full translations, no placeholders.
Inject by namespace marker + `JSON.parse` validate; don't reformat the file (L-033).

## 5. Config (PROTECTED — Doğan adds, or ask)
`lib/marketing-tools-config.ts` entry shape: `slug`, `category`, `tier` ('sagird'|'kalfa'|'usta'),
`iconName`, `status`, `aiProvider`, `externalApis`, `inputSchema`, `monthlyRunLimit`,
`estimatedCostAznPerRun`. This file is PROTECTED — do not edit directly; give Doğan the exact entry.
Also wire the index/listing page if the area has one (e.g. `app/toolkit/page.tsx`).

## 6. Verify (Definition of Done)
- `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run build` → 0 error
- Smoke **prefix-less** URL: `/<area>/<slug>` → 200/307 (NOT only `/en/...`)
- If gated: POST to the action path → 401 without auth
- `grep` the new component for hardcoded AZ/TR words → 0 hits
- Update `docs/CHANGELOG.md` + `docs/DEVLOG.md`
- Then: `Use the dk-validator subagent to verify TASK-XXXX.`
