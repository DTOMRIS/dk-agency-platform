# Changelog - DK Agency Platform

## [Unreleased]

- `TASK-0424` fix(ui): mobile menu top-level Blog link; 40% paywall disabled (everyone reads full blog+news, PAYWALL_ENABLED flag); MansetVitrin carousel counter no longer wraps on mobile.
- `TASK-0423` fix(blog): mobile horizontal overflow — blog article bodies scrolled sideways on phones; added overflow-wrap/word-break to .blog-content + break-words on p/a renderers. body overflow-x-hidden was only masking it (leaks on iOS Safari). 4-line diff.
- `TASK-0422` fix(blog): all blog detail pages crashed ("xəta baş verdi") because getSlugRedirect (slug_redirects) and the guru_boxes query lacked try/catch — a missing table (unrun migration) threw and crashed every post's detail page. Both wrapped defensively (ads-repo "never throw" pattern); operator applies migrations 0015/0016 on prod to restore redirects/boxes.
- `TASK-0421` fix(auth): registered members were invisible in admin panel (admin reads member_profiles, register only wrote users). Register now also creates a member_profiles row (onConflictDoNothing, non-blocking); confirm syncs member_profiles.email_verified. One-time Neon backfill SQL in task card for existing users. No schema change.
- `TASK-0420` fix(onboarding): modal mobile polish — responsive padding, ≥44px tap targets (min-h-11), WCAG contrast bumps on OnboardingModal; className-only, no design/logic change; selected-first reorder deliberately skipped.
- `TASK-0419` fix(onboarding): onboarding dead-end → in-modal Step 2 result screen; removed 5 route-less tool slugs from `PRIORITY_TOOL_MAP` (fixed live 404s in RecommendationWidget + nudge); recovered Complaint Analysis tool via `getToolRoute()` resolver (PROTECTED config untouched); gap priority coming-soon + notify card; 4-language `onboarding.result.*`.

## [TASK-0418] feat(ui): UX navigation restructuring, homepage streamlining & mobile bottom nav - 2026-06-28

### Added
- Added `MobileBottomNav` component providing an app-like bottom navigation bar on mobile viewports (`<lg`) with direct links to Home, Tools, KAZAN AI, Listings, and Profile.
- Added `DeviceLanguageDetector` client component to automatically detect browser/phone language (`az`, `tr`, `ru`, `en`) on first visit and direct users to their native locale.
- Added `DoganNote` (Kurucu Məktubu) and `AhilikValues` sections to the `/haqqimizda` (About Us) page.

### Changed
- Streamlined top navigation header (`Header.tsx`) into 4 macro hubs: Alətlər & Həllər ▾, İlanlar, Resurslar ▾ (Blog + News), and Haqqımızda.
- Dynamically hidden "İdarə Paneli" from top header for anonymous guest visitors.
- Removed `DoganNote` and `AhilikValues` from homepage (`page.tsx`) to focus on conversion and action, and improved section background visual rhythm.

### Fixed
- Raised muted `text-slate-400/300` labels on light backgrounds to `text-slate-600` across 19 tool files + the shared `LikertScale` (unselected star `slate-300→400`, question badge `slate-400→500`). Verified per-occurrence to skip dark surfaces (DK-advice cards, process boxes), icon-only lucide buttons, and `slate-500`+ which already passes AA.
- 88 lines, all pure 1:1 contrast-class swaps (no logic/number changes); build + lint pass.

## [TASK-0412] fix(toolkit): locale thousand separators in 4 more financial tools - 2026-06-19

### Fixed
- Applied the basabas number-format pass to the remaining tools flagged by a 3-agent audit: delivery-calc (monthly net), menu-matrix (avg sales), yemek-xerci (central `money()` helper → covers whole tool), menyu-analitigi (monthly profit). Locale-aware separators + finite guards; percentages untouched.
- Audit also surfaced ~16 contrast spots (LikertScale `text-slate-300`, muted stat labels) — tracked for a separate focused WCAG sweep, not in this PR.

## [TASK-0411] fix(finance): basabas number format + EBITDA band + runway - 2026-06-19

### Fixed
- All manat figures now render with locale-aware thousand separators via a `fmt0` helper (az `239.804`, ru `239 804`, en `239,804`, tr `239.804`) — 24 sites across the page and the downloadable HTML report; percentages untouched.
- EBITDA benchmark green band capped at 30, so a healthy ~49% margin fell through to `red` ("Zəif"). Raised green `max` 30→1000 → high margins now show green/"Güclü".
- `runwayMonths` could display negative months when budget < opening investment; floored at 0 to match `cashRunwayMonths`.

