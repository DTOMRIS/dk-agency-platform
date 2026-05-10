# Marketinq Ocagi — Texniki Spec

> Bu fayl Marketinq Ocagi toolkit-in texniki spesifikasiyasidir.
> Konstitusiya senedi ayrica saxlanilir (Sprint planlama).
> Son yenilenme: 2026-05-10

---

## 2.1 Pilleleler ve qiymet strukturu

| Pille | Icaze | Aylik qiymet | Hedef |
|---|---|---|---|
| **SAGIRD** | 4 alet — pulsuz | 0 AZN | Lead capture |
| **KALFA** | 4 SAGIRD + 5 KALFA = 9 | 49 AZN | Gelir motoru |
| **USTA** | butun 12 alet | 149 AZN | Premium |

### 2.1.1 Plan-to-tier mapping (REAL implementasiya)

Movcud `lib/member-access.ts`-de 3 plan var: `free` / `member` / `admin`.
Marketinq Ocagi bunlari birbasa brand pillesine map edir:

| MemberPlan (movcud) | MarketingToolTier (brand) | Qeyd |
|---|---|---|
| `free` | SAGIRD | Pulsuz, 4 alet |
| `member` | KALFA | 49 AZN/ay, 9 alet |
| `admin` | USTA | 149 AZN/ay, 12 alet |

**Implementasiya:** `lib/marketing-gating.ts` → `mapPlanToTier(plan)` funksiyasi.

**Mehdudiyyet:** Bu mapping `is_premium` column elave etmir.
Movcud `users.role` ve `member-access.ts` `MemberPlan` istifade olunur.
Bu, Stripe/Payriff inteqrasiyasindan evvel kifayetdir, cunki:
- Butun `free` istifadeciler = SAGIRD (pulsuz aletlere giris var)
- `member` plan = odenis eden uzv = KALFA
- `admin` = DK Agency komandasi = USTA (butun aletler)

**Gelecek:** Stripe inteqrasiyasi gelende `member_subscriptions.marketing_tier`
enum column elave olunacaq. Bax: `docs/TECH_DEBT.md` TD-001.

---

## 2.2 Texniki standartlar

- **Frontend:** Next.js 16 App Router + Tailwind + i18n (4 dil)
- **AI:** DeepSeek (primary) + Claude (fallback) — `lib/ai-router.ts`
- **DB:** Drizzle ORM + Neon PostgreSQL — `marketing_tool_runs` cedveli
- **Gating:** `lib/marketing-gating.ts` — TIER kontrolu
- **i18n:** Dashboard inline copy pattern (next-intl middleware-den xaric)
- **Single source of truth:** `lib/marketing-tools-config.ts`

---

## 2.3 Alet sablonu

```
URL: /dashboard/marketinq-ocagi/[slug]
Bolme 1: Basliq + 1 cumle aciqlama + pille badge
Bolme 2: "Niye bu vacibdir" (50-100 soz)
Bolme 3: Input form (sahe tipi config-den)
Bolme 4: AI cagirisi + netice gorunusu
Bolme 5: "Novbeti addim" — basqa alete korpu
```

---

## 3. ALET SIYAHISI

| # | Slug | Pille | AI Provider | Status |
|---|---|---|---|---|
| 1 | gorunurluk-testi | SAGIRD | none | planned |
| 2 | kst-yoxlayici | SAGIRD | deepseek | planned |
| 3 | gbp-qurucu | SAGIRD | deepseek | planned |
| 4 | marka-kompasi | SAGIRD | claude | live |
| 5 | smm-plan-ai | KALFA | deepseek | planned |
| 6 | caption-yazici | KALFA | deepseek | planned |
| 7 | promosyon-roi | KALFA | deepseek | planned |
| 8 | kampaniya-takvimi | KALFA | claude | planned |
| 9 | rey-cavab-ai | KALFA | claude | planned |
| 10 | reqib-radari | USTA | deepseek | planned |
| 11 | ai-vizyual-studyo | USTA | deepseek | planned |
| 12 | aeo-skoru | USTA | claude | planned |
