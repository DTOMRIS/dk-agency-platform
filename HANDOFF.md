# HANDOFF

## TASK-0152 - Pricing Page

Status: DONE in `feature/task-0152-pricing-page`.

Key points:
- Public route: `/[locale]/pricing`.
- Single component: `components/pricing/PricingPage.tsx`.
- Tier cards read tool lists from `lib/marketing-tools-config.ts`.
- Current source-of-truth tier counts are SAGIRD 3, KALFA 12, USTA 6.
- KALFA and USTA use WhatsApp CTA; SAGIRD uses the existing register flow.

Next: TASK-0153 Homepage 3-card pricing entry.

## TASK-0149 - Restoran Audit

Status: DONE in `feature/task-0149-restoran-audit`.

Key points:
- 30 questions remained fixed at 6 areas x 5 questions.
- AZ-specific controls added through replacement, not scope expansion.
- AQTA/compliance copy avoids fee and procedure numbers.
- Single component convention: `components/marketinq-ocagi/restoran-audit/RestoranAuditPage.tsx`.

## TASK-0150 - Trend Analiz

Status: DONE in `feature/task-0150-trend-analiz`.

Key points:
- Static 2026 HoReCa trend KB is the source of truth; no RSS dependency in this task.
- DeepSeek is only an application-advice layer.
- AI failure path falls back to static first-step copy and keeps the tool usable.
- Single component convention: `components/marketinq-ocagi/trend-analiz/TrendAnalizPage.tsx`.

## TASK-0151 - Lokasyon Analiz

Status: DONE in `feature/task-0151-lokasyon-analiz`.

Key points:
- Static franchise-style location KB is the source of truth; no Google Places, map, or demographic API dependency.
- Two modes: new site selection with breakeven sales, and existing site review with risk flags.
- DeepSeek is only an application-advice layer; fallback recommendations keep the tool usable.
- Single component convention: `components/marketinq-ocagi/lokasyon-analiz/LokasyonAnalizPage.tsx`.

## Sprint 5 Completed

Marketinq Ocagi Sprint 5 is complete: TASK-0146..0151, 6/6 tools.

Next work should be scoped separately:
- Enrich TASK-0149 audit with the remaining restaurant evaluation and profitability sections.
- Move the broader franchise manual sections into KAZAN AI knowledge base in a dedicated session.
