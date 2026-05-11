# TASK-0107-impl
- Scope: Implement Promosyon ROI v2 — McDonald's model with SOI calculation.
- Affected files: `app/api/marketing-tools/promosyon-roi/route.ts`, `components/marketinq-ocagi/promosyon-roi/PromoROIForm.tsx`, `components/marketinq-ocagi/promosyon-roi/PromoROIResult.tsx`, `components/marketinq-ocagi/promosyon-roi/PromoROIPage.tsx`, `app/dashboard/marketinq-ocagi/[slug]/page.tsx`, `lib/marketing-tools-config.ts`.
- Pure calculation: SOI, P&L comparison, incremental analysis, monthly projection.
- AI: DeepSeek for verdict + insights (fallback if AI fails — pure calc still works).
- Tier: KALFA (unlimited runs).
- Done criteria: 3-step form, P&L table, verdict badge, AI findings/risks/recommendations.
- Owner: Claude
- Date: 2026-05-11
