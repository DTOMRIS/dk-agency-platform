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

---

## TD-002 — ANTHROPIC_API_KEY production validation

**Tarix:** 2026-05-10
**Sprint:** 2
**Status:** ACIQ
**Prioritet:** Orta

### Problem
Marka Kompasi prod-da ai_provider=deepseek qaytarir (fallback), Claude
primary islenir. Spec-de Claude primary qeyd edilmisdir
(positioning ucun April Dunford terzi nuanced cavab).

### Sebeb (ehtimal)
- ANTHROPIC_API_KEY Hostinger panel env-de yoxdur, ya da
- Movcuddur amma key kecersizdir/format yanlisdir, ya da
- Model adi `claude-sonnet-4-20250514` movcud deyil (model adlandirmasi
  deyismis ola biler)

### Hell
1. Dogan: Hostinger panelde ANTHROPIC_API_KEY movcudlugunu yoxla
2. Var olarsa: lokalda eyni key ile tek cagris test et
3. Test fail olsa: model adi movcud deyil — model siyahisini yoxla
4. Duzelt → restart Hostinger app → yeniden test (yeni run
   ai_provider='claude' olmalidir)

### Elaqeli
- lib/ai-router.ts (callClaude funksiyasi)
- DEVLOG TASK-0102 netice bolmesi
