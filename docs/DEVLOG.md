# DK Agency Platform — Dev Log

## 2026-06-19 — TASK-0410 (F2.8: Sektor dynamic [slug] route — generateStaticParams)

**Problem:** Dinamik `[slug]` sektor route-u `generateStaticParams` export etmirdi — Next.js build zamanı slug-ları statik olaraq pre-render etmirdi.

**Fix:** `app/[locale]/sektor/[slug]/page.tsx`-ə `generateStaticParams()` əlavə edildi — `VALID_SEKTOR_SLUGS` (qonaq-evi, otel, restoran, kafe) map olunur. Build keçdi, 5 route 200, invalid slug 404.

**Qeyd:** F2.8 sprint-in əsas işi (config sistemi, builder, 4 sektor config, SektorLanding, index page, i18n, OG image, not-found, root mirrors) əvvəlki session-da tamamlanmışdı. Bu commit yalnız `generateStaticParams` boşluğunu bağlayır.

## 2026-06-09 — TASK-0242 (Blog: strukturlu Doğan notu + Guru qutuları route-a bağlandı)

**Problem:** Yeni yayınlanan bloq yazısında ("Süni İntellekt çağında franchise…") guru qutusu və Doğan notu görünmürdü — "field by field doldururuq amma çıxmır". Araşdırma: editor (`BlogEditorForm.tsx`) `doganNote` (textarea) + `guruBoxes` (5-ə qədər guru/quote/book) sahələrini toplayır; API (`/api/blog/[slug]`) DB-yə yazır; `mapDbArticle` (blog-repository.ts:101,103) `doganNote` + `guruBoxes` qaytarır. **Amma** public render `app/[locale]/blog/[slug]/page.tsx` yalnız `MarkdownRenderer content` çağırırdı — strukturlu sahələri heç istifadə etmirdi. Köhnə yazılarda qutular markdown mətninə (ASCII `╔║`, `### guru kutusu`, `> 📝 Doğan notu`) gömülmüşdü, ona görə MarkdownRenderer onları tuturdu. Strukturlu sahələrlə yazılan yeni yazılar boş çıxırdı.

**Fix:** `app/[locale]/blog/[slug]/page.tsx` — markdown-dan sonra `article.guruBoxes.map(GuruQuoteBox)` + `article.doganNote → DoganNote` render olundu. Barrel-dən (`components/blog/index.ts`) import. Root-mirror `app/blog/[slug]/page.tsx` re-export olduğu üçün avtomatik miras alır. Markdown marker yolu (MarkdownRenderer) toxunulmadı — additiv dəyişiklik, köhnə yazılar pozulmur.

**Diaqnoz qeydi (404 ayrı):** `/blog/suni-i-ntellekt-...` 404 verir. Route dinamikdir (`generateStaticParams`/`dynamic` yox), `getBlogPostDetail` status filtri olmadan slug-la sorğu edir → 404 yalnız o halda olur ki URL slug DB-dəki slug-la üst-üstə düşmür (ya prod-da DB env düşüb statik fallback olur). Həmçinin `slugify` (BlogEditorForm.tsx:59) böyük **İ** hərfini idarə etmir: `"İ".toLowerCase()` → `i`+U+0307 (birləşən nöqtə) → regex `-`-ə çevirir → `suni-i-ntellekt`. Slug fix bu sessiyada tətbiq EDİLMƏDİ (sahibin qərarı) — açıq qalır.

## 2026-06-04 — TASK-0197 (F2.7: Sektor Analytics + OG Image + OTA PDF)

**Problem:** F2.6 sektor landing hazir idi amma: (1) hec bir user interaction olculmurdu, (2) social share-de image yox idi, (3) lead capture PDF vermir, sadece email notification gonderirdi.