### Verification
- 0 TS / 0 lint errors; deterministic band + format checks pass; mobile layout (studio `lg:grid-cols`, input `sm:` grids) stacks without overflow.

## [TASK-0409] feat(finance): branch-opening financial engine on basabas - 2026-06-18

### Added
- New deterministic branch-opening engine layered onto the existing `/toolkit/basabas` tool (no parallel route): CAPEX build-up, Azerbaijan tax constants (simplified 8/4%, profit 20%, lease 14%, social 24.5%), ramp-up loss, working capital, funding gap, runway, payback, three scenarios (base/conservative/optimistic), and benchmark flags.
- Six format presets (fastFood/coffee/bar/cafe/lounge/fineDining) and four-language labels with full key parity.

### Fixed
- Profit tax was applied to revenue instead of profit (`netProfit` and both scenarios) — corrected to `max(0, EBITDA) × 20%`, which restores finite payback in thin-margin cases.
- EBITDA benchmark compared an absolute manat value against a percentage band (always flagged red) — now uses EBITDA margin %.
- `taxBurden` double-counted simplified turnover tax and general profit tax — now a single regime: profit tax + lease tax + social contribution.

### Verification
- New files: 0 TS errors, 0 lint errors; i18n key parity intact; deterministic numeric replay confirms sane figures. Route smoke deferred to the commit step (needs dev server).

## [TASK-0406] feat(finance): cross-sector viability and working-capital report - 2026-06-13

### Added
- Extended the existing `/toolkit/basabas` tool for cafe, restaurant, hotel, retail, and service planning without creating a parallel UI.
- Added deterministic budget, break-even, daily demand, working-capital, funding-gap, runway, payback, verdict, and sensitivity calculations.
- Added a downloadable mobile single-file HTML report and four-language labels.
- Reused the existing toolkit insight action with a grounded cross-sector financial prompt; all report numbers remain deterministic.

### Verification
- Production build, focused lint, and deterministic cafe/hotel/service smoke checks passed.
- Mobile E2E coverage was added; its final rerun after accessibility label fixes was deferred to avoid another heavy local browser run.

## [TASK-0319] fix(news): detail + listing UX — 4 fixes - 2026-06-13

### Fixed
- **Summary raw markdown**: `### Nə baş verdi` was shown as plain text in detail page summary. Added `stripMarkdown()` to clean summary display.
- **Synthesis headings**: Updated DeepSeek prompt to write flowing paragraphs instead of markdown headings (`###`). Existing articles cleaned via stripMarkdown at render time.
- **Empty related sidebar**: Related articles now include `translated` + `approved` status, filling the sidebar even when few articles are approved.
- **Slider missing on page 2+**: Vitrin slider (MansetVitrin) now shows on all pages via dedicated `getVitrinNewsArticles()` query instead of slicing from page results.

## [TASK-0305] fix(news): make detail query compatible with pending DB migration - 2026-06-12

### Fixed
- Public `/haberler/[slug]` pages no longer fail when production Neon lacks `related_toolkits` and `related_blog_slug`.
- The detail query now reads optional fields through `to_jsonb(news_articles)`, returning empty/null before migration and real values after migration.
- Added idempotent migration `drizzle/0017_add_news_related_columns.sql`.
- Added `/favicon.ico` redirect to the existing `/icon.png` asset.

### Root Cause Proof
- Live news list returned `200` while multiple live detail routes returned `500`.
- Production-shaped Neon schema inspection showed both optional columns were absent.
- The corrected repository query successfully loaded the affected Subway article and returned `relatedToolkits: []` against the same schema.
- Production build and DK validator both pass; validator verdict is 8/8.

## [TASK-0304] feat(news): shared full-page editor for existing articles - 2026-06-12

### Changed
- Replaced the incomplete news-list edit modal with `/dashboard/xeberler/[id]` and its locale mirror.
- Reused `NewsEditorForm` for create and edit; existing articles load all four locales, SEO, source, date, status flags, type, and cover data into the same editor.
- Added PATCH round-trip support for slug, publication date, source fields, news type, Telegram flag, and logo overlay.
- Added cover image add/replace/remove and article delete actions to the edit page.
- Applied the same admin-plan guard to the server-rendered edit page as the news admin API.
- Preserved manual-news source markers when an editor saves an empty visible source field.

