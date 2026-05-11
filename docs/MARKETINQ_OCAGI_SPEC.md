# Marketinq Ocagi — Texniki Spec

> Bu fayl Marketinq Ocagi toolkit-in texniki spesifikasiyasidir.
> Konstitusiya senedi ayrica saxlanilir (Sprint planlama).
> Son yenilenme: 2026-05-11

---

## 2.1 Pilleleler ve qiymet strukturu

| Pille | Icaze | Aylik qiymet | Hedef |
|---|---|---|---|
| **SAGIRD** | 3 alet — pulsuz | 0 AZN | Lead capture |
| **KALFA** | 3 SAGIRD + 6 KALFA = 9 | 89 AZN | Gelir motoru |
| **USTA** | butun 13 alet | 149 AZN | Premium |

### 2.1.1 Plan-to-tier mapping (REAL implementasiya)

Movcud `lib/member-access.ts`-de 3 plan var: `free` / `member` / `admin`.
Marketinq Ocagi bunlari birbasa brand pillesine map edir:

| MemberPlan (movcud) | MarketingToolTier (brand) | Qeyd |
|---|---|---|
| `free` | SAGIRD | Pulsuz, 3 alet |
| `member` | KALFA | 89 AZN/ay, 9 alet |
| `admin` | USTA | 149 AZN/ay, 13 alet |

**Implementasiya:** `lib/marketing-gating.ts` → `mapPlanToTier(plan)` funksiyasi.

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

## 3. MASTER ALET SIYAHISI (13 alet)

| # | Alet | Slug | Pille | AI Provider | Status |
|---|---|---|---|---|---|
| 1 | Marka Kompasi | `marka-kompasi` | SAGIRD | deepseek | live |
| 2 | KST Yoxlayici | `kst-yoxlayici` | SAGIRD | deepseek | live |
| 3 | Menyu Analitigi | `menyu-analitigi` | SAGIRD | deepseek | planned (Sprint 4) |
| 4 | Promosyon ROI v2 | `promosyon-roi` | KALFA | deepseek | planned (Sprint 4) |
| 5 | P&L Simulator | `pnl-simulator` | KALFA | deepseek | planned (Sprint 4) |
| 6 | Sikayet Analitigi | `sikayet-analitigi` | KALFA | deepseek | planned (Sprint 4) |
| 7 | Musteri Persona | `musteri-persona` | KALFA | deepseek | planned (Sprint 4) |
| 8 | Sezon Planlama | `sezon-planlama` | KALFA | deepseek | planned (Sprint 5) |
| 9 | Reklam Yazicisi | `reklam-yazicisi` | KALFA | deepseek | planned (Sprint 5) |
| 10 | Sosial Medya Plan | `sosial-medya-plan` | USTA | deepseek | planned (Sprint 5) |
| 11 | Audit Robotu | `audit-robotu` | USTA | deepseek | planned (Sprint 5) |
| 12 | Trend Analitigi | `trend-analitigi` | USTA | deepseek | planned (Sprint 5) |
| 13 | Lokasyon Secme | `lokasyon-secme` | USTA | deepseek | planned (Sprint 5) |

**Cemi:** 3 SAGIRD + 6 KALFA + 4 USTA = 13

**Deyisiklik loqu (2026-05-11):**
- 12 → 13 alet (Lokasyon Secme elave)
- Alet adlari yenilendi (Sprint 4 scope-a uygun)
- Qiymet: KALFA 49 → 89 AZN (daha cox alet, daha cox deger)
- AI provider: butun aletler DeepSeek primary (Dogan-in 2026-05-10 qerari)
- Kohne aletler (gbp-qurucu, smm-plan-ai, caption-yazici, kampaniya-takvimi,
  rey-cavab-ai, reqib-radari, ai-vizyual-studyo, aeo-skoru, gorunurluk-testi)
  yeni adlarla evez olundu ve ya legv edildi

---

## 4. ALET DETALLARI

### 4.1 Marka Kompasi (LIVE)

Bax: Sprint 2 implementasiya. `app/api/marketing-tools/marka-kompasi/route.ts`
5 sual → Claude/DeepSeek AI → ICP, Value Prop, Tagline, Differentiators.

### 4.2 KST Yoxlayici (LIVE)

Bax: Sprint 3 implementasiya. `app/api/marketing-tools/kst-yoxlayici/route.ts`
30 Likert sual → DeepSeek AI → Scores, 3 Issues, 30-day Action Plan.

---

### 4.3 Promosyon ROI v2 (McDonald's modeli)

