# Changelog - DK Agency Platform

## [Unreleased]

## [TASK-0199] fix(blog): production DB-yə çatışmayan 14 yazını sync et — 2026-06-06

### Fixed
- Statik blog mənbəsində mövcud olub production Neon DB-də olmayan 14 yazı idempotent seed ilə yayımlandı.
- Blog seed artıq `stage` sahəsini də yazır və əlavə edilən/keçilən qeyd sayını göstərir.

## [TASK-0198] content(franchise): Fəsil 11 hüquqi redaksiya — 2026-06-06

### Added
- `DK Agency Franchise Bələdçisi` üçün AZ/TR Fəsil 11 mənbə faylı əlavə edildi və `status: ready` olaraq işarələndi.

### Changed
- Yerli markalar haqqında hüquqi risk yaradan uğursuzluq iddiaları çıxarıldı; Krispy Kreme, Quiznos və Burger King-in qlobal operator nümunələri saxlanıldı.

## [TASK-0183] feat(blog): wire 14 covers slug→blog-NN (drift-safe) — 2026-06-06

### Added
- 14 cover images `public/images/blog-12.png … blog-25.png` (committed separately)

### Fixed
- Wired `coverImage` for 14 articles by SLUG to the canonical `/images/blog-12..25.png` scheme. The previous descriptive filenames (`blog-11-ai-favok.png` …) were off-by-one vs the canonical numbering — a NUMBER-based wire would have shown the wrong cover. Done by slug to avoid that drift (see launch spec).
- Verified (prod `next build` + `next start`): `/blog` 200, cover assets 200, and each of the 14 slugs renders its correct cover (e.g. ai-ile-favok-qorumasi → blog-12, cografi-isare-yerli-lezzet → blog-25). All 24 referenced cover files exist on disk (0 broken).

## [TASK-0196] feat(sektor): /sektor/qonaq-evi landing + lead endpoint — 2026-06-05

### Added
- 7 parametric components in `components/sektor/` (SektorHero, StatGrid, ToolGrid, BlogTeaserGrid, LeadCapture, FaqAccordion, FooterCta) — reusable for future `/sektor/otel`, `/sektor/restoran`, `/sektor/kafe`
- Landing page `/sektor/qonaq-evi` — Hero + 3 stats + 3 tools (ROI calc = hero card) + blog teasers + lead form + FAQ accordion + footer CTA
- Lead endpoint `POST /api/lead/ota-guide` — validation, IP rate limit 3/hr, KVKK consent, dual email notifications (user + admin)
- i18n `sektorQonaqEvi` namespace in 4 locales (AZ/EN/RU/TR)

### Deferred
- Real PDF generation (Puppeteer) — F2.7
- OG cover image — content team
- Yandex Metrica events — next sprint

## [TASK-0195] feat(blog): stage lifecycle + callout h3 + 12 new articles — 2026-06-04

### Added
- Blog stage lifecycle field (Başla / Böyüt / Devir) — schema, editor, grid cards, detail page
- StageBadge component with color-coded badges (red/amber/purple)
- MarkdownRenderer h3 callout system — 14 patterns (Guru Kutusu, Faydalı Məlumat, Hüquqi Risk, Doğan Notu, etc.)
- LegalDisclaimer auto-appended to Hüquqi category blog posts
- 2 new blog categories: Hüquqi + Marketinq (case-insensitive fallback)
- 12 new blog articles (blog-011 through blog-022): AI FAVÖK, garson upsell, coğrafi işarə, AHA ulduz, Şəki pansiyon, M2 Lounge, franchise müqavilə, patent, qastronomiya 2030
- Missing otaReadiness i18n keys added to az.json
- Migration: `0012_add_blog_stage_column.sql`

## [TASK-0194] feat(ota): 3 toolkit tools — OTA quiz + ROI calc + WhatsApp freemium — 2026-06-04

### Added
- OTA Readiness Quiz (`/toolkit/ota-hazirlig-testi`) — 8 questions, 5 tiers, AI report via FranchiseQuiz parametric reuse
- Guesthouse ROI Calculator (`/toolkit/qonaq-evi-roi-kalkulyatoru`) — OTA commission math with Booking 15% + Airbnb comparison
- WhatsApp Templates (`/toolkit/whatsapp-template-paketi`) — 3 free + 7 gated freemium model, clipboard copy
- `OtaReadinessReport` AI taskType added to franchiseReport.ts
- SSOT data files: `guesthouseRoi.ts`, `whatsappTemplates.ts`, `otaReadiness.ts`

### Fixed
- `otaReadiness.ts` was missing from git (P0 prod crash risk) — committed separately
- React compiler lint: `startTransition` wrapper for `FranchiseQuiz` + `RadarChart` setState-in-effect

## Cleanup Sprint — 2026-06-04

### Changed
- 170 stale branches deleted (106 merged + 64 squash-merged)
- 3 stashes dropped (content recovered first)
- 2 git worktrees removed (dogan-notu, ru-locale — both already in main)

## [TASK-LOCALE-LOOP] fix(i18n): resolve localized public route loop - 2026-05-31

### Fixed
- Prevented next-intl middleware from re-processing unprefixed public paths and causing default-locale redirect loops.
- Added `/[locale]/listings` as an alias for localized listings campaign links.
- Added Playwright coverage for `/az/ilan-ver`, `/az/ilanlar`, `/ru/ilan-ver`, `/ru/ilanlar`, `/en/listings`, and `/tr/ilanlar`.

### Changed
- Improved mobile layout resilience for public listing form, listing filters, and mobile header drawer.

## [TASK-DEBT-CLEANUP] chore: repair field config and audit gates - 2026-05-31

