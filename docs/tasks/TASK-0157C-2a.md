# TASK-0157C-2a: Dashboard Pattern A — C2a Batch

**Status:** Ready for PR
**Branch:** `feat/task-0157c-2a-dashboard-server-pattern-a`

## Scope
- `app/dashboard/mesajlar/page.tsx` (17 key)
- `app/dashboard/pipeline/page.tsx` (24 key)
- `app/dashboard/loglar/page.tsx` (25 key)
- `app/dashboard/raporlar/page.tsx` (33 key)
- `messages/{az,tr,ru,en}.json` (4 new namespaces, 99 leaf keys)

## Out of Scope
- roller (C2b — permission terminology, isolated)
- food-cost, faturalar, auditor (C3)
- b2b-yonetimi (C4)
- Mock data (İstanbul/HORECA) — Devir M5

## Validation
- Build PASS
- i18n key parity: 17/17/17/17, 24/24/24/24, 25/25/25/25, 33/33/33/33
- AZ + TR smoke: 8 pages all 307
