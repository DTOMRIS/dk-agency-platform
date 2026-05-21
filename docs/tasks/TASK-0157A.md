# TASK-0157A: Dashboard i18n Batch 1

**Status:** Ready for PR
**Branch:** `fix/task-0157a-dashboard-i18n-batch1`
**Scope:** Sidebar + KAZAN leads + listing labels

## Scope

- `components/dashboard/DashboardSidebar.tsx`
- `app/dashboard/kazan-leads/page.tsx`
- `app/dashboard/ilanlar/[id]/page.tsx` (only 3 labels)
- `messages/{az,tr,ru,en}.json` (65 new leaf keys)

## Out of Scope

- Remaining 13 `Record<Locale>` files: future batches
- Mock data (`Istanbul` / `HORECA` / `Kadikoy` / `TRY`): Devir M5
- Dashboard locale routing: TASK-0157B

## Validation

- Build PASS, lint 0 errors
- TS strict: 0 new task-related errors (existing debt remains)
- i18n key parity (scoped): 22/22/22/22, 40/40/40/40, 15/15/15/15
- AZ runtime smoke: 4 pages x 2 viewport PASS
