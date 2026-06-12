# TASKS

## TASK-0304 - News editor spine

- Status: implementation and local verification complete; PR pending.
- Scope: Replace the incomplete list modal with one shared full-page news editor at `/dashboard/xeberler/[id]`.
- Includes: complete DB field round-trip, PATCH save, cover image add/replace/remove, preview, translation, publish, and delete.
- Task card: `docs/tasks/TASK-0304.md`.

## TASK-0109 — KAZAN AI system prompt locale-aware response

Scope placeholder:
- Make `lib/kazan-ai/system-prompt.ts` and related KAZAN AI request flow locale-aware.
- Preserve brand terms: KAZAN, HoReCa, Toolkit, OCAQ, ŞEDD, Ahilik, Cavanmərdlik, DK Agency.
- Test chat responses separately in AZ, TR, RU, and EN.

Do not mix this with UI i18n tasks; TASK-0108 only localizes the KAZAN AI page UI and metadata.