### Verification
- `npm run lint`: PASS with pre-existing warnings only.
- Production build: PASS; root and locale `/dashboard/xeberler/[id]` routes registered.
- Local production smoke: root edit route `307` to login, locale route `307` to root mirror, and unauthenticated admin GET/PATCH/DELETE all `403`.
- DK validator: PASS 8/8 via Git Bash.

## [TASK-0257] fix(blog): robust slug lookup and capital 'İ' slugification fix (P0 404) — 2026-06-10

### Fixed
- Fixed 404 error on franchise blog details page by implementing robust slug queries in `lib/db/blog-repository.ts` (`getBlogPostDetail`, `getBlogPostRaw`, `updateBlogPostInDb`, `archiveBlogPostInDb`, `translateBlogPostBySlug`). If a query is made for either the canonical or legacy/un-slugified slug (such as with spaces/colons), the repository checks all variants and returns the correct post.
- Fixed the capital letter 'İ' lowercasing issue in `slugify` (in `BlogEditorForm.tsx`, `NewsEditorForm.tsx`, `rss-pipeline.ts`, and `fetch-news.mjs`) where "Süni İntellekt" was converted to "suni-i-ntellekt" (due to Combining Dot U+0307 above) instead of "suni-intellekt". The function now replaces `İ`/`I`/`ı` with `i` and strips U+0307 before lowercasing.
- Fixed potential undefined locale crash in `app/[locale]/blog/[slug]/page.tsx` (`generateMetadata` and `BlogDetailPage`) on prefix-less root routes.

## [TASK-0206] fix(marketinq): root mirrors for default-locale tool routes (P0 404) — 2026-06-07

### Fixed
- Bütün 11 Marketinq Aləti detal səhifəsi default-locale (az, prefix-siz) URL-də 404 verirdi (`/marketinq/menyu-analitik` və s.) — yalnız `/az/...` işləyirdi. Səbəb: `app/[locale]/marketinq/<slug>/` var idi, amma root mirror (`app/marketinq/<slug>/`) yox idi (L-038).
- 11 root mirror əlavə olundu (`app/marketinq/<slug>/page.tsx` → `@/app/[locale]/marketinq/<slug>/page` re-export): lokasyon-analiz, menyu-analitik, musteri-persona, pl-simulyatoru, reklam-roi, restoran-audit, roi-kalkulator, sezon-analitikasi, sikayat-analizi, sosial-metrik, trend-analiz.
- Doğrulama: prefix-siz route-lar artıq 307 (auth redirect) verir, 404 yox; naməlum slug hələ 404.

### Note
- Giriş etmiş üzv tool-a çatacaq; tier kifayət etmirsə "KALFA upgrade" paneli görünür (gating — ayrı məsələ, 404 deyil).

## [TASK-0205] content(blog): add blog-026, blog-027 and blog-028 — 2026-06-07

### Added
- Blog-026: "Servis Haqqı: Kimin Pulu və Necə Paylanmalıdır?" (`/blog/servis-haqqi-kimin-pulu-nece-paylanmalidir`) and cover image `/images/blog-26.png`.
- Blog-027: "Orta Çeki Necə Böyüdürsən? Satma — Sual Ver, Ehtiyacı Tap" (`/blog/orta-cek-acik-suallar-ehtiyac`) and cover image `/images/blog-27.png`.
- Blog-028: "Müştəri Həmişə Haqlıdır? Şikayət — Sistem Diaqnostikasıdır" (`/blog/musteri-her-zaman-haqli-sikayet`) and cover image `/images/blog-28.png`.

## [TASK-0231] feat(toolkit): Mətbəx İstasyon Kalkulyatoru (QSR / Fast Food) — 2026-06-06

### Added
- `/toolkit/metbex-istasyon` — menyu SKU sayına görə istasyon sayı + kadrolar (fast food, QSR burger/pizza, dark kitchen, catering)
- Calc engine (client-side): SKU→istasyon (2/3/4/6), fiş+kanal bazlı baza/peak/axşam kadro, shift leader (200+ fiş), istasyon xəritəsi (isti/soyuq), əmək faizi — QSROnline/araşdırma formulları
- `components/marketinq-ocagi/metbex-istasyon/MetbexIstasyonPage.tsx` + root mirror + locale wrapper
- i18n `toolkit.metbexIstasyon` (AZ/RU/EN/TR), 13 istasyon ad açarı daxil
- AI insight: `getToolkitInsight`-a `metbex-istasyon` prompt (yeni API route YOX — L-009)

