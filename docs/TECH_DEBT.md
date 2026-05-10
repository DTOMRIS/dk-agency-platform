# Tech Debt Registry — DK Agency Platform

Texniki borc qeydleri. Her giris prioritet, sprint ve hell plani ile.

---

## TD-001 — Marketing tier mapping role-a baglidir

**Tarix:** 2026-05-09
**Sprint:** 1 (kesf), 2 (qebul)
**Status:** ACIQ
**Prioritet:** Asagi (Stripe inteqrasiyasina qeder)

### Problem
`lib/marketing-gating.ts` → `mapPlanToTier()` MemberPlan
(free/member/admin) → MarketingToolTier (sagird/kalfa/usta) edir.
Bu o demekdir ki, her `member` plan istifadecisi avtomatik KALFA-dir.
Stripe/Payriff inteqrasiyasi gelende bu yanlis olacaq.

### Hell
1. `member_subscriptions` cedvelinde `marketing_tier` enum column elave et
   (sagird/kalfa/usta)
2. Stripe webhook-dan odenis statusuna gore bu column-u yenile
3. `mapPlanToTier()`-i extend et: evvel marketing_tier yoxla, varsa
   istifade et, yoxsa role mapping-e fall back

### Elaqeli
- docs/MARKETINQ_OCAGI_SPEC.md bolme 2.1.1
- lib/marketing-gating.ts
- Sprint 5 (Stripe/Payriff)