**Slug:** `promosyon-roi`
**Pille:** KALFA
**Menbe:** `pazarlama_wshop_case.xls` (McDonald's case study)

**Niye v2?** Kohne model cox sadedir — TC, Gross Margin, sabit xercler,
SOI, x4 hafta extrapolasiya yoxdur. Yeni model Baz Hafta vs Promo Hafta
muqayisesine esaslanir.

**Input (3-step wizard):**

Step 1 — Meta:
- promoName (text)
- promoDurationDays (number)
- restaurantName (text, optional)

Step 2 — Reqemler (2 sutun yanasi):

| Baz Hafta | Promo Hafta |
|---|---|
| totalSales (AZN) | totalSales (AZN) |
| transactionCount (TC) | transactionCount (TC) |
| avgTicket (auto: sales/TC) | avgTicket (auto) |
| grossMarginPercent (%) | grossMarginPercent (%) |
| — | promoCost (AZN) |
| — | marketingSpend (AZN) |

Collapse panel — Sabit xercler (defaults):
- rentPercent: 15%
- royaltyPercent: 0%
- advertisingPoolPercent: 5%
- serviceFeePercent: 5%

Step 3 — Netice (5 panel):
1. Weekly Comparison (uplift %, TC uplift, avg ticket change)
2. P&L (baseline vs promo — SOI hesabi)
3. Incremental Analiz (incrementalSOI, ROI %)
4. Monthly Projection (x4 hafta extrapolasiya)
5. AI Insight (QAZANDIRDI/BERABERE/ZERER + findings + risks + recommendations)

**SOI formula:**
```
SOI = totalSales - foodCost - rent - royalty - adPool - serviceFee - promoCost - marketingSpend
foodCost = totalSales * (1 - grossMarginPercent/100)
ROI = ((incrementalSOI - totalPromoInvestment) / totalPromoInvestment) * 100
```

**AI prompt:** DeepSeek — reqemlere esaslanan yorum, hec bir reqem uydurma.
Verdict: QAZANDIRDI/BERABERE/ZERER.

**Run limit:** SAGIRD 0, KALFA unlimited, USTA unlimited.

---

### 4.13 Lokasyon Secme (YENİ — 13-cu alet)

**Slug:** `lokasyon-secme`
**Pille:** USTA (149 AZN/ay)
**Menbe:** `Heb_s_Operasyon_El_Kitabi.docx` bolme 1

**Niye USTA?**
- Acilis investisiyasi 30,000-150,000 AZN — sehv yer = 6-12 ay zerer
- Google Maps API call-lari bahadir (~$0.20/analiz)
- Abuse riski SAGIRD/KALFA-da yuksekdir

**7 restoran konsepti preset:**
- fast_food, saglam_menyu, fine_dining, cafe_kafeterya,
  fast_casual, fine_casual, qiraathane_kafe
- Her preset: targetDemographic, locationPreferences, trafficPatterns,
  competitionRadius, redFlags, greenFlags
- Config faylinda saxlanilir (listingFieldConfig dersi)

**4 asama wizard:**

1. Pazar Analizi — lokasyon unvani (Google autocomplete), konsept secimi,
   hedef demografik. Cixis: ticari bolge tipi, ofis sixligi, lifestyle markers.

2. Yer Deyerlendirmesi — m2, cebhe, kose yer, tabela, park, aciq metbex,
   AVM mertebe, foto upload. Cixis: Gorunurluk A/B/C (Heb's metodologiyasi),
   trafic analizi, olcu uygunlugu.

3. Maliyye + Risk — aylik kira, investisiya, gozlenilen satis.
   Cixis: break-even ay, kira/satis nisbeti, ROI proyeksiyasi, risk
   xeberdarliqlar.

4. Karar — yekun tovsiye: GET (yasil) / TEHLIL (sari) / REDD (qirmizi).
   Bal 0-100 (5 sahe), 3 alternativ ssenari, action plan.

**Google Maps API istifadesi:**
- Places API (autocomplete, nearby search, place details)
- Geocoding API
- Maliyyet: ~$0.20/analiz, cache 7 gun
- Env: GOOGLE_MAPS_API_KEY (Hostinger panele elave)

**Run limit:** SAGIRD 0, KALFA 0, USTA 10/ay.

**Sprint:** 5 (en boyuk scope — Google Maps + multi-step wizard + cache).

---

## 5. SPRINT PLANI

### Sprint 4 (1 hefte)
- TASK-0104 Menyu Analitigi (SAGIRD)
- TASK-0105 Sikayet Analitigi (KALFA)
- TASK-0106 P&L Simulator (KALFA)
- TASK-0107 Promosyon ROI v2 (KALFA, McDonald's modeli)
- TASK-0109 Musteri Persona (KALFA)

### Sprint 5 (1 hefte)
- TASK-0110 Sezon Planlama (KALFA)
- TASK-0111 Reklam Yazicisi (KALFA)
- TASK-0112 Sosial Medya Plan (USTA)
- TASK-0113 Audit Robotu (USTA)
- TASK-0114 Trend Analitigi (USTA)
- TASK-0108 Lokasyon Secme (USTA, en boyuk scope)