### Note
- Slug Doğan tərəfindən `lib/marketing-tools-config.ts`-ə əl ilə əlavə olunacak (PROTECTED).
- Əmək faizi spec sabitlərindən (380 AZN, cek, 26 gün) hesablanır; product-owner kalibrasiyası ilə dəqiqləşdirilə bilər.

## [TASK-0230] feat(toolkit): Personel Planlayıcısı (Restoran + Kafe) — 2026-06-06

### Added
- `/toolkit/personel-planlayici` — vardiya bazında optimal personel hesablayıcısı (restoran casual/fine, kafe, bar)
- Calc engine (client-side): açılış/peak/axşam briqadası, əmək maliyyəti + faiz (status: ideal/diqqət/kritik), skeleton minimum — Cornell/Shifty benchmark formulları
- `components/marketinq-ocagi/personel-planlayici/PersonelPlanlayiciPage.tsx` + root mirror (`app/toolkit/...`) + locale wrapper (`app/[locale]/toolkit/...`, metadata)
- i18n `toolkit.personelPlanlayici` namespace (AZ/RU/EN/TR)
- AI insight: mövcud `getToolkitInsight` server action-a `personel-planlayici` prompt əlavə olundu (yeni API route YOX — L-009, DRY)

### Note
- `lib/marketing-tools-config.ts`-ə slug Doğan tərəfindən əl ilə əlavə olunacaq (PROTECTED, toxunulmadı).

## [TASK-0204] content(blog): unsourced statistics softened + 2 real sources — 2026-06-06

### Changed
- Blog atıf auditi (`scripts/blog-citation-audit.ts` + `docs/BLOG-CITATION-AUDIT.md`) əlavə olundu — iddia→mənbə tiered tarama.
- 6 mənbəsiz real-dünya statistikası müşahidə dilinə yumşaldıldı (food-cost, başabaş, kurumsal, delivery yazıları) — uydurma rəqəm/iddia çıxarıldı.
- 2 yoxlanıla bilən iddiaya real mənbə əlavə olundu: food cost sənaye standartı (28-35%); restoran işçi dönüşümü (ABŞ Milli Restoran Assosiasiyası / NRA).
- Sitatlar (Roger Fields, Danny Meyer, David Scott Peters) və DK Agency Notu anekdotları atributlu olduğu üçün toxunulmadı.

### Note
- Dəyişən 4 yazı production DB-yə sync olunmalıdır: `npx tsx scripts/sync-static-blog-article.ts <slug>` (1-porsiya-food-cost-hesablama, isci-saxlama-7-strategiya, kurumsal-kitabca-emeliyyat, wolt-bolt-komissiyon).

## [TASK-0109] feat(ai): KAZAN AI system prompt locale-aware response — 2026-06-06