**Fix:**
1. `lib/analytics/sektorEvents.ts` — `trackSektorEvent({ sektor, action, label?, faqIndex? })` wrapper, Yandex Metrica `reachGoal` API istifade edir
2. 5 sektor komponentine `sektorSlug` prop + onClick/onSubmit tracking elave edildi (SektorHero, SektorLeadCapture, SektorToolGrid, SektorFaqAccordion, SektorFooterCta)
3. `app/[locale]/sektor/qonaq-evi/opengraph-image.tsx` — Next.js `ImageResponse` ile dinamik 1200x630 PNG (dark theme, DK branding, 3 tool badge)
4. `lib/data/otaGuide.ts` — 8 bolmeli OTA beledcisi content SSOT (bazar datasi, foto hazirligi, qiymet strategiyasi, review idareetmesi, WhatsApp sablonlari, ROI numunesi)
5. `lib/pdf/otaGuidePdf.ts` — server-side jsPDF generator: branded cover page + content pages + CTA page, `sanitize()` ile Azerbaycan herfleri
6. `lib/email/smtp.ts` — `EmailAttachment` interface, `sendSmtpEmail()` indi attachments qebul edir
7. `app/api/lead/ota-guide/route.ts` — lead submit-de PDF generate + user email-e attachment kimi gonderilir

**Key decisions:**
- jsPDF secildi (Puppeteer yerine) — artiq package.json-da, audit-pdf.ts-de subut olunub, Hostinger-de problem yaratmir
- Event-ler generic: `sektor_{slug}_{action}` formati — gelecek sektor sehifeleri ucun reusable
- DB enum migration bu sprint-e daxil edilmedi — `toolSource: 'consulting'` + `score.source: 'ota_guide_pdf'` JSONB yanasmasi saxlandi

**PR:** #280

## 2026-06-03 - TASK-0186 (AI Franchbook Generator)

**Problem:** Franchise funnel needed a monetizable USTA product after free readiness/ROI/buyer tools.

**Fix:**
1. `franchbook_projects` table + migration `0011_franchbook_projects.sql`
2. `lib/data/franchbookOutline.ts` - fixed AFA Akademiya outline SSOT
3. `FranchiseQuiz` now supports score quizzes and wizard input flows
4. `POST/PATCH /api/franchise/franchbook` - JWT owner binding, USTA gate, DB save, edit save
5. `lib/ai/franchbookGenerator.ts` - fixed-section AI generation with schema validation
6. `/franchise/francbuk-generatoru` + locale route - wizard, editor, markdown export
7. 4-language Pattern A namespace: `franchise.franchbook`

## 2026-05-30 — TASK-0112 (admin activation funnel widget)

**Problem:** Event veriləri var amma admin heç bir funnel görüntüsü yoxdur.
Crunchtime raporu "ilk gündən KPI set" deyirdi.

**Fix:**
1. `lib/admin/funnelQuery.ts` — CTE ilə 4 stage aggregation (registered → priorities → tool click 24h → D7 return)
2. `components/dashboard/ActivationFunnelWidget.tsx` — server component, 4 bar + benchmark note
3. `app/dashboard/funnel/page.tsx` — admin-only role gate (non-admin → redirect /dashboard)
4. DashboardSidebar-ə "funnel" nav item əlavə edildi (BarChart3 icon)
5. 4 dildə i18n: AZ/EN/RU/TR — sidebar nav + widget copy inline

## 2026-05-30 — TASK-0111 (user events foundation: schema + API + instrumentation)

**Problem:** Adoption loop ölçülmür — modal açılış, prioritet seçim, tool click, nudge
engagement heç yerdə qeyd olunmur. Funnel kordur.

**Fix:**
1. `user_events` cədvəli yaradıldı (schema.ts + migration 0008)
2. `lib/data/userEvents.ts` — 7 event type SSOT
3. `lib/user/events.ts` — server-side fire-and-forget logEvent()
4. `POST /api/user/events` — JWT auth + 10/dəq rate limit
5. `lib/track.ts` — client-side fire-and-forget tracker
6. Instrumented: OnboardingModal (modal_opened, priorities_set, priorities_skipped),
   RecommendationWidget (tool_recommended_clicked), NudgeBanner (nudge_shown/clicked/dismissed)

