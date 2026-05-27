# Architecture Decision Records (ADR)

Bu klasor DK Agency-nin texniki qerarlarinin formal qeydini saxlayir.

## Format
Her ADR bir fayl: `NNNN-qisa-basliq.md`
Status: Proposed / Accepted / Deprecated / Superseded

## Movcud ADR-lar

| # | Qerar | Status |
|---|---|---|
| [001](0001-nextjs-app-router.md) | Next.js + App Router | Accepted |
| [002](0002-custom-auth.md) | Custom JWT auth (not NextAuth) | Accepted |
| [003](0003-drizzle-orm.md) | Drizzle ORM | Accepted |
| [004](0004-neon-postgresql.md) | Neon PostgreSQL | Accepted |
| [005](0005-hostinger-deploy.md) | Hostinger over Vercel | Accepted |
| [006](0006-four-languages.md) | 4 dil (AZ/RU/EN/TR) | Accepted |
| [007](0007-ahilik-tier.md) | SAGIRD/KALFA/USTA tier | Accepted |
| [008](0008-i18n-pattern-a.md) | i18n Pattern A standard | Accepted |
| [009](0009-deepseek-primary.md) | DeepSeek primary + Claude fallback | Accepted |
| [010](0010-yandex-metrica-kvkk.md) | Yandex Metrica + KVKK consent | Accepted |
| [011](0011-kazan-context-injection.md) | KAZAN context-aware greeting | Accepted |
| [012](0012-metro-3-block.md) | Metro 3-block tool descriptions | Accepted |
| [013](0013-dk-validator.md) | dk-validator 8-check subagent | Accepted |
| [014](0014-task-card-system.md) | TASK-XXXX card pre-commit | Accepted |
| [015](0015-auto-approve-mode.md) | Claude Code auto-approve | Accepted |

## Process
Yeni ADR yazmaq ucun:
1. `cp docs/ADR/_TEMPLATE.md docs/ADR/NNNN-title.md`
2. Doldur
3. PR-da review al
4. Merge sonra status: Accepted