### Added
- Localized the KAZAN AI system prompt in [system-prompt.ts](file:///C:/codelar/dk-agency-platform/lib/kazan-ai/system-prompt.ts) to adapt dynamically for AZ, TR, RU, and EN locales.
- Added dynamic route prefixing for markdown links generated by KAZAN AI based on user locale.
- Localized the Ahilik quote suffix (Əhilik / Ahilik / Ахилик) based on user locale in the KAZAN AI route.

## [TASK-0203] fix(ai): readiness report truncation — raise token ceiling — 2026-06-06

### Fixed
- `/api/franchise/readiness-report` AI hesabatı yarıda kəsilirdi (AZ 3-bölməli mətn `max_tokens: 1200`-ə sığmırdı). DeepSeek `max_tokens` 1200→3000, Gemini fallback `maxOutputTokens` 800→3000 qaldırıldı.
- `export const maxDuration = 60` əlavə olundu (uzun generasiyada vaxt aşımı/erkən kəsilmənin qarşısını alır).
- Bu endpoint 4 quiz tool-unu idarə edir (Otel, OTA, Franchise Readiness, Buyer Checklist) — hamısı düzəlir.

## [TASK-0200] fix(blog): cover images 404 & slug synchronization — 2026-06-06

### Fixed
- Fixed a bug where relative image paths from the database (e.g. `images/blog-13.png`) resolved to `/blog/images/blog-13.png` (404) on the blog detail page. Added a leading slash fallback inside `resolveLocalCover`.
- Synchronized static blog slug `isleyen-franchise-təhvil almaq` with database slug `isleyen-franchise-devralmaq` to resolve matching problems and support correct local cover image resolving.

## [TASK-0202] feat(toolkit): add Hospitality/OTA section to /toolkit — 2026-06-06

### Added
- `/toolkit` index 3-cü bölmə: **Qonaqlama / Otel & Pansiyon (OTA)** — mövcud `ToolGrid` ilə, 4 dildə (AZ/TR/EN/RU)
- 4 tool listələndi (route-lar əvvəldən mövcud idi, sadəcə index-ə əlavə olunmamışdı): `ota-hazirlig-testi`, `otel-hazirlig-testi`, `qonaq-evi-roi-kalkulyatoru`, `whatsapp-template-paketi`

### Fixed
- Bu tool-lar yalnız `/sektor/*` səhifələrindən əlçatan idi; indi `/toolkit` index-ində də görünür.

## [TASK-0201] fix(home): complete join CTA title + drop "Agentlik"/"agency" wording — 2026-06-06

### Fixed
- `CTASections` join CTA başlığı yarımçıq idi (feil yox) və qadağan "Agentlik"/"agency" sözündən istifadə edirdi. 4 dildə tam, qadağan-sözsüz başlığa yenidən yazıldı:
  - AZ: `Biznesinizi növbəti səviyyəyə daşıyın`
  - TR: `İşinizi bir üst seviyeye taşıyın`
  - RU: `Выведите бизнес на следующий уровень`
  - EN: `Take your business to the next level`

## [TASK-F28] feat(sektor): config-driven dynamic slug route — 2026-06-06

### Added
- `lib/data/sektorConfigs/` SSOT — `getSektorConfig(slug)`, `VALID_SEKTOR_SLUGS`, builder + per-sektor configs (qonaqEvi, otel, restoran, kafe)
- Dynamic route `app/[locale]/sektor/[slug]/` — single config-driven page + slug-aware `opengraph-image` + localized `not-found`
- `app/[locale]/sektor/page.tsx` — sektor index (cards for all active sektors)
- `components/sektor/SektorLanding.tsx` — client landing rendering the 7 sektor sections from a config
- i18n namespaces `sektorOtel`, `sektorRestoran`, `sektorKafe` (+ `sektorNotFound`, `sektorIndex`) in 4 locales (AZ/EN/RU/TR)
- `e2e/sektor-config.test.ts` — integrity test (tool hrefs → real toolkit routes, blog slugs exist, unknown slug → null)

### Changed
- `/sektor/qonaq-evi` now served by the dynamic `[slug]` route (data moved into config); URL unchanged

### Removed
- Static `app/[locale]/sektor/qonaq-evi/` and `app/sektor/qonaq-evi/` routes (superseded by the dynamic route)

### Added (root mirror — default-locale fix)
- `app/sektor/page.tsx` + `app/sektor/[slug]/{page,opengraph-image,not-found}.tsx` — locale-less root mirrors so the default locale (az) is served without a prefix (matches the `app/blog/` pattern). Deleting the old root route had broken `/sektor/*` for az.
- `[locale]/sektor` pages now resolve locale via `getLocale()` instead of `params.locale`, so they work under both the `[locale]` route and the root mirror.

### Notes
- Stats sourced from State Statistics Committee (otel/restoran) and WTTC 2025 (kafe) — provided by product owner
- Tool CTAs use real toolkit routes (food-cost, pnl, basabas, delivery-calc), not the spec's illustrative slugs which would 404 (L-001)
- `generateStaticParams` intentionally omitted to match the codebase's dynamic `[locale]` rendering (blog/[slug] pattern)
- **Verified in production** (`next build` + `next start`): `/sektor/{qonaq-evi,otel,restoran,kafe}` (az) → 200, `/sektor/bilinmeyen` → 404 (SektorNotFound), `/az/sektor/otel` → 307, `/sektor` → 200, `/en/sektor/otel` → 200, `/sektor/otel/opengraph-image` → 200. Integrity test PASS, lint + TS clean. Build needs `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` (Google Fonts TLS). See L-038.

## [TASK-0200] content(blog): Peşə Məktəbi yazısını genişləndir — 2026-06-06

### Changed
- `pese-mektebi-olke-meselesi` yazısı Koç modeli, TQTA, TİKA, CTH və milli kadr platforması təklifi ilə 1.778 sözə genişləndirildi.
- İki faydalı məlumat qutusu və xüsusi Doğan Notu bloku renderer konvensiyasına uyğunlaşdırıldı.
- Mənbəsi dəqiqləşdirilməyən `290.000` və ILO iddiaları bu yazıdan çıxarıldı; Koç və CTH rəsmi məlumatları əsas götürüldü.

### Added
- Tək bir statik blog yazısını slug üzrə production DB-yə təhlükəsiz sync edən `scripts/sync-static-blog-article.ts` əlavə edildi.

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