## 2026-05-30 — TASK-0110 (gate hygiene: OOM fix + Playwright @smoke wire-up)

**Problem:** dk-validate.sh #233-də OOM ilə çökdü (build 4096MB heap ilə çalışırdı).
Playwright check 8 yalnız dəyişən spec-ləri test edirdi — @smoke suite yox idi.

**Fix:**
1. `NODE_OPTIONS='--max-old-space-size=8192'` export dk-validate.sh-ə əlavə edildi
2. Build check birbaşa `node --max-old-space-size=8192` ilə çağrılır (package.json bypass)
3. `e2e/smoke.spec.ts` yaradıldı — 4 @smoke test (GET /, login, ilanlar, API gating)
4. Check 8 indi HƏMİŞƏ @smoke suite çalışdırır (dəyişən fayldan asılı deyil)
5. CLAUDE.md DoD: maddə 11 əlavə — "8/8 PASS məcburi, skip izahla"

## 2026-05-29 — TASK-B-FIX (sector API filter + response fix)

**Kök səbəb:** E2E smoke test-də sektor filter "No listings match" qaytarırdı.
3 nöqtə missing idi:
1. `ListingFilters` interface-də `sector` yox idi
2. `getListings()` sector-a görə filter etmirdi
3. `mapDbListing()` response-a `sector` field daxil etmirdi
4. API GET handler `sector` query param-ı oxumurdu

**Fix:** 2 fayl, 4 sətir — `listings-repository.ts` + `route.ts`

## 2026-05-29 — TASK-B (sector select + filter + badge)