### Fixed
- Updated listing field config test to expect the current 14-field `devir` config including `equipment-list`.
- Replaced Windows-incompatible `grep` usage in `generate-audit.mjs` with Node-native file scanning.
- Fixed Windows API route detection in `generate-state.mjs`.

## [TASK-I18N-IDEMPOTENT] feat(content): per-field translation runs - 2026-05-31

### Added
- Added `content:translate`, `content:translate:dry`, and `content:translate:mock` scripts.
- Added deterministic `--mock` translation mode for safe script checks.

### Fixed
- `translate-content.mjs` now fills missing blog/news/listing fields individually instead of skipping a whole row when only `title_xx` exists.
- Listings translation now selects `description_az` before using it as a source field.

## [TASK-BLOG-CONTENT-RUN] chore(content): translate blog DB content - 2026-05-31

### Changed
- Filled `blog_posts` RU/EN/TR `title`, `summary`, and `content` columns for 13/13 AZ source posts via DeepSeek.

## [TASK-0180] feat(listings): public concept axis - 2026-05-31

### Added
- Public `CreateListingForm` Step 3 now shows sector-based concept chips from `listingConcepts.ts` SSOT.
- Sector-based location detail fields are collected in the public listing flow.
- Concept/location warnings are displayed before submission and included in preview.
- `createListing` i18n keys added for AZ/EN/RU/TR with parity preserved.

### Changed
- Listing submit payload now stores selected concepts and location details inside `typeSpecificData`.
- `SYSTEM-AUDIT.md` regenerated after the change.

## [TASK-B-FIX] fix(listings): sector API filter + response — 2026-05-29

### Fixed
- `ListingFilters` interface: `sector` field əlavə edildi
- `getListings()`: sector filter condition əlavə edildi
- `mapDbListing()`: response-a `sector` field daxil edildi
- API GET handler: `sector` query param oxunub `getListings()`-ə ötürülür

## [TASK-B] feat(listings): sector select + filter + badge — 2026-05-29

### Added
- CreateListingForm Step 2: sector SELECT (məcburi, 7 sektor, listingSectors.ts SSOT-dan)
- ListingsShowcasePage: sector filter dropdown (URL param sync)
- B2B ilanlarım: sector filter dropdown
- ListingCard: sector badge (category badge altında)
- Admin ilanlar table: sector column
- B2B ilanlarım row: sector badge
- i18n: `filterAllSectors` key 4 dildə (az/en/ru/tr)
- Mock data: 12 listing-ə sector dəyəri

### Changed
- CreateListingForm FormState: `sector` field əlavə
- ListingsShowcasePage filter logic: sectorMatch əlavə

## [TASK-A] dk-validator blocking gate — 2026-05-29

### Added
- `scripts/dk-validate.sh` — full 8-check validation script (`npm run dk:validate`)
- CLAUDE.md DoD madde 9-10: dk-validator PASS + audit:system məcburi
- PR template: dk-validator çıxışı bölməsi

### Changed
- `.claude/scripts/pre-commit-gate.sh` — 3 check → 5 check (auth contract + DB schema naming)
- `.claude/agents/dk-validator.md` — description updated (Stop hook 5/8 blocking, subagent 6-8)
- `.github/pull_request_template.md` — dk-validator + audit:system checklist

## [TASK-0157C-3a] auditor + food-cost Pattern A — 2026-05-23

### Added
- dashboardAuditor namespace (33 key × 4 dil = 132 tərcümə)
- dashboardFoodCost namespace (29 key × 4 dil = 116 tərcümə, months/monthsShort array)

### Changed
- `app/dashboard/auditor/page.tsx`: Pattern B → A (Record<Locale> → useTranslations)
- `app/dashboard/food-cost/page.tsx`: Pattern B → A (Record<Locale> → useTranslations)

### Notes
- Audit funnel statusları CTO təsdiq: statusConverted = "Müştəri" doğrudur
- CATEGORIES array toxunulmadı (L-013)
- MOCK_AUDITS toxunulmadı
- months/monthsShort array-lar t.raw() ilə əldə edilir
- Dashboard i18n: 15/16 fayl (94%)

## [TASK-0157C-2b] roller Pattern A — 2026-05-23

### Added
- dashboardRoller namespace (53 leaf key × 4 dil = 212 tərcümə)

### Changed
- `app/dashboard/roller/page.tsx`: Pattern B → A (Record<Locale> → useTranslations)

### Notes
- Permission/səlahiyyət terminologiyası CTO təsdiq: olduğu kimi saxlandı
- Hardcoded role adları (Admin/Moderatör/Editör/İzleyici) toxunulmadı
- Discovery server/client səhvi qeyd edildi (client idi, server deyil)
- Dashboard i18n: 13/16 fayl (81%)

## [TASK-0157C-4] b2b-yonetimi Pattern A — 2026-05-22

### Added
- dashboardB2bYonetimi namespace (51 leaf key × 4 dil = 204 tərcümə)
- 4 Record obyekt miqrasiyası (əsas + typeLabels + statusLabels + modal)

### Changed
- `app/dashboard/b2b-yonetimi/page.tsx`: Pattern B → A (Record<Locale> → useTranslations)

### Terminology (CTO təsdiq)
- AZ "Sövdələşmə" / TR "Anlaşma" / RU "Сделки" / EN "Deals"
- "Franchise alan" saxlandı (DK franchise consulting brend)

### Notes
- Mock data (İstanbul HORECA Group) toxunulmadı (Devir M5)
- Discovery dərsi: 1 fayl 4 Record (L-008 genişlənməsi)
- Linter recovery: əvvəlki session çöküntüsündən bərpa
- Dashboard i18n: 12/16 fayl (75%)

