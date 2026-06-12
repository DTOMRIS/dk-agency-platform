# DEVLOG — DK Agency Platform


## 2026-06-12 — TASK-0307: feat(listings): admin listing create

**Why:** Listing motor fully built (CRUD, moderation, AI, schema) but admin had no way to create listings from dashboard — only members could via `/b2b-panel/yeni-ilan`.

**What:**
- `app/dashboard/ilanlar/yarat/page.tsx`: new admin create route
- `app/dashboard/ilanlar/page.tsx`: "Yeni elan yarat" button added
- `components/listings/CreateListingForm.tsx`: `isAdmin` prop — direct status selection (submitted/committee_review/showcase_ready), isFeatured/isShowcase toggles, internal admin note, YouTube/Instagram video embed (ID-only regex, safe iframe), bulk image delete with checkbox
- `app/api/listings/route.ts`: accepts admin fields (initialStatus, isShowcase, isFeatured)
- No schema/migration changes

## 2026-06-12 — TASK-0308: fix(email): HTML injection + delivery logging + newsletter

**Why:** CTO audit found user-supplied values (leadName, message, reason, title) injected raw into email HTML — production injection vulnerability. Also 14 email send failures silently swallowed.

**What:**
- `lib/email/templates.ts`: 5 template functions now use `escapeEmailHtml()` for all user input. `sendEmail()` auto-logs to `email_logs` table.
- 8 API route files: `.catch(() => {})` → `.catch((err) => console.error('[email] ...', err))`
- `lib/db/schema.ts` + `drizzle/0017_add_email_logs.sql`: new `email_logs` table (queued/sent/failed)
- `components/layout/Footer.tsx`: newsletter form → `POST /api/newsletter/subscribe`

**Action required:** Migration 0017 already run on Neon.

## 2026-06-12 — TASK-0306: fix(listings): remove mock fallback from public ilanlar

**Why:** DB hiccup during production would show 10 fake listings to real users. Mock fallback removed from public pages; clean empty state instead.

**What:**
- `lib/db/listings-repository.ts`: `getListings()` returns `[]`, `getListingBySlug/ById()` returns `null` when `!db`
- `components/listings/ListingsShowcasePage.tsx`: initial state `[]`, catch fallback `[]`

## 2026-06-10 — TASK-0251: fix(blog): guru box header locale-aware

**Why:** Guru box header "MİCHAEL H. SEİD YANAŞMASI" was hardcoded AZ in all locales because `guruName` was a single column with no locale variants. EN/RU/TR users saw AZ guru name.

**What:**
- `lib/db/schema.ts`: added `guru_name_ru/en/tr` columns to `guru_boxes` table
- `lib/db/blog-repository.ts`: `mapDbArticle` now uses `localizedField(boxR, 'guruName', locale)` with AZ fallback. `autoTranslateBlogPost` now translates guru names alongside quotes.
- `drizzle/0015_add_guru_name_locale_columns.sql`: idempotent migration

**Action required:** Run migration 0015 on Neon, then press "Tərcümə et" on affected blog posts.

## 2026-06-10 — TASK-0249: fix(blog): self-healing title/field translation

**Why:** Admin reported RU blog pages where the body translated but the title stayed in Azerbaijani. The editor confirmed `title_ru` in the DB held the AZ title (an untranslated copy), and `autoTranslateBlogPost` only filled EMPTY targets — so a non-empty-but-AZ field was skipped forever.

**What:**
- `lib/db/blog-repository.ts`: added `needsTranslation(target, azSource)` — true when the target is empty OR equals the AZ source. `autoTranslateBlogPost` now uses it for title/summary/content/doganNote and guru quotes, so polluted "copy of AZ" fields get re-translated on the next run. Genuine manual translations (different from AZ) are still never overwritten.

**Verification:** `npx tsc --noEmit` → 0 errors in changed file; `npx eslint` → 0 errors.

**Note:** this is on the feature branch with TASK-0242…0248, which are NOT yet on `main` (live deploy is still at TASK-0240). None of these fixes take effect until the branch is merged and Hostinger redeploys.

## 2026-06-10 — TASK-0248: fix(blog): translate Doğan Notu + guru quotes; structure-preserving prompt

**Why:** Admin reported RU blog pages where the title, Doğan Notu and guru quotes were untranslated, and section numbering appeared in RU but not AZ. Root cause: `autoTranslateBlogPost` only translated `title/summary/content`. Doğan Notu and guru-box quotes were never sent to the translator, and `dogan_note` was a single AZ-only column with no place to store a translation.

**What:**
- `lib/db/schema.ts` + `drizzle/0014_add_dogan_note_locale_columns.sql`: added `dogan_note_ru/en/tr` columns (migration is idempotent, `IF NOT EXISTS`, must be run manually on Neon).
- `lib/db/blog-repository.ts`: `mapDbArticle` now returns locale-aware `doganNote` (`dogan_note_<locale>` → AZ fallback). `autoTranslateBlogPost` now also translates `doganNote` (→ `dogan_note_<lang>`) and every guru box quote (`quote_az` → `quote_<lang>`, columns already existed from migration 0001). Guru rows are updated per-box after the posts update.
- `lib/ai/translate.ts`: hardened the system prompt to mirror source structure 1:1 — no added/removed/renumbered headings, list items or section numbers (fixes the RU-only numbering drift).

**No editor change needed:** the existing "Avtomatik tərcümə (RU/EN/TR)" button (→ `/api/blog/translate` → `translateBlogPostBySlug`) now covers Doğan Notu + guru quotes. Flow: save the post (with Doğan Notu + guru boxes filled), then click translate.

**Verification:** `npx tsc --noEmit` → 0 errors in changed files; `npx eslint` → 0 errors. Build/live not verifiable here (Google Fonts + prod DB are outside the sandbox allowlist).

**ACTION REQUIRED (admin):**
1. Run `drizzle/0014_add_dogan_note_locale_columns.sql` on Neon.
2. Re-run "Avtomatik tərcümə" on the affected post(s) so the new columns get filled.
3. "Image still missing" + "boxes don't show even in AZ" are likely deploy-lag (merge≠live) or Cloudinary env not set on Hostinger — confirm TASK-0243 is merged & live and that `CLOUDINARY_*` env vars exist.

## 2026-06-10 — TASK-0247: fix(b2b): dynamic profile completion + plan badge in sidebar

**Why:** The B2B sidebar showed a hardcoded 78% completion bar and a permanent PREMIUM badge — neither reflected the user's real DB state.

**What:**
- `app/api/user/profile/route.ts` GET: returns `profileCompletion` (filled / 16 core fields, rounded) as the single source of truth.
- `components/b2b-panel/B2BSidebar.tsx`: fetches `/api/user/profile` (completion) and `/api/member/session` (plan). Bar width + label now reflect real completion (`—` while loading). Badge: member/admin → PREMIUM (amber), free → "Pulsuz" (slate).
- `messages/{az,ru,en,tr}.json`: added dashboard.sidebar.freePlan.

**Verification:** eslint → 0 errors (only pre-existing <img> warnings); tsc → no errors in changed files; grep confirms no static 78% remains; all 4 message files valid JSON.

**Note:** plan granularity is limited to admin/member/free from the session; finer tiers (member_subscriptions) can refine the badge later.

## 2026-06-10 — TASK-0246: fix(b2b): wire /b2b-panel home to real owner data

**Why:** The B2B dashboard home shipped pure mock data: MY_LISTINGS was a hardcoded array with Turkish leftovers (Kadıköy, ₺), the 4 stat cards were 0 with fake [0,0,0,0,0] sparklines, and "Son Təkliflər" rendered 3 fabricated offers from the translation file. No real per-user data reached the page.

