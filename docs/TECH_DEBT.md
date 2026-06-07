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

---

## TD-003 — b2b-panel ana sehife Pattern C (inline Record<Locale>)

**Tarix:** 2026-06-07
**Status:** ACIQ
**Prioritet:** Orta (qayda pozuntusu, amma islenir)

### Problem
`app/b2b-panel/page.tsx` ~180 setirlik `pageCopy: Record<Locale, ...>`
inline tercume bloku (Pattern C) saxlayir — L-004/L-009 qaydasina ziddir.
Eyni qovluqdaki `components/b2b-panel/B2BSidebar.tsx` ARTIQ Pattern A
(`useTranslations`) islenir, yeni uygunsuzdur. PR #298 ile genislendi.

### Niye derhal duzelmedi
30+ istinad noktasi (`copy.statLabels[0]`, `copy.categoryLabels[cat]`,
`copy.offerItems[i]` ...) + array/nested obyekt strukturlari var. Teze
merge olunmus auth-yaxin faylda telesik refaktor runtime MISSING_MESSAGE
bug riski yaradir. Ayrica fokuslu task lazimdir (L-016: kohne borc cari
isi bloklamamalidir).

### Hell (gelecek task — TASK-0212 namizedi)
1. `b2bPanel` namespace-i `messages/{az,ru,en,tr}.json`-a kocur
   (string-ler artiq movcuddur — VERBATIM kocurme, yeni tercume yox).
2. Array-lar ucun `t.raw('statLabels')`, nested ucun `t('statusLabels.active')`.
3. `pageCopy` + `normalizeLocale(pathname)` copy mentiqini sil,
   `useTranslations('b2bPanel')` ile evez et (locale provider-den gelir).
4. Hemise prefix-siz `/b2b-panel` HEM de `/en/b2b-panel` smoke et;
   build + MISSING_MESSAGE konsol yoxlamasi.

### Elaqeli
- app/b2b-panel/page.tsx (Pattern C)
- components/b2b-panel/B2BSidebar.tsx (Pattern A referans)
- docs/LESSONS.md L-004, L-009