## 2026-05-21 — Dashboard i18n Push (4 PR, 11/16 fayl)
- TASK-0157A: sidebar + kazan-leads + listing labels (PR #171)
- TASK-0157B: route mirrors + locale-aware links (PR #172)
- TASK-0157C-1: Pattern A pilot 4 fayl (PR #173)
- TASK-0157C-2a: Pattern A batch 4 fayl (PR #174)
- Cəmi: 245 leaf key × 4 dil = 980 tərcümə
- Launch blocker bağlandı (route mirrors)
- Qalan 5 fayl handoff edildi

## [TASK-0157C-2a] Dashboard Pattern A — C2a Batch — 2026-05-21

### Changed
- `app/dashboard/mesajlar/page.tsx`: Record<Locale> → useTranslations('dashboardMesajlar')
- `app/dashboard/pipeline/page.tsx`: Record<Locale> → useTranslations('dashboardPipeline')
- `app/dashboard/loglar/page.tsx`: Record<Locale> → useTranslations('dashboardLoglar')
- `app/dashboard/raporlar/page.tsx`: Record<Locale> → useTranslations('dashboardRaporlar')

### Added
- 4 new i18n namespaces (99 leaf keys × 4 locales = 396 translations)

### Notes
- Dashboard Pattern A progress: 11/16 files
- Mock data (İstanbul/HORECA) untouched — Devir M5 scope
- Remaining: roller (C2b), food-cost + faturalar + auditor (C3), b2b-yonetimi (C4)

## [TASK-0157C-1] Dashboard Pattern A — C1 Pilot — 2026-05-21

### Changed
- `app/dashboard/settings/page.tsx`: Record<Locale> → useTranslations('dashboardSettings')
- `app/dashboard/toolkit/page.tsx`: Record<Locale> → useTranslations('dashboardToolkit')
- `app/dashboard/site/page.tsx`: Record<Locale> → useTranslations('dashboardSite')
- `app/dashboard/trends/page.tsx`: Record<Locale> → useTranslations('dashboardTrends')

### Added
- 4 new i18n namespaces in messages/{az,tr,ru,en}.json (81 leaf keys × 4 locales)

### Notes
- Dashboard Pattern A progress: 7/16 files (3 from 0157A + 4 from C1)
- Remaining 9 files in C2/C3/C4 batches
- faturalar/[id] excluded (no Record<Locale>, separate task)

## [TASK-0157B] Dashboard locale route mirrors — 2026-05-21

### Added
- 39 re-export mirror files under `app/[locale]/dashboard/` (1 layout + 38 pages)
- All 38 dashboard pages now accessible via `/tr/dashboard/...`, `/ru/dashboard/...`, `/en/dashboard/...`

### Changed
- `app/[locale]/dashboard/ilanlar/page.tsx`: redirect → re-export (preserves locale context)
- `app/[locale]/dashboard/ilanlar/[id]/page.tsx`: redirect → re-export
- `components/dashboard/DashboardSidebar.tsx`: nav links locale-aware via `withLocale()`
- `components/dashboard/DashboardTopBar.tsx`: profile link locale-aware via `withLocale()`

### Fixed
- Language switcher → `/tr/dashboard/...` no longer 404
- Sidebar navigation preserves locale when navigating between dashboard pages
- `isActive()` detection works with locale-prefixed pathnames via `stripLocalePrefix()`

### Notes
- Middleware unchanged — `/(az|ru|en|tr)/:path*` matcher already handles locale-prefixed routes
- Auth guard preserved via layout re-export
- 4 locales × 6 pages = 24 HEAD tests PASS (307 → /auth/login)

## [TASK-0157A] Dashboard i18n Batch 1 — 2026-05-21

### Added
- `dashboardSidebar` namespace genişləndirildi (22 leaf key × 4 dil)
- `dashboardKazanLeads` namespace yaradıldı (40 leaf key × 4 dil)
- `listingDetail` namespace-ə 3 yeni label key (`labelName`, `labelPhone`, `labelEmail` × 4 dil)

### Changed
- `components/dashboard/DashboardSidebar.tsx`: Pattern B → Pattern A (`useTranslations`)
- `app/dashboard/kazan-leads/page.tsx`: Pattern B → Pattern A (`getTranslations`, server component)
- `app/dashboard/ilanlar/[id]/page.tsx`: 3 hardcoded label → `t('labelXxx')`

### Notes
- Scope: 3 fayl + 4 JSON. Qalan 13 `Record<Locale>` dashboard faylı növbəti batch-lərdə.
- AZ runtime smoke PASS (4 səhifə × 2 viewport).
- TR/RU/EN JSON key-ləri gələcəyə hazırdır, lakin TASK-0157B route mirror fix-i edilənə qədər runtime-da görünmür (dashboard locale-prefix-siz, switcher `/tr/dashboard`-a yönləndirir, route yoxdur).
- L-007 sarmaldan qaçıldı: 16 `Record<Locale>` bir PR-da migrasiya edilmədi.

### Added
- `[TASK-0108] feat(i18n): KAZAN AI page Pattern C→A — kazanAi namespace, 4 dil UI + locale-aware metadata`
- `[TASK-0106] feat(home): trust layer — DoganNote (Pattern A, ayrı komponent) + AhilikValues 3-card — 14 key × 4 dil, "Necə işləyir" sonrası, StageSelector öncəsi`
- `[TASK-0105] feat(home): platform 3-card section KAZAN+Toolkit+OCAQ (Pattern A, brand colors) — 15 key × 4 dil, Hero altı, ToolkitShowcase üstü`
- `[TASK-0142] feat(marketinq): complaint analysis tool — AI + keşf sualları + kanal-aware cavab`
- `[TASK-0103] feat(i18n): toolkit batch3 FINAL — aqta+insaat+checklist (390 key, 4 dil) — 11/11 toolkit complete`
- `[TASK-0102] feat(i18n): toolkit batch2 — food-cost+delivery-calc+menu-matrix (244 key, 4 dil)`
- `[TASK-0101] feat(i18n): toolkit batch1 — staff-retention+branding+basabas (178 key, 4 dil)`
- `[TASK-0100] feat(i18n): P&L Simulator PnlForm+PnlResult pageCopy→useTranslations (44 key, 4 dil)`
- `[TASK-0156] chore(config): marketing-tools-config.ts reorq — 4 tool doğru tier bölməsinə köçürüldü`
- `[TASK-0157] fix(i18n): dashboard sidebar + KAZAN widget + elan detay — 48 key, 4 dil, hardcoded→useTranslations`
- `[TASK-0155] fix(config): 3 slug uyğunsuzluğu düzəlişi — config slug-lar public route adlarına uyğunlaşdırıldı`
- `[TASK-0154] feat(news): pulsuz qeydiyyat-gate — blog + xəbərlər 40% scroll, i18n 4 dil, emerald UI`
- `[TASK-0153] fix(pricing): tool status truth + USTA 149→99 AZN + açılış kampaniyası (1 Sent 2026) + planned/live filter`
- `[TASK-0152] feat(pricing): Marketinq Ocagi 3 tier pricing page + config-driven tool list + WhatsApp CTA`
- `[TASK-0151] feat(marketinq): Lokasyon Analiz - franchise lokasyon KB + basabas formulu + DeepSeek fallback`
- `[TASK-0150] feat(marketinq): Trend Analiz — statik 2026 HoReCa KB + DeepSeek tətbiq tövsiyəsi + fallback`
- `[TASK-0149] feat(marketinq): Restoran Audit — 30 sual, kassa/POS, prime cost, top məhsul marjası və uyğunluq aksiyon planı`
- `[TASK-0148] feat(marketinq): sosial media metrik analizatoru — KALFA + ER benchmark + content type ranking`
- `[TASK-0147] feat(marketinq): Reklam ROI — awareness/conversion + ROAS/CAC/LTV:CAC + AZ kanal modulu`
- `[TASK-0146] feat(marketinq): Sezon Analitikası — AZ təqvimi + cash-flow + staff/inventar proqnozu`
- `[TASK-0145] feat(marketinq): müştəri persona yaradıcısı — USTA + AI + AZ/TR kontekst`
- `[TASK-0144] feat(marketinq): ROI kalkulatoru v2 — çoxlu kanal + CAC + LTV + payback`
- `[TASK-0143] feat(marketinq): P&L simulyatoru — USTA tier + what-if + AI + breakeven`
- `[TASK-0141] feat(marketinq): Menyu Analitiği — BCG matrix + AI tövsiyə + PDF export`
- **TASK-0127** [#127]: Yemək Xərci Food Cost Calculator real implementation. Marketinq Ocağına `yemek-xerci` live ŞAGİRD aləti əlavə edildi: resept kartı, çoxlu məhsul sətri, trim loss, porsiya maya dəyəri, food cost %, ideal qiymət, CSV/Excel export.
- **TASK-0124** [#123]: Quick UX wins for investor pitch. Promosyon ROI AZ terminology, Working Capital (Stok Tamponu) input + output card. Sikayet DD.MM.YYYY date display. Menyu placeholder/grid fix + BCG matrix description. Sezon Planlama new schema fields render (executiveSummary, methodology, doganRule, aeoRecommendations, risksWatchout). Brand tone polish on 3 tool titles.
- **TASK-0123** [#122]: Marketing Brain Foundation. `lib/marketing-tools/_brain/` yaradildi - Dogan Dersleri v2.0, KAHI few-shot examples, 2026 trendleri (GEO/AEO, AI Decisioning, RCS), 7 pilleli marketing modeli, BCG matrisi, AZ 2026 teqvimi (Meherrem boslugu daxil), Baki region profilleri. Sezon Planlama schema genislendi: executiveSummary, methodology, doganRule, aeoRecommendations, risksWatchout.

### Debug
- **TASK-0122** [#120]: Sezon Planlama raw DeepSeek output capture + Zod error detail. Zod validation fail statusu 502-den 422-ye kecirildi. Schema align Faza 2-de gelecek.
### Fixed
- `[TASK-0110] fix(i18n): dashboard audit log actions.member.* JSON keys nested edildi — next-intl INVALID_KEY warning aradan qalxdı`
- `[TASK-0111] fix(lint): ComplaintAnalysis localStorage history init lazy state-ə köçürüldü — react-hooks/set-state-in-effect error aradan qalxdı`
- `[TASK-0107] fix(security): b2b-panel layout auth guard — /b2b-panel/* now requires member session before rendering portal shell`
- **TASK-0125** [#124]: Marketing tools readability fix. 7 alətdə "Niyə bu vacibdir?" info box kontrastı artırıldı (blue info card), Şikayət Analitiği duplicate warning silindi, Mənbə select grid-i genişləndi və tarix üçün DD.MM.YYYY display label əlavə edildi.
- **TASK-0122** [#121]: Sezon Planlama 502/422 real root cause hell olundu. DeepSeek prompt AZ keys qaytarirdi, Zod schema EN keys gozleyirdi. Prompt-a strict English JSON structure elave edildi. PR #117, #118, #119 simptom idi; bu real key alignment fix-dir.
- **TASK-0120** [#119]: AI router streaming + 55s timeout + JSON mode qoshuldu. Sezon Planlama 502 Bad Gateway helli ucun DeepSeek streaming aktiv edildi. PR #118 schema relax geri qaytarildi. Diger marketing tool route-larina `maxDuration = 60` ve `timeout: 55000` elave edildi (regression-safe).

Bütün dəyişikliklər bu faylda qeyd olunur.
Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

## [TASK-0113] - 2026-05-11 — Sprint 4 YEKUN + Sprint 5 hazırlıq

### Sprint 4 YEKUN (7/13 live)
- ✅ TASK-0102 Marka Kompasi (SAGIRD) — PR #103
- ✅ TASK-0103 KST Yoxlayici (SAGIRD) — PR #106
- ✅ TASK-0104 Menyu Analitigi (SAGIRD) — PR #111
- ✅ TASK-0105 Sikayet Analitigi (KALFA) — PR #112
- ✅ TASK-0106 P&L Simulator refactor (KALFA) — PR #114
- ✅ TASK-0107 Promosyon ROI v2 (KALFA) — PR #110
- ✅ TASK-0109 Musteri Persona (KALFA) — PR #113
- **SAGIRD pillesi:** 3/3 ✅ tam
- **KALFA pillesi:** 4/6
- **USTA pillesi:** 0/4 (Sprint 5)
- **Sarmal hadise:** 0

### Sprint 5 TASK ID yeniden nomreleme
Kohne Sprint 5 ID-leri (TASK-0108-0114) Sprint 4 ile konflikt edirdi.
Yeni ID-ler TASK-0114-den baslayir:

| Sira | ID | Alet | Pille |
|------|----|------|-------|
| 1 | TASK-0114 | Sezon Planlama | KALFA |
| 2 | TASK-0115 | Reklam Yazicisi | KALFA |
| 3 | TASK-0116 | Sosial Medya Plan | USTA |
| 4 | TASK-0117 | Audit Robotu | USTA |
| 5 | TASK-0118 | Trend Analitigi | USTA |
| 6 | TASK-0119 | Lokasyon Secme | USTA |

## [2026-05-11] — SPRINT 4 TAMAMLANDI: 7/13 alet canli

### Sprint 4 — 5 yeni alet implement edildi (PR #110 — #114)

| # | Alet | Pille | PR | Status |
|---|------|-------|----|--------|
| 3 | Promosyon ROI v2 | KALFA | #110 | live — McDonald's modeli, SOI hesabi, AI verdict |
| 4 | Menyu Analitigi | SAGIRD | #111 | live — Menu Engineering Matrix (Stars/Plowhorses/Puzzles/Dogs) |
| 5 | Sikayet Analitigi | KALFA | #112 | live — 8 kateqoriya, sentiment, action plan, cavab sablonlari |
| 6 | Musteri Persona | KALFA | #113 | live — 2 persona + anti-persona, marketing tips |
| 7 | P&L Simulator | KALFA | #114 | live — movcud formulalar saxlandi, AI yorum elave (SAGLAM/DIQQET/KRITIK) |

### Sprint 4 toplam statistika
- **Live tools:** 2/13 → 7/13
- **Yeni API endpoints:** 5 (POST+GET her biri)
- **Yeni komponentler:** 15 fayl
- **Yeni kod:** ~3,000+ setr
- **AI provider:** DeepSeek (butun aletler)
- **DB:** marketing_tool_runs cedvelinde 5 yeni toolSlug
- **Pilleler:** 3 SAGIRD (pulsuz) + 4 KALFA (89 AZN/ay)

### Alət URL-ləri (dashboard auth lazimdir)
- `/dashboard/marketinq-ocagi` — butun aletler index
- `/dashboard/marketinq-ocagi/marka-kompasi` — Marka Kompasi (Sprint 2)
- `/dashboard/marketinq-ocagi/kst-yoxlayici` — KST Yoxlayici (Sprint 3)
- `/dashboard/marketinq-ocagi/menyu-analitigi` — Menyu Analitigi
- `/dashboard/marketinq-ocagi/promosyon-roi` — Promosyon ROI v2
- `/dashboard/marketinq-ocagi/sikayet-analitigi` — Sikayet Analitigi
- `/dashboard/marketinq-ocagi/musteri-persona` — Musteri Persona
- `/dashboard/marketinq-ocagi/pnl-simulator` — P&L Simulator

---

## [2026-05-11] — Sprint 4 Spec: Tool List 12→13, Promosyon ROI v2, Lokasyon Secme

### Spec Updates (no code changes)
- **Master tool list**: 12 → 13 aletler, yeni adlar ve kategoriyalar
  - 3 SAGIRD (pulsuz) + 6 KALFA (89 AZN) + 4 USTA (149 AZN)
  - KALFA qiymet 49 → 89 AZN (daha cox alet, daha cox deger)
- **Promosyon ROI v2**: McDonald's case study modeli
  - Baz Hafta vs Promo Hafta muqayisesi, TC tracking, SOI hesabi
  - 3-step wizard, x4 hafta extrapolasiya, AI verdict
- **Lokasyon Secme**: 13-cu alet (USTA), Heb's metodologiyasi
  - 7 restoran konsepti preset, 4-asama wizard
  - Google Maps Places API entegrasiya, A/B/C gorunurluk skoru
- **Sprint 4-5 plan**: 11 yeni alet implement schedule

## [2026-05-10] — KST Yoxlayici: 2nd Live Marketing Tool (TASK-0103)

### Added
- **KST Yoxlayici** — 30-question Quality/Service/Cleanliness self-audit (SAGIRD tier)
- Reusable `LikertScale` component (`components/marketinq-ocagi/shared/`) — memo-optimized
- `KSTQuestionnaireForm` with 3-section accordion, progress bar, useReducer state
- `KSTResultCard` with score dashboard, 3 critical issues, 30-day action plan
- API endpoint `POST+GET /api/marketing-tools/kst-yoxlayici` with zod validation

### Changed
- `kst-yoxlayici` config status: `planned` → `live`

### Notes
- DeepSeek primary AI, SAGIRD 3 runs/month, Live tools: 2/12

## [2026-05-09] — Marka Kompasi: First Live Marketing Tool (TASK-0102)

### Added
- **Marka Kompasi** — first live tool in Marketinq Ocagi (SAGIRD tier, free)
- API endpoint `POST+GET /api/marketing-tools/marka-kompasi` with zod validation
- 5-question form UI: customer time, activity, food story, competitor gap, recommend reason
- AI-generated positioning result: tagline, ICP, value prop, 3 differentiators, useThisIn
- History support: revisiting page shows last result with "Redo" option
- Real DB run logging in `marketing_tool_runs` with AI cost tracking
- Claude as primary AI provider for positioning context (DeepSeek fallback)
- Copy button on tagline for quick clipboard copy
- 4-language inline copy (AZ/EN/TR/RU) in all components
- `zod` dependency added for input/output schema validation

### Changed
- `marka-kompasi` config status: `planned` → `live` in `marketing-tools-config.ts`
- Input field names aligned with spec: `peakHours` → `customerTime`, `customerPurpose` → `customerActivity`
- Monthly run limits updated: SAGIRD 3/mo, KALFA 10/mo, USTA unlimited

### Notes
- SAGIRD tier: 3 runs/month limit enforced via marketing-gating.ts
- Sprint 1 infrastructure (ai-router, gating, config) used as designed — no infra changes needed
- Live tools: 1/12

## [2026-05-09] — Marketinq Ocagi Sprint 1: Faza 0 Infrastructure (TASK-0101)

### Added
- **Marketinq Ocagi toolkit infrastructure** — 12 AI-powered marketing tools framework
  - `lib/marketing-tools-config.ts` — single source of truth for all 12 tools (slug, tier, category, AI provider, input schema, run limits)
  - `lib/ai-router.ts` — unified DeepSeek + Claude AI gateway with automatic fallback, cost tracking per token
  - `lib/marketing-gating.ts` — SAGIRD/KALFA/USTA tier-based access control with monthly run limits
  - `marketing_tool_runs` table in DB schema with user/slug/status indexes
- **Dashboard pages** — `/dashboard/marketinq-ocagi` index (12 cards, 4 categories) + `/dashboard/marketinq-ocagi/[slug]` dynamic placeholder
- **OCAQ sidebar entry** — "Marketinq Ocagi" with Sparkles icon, 4-language copy (AZ/EN/TR/RU)
- **i18n keys** — `marketing.ocagi` + `marketing.tools.*` for all 12 tools in `messages/az.json`

### Tool Inventory (all status: planned)
| Pille | Aletler |
|-------|---------|
| SAGIRD (pulsuz) | Gorunurluk Testi, KST Yoxlayici, GBP Qurucu, Marka Kompasi |
| KALFA (49 AZN/ay) | SMM Plan AI, Caption Yazici, Promosyon ROI, Kampaniya Takvimi, Rey Cavab AI |
| USTA (149 AZN/ay) | Reqib Radari, AI Vizyual Studyo, AEO Skoru |

### Notes
- All 12 tools display "Tezlikle" badge — no tool is implemented yet
- AI router tested at build time only, real API calls in Sprint 2
- DB migration needs `drizzle-kit generate` + `drizzle-kit push` to Neon
- Sprint 2 target: Marka Kompasi full implementation

---

## [2026-05-07] — Auth Password Reset + Deployment Docs

### Fixed
- **forgot-password endpoint** — replaced in-memory mock with real Neon/Drizzle DB implementation
  - User lookup via `users` table, token stored in `passwordResetTokens`
  - Email sent via SMTP with locale-aware `passwordReset` template
  - Email enumeration protection: always returns 200
- **reset-password endpoint** — real DB token validation + bcrypt password hash update
  - Token expiry check (1 hour), used-at marking, `users.passwordHash` update

### Added
- Rate limit for reset-password: 5 requests/hour/IP (`RATE_LIMITS.authResetPassword`)
- `docs/DEPLOYMENT.md` — complete deployment guide (Hostinger, env vars, SMTP, DB, pitfalls, smoke tests)

---

## [2026-05-06] — CTO Sprint: i18n 100%, Security, Performance

### Added
- **i18n Phase 1-3 complete — 62/62 pages translated to 4 languages (AZ/RU/EN/TR)**
  - Phase 1: Auth sidebar, Header, MegaMenu (PR #82)
  - Phase 2: Public routes — blog, news, ilanlar, toolkit, pricing (PR #82)
  - Phase 3: Admin dashboard — 9 core pages (PR #89)
  - Phase 4: Full coverage — remaining 32 pages in one batch (PR #93)
- Mobile language switcher in header dropdown — Globe icon + 4 lang with active state (PR #87)
- SEO hreflang alternates for all locale routes with x-default (PR #84)
- Email templates i18n — all 9 templates (verification, welcome, password reset, listing notifications, KAZAN lead admin) now accept locale parameter (PR #86)
- Rate limiting utility (`lib/utils/rate-limit.ts`) — in-memory sliding window, IP-based (PR #91)
  - Auth endpoints: login 5/15min, register 3/1h, forgot-password 3/1h, verify-email 10/1h
  - AI endpoints: kazan-ai 30/1min, invoice-ocr 20/1h
  - 429 response with X-RateLimit-Limit/Remaining/Reset headers
  - Locale-aware error messages
- Lazy loading: CookiesBanner, AdsPreview, StageSelector via next/dynamic ssr:false (PR #92)

### Changed
- Brand color unification — 23 files converted from raw `red-500/600/700` to `dk-red`/`dk-red-strong` CSS tokens (PR #88)
- `brand-red` and `brand-red-hover` tokens added to @theme inline block in globals.css
- xlsx dynamic import in export-utils.ts and excel-parser.ts — no longer loaded at module init (PR #92)
- News API refactored from mock data to real Neon DB (PR #85)
- Mobile design pass — CategoryTabs scroll-snap, article reading ergonomics (PR #83)

### Fixed
- Console.log cleanup — 25+ debug logs deleted, 4 security-sensitive logs removed (token/password/reset-URL leaks), NODE_ENV guard on error logs (PR #90)

### Security
- Security sprint merged (PR #79): demo credentials removed, JWT enforcement, admin guards, password validation
- Rate limiting on all auth + AI endpoints prevents brute force attacks
- Sensitive console.log calls exposing tokens/passwords removed from production

### Removed
- Stale PRs closed: #45 (Resend email — superseded by Hostinger SMTP), #51 (Hostinger migration — completed separately)

## [Unreleased]

### Debug
### Added
- Russian (`ru`) locale infrastructure, DeepSeek-backed `scripts/translate-ru.mjs`, generated `messages/ru.json`, and a `/ru` Playwright smoke test.

### Changed
- Header/footer locale switcher, locale routing, sitemap alternates, homepage copy, and founder note / B2B sections now recognize `AZ + RU + EN + TR`.

### Added
- TASK-0012: n8n RSS workflow template — `docs/n8n-rss-workflow.json` for scheduled fetch + translate
- TASK-0012: n8n setup guide — `docs/n8n-setup.md` with import, env vars, test, troubleshooting

### Changed
- TASK-0012: new `/api/news/fetch` and `/api/news/translate` endpoints with 60s rate limiting and `Authorization: Bearer <NEWS_API_SECRET>` auth

### Added
- Devir listing-ə 3 yeni field: icarə müddəti (ay), aylıq xalis mənfəət, mülkiyyət tipi — BizBuySell/BusinessesForSale benchmark əsasında.
- Franchise-vermek kateqoriyasına minimum sahə tələbi field-ı.
- Obyekt icarəsi kateqoriyasına icarə müddəti field-ı.
- Input placeholder dəstəyi əlavə sahələr addımında.

### Fixed
- Locale admin leads route now resolves correctly by redirecting `/[locale]/admin/leads` to the existing real DB-backed `/dashboard/kazan-leads` screen instead of returning 404.

### Added
- DK Agency HoReCa sales sprint added to the operating record: 20 Baku target accounts were grouped across restaurant chains, hotel+restaurant properties, cafes/brunch venues and premium/fine-dining restaurants.
- First outreach pack prepared for 10 April 2026 with short Instagram/Web DM scripts for the first 10 targets, plus response handling for demo requests, pricing questions, existing-system objections and opt-outs.
- AEO mini-audit offer added as the primary low-friction entry point for premium restaurants such as Meatadore and Firuze.
- Almila production readiness was documented for sales use: DeepSeek direct model path, lead capture, WhatsApp deep link, objection handling and employer mode are ready for live demos.

### Changed
- Cold outreach wording was softened for first contact: removed early pricing, hard chatbot claims and aggressive enterprise comparisons from the initial DM flow.
- Hotel pitch reframed from Booking.com commission pressure to direct reservation lift and faster guest-response handling.
- Restaurant pitch reframed around WhatsApp/Instagram response capture, menu questions, reservations and lost lead prevention.

### Fixed
- Almila OpenClaw prompt conflict was resolved by updating the workspace-level `SOUL.md`, which was still carrying the old short `wa.me/994517696181` CTA format.
- WhatsApp CTA now uses the full `https://wa.me/...?...text=...` deep link format in the live Almila flow.
- OpenRouter `402` dependency risk was removed from the active Almila path by confirming `deepseek/deepseek-chat` as the direct model route.
- First greeting behavior was corrected so Almila no longer asks for name/phone immediately on a simple greeting.

### Operational Notes
- Gemma 4 VPS inference was parked because the current VPS is CPU-only with limited RAM and is not suitable for production-speed local inference.
- Almila v3.2 is accepted as production-ready for demos; remaining inconsistent name echoing is tracked as a non-blocking model behavior.
- Today’s outreach target is 10 DMs: 5 restaurant targets first, then 5 hotel targets after a short interval.

### Fixed
- Public `/haberler` hero now prefers translated editor picks only and falls back safely when an editor pick is not publishable.
- Admin news approve API now blocks approving articles that do not have Azerbaijani title/summary content.
- News cards now use category-based gradient placeholders instead of generic dark image fallbacks.
- Public news heading copy now uses final `Sektor Nəbzi` wording instead of pipeline/developer phrasing.
- News detail pages now use the simplified article-first layout with a single source CTA and share block.
- Locale news detail route now points at the same redesigned article page.
- Untranslated `editor pick` flags were cleared in the database so public hero selection cannot surface untranslated articles.
- Blog route can now safely render legacy `picsum.photos` cover images because the host was added to the image allowlist.
- Footer resource links were cleaned up to remove duplicate and unclear labels such as `HAP Bilgilər` and `DK Digest`.

## [0.8.0] - 2026-04-05 - Phase 4: RSS News Pipeline

### Added
- POST /api/news/fetch - real RSS fetch (rss-parser, 6 HoReCa source)
- POST /api/news/translate - DeepSeek EN->AZ translate
- lib/news/rss-pipeline.ts - fetch+translate pipeline
- Public /haberler real DB-dən (mock əvəzinə)
- /haberler/[slug] detail page (titleAz, summaryAz, source link)
- Editor Pick hero card
- Category tab filter
- NEWS_API_SECRET security (admin session || API key)
- docs/ENV-SETUP.md

## [0.7.0] - 2026-04-05 - Phase 2: Admin OCAQ Real DB CRUD

### Changed
- Dashboard stats: mock -> real COUNT queries
- /dashboard/ilanlar: mock list -> real DB query + filter + pagination
- /dashboard/ilanlar/[id]: mock detail -> real DB + status update + review insert
- /dashboard/xeberler: mock -> real news_articles DB query
- /dashboard/xeberler/rss: real news_sources toggle
- /dashboard/ayarlar: real site_settings read/write

### Added
- lib/repositories/listingRepository.ts
- lib/repositories/newsRepository.ts
- lib/repositories/settingsRepository.ts
- API: /api/listings (admin query), /api/listings/[id]/reviews
- API: /api/news/admin, /api/news/admin/[id], /api/news/sources/[id]
- API: /api/settings
- /dashboard/blog/yeni alias route

### Planned
- Phase 2: Admin OCAQ real DB CRUD
- Phase 3: Resend email + Cloudinary media env activation
- Phase 4: RSS news pipeline
- Phase 5: KAZAN AI production upgrade

### Added
- `CLAUDE-DESIGN.md` repo kökünə əlavə olundu
- `CHANGELOG.md` repo kökünə əlavə olundu

### Changed
- `KAZAN AI` provider chain `DeepSeek -> Anthropic -> static` olaraq düzəldi
- Chat UI üçün 3 saniyə client throttle, `KAZAN düşünür...` loading state və nümunə sual düzəlişi edildi

## [0.6.0] - 2026-04-04 - Phase 0: CTO Architecture Setup

### Added
- `CLAUDE-DESIGN.md` foundation sənədi
- `CHANGELOG.md` tarix faylı
- Phase 0-5 arxitektura planı
- quality gate qaydaları

## [0.5.0] - 2026-04-03 - PR#12: Blog DB Migration

### Changed
- Blog yazıları Neon PostgreSQL-ə migrate olundu
- Repository pattern və fallback saxlanıldı
- Blog admin axını real DB ilə işləməyə başladı

## [0.4.0] - 2026-04-02 - PR#11: Real Database Connection

### Added
- Neon PostgreSQL real bağlantı
- Drizzle ORM schema push
- Seed data: listings, users, news sources
- Custom member auth üçün bcrypt hash

### Security
- Admin seed password production-da dəyişməlidir

## [0.9.3] - 2026-04-12 - Mobile Triage Addendum

### Fixed
- `NewsPreview` mobil kart spacing, button width və type scale düzəldi
- `app/[locale]/page.tsx` daxilində blog və B2B section spacing mobil üçün rahatlaşdırıldı
- `FloatingKazanWidget` mobil ölçü və alt-sağ yerləşimi content overlap riskini azaltdı

### Notes
- PR#36 üzərinə mobile triage əlavə edildi

## [0.3.0] - 2026-03-30 - PR#9: Mega Sprint

### Added
- `/ilanlar` vitrini və modal axını
- `/ilan-ver` multi-step form
- `listingFieldConfig.ts` single source of truth
- Admin OCAQ panel shell
- Auth flow-ları: register, login, forgot/reset/change password, verify
- `imageUtils.ts` və media degrade axını
- Email template-lər
- Status workflow

### Important
- Admin CRUD bu mərhələdə hələ tam real DB CRUD deyil

## [0.2.0] - 2026-03-29 - PR#5/#6/#7: Infrastructure Fixes

### Fixed
- i18n routing və middleware axını
- Toolkit route normalization
- Register/Login input görünüşü
- ESLint səhvləri

### Changed
- Mega menu trigger dili
- KAZAN AI badge `BETA` oldu
- Header panel linkləri düzəldi

## [0.1.0] - 2026-03-27 - İlkin Launch

### Added
- Blog və toolkit səhifələri
- KAZAN AI teaser page və API route
- `KazanAiChatClient.tsx`
- `knowledge-base.ts` və `system-prompt.ts`
- i18n scaffold
- Drizzle schema
- RSS source xəritəsi
- Homepage section-ları
- Header, Footer, MegaMenu

## [2026-05-09] - TASK-0102 Contact Lead Funnel

### Added
- Contact page lead funnel with KAZAN AI, WhatsApp, and Telegram channel cards.
- `POST /api/leads/track` records contact CTA clicks in `leads` with `source`, `channel`, `locale`, `user_agent`, and `ip_hash`.
- `leads` table mapping and `idx_leads_source_channel` migration.
- 4-language `contact.funnel` namespace in `messages/*.json`.
- Playwright checks for 4 locales and WhatsApp tracking payload.

### Changed
- Removed the visible phone card from contact page. WhatsApp remains available through a localized prefilled redirect.

## [2026-05-09] - TASK-0100 P&L Simulator i18n

### Changed
- P&L Simulator now fully uses i18n across AZ/RU/EN/TR with `Intl.NumberFormat` currency and percent output.