**What:**
- `app/b2b-panel/page.tsx`: now fetches `GET /api/listings?scope=owner` (the member's own listings) in a useEffect; renders top 3 with loading + honest empty state, each linking to /b2b-panel/ilanlarim/[id]. Stats computed from real listings — Active (showcase_ready), Total Views (sum viewCount), Messages (sum leads); "Incoming Offers" stays 0 (no offers backend). Removed the fabricated trend sparkline, "Son 7 gün" footer and change %. Offers panel replaced with an honest empty state.
- `lib/repositories/listingRepository.ts` + `lib/data/mockListings.ts`: expose `viewCount` (additive, optional on MockListing) so the views stat is real.
- `messages/{az,ru,en,tr}.json`: added b2bPanel.noOffers + noListings.

**Verification:** eslint on all changed files → 0 errors; tsc → no errors in changed files; grep confirms no Kadıköy/İstanbul/₺/MY_LISTINGS/Sparkline leftovers. All 4 message files valid JSON.

**Note:** the top welcome subtitle "İstanbul HORECA Group - B2B Portalı" is a separate hardcoded i18n value (another wrong-geography mock) — left untouched here, flag for a follow-up.

## 2026-06-10 — TASK-0245: fix(dashboard): drop member tool "toolkit" from admin sidebar

**Why:** Audit said both toolkit and marketinq-ocagi should leave the admin sidebar to finish role separation. Investigation showed only toolkit qualifies: it has a member home at /b2b-panel/toolkit (same as the foodCost precedent). marketinq-ocagi is the canonical hub that 11 public /marketinq/* tools and b2b-panel/analizler link back to — removing it would orphan the admin's own access, not clean up roles.

**What:** Removed the `toolkit` nav item (and the now-unused `Wrench` import) from `components/dashboard/DashboardSidebar.tsx`. Kept `marketinqOcagi`. Routes untouched — only the sidebar link.

**Verification:** eslint → 0 errors. grep confirms toolkit/Wrench gone, marketinqOcagi present.

## 2026-06-10 — TASK-0244: fix(i18n): purge forbidden word "Tezliklə" → "Yaxında"

**Why:** CLAUDE.md forbids "Tezliklə"; the audit claimed TASK-0240/PR#330 fixed it, but 9 live hits remained across 8 files (including the very az.json line the audit said was done).

**What:** Replaced "Tezliklə"/"Tezlikle" with "Yaxında" in b2b-panel/{bildirimler,teklifler,destek}, qiymet, uzvluk, dashboard/marketinq-ocagi (page + [slug]), and az.json (coming_soon + plannedToolsLabel). Left "Tezlik" (=frequency) in persona-ai-generator.ts and SikayetResult.tsx untouched — different word.

**Verification:** az.json valid JSON; eslint on changed TSX → 0 errors; grep "Tezlikl" → 0 hits.

## 2026-06-10 — TASK-0243: fix(blog): wire blog editor image upload to Cloudinary

**Why:** Admin uploaded cover images on 2 new blog posts; neither image appeared on the public page. Root cause: `BlogEditorForm.handleImage` never uploaded anything to the server — `compressImage()` returns `URL.createObjectURL()` (a `blob:` URL valid only in the current browser tab's memory). That `blob:` string was written to the DB `featured_image` column and died on reload; `resolveLocalCover` then turned it into `/blob:...`, a broken image.

**What:**
- `components/dashboard/BlogEditorForm.tsx`: `handleImage` now POSTs the compressed file to the existing `/api/upload` route (Cloudinary) and stores the returned durable `https` `secure_url` in `featuredImage`. Blob preview kept only for instant UI feedback. Added `uploadingImage` state (disables save buttons + file input while uploading); submit drops any `blob:`/`data:` value so a broken URL can never be persisted.
- `lib/db/blog-repository.ts`: `resolveLocalCover` now treats legacy `blob:`/`data:` values as missing (falls back to static cover or empty) instead of emitting a broken `/blob:...` src.

**Verification:** `npx eslint` on both files → 0 errors. `npx tsc --noEmit` → no errors in changed files (pre-existing unrelated errors only). `npm run build` blocked locally by Google Fonts fetch (sandbox network), not by these changes.

**Note for admin:** the 2 already-saved posts still hold dead `blob:` URLs in the DB — re-upload the cover image in the editor and save; it will now persist correctly.
## 2026-06-07 — TASK-0205: content(blog): add blog-026, blog-027 and blog-028

**Why:** The marketing and educational resources needed to be expanded to cover crucial Horeca topics such as Tip/Service Charge distribution policies (blog-026), average check building strategies via customer needs (blog-027), and professional handling of customer complaints (blog-028).

**What:**
- Registered three new static blog posts under indexes `blog-026`, `blog-027`, and `blog-028` inside [blogArticles.ts](file:///C:/codelar/dk-agency-platform/lib/data/blogArticles.ts).
- Integrated correct internal routes such as `sikayat-analizi` (complaint analysis) inside the article contents.
- Checked out and resolved the separate workspace issue where the uploaded cover images (`blog-26.png`, `blog-27.png`, `blog-28.png`) were not visible to the content branch.
- Regenerated the system audit report [SYSTEM-AUDIT.md](file:///C:/codelar/dk-agency-platform/docs/SYSTEM-AUDIT.md).

---

## 2026-06-06 — TASK-0109: feat(ai): KAZAN AI system prompt locale-aware response

**Why:** KAZAN AI was only aware of Azerbaijani (`az`) prompt context, meaning any inquiries in English, Russian, or Turkish would receive responses using Azerbaijani system prompt constraints, and all markdown CTA links were hardcoded to the default locale.

**What:**
- Rewrote `buildKazanSystemPrompt` in [system-prompt.ts](file:///C:/codelar/dk-agency-platform/lib/kazan-ai/system-prompt.ts) to construct the system prompt dynamically based on the active `locale` (AZ/TR/RU/EN).
- Localized and routed CTA links generated by KAZAN AI (e.g. `/toolkit/food-cost`, `/toolkit/pnl`, `/elaqe`) using a localized URL prefix helper.
- Passed `locale` from the request body in [route.ts](file:///C:/codelar/dk-agency-platform/app/api/kazan-ai/route.ts) into `buildKazanSystemPrompt(locale)`.
- Localized the suffix of the appended Ahilik quotes (Əhilik / Ahilik / Ахилик) based on user locale.

**Verification:**
- Derleme ve TS denetimleri başarıyla tamamlandı (`npm run build` PASS).

---

## 2026-06-06 — TASK-0200: fix(blog): cover images 404 & slug synchronization

**Why:** Blog cover images looked correct on `/blog` (index) but were broken (404) on the detail page (`/blog/[slug]`) because relative paths from the database (e.g. `images/blog-13.png`) resolved relative to the `/blog/` route segment. Furthermore, slug mismatch for the article "İşləyən Franchise'i Almaq" (`isleyen-franchise-təhvil almaq` in static config containing a space vs `isleyen-franchise-devralmaq` in DB) prevented local static mapping fallbacks.

**What:**
- Renamed the slug `isleyen-franchise-təhvil almaq` to `isleyen-franchise-devralmaq` in `lib/data/blogArticles.ts` along with all `relatedArticles` array references.
- Made `resolveLocalCover()` in `lib/db/blog-repository.ts` robust by prefixing any non-absolute, non-external DB featured image with `/` so they always render correctly on the detail pages.
- Re-ran `npm run audit:system` to refresh `docs/SYSTEM-AUDIT.md`.

**Verification:**
- Ran `npm run audit:blogs` → 0 findings.
- Ran `$env:ALLOW_PROTECTED="1"; npm run verify` → PASS.
- Ran `$env:ALLOW_PROTECTED="1"; npm run build` → Compiled successfully (200 routes, 0 errors).

---

## 2026-06-06 — TASK-F28: F2.8 Sektor Dynamic [slug] Route

**Why:** 3 statik sektor route = 3× eyni kod. Config-driven dinamik `[slug]` route ilə yeni sektor = 1 config + 1 i18n namespace (kod yox). Gələcək `/sektor/catering` üçün kopya lazım olmayacaq.

**What:**
- `lib/data/sektorConfigs/` SSOT (types + builder + qonaqEvi/otel/restoran/kafe + index) — `getSektorConfig`, `VALID_SEKTOR_SLUGS`
- `app/[locale]/sektor/[slug]/` — server page (generateMetadata + notFound) + slug-aware OG image + lokalizə not-found
- `components/sektor/SektorLanding.tsx` — client; config → 7 namespace-driven komponent + view event
- `app/[locale]/sektor/page.tsx` — sektor index (kartlar)
- i18n: `sektorOtel`/`sektorRestoran`/`sektorKafe` + `sektorNotFound` + `sektorIndex` × 4 dil
- Köhnə statik qonaq-evi route-ları silindi (A1), data config-ə köçdü, URL dəyişmədi
- `e2e/sektor-config.test.ts` — integrity test (icra olundu, PASS)

**Decisions:**
- **A1**: statik qonaq-evi silindi, dinamik route əhatə edir (URL eyni qalır)
- **Real toolkit slug-ları** (food-cost / pnl / basabas / delivery-calc) — spec-dəki yanlış slug-lar (food-cost-hesablayici və s.) 404 verərdi (L-001)
- `SektorToolGrid` icon yalnız quiz|calculator|whatsapp → aqta-checklist `quiz` ikonu (ClipboardCheck) istifadə edir
- `generateStaticParams` buraxıldı — codebase dinamik `[locale]` render edir (blog/[slug] pattern); SSG `setRequestLocale` istəyər, heç bir route istifadə etmir
- `middleware.ts` TOXUNULMADI (hard rule); locale fix artıq `i18n/routing.ts`-də (`as-needed`)
- **ROOT-LEVEL MIRROR** (kritik): default-locale (az) prefix-siz route bu codebase-də middleware rewrite ilə yox, root mirror ilə işləyir (`app/blog/...` → `app/[locale]/blog/...`). Köhnə `app/sektor/qonaq-evi`-ni silməklə `/sektor/*` (az) 404 verdi (real bug, dev/prod hər ikisi). Fix: `app/sektor/page.tsx` + `app/sektor/[slug]/{page,opengraph-image,not-found}.tsx` re-export mirror-ları yaradıldı; `[locale]` səhifələr locale-i `params`-dan yox `getLocale()`-dan alır (mirror-da params.locale yoxdur). Bax L-038.

**Verification (production — `next build` + `next start`):**
- `/sektor/{qonaq-evi,otel,restoran,kafe}` (az, prefix-siz) → **200** ✓ (otel = AHA/Booking məzmunu render)
- `/sektor/bilinmeyen` → **404** (SektorNotFound render) ✓
- `/az/sektor/otel` → **307** ✓ ; `/sektor` index → **200** ✓ ; `/en/sektor/otel` → **200** ✓
- `/sektor/otel/opengraph-image` → **200 image/png** ✓
- integrity test PASS, i18n 4 dil tam, lint + TS təmiz (yeni fayllar), PROTECTED toxunulmadı
- Qeyd: `next build` üçün `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` lazımdır (Google Fonts TLS).

**Lessons:** L-038 (default-locale prefix-siz route üçün root-level mirror məcburidir)

---

## 2026-06-05 — TASK-0196: F2.6 Sektor Landing + Lead Endpoint

**Why:** Qonaq evi / pansiyon sektoru üçün sektor-spesifik landing page lazım idi. 600 sertifikasız tesis × qanuni məcburiyyət × sıfır rəqib = blue ocean. Alətlər artıq canlı idi (PR #271), lakin funnel-in giriş nöqtəsi yox idi.

**What:**
- 7 parametrik komponent (`components/sektor/`) — gələcək `/sektor/otel`, `/sektor/restoran` üçün eyni backbone
- `/sektor/qonaq-evi` landing: Hero + 3 stat (AirDNA/Booking/DTA) + 3 tool (ROI = hero card) + blog teasers + lead form + FAQ + footer CTA
- `POST /api/lead/ota-guide` — Zod-free validation, IP rate limit 3/hr, KVKK consent, admin + user email
- i18n `sektorQonaqEvi` namespace: AZ/EN/RU/TR
- ROI Kalkulyatoru "Fərqləndirici" badge ilə — araşdırmadan gələn gap (dünyada NET gəlir göstərən alət yoxdur)

**PRs:** #277

**Verification:** Build PASS. Route `/sektor/qonaq-evi` + `/[locale]/sektor/qonaq-evi` build output-da görünür.

**Deferred:** Real PDF (Puppeteer F2.7), OG image (Agent 3), Yandex Metrica events.

---

## 2026-06-04 — TASK-0194/0195: OTA Funnel + Blog Sprint + Cleanup

**Why:** Qonaq evi / pansiyon sektoru üçün toolkit alətləri lazım idi (F2.5 roadmap). Blog sisteminə stage lifecycle + callout h3 + yeni kateqoriyalar əlavə olunmalı idi. Repo 170+ köhnə branch və 3 stash ilə dolu idi.

**What:**
- 3 yeni toolkit: OTA Readiness Quiz, Guesthouse ROI Calculator, WhatsApp Template Paketi (freemium)
- Blog: stage field (Başla/Böyüt/Devir), 14 callout h3 pattern, LegalDisclaimer, Hüquqi+Marketinq kateqoriyaları
- 12 yeni blog məqaləsi stash-dan recover edildi (blog-011 → blog-022)
- P0 fix: otaReadiness.ts git-ə commit edilməmişdi — runtime crash riski
- Cleanup: 170 branch, 3 stash, 2 worktree silindi

**PRs:** #271, #272, #273, #274

**Verification:** Build PASS. Prod smoke 4/4 route 200 (prefix-siz). Hostinger 503 (server restart lazım — infra, kod deyil).

**Dərs (L-038):** Yeni fayl yaradılanda `git status` ilə untracked yoxla — Next.js dynamic import build-i keçirir, runtime-da crash edir.

---

## 2026-05-31 - TASK-0180 Public CreateListingForm concept axis

**Why:** Concept/location methodology existed in `ListingForm`, but public `/ilan-ver` uses `CreateListingForm`, so submissions were missing concept axis data.

**What:** Public listing Step 3 now uses `listingConcepts.ts` and sector location fields from `listingFieldConfig.ts`, shows max-3 concept chips, records location indicators, renders recommendation warnings, previews the selected data, and stores it in `typeSpecificData`.

**Verification:** Build PASS. Target lint PASS. Audit regenerated. API POST unauthenticated returns 401. Locale redirect loop was fixed in the follow-up route task below.

---

## 2026-05-31 - TASK-LOCALE-LOOP / TASK-DEBT-CLEANUP / TASK-I18N-IDEMPOTENT / TASK-BLOG-CONTENT-RUN

**Why:** `/az/*` public routes could loop through next-intl default-locale redirects, field-config tests expected the pre-equipment field count, Windows audit scripts depended on `grep`, and the content translation script skipped whole rows when only `title_xx` existed.

**What:** Middleware now lets unprefixed public paths bypass next-intl while preserving locale-prefixed handling; `/[locale]/listings` alias was added for English campaign links. Mobile listing/form surfaces were tightened. Field config test now expects 14 devir fields. Audit/state generators are Windows-safe. Content translation is per-field idempotent with dry/mock scripts. Blog DB content was translated for RU/EN/TR.

**Verification:** Build PASS. Target lint PASS. `e2e/locale-routes.spec.ts` 6/6 PASS. `e2e/listing-field-config.test.ts` PASS. `npm run audit:system` reports routes=194, DeepSeek=19, Gemini=7, i18n parity 3298/3298/3298/3298. DB count after blog run: 13/13 title, summary, content filled for RU/EN/TR.

---

## 2026-05-28 — Ahilik Studio Launch Sprint (16 PR, #204-#220)

**Why:** Bütün platforma vahid "Ahilik Studio" dizayn dilinə keçməli idi. AI stack deprecated model-lərdən yenilənməli idi. Toolkit-lər canlı AI insight istəyirdi. Devir marketplace real CRUD təməlinə ehtiyac var idi.

**What (16 PR):**
- A02pre (#204-206): AI stack migration — deepseek-chat → v4-flash (17 yer), gemini-2.0 → 2.5-flash (5 yer), lib/ai-models.ts SST yaradıldı
- A02a/b (#207-208): 10 toolkit səhifə ToolkitStudioLayout-a köçürüldü
- A02c/d (#214-215): 9 toolkit səhifəyə real DeepSeek AI insight bağlandı
- A03 (#209): Devir marketplace UI refresh, Pattern A, DK Onaylı badge
- A05 (#210): Header + Footer Ahilik Studio, Pattern A (180 tərcümə)
- A05fix (#211): Protected list reconcile (14 fayl sinxron)
- A04 (#212): Dashboard/OCAQ warm palette, tier badge
- A06 (#213): Blog/News Ahilik Studio, Pattern A
- SYS (#216): SYSTEM-AUDIT.md auto-generator
- M5.1 (#217): Listings schema expansion (15 sütun, 9 status)
- M5.2 (#219): Cloudinary env + docs (upload artıq mövcud idi — L-032)
- M5.3a (#220): owner_id JWT binding + equipment field render

**Verification:** Production smoke 23/23 PASS, 0 kritik bug. Email backend LIVE (L-032: "eksik" sanılmışdı, hazır idi). Cloudinary upload test PASS.

**Lessons:** L-031 (schema dublikat), L-032 (boşluq varsayma — email+OCR hazır idi)

---

## 2026-05-27 - TASK-A01 Homepage Full Refresh

**Why:** Dashboard i18n 13/16 bitib. C3a batch: auditor (33 key) + food-cost (29 key). Auditor audit-sales funnel səhifəsidir — statusConverted = "Müştəri" CTO təsdiq.

**What:** 2 fayl Pattern B → A. 62 leaf key × 4 dil = 248 tərcümə. 2 namespace: dashboardAuditor, dashboardFoodCost. food-cost months/monthsShort array — t.raw() pattern. CATEGORIES + MOCK_AUDITS toxunulmadı.

**Smoke:** Build PASS. 8 curl (AZ/TR/RU/EN × 2 page) hamısı 307 auth redirect.

---

## 2026-05-23 - TASK-0157C-2b roller Pattern A

**Why:** Dashboard i18n 12/16 bitib, roller növbəti tək fayl. Permission terminologiyası həssas — CTO təsdiqi alındı.

**What:** 1 fayl Pattern B → A. 53 leaf key × 4 dil = 212 tərcümə. Namespace: dashboardRoller. Client component (Discovery "server" demişdi, səhv idi). Hardcoded role adları toxunulmadı.

**Smoke:** Build PASS. 4 curl (AZ/TR/RU/EN) hamısı 307 auth redirect.

---

## 2026-05-22/23 - TASK-0157C-4 b2b-yonetimi Pattern A

**Why:** C2a batch (4 fayl) bitdi, sıra C4-ə gəldi. b2b-yonetimi page-də 4 Record<Locale> obyekt var idi (əsas copy, typeLabels, statusLabels, modal). Əvvəlki session yarımçıq qaldı (linter crash), JSON diskdə idi, kod miqrasiyası bu session-da tamamlandı.

**What:** 1 fayl Pattern B → A. 51 leaf key × 4 dil = 204 tərcümə. Namespace: dashboardB2bYonetimi. CRM terminologiyası CTO təsdiq: Sövdələşmə/Anlaşma (Deal). Mock data (İstanbul HORECA Group) toxunulmadı.

**Smoke:** Build PASS. Lint 0 yeni error. 4 curl (AZ/TR/RU/EN) hamısı 307 auth redirect.

---

## 2026-05-21 — Dashboard i18n Push (sessiya yekunu)

**Session:** 7+ saat, 4 PR merged (#171, #172, #173, #174)
**Progress:** Dashboard i18n 11/16 fayl (69%), 245 key × 4 dil = 980 tərcümə
**Launch blocker:** Route mirrors bağlandı — switcher artıq /tr/dashboard 404 vermir
**Handoff:** docs/handoff/TASK-0157C-CONTINUATION.md — qalan 5 fayl sabaha

---

## 2026-05-21 - TASK-0157C-2a Dashboard Pattern A server batch

**Why:** C1 pilot batch validated the pattern (4 files). C2a continues with 4 more client-component dashboard pages that have mock data mixed in. Mock data untouched per Devir M5 scope.

**What:** mesajlar (17 key), pipeline (24 key), loglar (25 key), raporlar (33 key) migrated from Record<Locale> to useTranslations(). 4 new namespaces, 99 leaf keys × 4 dil = 396 translations. Mock data (İstanbul/HORECA) preserved.

**Smoke:** Build PASS. 8 curl (AZ+TR × 4 pages) all 307.

---

## 2026-05-21 - TASK-0157C-1 Dashboard Pattern A pilot batch

**Why:** TASK-0157A migrated 3 dashboard files, TASK-0157B added route mirrors. Now the remaining 13 Record<Locale> files need Pattern A migration. C1 pilot batch tackles the 4 simplest client-component pages.

**What:** 4 files migrated from inline Record<Locale> to useTranslations(): settings (2 key), toolkit (18 key), site (32 key), trends (29 key). 4 new namespaces added to all 4 locale JSON files. Total: 81 leaf key × 4 dil = 324 translations.

**Smoke:** Build PASS. 8 curl checks (AZ + TR × 4 pages) all 307 (auth redirect). No 500/404.

---

## 2026-05-21 - TASK-0157B Dashboard locale route mirrors

**Why:** TASK-0157A 65 i18n key-i 4 dilə əlavə etdi, lakin dashboard route-ları `/dashboard/` prefix-siz qalırdı. Language switcher `/tr/dashboard`-a yönləndirirdi → 404. Mövcud 2 ilanlar mirror-u `redirect()` pattern-i istifadə edirdi ki, locale kontekstini itirirdi.

**What:** 39 re-export mirror faylı yaradıldı `app/[locale]/dashboard/` altında (1 layout + 38 page). Hər fayl 1 sətirlik `export { default } from '@/app/dashboard/.../page'` pattern-i istifadə edir. DashboardSidebar-ın 15 nav link-i və logo link-i `withLocale()` ilə locale-aware edildi. DashboardTopBar profile link-i eyni pattern-ə keçdi. Auth guard layout re-export vasitəsilə qorunur — unauthenticated `/tr/dashboard` → `/auth/login`.

**Discovery:** Middleware dəyişiklik tələb etmir: `/(az|ru|en|tr)/:path*` matcher artıq locale-prefixed dashboard route-larını tutur. AZ prefix middleware tərəfindən avtomatik silinir (`as-needed` strategiya). `isActive` sidebar funksiyası `stripLocalePrefix` ilə locale-agnostic edildi.

**Smoke:** Build PASS. 4 dil × 6 səhifə HEAD test = 24/24 PASS (307 → /auth/login).

---

## 2026-05-21 - TASK-0157A Dashboard i18n Batch 1

**Why:** Dashboard-da sidebar, KAZAN leads səhifəsi və elan detail owner label-ları inline `Record<Locale>` / hardcoded pattern-də qalırdı. Launch öncəsi dashboard i18n batch-lərə bölünməli idi ki, 16 `Record<Locale>` bir PR-da sarmala çevrilməsin.

**What:** `DashboardSidebar` Pattern A-ya keçirildi (`useTranslations('dashboardSidebar')`). `app/dashboard/kazan-leads/page.tsx` server component olduğu üçün `getTranslations('dashboardKazanLeads')` istifadə edir. `app/dashboard/ilanlar/[id]/page.tsx` yalnız `Ad:`, `Telefon:`, `Email:` label-larını `listingDetail` key-lərinə bağladı. 65 yeni leaf key × 4 dil = 260 tərcümə əlavə edildi.

**Discovery:** Dashboard route-ları locale-prefix-sizdir. `/tr/dashboard`, `/ru/dashboard`, `/en/dashboard` hazırda 404 verir; `DashboardTopBar` switcher-i bu route-lara yönləndirir. Route strategy TASK-0157B-yə ayrıldı. AZ runtime smoke PASS, TR/RU/EN JSON hazır gözləyir.

**Scope:** Qalan 13 `Record<Locale>` dashboard faylı, mock data, middleware, protected files və dashboard route strategy dəyişdirilmədi.

---

## 2026-05-20 - TASK-0110 next-intl INVALID_KEY normalize

**Why:** Dashboard audit log action labels used DB action codes like `member.created`. JSON stored those as flat keys under `dashboard.auditLog.actions`, while next-intl interprets dots as nested path separators. This produced `INVALID_KEY` warnings for `actions.member.*`.

**What:** `messages/az.json`, `messages/en.json`, `messages/tr.json`, and `messages/ru.json` now store audit log actions as `actions.member.created`, `actions.member.role_changed`, `actions.member.deleted`, and `actions.member.password_reset` via nested JSON objects. Text values were preserved.

**Scope:** Dashboard components, DB action codes, audit APIs, migrations, protected auth files, and middleware were not changed.

---

## 2026-05-20 - TASK-0111 ComplaintAnalysis lint fix

**Why:** `components/marketinq/ComplaintAnalysis.tsx` initialized localStorage history by calling `setHistory()` synchronously inside a mount effect. React lint flagged this as `react-hooks/set-state-in-effect`, blocking quality gates for unrelated PRs.

**What:** History loading moved into a guarded `useState` lazy initializer. The same `dk_complaint_analysis_history` localStorage key is used, and save/clear behavior is unchanged.

**Scope:** Only the ComplaintAnalysis hook initialization was changed. UI, form flow, server action, protected files, and other lint warnings were not touched.

---

## 2026-05-20 - TASK-0108 KAZAN AI Page i18n

**Why:** `/tr/kazan-ai`, `/en/kazan-ai`, and `/ru/kazan-ai` reused the flat `/kazan-ai` page and rendered AZ hardcoded UI copy. The floating KAZAN widget was already Pattern A; the full page was still Pattern C.

**What:** `components/kazan-ai/KazanAiChatClient.tsx` now uses `useTranslations('kazanAi')`. Added `kazanAi` namespace to AZ/EN/TR/RU messages for hero, chat copy, sample questions, errors, sidebar, sales CTA, and metadata. `[locale]/kazan-ai` now has locale-aware `generateMetadata`; flat `/kazan-ai` keeps AZ metadata fallback.

**Scope:** `lib/kazan-ai/system-prompt.ts`, KAZAN widget, KAZAN lead actions, and `/api/kazan-ai/*` were not changed. AI response language remains a separate follow-up.

---

## 2026-05-20 - TASK-0107 B2B Panel Auth Guard

**Why:** `/b2b-panel/*` rendered without a server-side auth check. Public visitors could see the mock B2B portal shell and mock listings. Dashboard routes were already guarded separately.

**What:** `app/b2b-panel/layout.tsx` now calls `getServerMemberSession()` from `@/lib/members/server-session` before rendering the sidebar/shell. If `session.loggedIn` is false, it redirects to `/auth/login`. `[locale]/b2b-panel/layout.tsx` is a re-export, so locale-prefixed B2B routes use the same guard.

**Scope:** `lib/member-access.ts`, `lib/members/server-session.ts`, `middleware.ts`, dashboard routes, and member auth APIs were not changed.

---

## 2026-05-20 - TASK-0106 Trust Layer (DoganNote Pattern A + AhilikValues)

**Why:** Homepage-dəki DoganNote CTASections.tsx-in içindəki Pattern C (inline copyByLocale) komponent idi. L-004 qaydası: yeni komponent = Pattern A. Ahilik dəyərləri isə platformanın marka kimliyi — 3-kart vizualı ilə ayrıca section olaraq əlavə edildi.

**What:** `components/home/DoganNote.tsx` yaradıldı (useTranslations, 2-col grid, 3 abzas, 2 CTA). `components/home/AhilikValues.tsx` yaradıldı (3-card grid, lucide icons, gold #C5A022). CTASections.tsx-dən köhnə DoganNote funksiyası + Image import-u silindi; JoinCTA toxunulmadı. `app/[locale]/page.tsx`-ə insert: ToolkitShowcase → "Necə işləyir" → DoganNote → AhilikValues → StageSelector. 14 key × 4 dil (az/en/tr/ru) `home.doganNote` + `home.ahilikValues` namespace-lərinə əlavə edildi.

**Encoding fix:** Köhnə CTASections.tsx smart quotes (U+2018/U+2019) ilə idi — Turbopack build fail edirdi. Python ilə straight quote-a çevrildi.

**Build:** PASS (0 error). tsc yeni xəta: 0 (köhnə 15 xəta əvvəldən var).

---

## 2026-05-20 - TASK-0105 Homepage Platform 3-Card Section

**Why:** Homepage-ə platforma ekosistemini göstərən yeni section lazım idi. KAZAN AI, Toolkit, OCAQ kartları bir arada deyildi.

**What:** `components/home/PlatformCards.tsx` yaradıldı — Pattern A (useTranslations), framer-motion fade-in-up, brand rənglər (navy #1A1A2E, gold #C5A022, red #E94560). Hero-dan sonra, ToolkitShowcase-dən əvvəl insert edildi. 15 key × 4 dil (az/en/tr/ru) əlavə olundu `home.platformCards` namespace altında.

**Routes confirmed:** `/kazan-ai`, `/toolkit`, `/dashboard/ilanlar` — hamısı mövcuddur, 404 yoxdur.

**Build:** PASS (✓ Compiled successfully).

---

## 2026-05-20 - TASK-0103 Toolkit i18n Batch 3 FINAL (aqta + insaat + checklist)

**Why:** Last 3 Pattern C toolkit tools. Toolkit i18n now 11/11 complete.

**Fix:** 390 i18n keys added across 3 namespaces (aqtaChecklist 151, insaatChecklist 171, checklist 68). All 4 locales filled. AQTA regulatory text preserved accurately across translations.

**Toolkit i18n COMPLETE:** All 11 tools now Pattern A (useTranslations). Total keys across all batches: 44 + 178 + 244 + 390 = 856 keys.

## 2026-05-19 - TASK-0102 Toolkit i18n Batch 2 (food-cost + delivery-calc + menu-matrix)

**Why:** 3 more Pattern C toolkit tools needed i18n. food-cost was the biggest single tool (~105 keys).

**Fix:** 244 i18n keys added across 3 namespaces (foodCost 105, deliveryCalc 65, menuMatrix 74). All 4 locales filled. Same pattern as Batch 1.

**Remaining:** 3 Pattern C tools for Batch 3 (aqta-checklist, insaat-checklist, checklist = ~400 strings).

## 2026-05-19 - TASK-0101 Toolkit i18n Batch 1 (staff-retention + branding + basabas)

**Why:** 3 toolkit calculators had hardcoded AZ-only strings (Pattern C). Multi-lang users saw only AZ.

**Fix:** 178 i18n keys added across 3 namespaces (staffRetention 48, branding 60, basabas 70). All 4 locales filled. Components refactored to useTranslations. Arrays moved inside component body so t() is in scope.

**Remaining:** 6 more Pattern C tools in future batches (food-cost, delivery-calc, menu-matrix, aqta-checklist, insaat-checklist, checklist).

## 2026-05-19 - TASK-0100 P&L Simulator i18n

**Why:** PnlForm + PnlResult used inline Record<Locale> pageCopy pattern while parent PLSimulator already used useTranslations. Pattern B→A migration for consistency.

**Audit result:** PLSimulator.tsx already i18n (75+ keys). Only PnlForm (23 strings) + PnlResult (20 strings) + 1 "USTA" badge needed migration. Total: 44 keys added to marketinq.plSimulator namespace, 4 locales.

**Locale prop removed:** PnlForm/PnlResult no longer accept `locale` prop — useTranslations handles it internally. No external callers found (components are loaded via PnlSimulatorPage → PLSimulator, which doesn't use them directly).

## 2026-05-19 - TASK-0156 Config Fayl Reorqanizasiyası

**Why:** 4 tool fiziki olaraq yanlış komment bölməsində idi (menyu-analitik ŞAGIRD-da, yemek-xerci/pl-simulyatoru/musteri-persona KALFA-da). Kod düzgün işləyirdi (tier field əsas), amma developer oxunaqlığı pozulurdu.

**Fix:** 4 tool obyekti olduğu kimi (heç bir dəyər dəyişmədən) doğru tier bölməsinə köçürüldü. 1 fayl, 70→70 reorder, 0 dəyər dəyişikliyi.

## 2026-05-19 - TASK-0157 Dashboard i18n Fix (Launch-Blocker)

**Why:** 3 dashboard area had hardcoded AZ-only strings: FloatingKazanWidget (~25 strings), DashboardLayout (2), KazanLeadStatusActions (3), ilanlar detail page (~10 toasts/UI). Multi-lang users saw AZ-only content.

**Fix:** 4 new i18n namespaces added (kazanWidget 31 keys, dashboardSidebar 2, kazanLeadActions 3, listingDetail 12 = 48 keys total). All 4 locales filled (AZ/EN/TR/RU). Components refactored to `useTranslations()`. Brand names (KAZAN AI, OCAQ, P&L, AQTA) preserved as-is across locales.

**PROTECTED:** `lib/member-access.ts` untouched.

## 2026-05-18 - TASK-0155 Slug Uyğunsuzluğu Düzəlişi

**Why:** 3 tool-un config slug-u public route adından fərqli idi (menyu-analitigi vs menyu-analitik, pnl-simulator vs pl-simulyatoru, promosyon-roi vs roi-kalkulator). CTO qərarı: route adları əsasdır, config slug-lar route-a uyğunlaşdırılır. Fayl/qovluq köçürmə yoxdur (SEO qorunur).

**Cascade:** Slug 6 qat-da istifadə olunur — config, dashboard (if-statements + pageCopy 4 locale), public route (checkToolAccess), server actions, API routes (checkToolAccess + DB toolSlug), i18n keys, _brain type union, e2e tests. Grep ilə bir dəfə hamısı tapıldı, atomik patch edildi.

**Risk:** DB-dəki köhnə `marketing_tool_runs.toolSlug` sütununda əvvəlki run-lar köhnə adla qalır — aylıq rate limit count sıfırlanır. Startup fazasında məqbul.

**QOVLUQ KÖÇÜRMƏ YOX** (git diff --stat: 18 fayl, 70→70 string, 0 rename).

## 2026-05-18 - TASK-0154 Pulsuz Qeydiyyat-Gate (Blog + Xəbərlər)

**Why:** News articles (haberler/xeberler) had zero registration gate — visitors could read everything anonymously. Blog had 40% scroll gate but with hardcoded AZ strings and "paywall" language implying payment. Business model is free registration wall, not paywall.

**Approach:** Reused existing BlogContentWrapper (DRY — no duplicate component). Refactored hardcoded AZ strings to `useTranslations('registrationGate')` namespace across 4 locales. Wrapped `haberler/[slug]/page.tsx` with same component. `xeberler/[slug]` and `[locale]/haberler/[slug]` re-export from haberler — one file change covers all 3 routes.

**UI changes:** Gate modal color changed from red (paywall feeling) to emerald (free/positive). "Member Flow MVP" developer note removed. All messaging now "pulsuz" focused: "Bu məzmun pulsuzdur", "Heç bir ödəniş yoxdur". Benefits list updated: "Həmişə pulsuz" replaces "Gələcək sales layer".

**Protected:** `lib/member-access.ts` not modified (verified with git diff).

## 2026-05-18 - TASK-0153 Tool Status Truth + Pricing Filter

**Why:** Pricing page was rendering all 21 tools (including 4 "planned") without status filtering. This made USTA tier look like it had 6 usable tools when only 2 are live. Revenue page credibility issue.

**Audit findings:** All 17 "live" tools genuinely work (have components + dashboard access). 4 "planned" tools have zero implementation. Config status field was accurate — the problem was the pricing page not filtering.

**Fix:** `groupToolsByTier()` now splits tools into `live` and `planned` arrays. Live tools shown in expandable list as before. Planned tools shown separately in dashed-border "tezliklə" section (transparent, not hidden). i18n key `plannedToolsLabel` added in 4 locales.

**Config comments:** Updated file header (14→21), tier comments to match real counts (3/12/6).

**Result per tier:** ŞAGIRD shows 3 live, KALFA shows 12 live, USTA shows 2 live + 4 "tezliklə".

**Popcorn pricing:** USTA price changed from 149→99 AZN/ay. 10 AZN gap from KALFA (89) makes upgrade obvious. All i18n files updated, grep confirms zero 149 remnants in live config/UI.

**Launch campaign:** `LAUNCH_CAMPAIGN` config added to marketing-tools-config.ts with `endDateISO: "2026-09-01"`. `isLaunchActive()` auto-checks date. PricingPage shows strikethrough original price + "Hazırda Pulsuz" badge for KALFA/USTA during campaign. Green banner with campaign end date. Fully automatic — no manual switch needed when campaign expires.

## 2026-05-18 - TASK-0152 Pricing Page

**Why:** Marketinq Ocagi tools are already split by tier, but the public site did not answer the customer question: which package do I get, and what does it cost? The pricing page turns that gap into a sales entry point: three simple cards, expandable tool lists, and WhatsApp CTA.

**Architecture:** Route `/[locale]/pricing`, component `components/pricing/PricingPage.tsx`. The page is static: no DB, no payment provider, no AI. Tool lists are rendered dynamically from `lib/marketing-tools-config.ts`.

**Tier data:** The prompt mentioned 3/6/4, but the repo config currently returns 3/12/6. Following the source-of-truth rule, the code trusts config; counts and lists are not hardcoded in the component.

**CTA:** SAGIRD goes to the existing auth register flow. KALFA/USTA open a `wa.me` link with a ready tier message.

## 2026-05-18 - TASK-0151 Marketinq: Lokasyon Analiz

**Niyə:** Sprint 5-in son tool-u lokasyon qərarını generic xəritə yox, franchise səviyyəli müşahidə intizamına çevirir. Kiçik restoran üçün ən bahalı səhvlərdən biri zəif görünürlük, zəif trafik, park problemi və kirayə/marja uyğunsuzluğu olan nöqtəyə bağlanmaqdır.

**Arxitektura:** Source of truth `lib/marketing-tools/lokasyon-analiz.ts` statik lokasyon KB-sidir. 15 meyar lokasyon tipinə görə skorlanır, `Sabit giderlər / Brüt Kar Marjı` formulu ilə aylıq başabaş satış çıxarılır. Xarici xəritə, Google Places və demoqrafiya API yoxdur.

**AI fallback:** `app/actions/lokasyon-ai-recommendations.ts` DeepSeek-i yalnız tətbiq tövsiyəsi üçün çağırır. AI timeout, invalid JSON və ya `forceFallback=1` halında component statik fallback tövsiyələri və xəbərdarlıq qeydi göstərir.

**İki rejim:** Yeni lokasyon seçimi başabaş kartı ilə işləyir. Mövcud lokasyon rejimi eyni meyarlarla yanaşı əlavə risk flag-ləri göstərir: böyük sahə, yüksək kirayə, ortaq istifadə, mövsümi asılılıq və iş saatı məhdudiyyəti.

**Sprint 5 yekunu:** TASK-0146..0151 altı tool tamamlandı: Sezon, Reklam ROI, Sosial Metrik, Restoran Audit, Trend Analiz, Lokasyon Analiz.

## 2026-05-18 - TASK-0150 Marketinq: Trend Analiz

**Niyə:** 2026 HoReCa trend siyahısı uzundur, amma kiçik restoranın vaxtı və büdcəsi məhduddur. Sahibkar üçün əsas sual "hansı trend mənim restoranıma uyğundur və sabah nə etməliyəm?" sualıdır. Bu tool 8 prioritet trendi statik KB ilə skorlayır və top-3 üçün tətbiq addımı verir.

**Arxitektura:** Trend data mənbəyi RSS deyil, statik `lib/marketing-tools/trend-analiz.ts` bilik bazasıdır. Hesablama deterministikdir: restoran tipi, auditoriya və hazırkı güclü tərəf matrisindən 0-100 uyğunluq balı çıxarılır. DeepSeek yalnız top-3 trend üçün "ucuz və 7 günə sınanan ilk addım" tövsiyəsi verir.

**AI fallback:** `app/actions/trend-ai-recommendations.ts` DeepSeek/AI xətası, timeout, invalid JSON və ya validation problemində tool-u çökdürmür. Komponent statik `fallbackFirstStep` mətnlərini göstərir və "AI tövsiyə əlçatmazdır" qeydini çıxarır.

**Trend KB:** Dəyər/qiymət həssaslığı, çatdırılma-öncəlikli format, AI/rəqəmsal sifariş, sağlamlıq/funksional menyu, nostalji comfort, içki fokusu, davamlılıq/yerli mənbə, təcrübə/insani toxunuş.

**Test dataseti:** City + young + online profilində digital ordering/delivery/beverage yüksək çıxmalıdır. Banquet + tourist + service profilində experience/human touch və nostalgia yuxarı çıxmalıdır. Cafe + family + food quality profilində functional health, nostalgia və value xətti prioritet olmalıdır.

## 2026-05-18 - TASK-0149 Marketinq: Restoran Audit

**Niyə:** Kiçik restoranlarda problem çox vaxt audit kağızı deyil, idarəetmə görünməzliyidir: günlük kassa tutuşdurması, aylıq xərc hesabatı, prime cost, top məhsul marjası və uyğunluq sənədləri bilinmirsə sahibkar qərarı hisslə verir. Bu tool 30 suallıq qısa özünüqiymətləndirmə ilə zəif nöqtələri aksiyon planına çevirir.

**Arxitektura:** Hesablama `lib/marketing-tools/restoran-audit.ts` util-indədir. Komponent `components/marketinq-ocagi/restoran-audit/RestoranAuditPage.tsx` tək mənbədir; native SVG chart, 6 oblast akkordeon UI və 0-100 ümumi bal göstərir. AI çağırışı yoxdur.

**AZ-spesifik qat:** Maliyyə oblastı generic P&L yox, kassa/POS Z-report, fiskal çek, aylıq xərc hesabatı, prime cost və top-10 məhsul marjası üzərində quruldu. Uyğunluq oblastı AQTA qeydiyyatı, tibbi müayinə, temperatur, dezinfeksiya və əmək riski suallarını yoxlayır. Konkret rüsum/prosedur rəqəmi yazılmadı.

**Scoring:** Hər sual 0/1/2 baldır. Oblast balı `toplanan / 10 * 100`, ümumi bal 6 oblastın ortasıdır. `>=80` Usta, `50-79` Kalfa, `<50` Şagird. Ən zəif 3 oblast üçün statik ilk addım tövsiyəsi, 0 bal alan suallar üçün təcili siyahı, kritik 0 cavablar üçün "Nəyi bilmirsən?" kartı göstərilir.

**Test dataseti:** Bütün cavablar `2` -> 100, Usta. Bütün cavablar `0` -> 0, Şagird, 30 təcili sual, kritik kassa/xərc/marja/AQTA siyahısı dolu. Qarışıq cavablar -> orta bal və ən zəif 3 oblast düzgün sıralanmalıdır.

## 2026-05-17 - TASK-0148 Marketinq: Sosial Media Metrik Analizatoru

**Niyə:** Restoran sahibləri "ER nədir, hansı kontent daha yaxşıdır" sualına cavab tapa bilmir. ER hesablama mənbədən-mənbəyə fərqlidir (follower-bazlı vs reach-bazlı vs impressions-bazlı) — istifadəçi qarışır. Bu tool bir formul seçir və HoReCa sektoru üçün doğru benchmark ilə müqayisə edir.

**Formula (Instagram):** ER = (likes+comments+saves+shares) / (posts × followers) × 100. 2026-da save və share daxildir (əvvəlki formullardan fərq). Reach-bazlı ER opsionaldır (varsa göstərilir).

**Formula (TikTok):** ER = (likes+comments+shares+saves) / totalViews × 100 (views-bazlı — platforma standartı).

**HoReCa Benchmark-lar (2025-2026, Socialinsider/RivalIQ):** IG <10K: 2.53%, IG 10K-100K: 1.18%, IG 100K+: 0.70%. TikTok F&B: 2.65% (views-bazlı).

**Sağlamlıq balı:** 0-100 skala — 50 = benchmark-da dəqiq, 100 = 2x benchmark, 0 = sıfır ER. Rəng kodlu (yaşıl/qızıl/qırmızı).

**Kontent tipi ranking (Instagram, opsional):** Reels > Carousel > Single (2025-2026 data). İstifadəçi hər tip üçün ayrıca interaksiya daxil edirsə, real ranking göstərilir.

**Aksiyon tövsiyələri (statik, araşdırma əsaslı):** Video/Reels-ə keç (2-5x ER artım), şərhlərə 1h-da cavab (+23% gələcək ER), save-fokuslu kontent artır. Info bloku: "ER niyə aşağıdır" izahı (platforma səviyyəsində düşüş trendi).

**Test dataseti (IG):** 8500 follower, 10 post, 1200 like + 85 comment + 140 save + 45 share = 1470 total. ER = 1470 / (10×8500) × 100 = 1.73%. Nano tier benchmark: 2.53%. Delta: -0.80%. Status: weak (ratio 0.68 < 0.70 threshold). Health score: 34.

**Post-merge audit (2026-05-17):** PR-sız push edildiyi üçün manual audit keçirildi. Nəticə: dublikat YOX, PROTECTED TƏMİZ, hardcoded AZ = 0, i18n 4 dil TAM, build PASS, tsc yeni xəta YOX. Qayda pozuntusu qeyd olundu → L-008.

## 2026-05-17 - TASK-0147 Marketinq: Reklam ROI

**Niyə:** Restoran sahibi çox vaxt like, baxış və ümumi reach kimi vanity metrics ilə qərar verir. HoReCa reklamında əsas sual hansı kanalın real müştəri gətirdiyi, CAC-i neçə AZN etdiyi və müştərinin LTV-si ilə xərcin sağlam olub-olmamasıdır. Bu tool awareness və conversion kampaniyalarını ayırır ki, tanıtım kampaniyası səhvən ROAS ilə ölçülməsin.

**Arxitektura:** Hesablama `lib/marketing-tools/reklam-roi.ts` util-indədir; component yalnız input, validation, chart və cədvəl render edir. Conversion rejimində ROAS, CAC, ROI %, LTV:CAC və kanal müqayisəsi çıxarılır. Awareness rejimində reach, CPM və EMV təxmini göstərilir. Influencer üçün hybrid model: baza ödəniş + attributed revenue üzərindən komisyon.

**Tier:** KALFA (89 AZN/ay). Tool `reklam-roi` slug-u ilə `marketing-tools-config.ts` single source of truth-a əlavə edildi, `aiProvider: none` saxlandı, çünki hesab deterministikdir.

**Test dataseti:** Instagram/Facebook 600 AZN, 18 müştəri, AOV 32 AZN; Influencer 450 AZN + 12% komisyon, 14 müştəri; Telegram 180 AZN, 7 müştəri. Gözlənilən: Instagram/Facebook ROAS 0.96x, influencer effective budget 503.76 AZN, Telegram CAC 25.71 AZN, LTV 49.23 AZN, ümumi LTV:CAC təxminən 0.86:1. Awareness smoke: 600 AZN / 42,000 impressions -> CPM 14.29 AZN.

**Qeyd:** Prompt `recharts` istəyirdi, amma repo dependency-lərində `recharts` yoxdur və yeni paket qadağandır. Ona görə TASK-0146 pattern-i ilə native SVG/bar chart quruldu; chart `data-testid="reklam-roi-chart"` ilə smoke üçün yoxlanır.

## 2026-05-17 - TASK-0146 Marketinq: Sezon Analitikası

**Niyə:** Kiçik restoranlarda cash-flow proqnozu çox vaxt intuisiya ilə aparılır. Pik ayda az staff və az inventar fürsəti qaçırır, ölü ayda artıq alış və uzun növbə nağd pulu yandırır. Rəqib ümumi kalkulyatorlardan fərq olaraq bu tool AZ-spesifik sezonları — Novruz, Ramazan pəncərəsi, sahil turizmi, Şahdağ/Qəbələ qış sezonu və toy-banket aylarını — deterministik əmsala çevirir.

**Arxitektura:** Hesablama `lib/marketing-tools/sezon-analitikasi.ts` util-indədir; component yalnız input, validation və vizual nəticəni render edir. Matrix 5 restoran tipi x 12 ay əmsalından ibarətdir. Hər ay üçün dövriyyə, işçi büdcəsi və inventar büdcəsi hesablanır; ən zəif 3 ay, ən güclü 3 ay və `<0.80` ölü ay xəbərdarlığı çıxarılır.

**Tier:** KALFA (89 AZN/ay). Tool `sezon-analitikasi` slug-u ilə `marketing-tools-config.ts` single source of truth-a əlavə edildi, `aiProvider: none` saxlandı, çünki hesab deterministikdir.

**Test dataseti:** 25,000 AZN orta dövriyyə, şəhər restoranı, 28% işçi xərci, 32% food cost. Yanvar `18,750`, mart `30,000`, işçi büdcəsi müvafiq `5,250` və `8,400`, inventar büdcəsi `6,000` və `9,600` olmalıdır. Sahil-kurort fevral `13,750`, iyul `36,250`; dağ-kurort yanvar `33,750`, avqust `18,750`.

**Qeyd:** Prompt `recharts` istəyirdi, amma repo dependency-lərində `recharts` yoxdur və task yeni paket qadağan edir. Ona görə mövcud stack ilə responsive SVG bar/line chart quruldu; chart `data-testid="season-chart"` ilə smoke üçün yoxlanır.

## 2026-05-17 - TASK-0145 Marketinq: Müştəri Persona Yaradıcısı

**Niyə:** Restoran sahibi müştərisini tanımır — "kim gəlir, nə istəyir, harada tapıram?" suallarına cavab yoxdur. Ümumi persona tool-larından fərqli olaraq bu tool AZ/TR restoran sektoru üçün xüsusidir: Bakı vs Gəncə müştərisi, lokal ödəmə vərdişləri, WhatsApp statusu vs Instagram, ailə yönümlü vs fərdi yemək vərdişi.

**Arxitektura:** 3 mərhələli UI (restoran profili + müştəri müşahidələri + AI persona generasiyası). DeepSeek server action JSON formatında cavab qaytarır, 18 sahəli persona kartı yaradır. Cookie-based rate limit: 10 dəqiqədə 5 persona. localStorage-da son 3 persona tarixi saxlanılır.

**Tier:** USTA (149 AZN/ay). KALFA və ŞAGIRD üçün upgrade CTA göstərilir. Config: `musteri-persona` slug, tier `usta`-ya dəyişdirildi (əvvəl `kalfa` idi, amma prompt USTA tələb edir).

**Test ssenarisi:** Milli Mətbəx, Bakı, 15-30 AZN, Zal + Çatdırılma. Yaş 25-34 + 35-44, Qadın 60%. Nahar + Axşam, Həftədə 2-3, Masa 2 + 3-4, Kart + Nağd, Piyada + Taksi. AI Bakılı, 28-38 yaş, orta-yüxsək gəlirli, Instagram aktiv persona qaytarmalıdır. Persona kartı: profil (sol) + insights (sağ) + marketinq tövsiyələri (alt) layout.

**Qeyd:** DeepSeek response_format: json_object istifadə olunur — JSON parse uğursuzluğu üçün ayrıca error tipi (`json-parse`) əlavə edildi. Temperature 0.7 (ROI-dan yüksək) — kreativ persona üçün daha yaxşı nəticə verir.

## 2026-05-17 - TASK-0144 Marketinq: ROI Kalkulatoru v2

**Niyə:** Mövcud Promosyon ROI v1 baz həftə ilə promo həftəni müqayisə edirdi. ROI v2 restoran sahibinin "hansı kanala pul xərcləməliyəm?" sualına cavab verir: Instagram, Google, WhatsApp, flyer və digər kanallar eyni cədvəldə ROI, ROAS, CAC, LTV:CAC və payback ilə müqayisə olunur.

**Formula:** Kanal ROI % = (gəlir - xərc) / xərc * 100. ROAS = gəlir / xərc. CAC = xərc / yeni müştəri sayı. Payback gün = CAC / (orta çek * gündəlik ziyarət tezliyi). Ümumi ROI = (ümumi gəlir - ümumi xərc) / ümumi xərc * 100. LTV = orta çek * aylıq ziyarət * loyallıq müddəti. LTV:CAC = LTV / ümumi CAC.

**Test dataseti nəticəsi:** Instagram 500 xərc, 1800 gəlir, 15 yeni müştəri -> ROI 260%, ROAS 3.6x, CAC 33.3 AZN. Google Ads 800/1200/8 -> ROI 50%, ROAS 1.5x, CAC 100 AZN. Flyer 200/300/3 -> ROI 50%, ROAS 1.5x, CAC 66.7 AZN. Orta çek 25 AZN, aylıq ziyarət 2, loyallıq 12 ay -> LTV 600 AZN, ümumi CAC 57.7 AZN, LTV:CAC 10.4:1. Ən yaxşı kanal Instagramdır.

**AI təhlükəsizliyi:** DeepSeek çağırışı `app/actions/roi-ai-analysis.ts` server action-dadır. Input max 8 kanal, xərc > 0, gəlir >= 0 sanitizasiyası ilə qorunur. Cookie əsaslı limit: 10 dəqiqədə 3 analiz. `DEEPSEEK_API_KEY` client bundle-a düşmür.

---

## 2026-05-17 - TASK-0143 Marketinq: P&L Simulyatoru

**Niyə:** USTA tier üçün restoran sahibinin rəqəmləri real vaxtda görməsi lazımdır: satış, yemək məsrəfi, işçi xərci, əsas xərc, overhead, xalis mənfəət və zərərsizlik nöqtəsi eyni paneldə oxunur. Mövcud P&L səthi saxlanmadı; dashboard wrapper yeni mobil-first komponentə bağlandı ki iki fərqli P&L davranışı qalmasın.

**Formula:** Ümumi satış = yemək satışı + içki satışı + digər. COGS = başlanğıc stok + alışlar - son stok. Yemək məsrəfi % = COGS / satış * 100. İşçi xərci % = işçi xərci / satış * 100. Prime Cost = COGS + işçi xərci. Prime Cost % = Prime Cost / satış * 100. Xalis mənfəət = satış - COGS - işçi xərci - overhead. Zərərsizlik nöqtəsi = overhead / (1 - dəyişkən xərc %).

**Benchmark:** Yemək məsrəfi <=30% yaxşı, 30-35% diqqət, >35% kritik. İşçi xərci <=30% yaxşı, 30-35% diqqət. Prime Cost <=60% yaxşı, 60-70% diqqət, >70% kritik. Xalis mənfəət >=5% sağlam, 3-5% diqqət, <3% riskli.

**Test dataseti nəticəsi:** Aylıq satış 18,000 AZN. COGS 6,500 AZN, Food Cost 36.1% -> kritik/diqqət zonası. İşçi xərci 5,800 AZN, Labor 32.2% -> diqqət. Prime Cost 12,300 AZN, 68.3% -> diqqət. Overhead 2,800 AZN. Xalis mənfəət 2,900 AZN, 16.1% -> yaxşı. Zərərsizlik nöqtəsi dəqiq formula ilə 8,842 AZN-dir; cari satış BEP-dən yuxarıdır.

**AI təhlükəsizliyi:** DeepSeek çağırışı `app/actions/pl-ai-analysis.ts` server action-dadır. `DEEPSEEK_API_KEY` client bundle-a düşmür. Cookie əsaslı limit: 10 dəqiqədə 3 analiz. Xalis mənfəət mənfi ola bildiyi üçün server action bu sahədə signed number qəbul edir.

---

## 2026-05-17 - TASK-0141 Marketinq: Menyu Analitiği

**Niyə:** Köhnə Menyu Analitiği AI tahmininə çox bağlı idi. KALFA səviyyəsində satıla bilən tool üçün kateqoriyalaşdırma deterministik olmalıdır: CM, Food Cost %, Menu Mix % və orta eşiklər istifadə olunur; AI yalnız tövsiyə qatıdır.

**Formula:** CM = satış qiyməti - yemək məsrəfi. Food Cost % = məsrəf / qiymət * 100. Menu Mix % = item satışı / ümumi satış * 100. Orta CM item-lərin CM ortalamasıdır, orta Mix isə 100 / item sayı.

**Test dataseti nəticəsi:** Plov 8/2.5/120 -> CM 5.50, FC 31.25%, Mix 42.11%, ULDUZ. Dolma 7/3/45 -> CM 4.00, FC 42.86%, Mix 15.79%, BULMACA. Qutab 4/1.2/90 -> CM 2.80, FC 30.00%, Mix 31.58%, İŞ ATI. Bozbas 6/2.8/30 -> CM 3.20, FC 46.67%, Mix 10.53%, İT.

**Qeyd:** Prompt-da Qutab üçün "BULMACA və ya ULDUZ" ehtimalı yazılmışdı, amma məcburi formula ilə Qutab orta CM-dən aşağı, orta Mix-dən yuxarıdır. Ona görə doğru kateqoriya İŞ ATI-dır.

**AI təhlükəsizliyi:** DeepSeek çağırışı `app/actions/menu-analytics-ai.ts` server action-dadır. Input max 20 item, item adı max 50 simvol, 10 dəqiqədə 3 çağırış cookie əsaslı rate limit ilə qorunur. API key client bundle-a düşmür.

## 2026-05-17 - TASK-0142 Marketinq: Şikayət Analiz Aləti

**Niyə:** Mövcud Şikayət Analitiği çoxlu şikayət pattern-ləri üçün idi. Bu task tək şikayəti operativ idarə etmək üçündür: əvvəl anlıq kateqoriya, sonra AI ilə ciddilik, kəşf sualları, kanal-aware müştəri cavabı və daxili qeydiyyat.

**Fəlsəfə:** Müştəri çox vaxt yalnız şikayətin səbəbindən yox, ele alınma biçimindən narazı qalır. Tool cavab yazmadan əvvəl adminə boşluqları göstərir: gün/saat, stol/zona, işçi, müştəri əvvəldən loyaldırmı, public kanal konteksti varmı.

**Test şikayəti 1:** "Sifarişim 45 dəqiqə gec gəldi və yemək soyuq idi" client-side iki siqnal verir: Yemək keyfiyyəti + Gözləmə/Sürət. Ciddilik yüksəkdir, çünki həm gecikmə, həm soyuq yemək var.

**Test şikayəti 2:** "Ofisiant çox kobud idi, sualıma cavab vermədi" client-side Xidmət/Personal verir. Ciddilik orta-yüksəkdir, çünki personal davranışı reputasiya və təkrar gəliş riskidir.

**AI təhlükəsizliyi:** DeepSeek çağırışı `app/actions/complaint-analysis-ai.ts` server action-dadır. Input 20-1000 simvol arası sanitize olunur, 10 dəqiqədə 5 analiz cookie əsaslı rate limit ilə qorunur. API key client bundle-a düşmür.

**CAPA əlavəsi:** Push-dan əvvəl daxili qeydiyyata düzəldici/önləyici fəaliyyət bloku əlavə edildi. Şikayət yalnız cavab göndərməklə bağlanmır; araşdırma aparılmalı, bağlama kriteriyası bilinməli, bu hadisə üçün düzəldici fəaliyyət və təkrar olmaması üçün önləyici fəaliyyət yazılmalıdır.

---

## 2026-05-17 - TASK-0140 Admin: İstifadəçi Sil (Soft Delete + Bulk)

**Niyə hard delete rədd edildi:** Audit log-da `targetUserId` referansları var. Hard delete sonra bu referanslar qırılır — "kim silindi?" sualı cavabsız qalır. Soft delete (deletedAt timestamp) bütün referansları qoruyur.

**Dual-table soft delete:** `users` (auth) + `memberProfiles` (admin panel) — hər ikisində deletedAt set olunmalıdır. `users`-ı email ilə tapırıq (id-lər fərqli ola bilər). Gələcəkdə bu iki cədvəl birləşdirildikdə (tech debt) bir update kifayət edəcək.

**Login bloklama:** deletedAt check emailVerified-dən ƏVVƏL qoyulub — silinmiş user "email təsdiqləyin" mesajı görmür, birbaşa "hesab deaktiv" görür. Bu, XSS/phishing kontekstində daha təhlükəsizdir.

**Bulk limit 50:** DoS qoruma — bir request-də 50-dən çox silmə bloklayır. Admin özünü bulk-dan da silə bilmir (id filter).

**Double confirm:** Detail page-də təsadüfi klik qarşısını almaq üçün 2 addım: (1) window.confirm, (2) "SİL" yazma + button disabled until match. MembersTable-da isə tək confirm (daha sürətli workflow).

---

## 2026-05-17 - TASK-0139 Admin: Şifrə Sıfırla

**Niyə:** Admin istifadəçinin şifrəsini bilmir və bilməməlidir. Amma istifadəçi şifrəsini unutduqda admin-dən kömək istəyə bilər. Admin-initiated reset flow: admin düyməyə basır → sistem token yaradır → email gedir → user özü şifrəni seçir.

**Admin heç vaxt şifrəni görmür:** Token plain-text email-dən keçir amma bu one-time-use + 1 saat expire. Şifrə özü heç vaxt göndərilmir. Audit log-a da token/hash yazılmır (OWASP).

**Niyə ayrı template?** Mövcud `passwordReset` template "Siz bu sorğunu göndərdiniz" deyir — admin-initiated olduqda bu yanlışdır. `adminPasswordReset` template "administrator tərəfindən sorğu göndərildi" + "əgər siz göndərməmisinizsə nəzərə almayın" deyir.

**Token expire 1 saat (24 yox):** TASK-0136 invite-da 24 saat idi çünki passiv onboarding. Burada isə admin-user aktiv ünsiyyətdədir — "indi sıfırladım, bax emailinə" deyir. 1 saat kifayətdir.

---

## 2026-05-17 - TASK-0138 Admin: İstifadəçi Detail Səhifəsi

**Niyə:** Siyahıdan user-ı seçib profil, audit tarixçəsi və əməliyyatları bir yerdə görmək lazımdır. Əvvəl yalnız cədvəl var idi — admin context almadan rol dəyişirdi.

**Sensitiv sahə qoruma:** `memberProfiles` cədvəlində passwordHash yoxdur (o `users` cədvəlindədir), ona görə select-dən explicit exclude lazım olmadı. Amma yenə də named select istifadə etdim — gələcəkdə sütun əlavə olunsa avtomatik leak olmasın.

**Audit preview:** Detail page-də istifadəçiyə aid son 10 audit log göstərilir. Bu, TASK-0137-in `adminAuditLogs.targetUserId` index-indən istifadə edir — ayrıca query, join yox. Əgər log sıfırdırsa "Əməliyyat yoxdur" mesajı.

**MembersTable link:** Eye icon + "Bax" linki — mövcud cədvəl sütunlarına təsir etmir, sadəcə sonda əlavə sütun.

---

## 2026-05-17 - TASK-0137 Admin: Audit Log

**Niyə:** TASK-0135/0136 admin əməliyyatları (rol dəyiş, user yarat) izlənmirdi. Audit log olmadan "kim nə etdi?" cavabsız qalır. Sonar + OWASP 2025 standartlarına görə hər admin əməliyyatı immutable log cədvəlinə yazılmalıdır.

**OWASP 2025 riayəti:**
- Timestamp UTC (`with timezone`) — locale-independent
- Admin kimliyi (id + email) — JWT-dən gəlir
- Target kimliyi (id + email) — kimin üzərində əməliyyat edilib
- metadata jsonb — əlavə kontekst (oldRole→newRole kimi)
- Credentials HEÇ VAXT log-a düşmür (password, token, hash)
- Log immutable — DELETE endpoint YOX, UI-da silmə düyməsi YOX

**Dizayn qərarları:**
- `writeAuditLog()` utility: fire-and-forget pattern (audit failure main operation-u bloklamamalı)
- serial id (uuid yerine) — mövcud schema pattern-ə uyğundur, performans üstünlüyü
- 3 index (admin_id, action, created_at) — filter/sort performance
- Retroaktiv yazma: TASK-0135 PATCH + TASK-0136 POST artıq audit qeyd edir

**Gələcək:** `member.deleted` action hazırdır — TASK-0140 silmə endpoint-i yaradılanda avtomatik istifadə olunacaq.

---

## 2026-05-17 - TASK-0136 Admin: Manuel İstifadəçi Əlavə Et

**Niyə:** Admin paneldən istifadəçi siyahısını görmək (TASK-0134) və rol dəyişmək (TASK-0135) mövcuddur, amma yeni istifadəçi əlavə etmək yox idi. Bu, onboarding zamanı admin-in əl ilə hesab yaratmasını tələb edir.

**Seçim: OPTION B (passwordless invite):** OWASP 2025 tövsiyəsinə görə temp şifrə email-dən keçirmək pis praktikadır. Forgot-password token flow-unu yenidən istifadə etmək həm daha təhlükəsiz, həm kod duplikasiyasını aradan qaldırır. Bu pattern-i TASK-0139 (şifrə sıfırla link-i yenidən göndər) üçün də hazırlamış oluruq — task-lar bir-birini tamamlayır.

**İkili cədvəl problemi:** Platform-da `users` (auth) və `memberProfiles` (admin panel) ayrıdır. Login `users.id`-dən JWT sign edir, admin panel isə `memberProfiles`-dan oxuyur. Admin-created user hər ikisində olmalıdır. Token `passwordResetTokens` → `users.id` referans edir. Gələcəkdə bu iki cədvəl birləşdirilməlidir (tech debt).

**emailVerified = true niyə?** Login endpoint `!emailVerified` bloklayır. Admin trust model: admin email-in düzgünlüyünə cavabdehdir. passwordHash=null zaten unauthorized access-i bloklayır. User link-ə klik edib şifrə set etdikdə — email sahibliyi onsuz da sübut olunur.

**Token 24 saat:** Forgot-password 1 saatdır (user aktiv istəyir). Admin-invite isə passiv — gecə göndərilib səhər baxıla bilər.

**Email fail graceful:** User yaradılsa amma email göndərilə bilməzsə — rollback YOX. Admin-ə `emailSent: false` qaytarılır, UI-da warning göstərilir. Admin sonra resend edə bilər (gələcək feature).

---

## 2026-05-17 - TASK-0135 Admin Role Management

**Niyə:** TASK-0134 ilə admin paneldə real istifadəçi siyahısı canlıdır. Adminin digər istifadəçilərin rolunu UI-dan dəyişə bilməsi lazımdır (member ↔ admin).

**Nə dəyişdi:** PATCH `/api/admin/members/[id]` endpoint yaradıldı — JWT auth, self-role protection (öz ID-nə 403), valid role check. MembersTable-da rol sütununa select dropdown əlavə edildi — cari admin-in öz sətirində badge-only (disabled, tooltip ilə). Local state optimistic update + error toast. 4 dil i18n tam (`dashboard.members.roles.*`).

**Dizayn qərarı:** Self-role protection həm API-da (403), həm UI-da (disabled select → badge) tətbiq olundu. İkili qat: frontend yanlışlıqla göndərsə belə backend bloklayır. `currentUserId` əlavə API sorğusu əvəzinə GET members response-una əlavə edildi (1 fetch = members + stats + currentUserId).

**Dərs:** Admin role dəyişikliyi təhlükəli əməliyyatdır — self-protection olmadan admin özünü kilidləyə bilər. Həmişə "özünə" qaydası əlavə et.

---

## 2026-05-16 - TASK-0134-FIX Validator Block Resolution

**Niyə:** PR #134 dk-validator tərəfindən BLOCK edildi: (1) E2E spec-də `/${locale}/dashboard/users` istifadə olunurdu — dashboard route-ları locale-independent-dir; (2) Component içində inline pageCopy obyekti L-004 pozuntusudur.

**Nə dəyişdi:** E2E spec-dən locale prefix silindi (`/dashboard/users` birbaşa istifadə), page.tsx + MembersTable.tsx-dəki bütün UI mətnləri `messages/*.json` fayllarına `dashboard.members.*` namespace altına köçürüldü, component-lərdə `useTranslations('dashboard.members')` istifadə edilir. 4 dil (az/en/ru/tr) tam.

**Dərs:** Dashboard route-ları Next.js app router-da `app/dashboard/` altındadır, `app/[locale]/dashboard/` yox. E2E spec-lər real routing strukturuna uyğun yazılmalıdır. Inline UI mətnləri nə qədər kiçik olsa da messages/*.json-a getməlidir — validator L-004 qaydası istisnasızdır.

---

## 2026-05-15 - TASK-0127 Food Cost Calculator Repair

**Niye:** PR #126 TASK-0127-ni tamamlanmis kimi merge etdi, amma main-de sadece task card var idi. `app`, `components`, `lib` altinda `yemek-xerci` implementasiyasi yox idi.

**Ne deyisdi:** `yemek-xerci` Marketinq Ocagi live SAGIRD tool kimi elave edildi. Client-side resept karti, coxlu mehsul setri, trim loss, porsiya maya deyeri, food cost %, ideal qiymet, CSV ve Excel export hazirlandi. API/AI route elave edilmedi.

**Ders:** Task card merge etmek feature merge etmek deyil. Bundan sonra acceptance criteria konkret route + ekran + klikli yoxlama ile baglanmalidir.

---

## 2026-05-14 - TASK-0125 Readability Fix

**Niye:** Sikayet Analitigi screenshot-da info box metni oxunmurdu, eyni mesaj ikinci sari blokda tekrar olunurdu, Menbe/date sutunlari dar gorunurdu. Menyu Analitigi ve diger marketing tools info box pattern-i de eyni kontrast problemini dasiyirdi.

**Ne deyisdi:** 7 marketing tool-da "Niye bu vacibdir?" info box blue contrast card-a kecdi. Sikayet duplicate warning silindi, Menbe select genislendi, backend-compatible source value-lari saxlanildi, date secilende DD.MM.YYYY label gosterilir.

**Ders:** Screenshot-da gorunen oxunurluq problemi production-critical UX bug-dur; content dogru olsa da kontrast ve grid onu istifade olunmaz ede biler.

---

## 2026-05-14 - TASK-0124 Quick UX Wins (Senbe pitch hazirligi)

**Niye:** 16 May yatirimci pitch ucun 14 May screenshot-larinda gorunen UX surtunmeleri temizlendi: Gross Margin AZ istifadecisi ucun aydin deyildi, Working Capital yox idi, date format browser default idi, Menyu input placeholder-leri kesilirdi.

**Ne deyisdi:** Promosyon ROI AZ terminology + tooltip + Stok Tamponu + Working Capital output, Sikayet DD.MM.YYYY display, Menyu responsive input grid + BCG izahi, Sezon Planlama premium optional fields quick render.

**Ders:** Yerli istifadeci ucun dil tercumesi kifayet deyil; termin ve cash-flow mentiqi de lokallasmalidir.

---

## 2026-05-14 - TASK-0123 Brain Foundation

**Niyə:** Sezon Planlama TASK-0122 sonra işləyirdi, amma çıxış ümumi AI cavabı səviyyəsində qalırdı. Bu task Doğan Dersleri, KAHI nümunələri və 2026 trendlərini təkrar istifadə edilən brain modulu kimi qurur.

**Yaranır:** `lib/marketing-tools/_brain/` modulu - Dogan Dersleri, KAHI examples, 2026 trends, methodology, AZ teqvim. Marketing alətlər `buildBrainContext(slug)` ilə uyğun hissələri prompt-a inject edə bilir.

**Sezon Planlama:** Schema yeni strateji sahələrlə genişləndi: `executiveSummary`, `methodology`, `doganRule`, `aeoRecommendations`, `risksWatchout`. Legacy quick-view sahələri saxlandı ki, TASK-0125 frontend render gələnə qədər mövcud kartlar qırılmasın.

**Dərs:** Premium AI cavabı yalnız JSON key alignment deyil; domain brain + struktur + frontend render ayrıca fazalarla getməlidir.

---

## 2026-05-14 - TASK-0122 Faza 2 (REAL FIX)

**Kok sebeb:** TASK-0122 Faza 1 debug log-u gosterdi ki, DeepSeek AZ acarlar (kampaniya_takvimi, tovsiyeler) qaytarir, Zod schema EN acarlar (calendar, topRecommendations) gozleyir. PR #117-den beri uyğunsuzluq var idi.

**Fix:** Inline Sezon Planlama prompt-a strict English JSON structure telebi elave edildi. Schema deyismir.

**Ders:**
1. Schema/Prompt eyni anda yoxlanmalidir.
2. Her yeni marketing tool ucun prompt-da JSON numunesi mutleqdir.
3. Faza 1 debug olmadan korleme fix riski cox yuksekdir.

**TODO:** 6 diger marketing tool yoxlanilmalidir — eyni problem ola biler.

---
## 2026-05-14 - TASK-0122 Faza 1

**Problem:** TASK-0120 (PR #119) deploy oldu, amma istifadeci `ai-output-invalid` aldi. DeepSeek call success qaytardi, Zod parse fail oldu.

**Faza 1:** Raw output capture deploy edilir. Dogan submit edib real DeepSeek output-u ve Zod error-u alacaq.

**Faza 2:** Real output elde edildikden sonra schema/prompt align edilecek.

**Ders:** "JSON mode bunu toparlar" varsayimi PR #119-da yanlis idi. DeepSeek valid JSON verir, amma Zod schema-ya birebir uygunluq garanti yoxdur.

---
## 2026-05-13 - TASK-0120

**Problem:** Sezon Planlama 502 davam edirdi (PR #117 + #118 sonrasi).
**Diaqnoz:** `/tmp/TASK-0114-DIAGNOSE-RAPORT.md` - non-streaming + proxy timeout + 3000 token output.
**Fix:** AI router streaming + AbortController timeout + DeepSeek JSON mode. Schema sert geri qaytarildi.
**Ders:** Schema gevsedilmesi simptom ortmesi idi. Kok sebeb diaqnozu edilmeden eyni problem tekrar ede bilerdi.

---

Sessiya qeydləri. Hər iş sessiyasının nəticəsi burada.

---

## 2026-05-10 — KST Yoxlayici Live (TASK-0103)

**Problem:** SAGIRD pillesinde 2-ci alet lazimdir. Marka Kompasi bazardaki yeri verir, KST ise daxili real veziyyeti olcur.

**Hell:**
1. API endpoint `app/api/marketing-tools/kst-yoxlayici/route.ts` — Marka Kompasi pattern ile eyni
2. Reusable `LikertScale` komponenti `shared/` qovlugunda — memo-optimized, gelecek aletler ucun
3. `KSTQuestionnaireForm` — 30 sual, 3 section accordion, useReducer state, progress bar
4. `KSTResultCard` — overall skor, 3 kateqoriya, benchmark muqayise, 3 kritik problem, 30 gunluk plan
5. `KSTYoxlayiciPage` — MarkaKompasiPage ile eyni orchestrator pattern (loading/form/result)

**Marka Kompasi dersinden:**
- `callAIJson` `{ data, meta }` qaytarir (meta.provider, meta.tokensUsed, meta.costAzn)
- Auth: `getAuthFromCookie()` → `JwtPayload` (userId, email, role)
- Dashboard i18n: inline copy pattern (useTranslations istifade olunmur)

**Build:** PASS
**Novbeti:** TASK-0104 — GBP Qurucu ve ya Gorunurluk Testi

---

## 2026-05-09 — Marka Kompasi Live (TASK-0102)

**Problem:** Marketinq Ocagi 12 aletden ibaret toolkit idi, lakin hec biri canli deyildi. Marka Kompasi butun diger aletlerin kontekst menbeyi oldugu ucun ilk implement edilmeliydi.

**Hell:**
1. API endpoint `app/api/marketing-tools/marka-kompasi/route.ts`:
   - POST: zod input validation → gating check → Claude AI call (callAIJson) → zod output validation → DB insert
   - GET: son ugurlu run-u qaytarir (history)
   - Auth: `getAuthFromCookie()` JWT pattern istifade edildi
   - Error handling: AI fail → DB-de `status: 'error'` + `errorMessage` yazilir

2. UI komponentleri (3 fayl):
   - `MarkaKompasiPage.tsx` — orchestrator (loading → form → result state machine)
   - `QuestionnaireForm.tsx` — 5 sual (3 select + 1 textarea + 1 text input)
   - `ResultCard.tsx` — tagline (copy button), ICP, value prop, differentiators, useThisIn

3. `[slug]/page.tsx` yenilendi: `slug === 'marka-kompasi' && status === 'live'` → MarkaKompasiPage render
4. Config update: `status: 'planned'` → `'live'`, field adlari spec-e uygunlasdirildi

**Sprint 1 infra istifade:**
- `callAIJson<T>()` — AI router isledi, meta (provider, tokens, cost) qaytardir
- `checkToolAccess()` — gating isledi, `mapPlanToTier()` ile MemberPlan→MarketingToolTier cevirme
- `marketingToolRuns` schema — DB insert/update isledi, nullable `db` check var
- `getToolConfig()` — config-den slug ile tool tapma

**Qerar:** `zod` dependency elave edildi (validation ucun). `dependencies`-e qoyuldu (Hostinger dersi).

**Build:** PASS
**Protected violations:** 0
**New TS errors:** 0

**Novbeti:** TASK-0103 — KST Yoxlayici (SAGIRD, ikinci alet)

### TASK-0102 netice (2026-05-10)
- Sprint 2 tam tamamlandi
- Marka Kompasi canlidir: /dashboard/marketinq-ocagi/marka-kompasi
- Ilk run: user_id=13, status=success, ai_provider=deepseek (Claude fallback),
  tokens=760, cost=0.000228 AZN, completion=5s
- Fallback mexanizmi production-da test edildi, isleyir
- Novbeti: TASK-0103 (KST Yoxlayici) — SAGIRD pille, ikinci alet

### Cetinlikler ve dersler
- Sprint 1 spec-de is_premium column elave edilmesi planlanmisdi, lakin
  agent qisa yoldan getdi (mapPlanToTier shortcut). TD-001 yaradildi,
  Stripe inteqrasiyasina qeder nezere alinmir.
- Pre-commit/pre-push hook ile main-e direct push qadagasi, her
  deyisiklik ucun PR — bu standart isledi, qoruyucu subut oldu.
- AI fallback (Claude→DeepSeek) esl production sinaginda ilk defe
  test edildi, problemsiz kecdi.

---

## 2026-05-09 — Marketinq Ocagi Faza 0 Infrastructure (TASK-0101)

**Problem:** DK Agency platformasinda restoran sahiblari ucun marketinq aletleri yox idi. Movcud toolkit (food cost, P&L, checklist) emeliyyat fokusludur. Marketinq — SMM, branding, reqib analizi, AEO — tamam bos idi.

**Kok sebeb:** Marketinq alet kategoriyasi hec vaxt planlanmamisdi. "Marketinq el kitabi 2023" senedi B2C doner brendi ucun yazilibdi, yeni B2B HoReCa vizyonuna uygun deyildi.

**Hell:**
Sprint 1 (Faza 0) — yalniz infrastruktur, hec bir alet implement edilmir:

1. `lib/marketing-tools-config.ts` — 12 aletin single source of truth konfiqurasiyasi
   - 4 kateqoriya: Gorunurluk, Kontent, Strateji, Reputasiya
   - 3 pille: SAGIRD (pulsuz, 4 alet), KALFA (49 AZN, +5), USTA (149 AZN, +3)
   - Her aletin slug, AI provider, input schema, run limiti var
   - `getToolConfig()`, `getToolsByTier()`, `canAccessTool()` helper-leri

2. `lib/ai-router.ts` — vahid AI gateway
   - DeepSeek primary, Claude fallback (Sarmal anti-pattern yasaq)
   - `callAI()` ve `callAIJson<T>()` funksiyalari
   - Token tracking + AZN cost hesablama
   - Movcud KAZAN AI route-undan model/baseUrl pattern-i oyrenilib

3. `lib/marketing-gating.ts` — tier erisim kontrolu
   - `MemberPlan` → `MarketingToolTier` mapping (free→sagird, member→kalfa, admin→usta)
   - Ayliq run limit check (DB query ile)
   - `db` null check (Neon baglantisi olmadiqda graceful degrade)

4. `lib/db/schema.ts` — `marketing_tool_runs` cedveli
   - userId, toolSlug, inputData (jsonb), outputData, aiProvider, tokensUsed, costAzn, status
   - 3 index: user, slug, createdAt

5. Dashboard sehifeleri
   - `/dashboard/marketinq-ocagi` — 12 kart, 4 kateqoriya, 4 dil inline copy
   - `/dashboard/marketinq-ocagi/[slug]` — placeholder ("Tezlikle")
   - Sidebar-a Sparkles icon ile yeni entry (4 dil)

6. i18n — `messages/az.json`-a `marketing.*` acarlari elave edildi

**Spec-den ferqler:**
- Spec `/[locale]/ocaq/marketinq-ocagi/` isteyirdi → real codebase `/dashboard/` istifade edir (i18n middleware-den xaric), ona uygunlasdirildi
- Spec `messages/az/marketing.json` isteyirdi → real struktur tek `messages/az.json` faylidir, nested keys elave edildi
- Spec `drizzle/schema/marketing-tools.ts` isteyirdi → real schema tek `lib/db/schema.ts` faylidir, ora elave edildi

**Cetinlikler:**
- `db` exportu nullable (`neon` connection yoksa null) — gating-de null check lazim oldu
- `sql` adi drizzle-orm import ile `@neondatabase/serverless` import-u toqqusudu — `dsql` alias istifade edildi

**Build:** PASS
**Protected violations:** 0
**Encoding issues:** 0
**Yeni TS xetalari:** 0 (movcud 7 xeta evvelden var)

**Novbeti:** TASK-0102 — Marka Kompasi tam implementasiya (5 sual UI + Claude AI cagirisi + JSON output)

---

## 2026-05-07 — Password Reset Real DB + Deployment Docs (TASK-0078, TASK-0081)

**Problem:** Audit (5 May) qeyd etdi ki forgot-password və reset-password route-ları mock-state istifadə edir. Server restart-da bütün tokenlar itir. Production-da işləmir.

**Kök səbəb:** İlkin development zamanı `lib/auth/mock-state.ts` ilə yazılmışdı, login/register real DB-yə keçirilmişdi amma forgot/reset keçirilməmişdi.

**Həll:**
1. `app/api/auth/forgot-password/route.ts` — Drizzle DB ilə yenidən yazıldı (register pattern)
2. `app/api/auth/reset-password/route.ts` — Drizzle DB ilə yenidən yazıldı (bcrypt + token validation)
3. `RATE_LIMITS.authResetPassword` əlavə edildi (5/saat/IP)
4. `docs/DEPLOYMENT.md` yaradıldı — tam deploy bələdçisi

**Build:** PASS
**Protected violations:** 0

---

## 2026-05-03 — Auth Frontend Fix (TASK-0022)

**Problem:** Login/register formları köhnə `/api/member/auth` endpoint-inə gedirdi (400 error), locale auth route-ları 404 qaytarırdı, password input-larda autocomplete yox idi.

**Həll:**
1. Login form: `/api/member/auth` → `/api/auth/login` (JWT response ilə MemberSession yaradılır)
2. Register form: `/api/member/auth` → `/api/auth/register` (verificationRequired flow)
3. Locale wrappers: `app/[locale]/auth/login/page.tsx` + `register/page.tsx` yaradıldı
4. Autocomplete: `current-password` (login), `new-password` (register + reset)

**Commits:**
- `ae740ae` — fix(auth): update login/register form endpoints
- `6ea8320` — feat(auth): add locale route wrappers for login/register
- `82972a7` — fix(auth): add autocomplete attributes to password inputs

**Build:** PASS (26.6s)
**Protected violations:** 0
**Encoding issues:** 0
## 2026-05-09 — TASK-0100: P&L Simulator Pattern C → A

**Changed:**
- P&L Simulator copy moved to `messages/*.json` under `toolkit.pnl`.
- Component now uses `useTranslations('toolkit.pnl')` and `useLocale()`.
- Currency and percent output use `Intl.NumberFormat`.
- Inputs parse locale-aware decimal formats for AZ/RU/TR and EN.
- Added Playwright smoke coverage for the P&L simulator in 4 locales.

**Out of scope:** other toolkit calculators, migrations, protected files.

## 2026-06-12 - TASK-0304: News editor spine

**Changed:**
- Removed the separate news-list edit modal.
- Added `/dashboard/xeberler/[id]` and locale mirror routes backed by the existing shared `NewsEditorForm`.
- Added complete edit PATCH mapping, article deletion, and cover image removal from the same page.
- Guarded the server edit page with the existing admin member-session contract.
- Preserved manual source markers during edit saves.

**Verification:**
- `npm run lint`: 0 errors.
- `npm run build`: PASS; both edit routes appear in the Next.js route inventory.
- Local production smoke: edit routes returned expected `307` redirects and admin GET/PATCH/DELETE returned `403` without a session.
- DK validator: PASS 8/8 via `C:\Program Files\Git\bin\bash.exe scripts/dk-validate.sh`.
- Repo-wide strict `tsc`: still fails on documented pre-existing debt outside TASK-0304; no TASK-0304 file appeared in the error list.

**Out of scope:** ingestion pipeline, RSS changes, database migration, protected files.

## 2026-06-12 - TASK-0305: News detail 500 root-cause hotfix

**Root cause:**
- `getNewsArticleBySlug` directly selected two columns that existed in Drizzle schema but not in production Neon.
- Render-level optional chaining could not catch the database SELECT failure.

**Changed:**
- Optional related-toolkit fields now use schema-compatible `to_jsonb` expressions.
- Added the missing additive/idempotent SQL migration.
- Added a favicon redirect route to remove the unrelated `/favicon.ico` 404.

**Proof:**
- The affected Subway row exists and is approved.
- Old live detail route: HTTP 500.
- New query against the same DB: article found with an empty toolkit array.
- Local Next detail route: HTTP 200; production build PASS; DK validator PASS 8/8.

**Out of scope:** Browser-extension message-channel warnings; these are not emitted by the application.