**Qərar 1 — Sector SELECT formanın Step 2-sinə**
CreateListingForm Step 2-yə `sector` select əlavə edildi. Şəhər/rayon ilə eyni grid-də.
FormState-ə `sector` field, validation-a "Sektor seçilməlidir" əlavə edildi.
API POST artıq sector-u qəbul edirdi (#224) — yalnız frontend bağlama lazım idi.

**Qərar 2 — Filter UI pattern: pageCopy inline (b2b) + useTranslations (showcase)**
Public showcase (ListingsShowcasePage) useTranslations Pattern A istifadə edir → `filterAllSectors` key 4 dildə messages/*.json-a əlavə edildi.
B2B ilanlarım pageCopy pattern istifadə edir → `allSectors` key inline 4 dildə əlavə edildi.
Sector label-ları: getSectorLabel(key, locale) — listingSectors.ts SSOT-dan gəlir, duplicate yox.

**Qərar 3 — Badge: ListingCard + admin table + b2b row**
ListingCard-da category badge-nin altında sector badge (bg-white/90 blur).
Admin ilanlar table-ına sector column (category-dən sonra).
B2B ilanlarım row-da category label-dən sonra sector badge.
Null sector → dash (—) göstərilir, köhnə elanlar sınmır.

**Qərar 4 — Mock data əhatəsi**
12 mock listing-ə sektor: 6×restoran, 3×fast-food, 1×kafe, 1×catering, 1×diger.

## 2026-05-29 — TASK-A (dk-validator blocking gate)

**Problem:** Son 3 PR-da (#222, #223, #224) dk-validator 8-check çıxışı görünmürdü.
dk-validator yalnız manual subagent idi — heç vaxt avtomatik tetiklənmirdi.

**Qərar 1 — Stop hook genişləndirildi (5/8 check)**
`pre-commit-gate.sh` 3 check-dən 5-ə artırıldı:
- Check 4: Auth contract (auth.id → auth.userId enforcement)
- Check 5: DB schema naming (input → inputData enforcement)
Cədvəl formatında çıxış, PASS/BLOCK verdict.

**Qərar 2 — Standalone dk-validate.sh (8/8 check)**
`scripts/dk-validate.sh` yaradıldı, `npm run dk:validate` ilə işlədilir.
Dev server çalışırsa 8/8 check, çalışmırsa 5/8 + 3 SKIP.

**Qərar 3 — DoD + PR template yeniləndi**
CLAUDE.md DoD-a madde 9 (dk-validator PASS məcburi) və 10 (audit:system) əlavə edildi.
PR template-ə dk-validator çıxışı bölməsi əlavə edildi.

## 2026-05-27 — TASK-0178A (ŞAGIRD Tool Descriptions)

**Qərar 1 — Kod oxumasına əsaslanan content (L-023)**
Hər alətin source code-u oxundu, GERÇEK input/output əsasında description
yazıldı. Marka Kompası 5 sual + April Dunford positioning, KST 30 likert
+ 30 gün plan, Yemək Xərci reçete card + trim loss + CSV export.

**Qərar 2 — ToolDescription reusable component**
Collapsible accordion, `toolKey` prop ilə hər toolkit page-ə əlavə olunur.
KALFA/USTA tier üçün eyni component istifadə olunacaq.

## 2026-05-27 — TASK-0176A (KAZAN Context-Aware Greeting)

**Qərar 1 — Auto-greeting (seçim A)**
Kullanıcı P&L Simulator-dan KAZAN-a keçdikdə, URL query param-ından
metrics decode olunur və KAZAN özü danışmağa başlayır. Kullanıcı "food
cost nədir" yazmağa ehtiyac yoxdur — veri artıq əldədir.

**Qərar 2 — System prompt injection**
DeepSeek/Claude API call-ına metrics system context olaraq inject olunur.
AI cavablarında bu spesifik rəqəmlərə referans verir, ümumi məsləhət yox.

**Qərar 3 — Sanity check**
İmkansız rəqəmlər (food_cost>60%, net_profit<-30%, rent>25%, sum>100%)
aşkarlandıqda xəbərdarlıq mesajı göstərilir: "hesablamada xəta ola bilər".

**Qərar 4 — TranslatorFn type**
next-intl `Translator` tipi generikdir və birbaşa `(key: string) => string`
ilə uyğun gəlmir. `any` cast ilə həll — pragmatik yanaşma.

## 2026-05-27 — TASK-0175 (Yandex Metrica — Senaryo B)

**Qərar 1 — KVKK L-024: consent-first analytics**
Yandex Metrica yalnız CookiesBanner-dən "Qəbul edirəm" seçildikdən sonra
initialize olunur. Default vəziyyət: script yüklənmir. localStorage-dəki
`dk-cookie-consent.accepted === true` yoxlanır. Reject edilsə → heç bir
tracking yox.

**Qərar 2 — Senaryo B tətbiqi**
Discovery audit: env var mövcud, cookie consent UI mövcud, amma initialization
layer yox idi. Yeni fayllar: yandex-metrica.ts (helper), events.ts (taxonomy),
YandexMetricaInit.tsx (consent-aware init + pageview tracking).

**Qərar 3 — CookiesBanner-dən Hotjar çıxarıldı**
Hotjar heç quraşdırılmamışdı — placeholder toggle idi. Yandex Metrica ilə
əvəz olundu (eyni UX slot — analytics toggle).

**Qərar 4 — CSP genişləndirildi**
script-src və connect-src-yə mc.yandex.ru, mc.yandex.com, mc.webvisor.org
əlavə olundu. Olmasa Yandex script CSP tərəfindən bloklanacaqdı.

## 2026-05-27 — TASK-0174 (Weekly Actions Panel)

**Qərar 1 — Sector benchmarks hardcoded**
AZ HoReCa benchmarkları recommendation-engine.ts-ə hardcoded: food_cost OK ≤32%,
labor_cost OK ≤25%, net_profit OK ≥12%, rent OK ≤8%. Bunlar Crunchtime AI
Buyer's Guide + DK Agency sektor təcrübəsindən gəlir. Gələcəkdə admin panel-dən
konfiqurasiya oluna bilər.

**Qərar 2 — Mövcud toolkit slug-ları istifadə**
8 action-dan hamısı mövcud toolkit slug-larına (`food-cost`, `basabas`,
`menu-matrix`, `staff-retention`) map edildi. Mövcud olmayan slug-lar
(recipe, supplier, waste, portion, price, revenue) əvəzinə ən yaxın
mövcud alət istifadə olundu. comingSoon flag hazırdır amma hələ false.

**Qərar 3 — All-good state**
Bütün metrikalar OK olduqda boş panel göstərilmir — yaşıl "Əla vəziyyətdə"
kartı göstərilir. UX yaxşıdır: istifadəçi bilir ki heç bir problem yoxdur.

## 2026-05-27 — TASK-0173 (AI Readiness Score wizard)

**Qərar 1 — Wizard pattern (1 sual/ekran)**
Bütün 10 sualı 1 səhifədə göstərmək UX-i zəiflədərdi. 1 sual/ekran wizard
pattern-i seçildi: progress bar, geri/irəli düymə, seçim saxlanır. Mövcud
`CreateListingForm.tsx` 5-step pattern referans alındı, amma ayrı component
olaraq quruldu (reuse deyil, kontekst fərqli — L-020).

**Qərar 2 — Score config ayrı fayl**
`lib/ai-readiness-score-config.ts` — 10 sual, 3 seqment, scoring funksiyası.
Component-dən ayrıdır ki gələcəkdə API-da da istifadə oluna bilsin (KAZAN
kontekst ötürmə). translationKey pattern — component yalnız i18n key bilir.

**Qərar 3 — Dynamic import (ssr: false)**
Wizard client-side interactivity tələb edir. `dynamic(() => import(...), { ssr: false })`
homepage ilk yüklənmə sürətini qoruyur — wizard yalnız browser-da render olunur.

**Qərar 4 — Segment seqment rengleri SVG-dən**
ScoreCircle rəng seqmentə görə dəyişir: red (<37%), amber (37-70%), green (>70%).
CSS var fallback ilə — design token olmasa hardcoded hex işləyir.

## 2026-05-26 — TASK-0168-C (UI consent checkbox)

**Qərar 1 — 1 checkbox, 2 link (UX)**
Ayrı-ayrı "Terms qəbul" + "Privacy qəbul" checkbox əvəzinə 1 birləşmiş
checkbox: "Mən {terms} və {privacy} ilə razıyam." İstifadəçi 1 click ilə
hər ikisini qəbul edir. API-ya `termsAccepted: true` + `privacyAccepted: true`
eyni anda göndərilir.

**Qərar 2 — Marketing ayrı (KVKK)**
KVKK tələbi: marketing razılığı şərtlər razılığından ayrı olmalıdır. Optional
checkbox, default false, ayrı state.

**Qərar 3 — target="_blank" + noopener**
Legal linklər yeni tab-da açılır — istifadəçi form datanı itirməsin. Security:
`rel="noopener noreferrer"` əlavə edildi.

## 2026-05-26 — TASK-0168-B Zod upgrade (follow-up)

**Qərar 1 — Zod z.literal(true) strict validation**
İlk PR manual `if` validation istifadə edirdi. Spec Zod tələb etdi:
`z.literal(true)` yalnız boolean `true` qəbul edir — `false`, `undefined`,
`"true"` string hamısı reject olunur. Manual `=== true` eyni nəticə verir
amma Zod digər field-ləri (email, password, name) də validasiya edir.

**Qərar 2 — CONSENT_VERSION centralized**
`lib/legal/consent-version.ts` — tək source of truth. Server-side const,
client manipulyasiya edə bilməz. İlk PR body-dən oxuyurdu (security risk).

**Qərar 3 — Zod 4 API fərqləri**
Repo Zod 4.4.3 istifadə edir. Zod 4-də:
- `z.literal(true, { errorMap })` dəstəklənmir → düz `z.literal(true)`
- `error.errors` yoxdur → `error.issues` istifadə et
- `error.flatten()` mövcuddur (repo pattern ilə uyğun)
Field-specific AZ error mesajları manual mapping ilə əlavə olundu.

## 2026-05-26 — TASK-0168-A (DB consent fields)

**Qərar 1 — 6 field, 7 yox**
Privacy version ayrı saxlanmır — Terms və Privacy eyni anda qəbul olunur,
eyni `termsVersion` ikisi üçün etibarlıdır. Gələcəkdə ayrı consent_log
table yaranarsa, orada fərqləndirilə bilər.

**Qərar 2 — ADD COLUMN only**
Migration yalnız `ALTER TABLE ADD COLUMN` istifadə edir — DROP yox, ALTER
TYPE yox. Production revert güvənlidir. Bütün field-lər nullable — mövcud
istifadəçilər üçün backfill lazım deyil.

**Qərar 3 — marketing_consent ayrı boolean**
KVKK ayrı razılıq tələb edir: şərtləri qəbul etmək ≠ marketing email
razılığı. Bu field false default ilə yaranır — opt-in model.

## 2026-05-26 — TASK-0167 (footer legal links)

**Qərar 1 — Bottom-bar, sütun deyil (L-009)**
Hüquqi linklər footer sütunlarına (Alətlər, Başla, Resurslar, Şirkət) əlavə
edilmədi. Standart UX pattern: legal linklər bottom-bar-da, copyright ilə bir
sırada (Google, GitHub, Stripe referans). Sütunlar tematik qalır.

**Qərar 2 — Inline Record<Locale>, messages/*.json deyil**
Footer artıq `footerCopy: Record<Locale, ...>` pattern istifadə edir. Yeni
`legal` field eyni struktura əlavə olundu. L-004 qaydası messages/*.json
üçündür — Footer/Header inline Record-u legitim Pattern B sayılır.

## 2026-05-25 — TASK-0169 (legal markdown render)

**Qərar 1 — Blog MarkdownRenderer istifadə edilmədi (L-009 dərsi)**
Blog renderer GuruQuoteBox, DoğanNote, warning/tip blokları, red accent
rəngləri istifadə edir. Hüquqi mətndə bunlar absurd olardı. Ayrı
`LegalRenderer` yaradıldı — sadə tipografiya, slate rənglər, cədvəl
scrollu, rehype-sanitize ilə XSS qoruması.

**Qərar 2 — Server component + client renderer split**
`LegalPageLayout` (server) — `fs.readFile` ilə markdown oxuyur, locale
fallback idarə edir, `getTranslations` ilə fallback banner göstərir.
`LegalRenderer` (client) — `react-markdown` client-side render lazımdır.
Bu split SSR perf saxlayır, interactivity client-ə buraxır.

**Qərar 3 — Fallback strategi**
RU/EN markdown hələ yoxdur. Route-lar 404 verməməli — AZ fallback +
sarı banner ilə bildiriş. `getLegalContent` helper `{ content, isFallback }`
qaytarır.

**Cookie URL fix:** privacy.md-lərdə `/cookie-policy` → `/cookies`
(AZ + TR).

## 2026-05-24 — TASK-0157D (faturalar detail i18n)

- Discovery: re-export pattern aşkar (app/[locale]/faturalar/[id] → app/dashboard/faturalar/[id])
- 481 sətir client component Pattern A-ya çevrildi
- 23 yeni "detail*" prefix-li açar 4 dildə əlavə (parity: 114=114=114=114)
- statusLabel obyekti getStatusLabel() helper-ə çevrildi (L-013 tətbiq)
- useLocale + Intl.DateTimeFormat ilə locale-aware tarix (bonus fix)
- Verification: build ✓, target lint ✓, target tsc ✓, hardcoded AZ = 0
- Repo debt aşkar: scripts/*.js require() və 10+ tsc error → TASK-0161/0159 açıldı

**TASK-0161 (eyni gün):** TASK-0157D-də aşkar olunan lint debt-i təmizləndi.
4 obsolete C3 migration script (336 sətir) lokal iş ağacından silindi. Bu fayllar tracked deyildi
amma ESLint local FS-i oxuduğu üçün error verirdi. Repo lint 4 error → 0.
Build və tsc statusu dəyişməyib (TASK-0159 hələ açıqdır).

**TASK-0158 (eyni gün, 3-cü PR):** i18n parity tam bərpa olundu.

ADDIM 0 audit 185 missing key tapdı. ADDIM 1 runtime audit "marketing"
namespace üçün 0 istifadə sübut etdi — qərar: sil (L-017 dərsi yarandı).

ADDIM 4 gate kritik problem aşkar etdi: toolkit.pnl.education.structure
4 dildə naming inconsistency. AZ/EN: 7 açar (revenue, netProfit, ...).
RU/TR: 5 açar (sales, net, ...). Kod (page.tsx:615 formulaLines) AZ/EN
naming-i çağırırdı → RU/TR P&L education-da istifadəçi xam açar adlarını
görürdü. CANLI BUG.

Fix: RU/TR-də orphan key-lər rename (sales→revenue, net→netProfit),
2 yeni tərcümə əlavə. Yeni dərs: L-018 — Orphan i18n key audit-də
görünmür, naming mismatch yoxla.

**TASK-0163 (eyni gün, 4-cü PR):** TASK-0158 mərge sonrası audit RU/TR
P&L education-da canlı UX bug aşkar etdi. AZ/EN-də font-mono terminal
görünüşündə riyazi düstur format (− COGS, = Operating profit) render
olunur. RU/TR-də operator işarələri əskik idi. Fix: 3 açar əvvəlinə
`− ` (U+2212), 1 açar əvvəlinə `= ` əlavə edildi (2 dildə = 8 string).
Açar adları toxunulmadı.

Yeni dərs: **L-019 — Render kontekst i18n keyfiyyətinə təsir edir**.
Mətnlər font-mono terminal stil və ya formal cədvəl daxilində render
olunursa, operator simvolları (−, =, →) də tərcümənin bir parçasıdır.
Açar parity yetmir, vizual parity də lazımdır.

## 2026-05-15 — TASK-0130 Reklam Yazıcısı

### What
AI ad copy generator for Instagram, Facebook, TikTok, Google Ads. 3 tones (attention/informative/sales) with platform-specific character limits and hashtags.

### Pattern
- Copied complaint-response route.ts line-by-line for auth/DB contract (L-002 lesson applied)
- Same wrapper pattern: ReklamYazicisiPage (pageCopy, viewMode, ToolInfoBox)
- Prompt builder: platform limits, Ahilik values, 2 few-shot examples
- Config: reklam-yazicisi status changed from 'planned' to 'live'
- Rate limit: 30/day/user (vs 20 for complaint handler)

## 2026-05-15 — TASK-0128 Şikayət Cavablandırıcı

### What
AI tool that generates 3-tone responses (formal/friendly/short) to restaurant review complaints from Google, TripAdvisor, Yandex.

### Pattern
- Followed PnlSimulatorPage wrapper pattern (pageCopy per locale, view state machine, ToolInfoBox)
- API follows sikayet-analitigi route pattern (Zod validation, checkToolAccess gating, callAIJson with DeepSeek primary + Claude fallback)
- Prompt builder uses Ahilik values: apology + concrete solution + re-invitation
- 4 locale translations added to messages/*.json under `toolkit.complaint-handler`
- In-memory rate limit (20/day/user) instead of Redis

### Files created
- `components/marketinq-ocagi/sikayet-cavablandirici/` (3 components)
- `lib/ai/complaint-prompt-builder.ts`
- `app/api/ai/complaint-response/route.ts`
- `e2e/sikayet-cavablandirici.spec.ts`

### Files modified
- `lib/marketing-tools-config.ts` — new tool entry
- `app/dashboard/marketinq-ocagi/page.tsx` — 4-locale title/subtitle
- `app/dashboard/marketinq-ocagi/[slug]/page.tsx` — import + routing
- `messages/*.json` (4 files) — complaint-handler namespace

## 2026-05-04 — Auth redirect / hostname fix package

### Problem

Hostinger runs Next.js standalone behind a reverse proxy. The internal server binds to `0.0.0.0` with no knowledge of the public hostname. When `app/api/auth/confirm/route.ts` called `request.nextUrl.origin` to build the redirect target, it got the internal address (e.g. `http://0.0.0.0:3001`) instead of `https://dkagency.com.tr`. Same issue affected password-reset and email confirmation links that fell through to `http://localhost:3000` when `NEXT_PUBLIC_APP_URL` was missing.

### Root cause

- `confirm/route.ts` used `request.nextUrl.origin` — which reflects the internal binding address, not the public domain.
- `register/route.ts` and `route.ts` used `process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'` inline — inconsistent fallback chain.
- Next.js was not configured to trust `X-Forwarded-Host` headers from the proxy.
- Two conflicting PostCSS configs existed (`postcss.config.js` CJS + `postcss.config.mjs` ESM).

### Fix (TASK-0030 to TASK-0034)

1. **TASK-0030** — Added `experimental.trustHostHeader: true` to `next.config.ts`. This makes Next.js standalone use the `X-Forwarded-Host` header from Hostinger's proxy when determining the request origin.

2. **TASK-0031** — Replaced all `request.nextUrl.origin` and inline `process.env.NEXT_PUBLIC_APP_URL` patterns in auth routes with `getBaseUrl()`.
   - `app/api/auth/confirm/route.ts` — `redirectWithMessage()` now uses `getBaseUrl()`.
   - `app/api/auth/register/route.ts` — confirm URL now uses `getBaseUrl()`.
   - `app/api/auth/route.ts` — both `handleRegister` and `handlePasswordResetRequest` now use `getBaseUrl()`.

3. **TASK-0032** — Extracted `lib/utils/get-base-url.ts`:
   ```ts
   export function getBaseUrl(): string {
     return process.env.NEXT_PUBLIC_APP_URL || 'https://dkagency.com.tr';
   }
   ```
   Single source of truth. No more scattered env var reads.

4. **TASK-0033** — Deleted `postcss.config.js` (CJS). Only `postcss.config.mjs` (ESM) remains.

5. **TASK-0034** — Added `.nvmrc` (value: `22`) and `engines: { "node": ">=22" }` to `package.json`.

### Hostinger operator checklist

- Remove `HOSTNAME` env var from Hostinger panel if it exists.
- Ensure `NEXT_PUBLIC_APP_URL=https://dkagency.com.tr` is set in Hostinger environment variables.
- Do NOT set `NEXT_PUBLIC_APP_URL` to an IP address or internal hostname.

## 2026-05-09 - TASK-0102 Contact lead funnel

### Changed
- Contact page now uses Pattern A (`useTranslations('contact')` + `messages/*.json`) instead of inline page copy.
- Visible phone contact card was removed. Primary contact actions are now KAZAN AI, WhatsApp, and Telegram.
- WhatsApp keeps a prefilled handoff through a same-origin redirect, so the number is not shown on the contact page.

### Added
- `POST /api/leads/track` records anonymous contact CTA clicks into `leads`.
- `leads.source`, `leads.channel`, `leads.locale`, `leads.user_agent`, and `leads.ip_hash` track attribution without storing raw IP.
- KAZAN AI listens for `kazan:open` and opens directly from the contact page with contact context.
- Playwright coverage for 4 locale rendering and WhatsApp tracking payload.
- Deploy note: add `IP_HASH_SALT` in Hostinger before release.

## 2026-05-09 - TASK-0100 P&L Simulator i18n

### Changed
- P&L Simulator now uses Pattern A (`useTranslations('toolkit.pnl')`) instead of hardcoded AZ copy.
- Added `toolkit.pnl` translations for AZ/RU/EN/TR.
- Currency and percent values are formatted with `Intl.NumberFormat`.
- Numeric inputs parse EN comma thousands and AZ/RU/TR comma decimals.

### Added
- `/toolkit/pnl-simulator` aliases for existing P&L page compatibility.
- Playwright smoke tests for 4 locale rendering and number formatting.
