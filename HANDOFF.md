# HANDOFF

## Session 6 İyun 2026 — F2.8 Sektor Dynamic [slug] Route

**Branch:** `feat/f28-sektor-dynamic-route` (origin/main üstündə)

### Tamamlanan
- Config-driven dinamik `app/[locale]/sektor/[slug]/` route — `lib/data/sektorConfigs/` SSOT
- 3 yeni sektor: **otel, restoran, kafe** (+ migrasiya olunmuş qonaq-evi) — config + i18n (4 dil)
- Sektor index `app/[locale]/sektor/page.tsx`, slug-aware OG, lokalizə not-found
- `e2e/sektor-config.test.ts` integrity test (PASS)
- Köhnə statik qonaq-evi route-ları silindi (A1)

### ⚠️ Preview-də doğrulanmalı (sandbox-da mümkün olmadı)
- `/sektor/qonaq-evi`, `/sektor/otel`, `/sektor/restoran`, `/sektor/kafe` (az, prefix-siz) → **200** olmalı
- `/sektor/bilinmeyen` → **404** (notFound → SektorNotFound)
- `/az/sektor/otel` → **307** (as-needed redirect)
- Səbəb: cloud sandbox-da default-locale prefix-siz route bütün yeni route-larda 404 (env kvirki); prod build Google Fonts network bloku. `/en/sektor/*` = 200 sübut edildi. Bax L-038.

### Növbəti
- Preview deploy-da az route-larını təsdiqlə; problem çıxsa next-intl as-needed + Turbopack araşdır
- `/sektor` index-i naviqasiyaya (Header MegaMenu) bağla
- Yeni sektor: **catering** — yalnız 1 config + 1 i18n namespace lazımdır (kod yox)

---

## Session 4 İyun 2026 (axşam) — F2.7 Sprint

**Repo:** `C:/codelar/dk-agency-platform` — main branch, təmiz.

### Tamamlanan işlər (1 PR merged)
| PR | İçərik |
|----|--------|
| #280 | **F2.7: Yandex Metrica events + OG image + OTA PDF generation** |

#### F2.7 detalları
- **D1:** `lib/analytics/sektorEvents.ts` — `trackSektorEvent()` wrapper, 5 komponentə wire edildi (view, cta_test, cta_roi, lead_submitted, faq_open, footer_cta_click)
- **D2:** `app/[locale]/sektor/qonaq-evi/opengraph-image.tsx` — dynamic 1200×630 social card
- **D3:** `lib/pdf/otaGuidePdf.ts` — jsPDF ilə 8-bölmə OTA bələdçi, `lib/email/smtp.ts`-ə attachment dəstəyi, lead submit-də PDF email-ə əlavə olunur

---

## Session 4-5 İyun 2026 — Əvvəlki Nəticə

**Repo:** `C:/codelar/dk-agency-platform` — main branch, təmiz, stash boş, 1 branch (main).

### Tamamlanan işlər (6 PR merged)
| PR | İçərik |
|----|--------|
| #271 | OTA Funnel: 3 toolkit (quiz + ROI calc + WhatsApp freemium) |
| #272 | Blog sprint: stage lifecycle + callout h3 + legal disclaimer |
| #273 | P0 fix: otaReadiness.ts commit (prod crash riski) |
| #274 | 12 yeni blog məqaləsi (011-022) stash-dan recover |
| #277 | **F2.6: /sektor/qonaq-evi landing + POST /api/lead/ota-guide** |
| #278 | CHANGELOG + DEVLOG |

### Repo təmizliyi
- 170 branch silindi (106 merged + 64 stale)
- 3 stash drop edildi
- 2 git worktree silindi

### Prod smoke (5 İyun verified)
- `/sektor/qonaq-evi` → 200
- `/ru/sektor/qonaq-evi` → 200
- `/en/sektor/qonaq-evi` → 200
- `/tr/sektor/qonaq-evi` → 200
- `/az/sektor/qonaq-evi` → 307 (default locale redirect, gözlənilən)
- `POST /api/lead/ota-guide {}` → 400 (validation işləyir)

### Hostinger 503 — AÇIQ PROBLEM
Bütün sayt 503 verir (arada). Hostinger hPanel-dən Node.js restart lazımdır. Kod problemi deyil, infra issue.

---

## Növbəti sessiya üçün prioritetlər

### Seçim A: F2.8 — Sektor genişlənmə (tövsiyə olunan)
- `/sektor/otel` — eyni 7 komponent, fərqli config (SektorHero, StatGrid, ToolGrid...)
- `/sektor/restoran` — eyni pattern
- `/sektor/kafe` — eyni pattern
- Fayllar: `app/[locale]/sektor/{slug}/page.tsx` + `messages/*.json` yeni namespace

### Seçim C: F4 KAZAN AI grounding

### Əsas fayllar (yeni session üçün oxu)
```
components/sektor/*.tsx          — 7 parametrik komponent (F2.6)
app/sektor/qonaq-evi/page.tsx   — landing page config
app/api/lead/ota-guide/route.ts — lead endpoint
lib/data/otaReadiness.ts        — OTA quiz SSOT
lib/data/guesthouseRoi.ts       — ROI calc SSOT
lib/data/whatsappTemplates.ts   — WhatsApp şablonlar SSOT
messages/az.json → sektorQonaqEvi namespace
CHANGELOG.md, DEVLOG.md         — session log
docs/tasks/TASK-0196.md         — F2.6 task card
```

---

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
