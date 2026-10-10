# HANDOFF

## Session 10 Oktyabr 2026 (gün) — TASK-0524 təhlükəsizlik + v2 dizayn, TASK-0525 sistem xəritəsi

**Əvvəl oxu:** `docs/ARCHITECTURE/SYSTEM-MAP.md` (yenidən yarat: `node scripts/generate-system-map.mjs`). Doğan: «yamaq yox, tam xəritə».
- Təhlükəsizlik: `listings?scope=admin`, `telegram/post`, `invoice-ocr/pdf` qoruyucu aldı. Xəritədə qalan «qorumasız» siyahı ictimai route-lardır (yoxlandı).
- v2 mənbələri: `components/inner/*`, `components/marketinq-ocagi/MarketinqV2.tsx` (ToolHeader/MarketinqFrame), `components/brand/DkMark.tsx`, `components/auth/AuthShell.tsx`. Yeni alət/səhifə bunlarla qurulur.
- Haiku auditinin tapıntıları (admin + b2b panel): sahte faktura detalı, saxta şifrə dəyişmə, mock fallback-lar, funnel addımlarının məntiqi, «gözləyən elan» 3 tərif — hələ açıqdır (növbəti tapşırıq).
- Lokasyon Analiz: Doğan-ın «Mytcha» açılış formu (Excel) metodologiyası ilə yenilənəcək (yalnız metod; Shaurma rəqəmləri köçürülmür).

## Session 10 Oktyabr 2026 — TASK-0523: Marketinq Ocağı düzəlişləri + birləşdirmə + OCAQ məntiqi

**Budaq:** `feat/TASK-0523-marketinq-fixes` (origin/main dc80c8d-dən). Kart: `docs/tasks/TASK-0523.md` (hər düzəlişin faylı və sübutu orada). Korumalı fayla toxunulmayıb.

- Rəqəmlər kodda: KST (`lib/marketing-tools/kst-score.ts`), şikayət sayları (`complaint-stats.ts`), menyu matrisi (`lib/toolkit/menu-matrix.ts` — b2b menyu analitikası da), anket (`qonaq-anketi.ts`). AI yalnız söz yazır. Yeni AI aləti yazanda bu qaydanı saxla.
- Aylıq limit indi işləyir (`logToolRun`): server action-a yeni AI aləti əlavə edəndə uğurlu run-u yaz. AI-ı avtomatik çağıran yer qoyma (menyu analitikasında var idi — limiti yeyirdi).
- Birləşmiş səhifələr `components/marketinq-ocagi/hubs/*` + `ToolTabs` — köhnə slug-lar/route-lar öz sekməsini açır; hub kartları qalıb.
- P&L simulyatoru və Marketinq yemək xərci səhifəsi silindi → `/toolkit/pnl`, `/toolkit/food-cost` (`EXTERNAL_TOOL_HREF`).
- Açıq (sahibə): promosyon-roi API yetimdir (UI yoxdur) — silinsin? Sezon planlama, persona promptları hələ «Əhilik hikməti» istəyir (KST/şikayət/menyuda dayandırıldı). OCAQ checklist 44/67 sualı cavabsız (bu PR-a təsiri yoxdur).
- Test zamanı (mərhələ 1) menyu səhifəsi AI-ı avtomatik çağırdı — canlı DB-də `marketing_tool_runs` user 1 üçün 1 sətir ola bilər; sahibə yoxlama SQL-i verildi.

## Session 9 Oktyabr 2026 (gec, 2) — TASK-0521: «Bütün müraciətlər» + header hesab menyusu

**Budaq:** `feat/TASK-0520-header-v2` (TASK-0520 ilə eyni budaq, commit edilməyib). `components/layout/Header.tsx` sahibin ayrıca commit-idir (`ALLOW_PROTECTED=1`). Kart: `docs/tasks/TASK-0521.md` (mənbə → cədvəl xəritəsi orada).

- `/dashboard/muracietler`: 5 cədvəldən yalnız oxuyan inbox (elan sorğuları, kliklər, KAZAN, franchise/OTA/Radar, bülletən). Status dəyişmək mənbə səhifəsindədir; inbox heç nə yazmır.
- Sidebar nişanı = son 7 gündə bütün mənbələr (kliklər daxil) — `GET /api/dashboard/muracietler/count`.
- Header: qonaq üçün «Daxil ol ▾» menyusu (Daxil ol / Üzv ol) — TASK-0520-nin açıq sualı bağlandı. RU 1280–1439-da ikon gizlidir (sığmırdı).
- Telefon panelində «Pulsuz diaqnostika» yoxdur. Diqqət: telefon zolağında da qırmızı pill `sm+`-dır, yəni < 640px-də diaqnostika CTA-sı header-də heç yerdə qalmadı.
- Açıq: bülletən abunələrinin ayrıca admin səhifəsi yoxdur (inbox-da link «—»); `leads` klikləri anonimdir (ad/telefon saxlanmır).

## Session 9 Oktyabr 2026 (gec) — TASK-0520: qlobal header v2

**Budaq:** `feat/TASK-0520-header-v2` (origin/main 70142a7-dən), commit edilməyib. `components/layout/Header.tsx` sahibin ayrıca commit-idir (`ALLOW_PROTECTED=1`). Kart: `docs/tasks/TASK-0520.md` (köhnə elementlərin hara getdiyi cədvəli orada).

- Header bütün enlərdə /tanitim nav-ıdır; navy üst zolaq yoxdur. Qeyri-şəffaf krem: app `body` fonu tünd olduğu üçün /tanitim-in 86% şəffaflığı boz görünürdü.
- Header hündürlüyü xl+ 76px (+1 xətt). Sticky offsetlər `--hdr` (inner) və `.tabbar` (home) yeniləndi; header hündürlüyünü dəyişən hər iş bu ikisini də dəyişməlidir.
- Üzən KAZAN düyməsi < lg gizli (alt menyu ilə eyni hədd; brief md deyirdi — 768–1023-də alt menyu da var).
- **Açıq sual sahibə:** «Üzv ol» kompüter header-ində yoxdur (RU 1280-də sığmır; paneldə və /auth/login-də var). İstəsə: «Daxil ol»-u kiçik hesab menyusuna çevirmək (Daxil ol / Üzv ol).
- RU-da kompüter header-i qısa mətn göstərir: «Диагностика», «Подать объявление».

## Session 9 Oktyabr 2026 (axşam) — TASK-0517 / 0518: sadə dil, vahid sıfırlama, sahib qərarları

**PR-lar:** #515 (8 Okt landing v2), #516 (iç səhifələr + audit düzəlişləri), #517 (TASK-0516 ana səhifə sübutu + TASK-0517 sadə dil) — hamısı main-də. TASK-0518 budaq `feat/TASK-0518-tools-polish` (bu commit), push Doğan-da.

**TASK-0519** (eyni budaq, commit edilməyib): mobil çərçivə v2 — header < xl krem, sağdan açılan menyu paneli (Modullar qrupları + nav + dil + hesab + «Pulsuz diaqnostika»), alt menyu v2 (64px), çərəz zolağı telefonda 67px, WhatsApp md-dən aşağı gizli, çek boş qalmır, reveal tez işə düşür. `Header.tsx` dəyişikliyi sahibin ayrıca commit-idir (`ALLOW_PROTECTED=1`). Kart: `docs/tasks/TASK-0519.md`.

### Sahib qərarları (09.10) — hamısı ADR-0017-də
- Tünd qırmızı: ağ mətnli qırmızı düymələr `#D63B54` (`dk-red-strong`), sayt + admin + b2b panel; `#E94560` yalnız dekor.
- Admin-də yeri olan səhifə hissəsi silinmir (manşet → `isManset`, «Son elanlar» → `showcase_ready`, reklam yuvaları `news-sidebar/news-inline/home-mid/blog-inline`).
- Alət dili: jarqon yoxdur (BCG, trim loss, CAPEX, ramp-up, Prime Cost, RevPASH, runway, payback); menyu matrisi kateqoriyaları hərəkət adıdır: **Qoru / Qiymətini düzəlt / Tanıt / Çıxar**.
- Bütün 17 alətdə eyni sıfırlama: «Təmizlə» → «Geri al» (8 san) → «Nümunəni yüklə» (`ToolResetControls`).
- Açılış checklist: «Dövlət Vergi Xidməti» düzgündür; «SES rəyi» tam çıxarıldı (AQTA qeydiyyatı onsuz da h2-də). İnşaat büdcəsi və maaş/əmək sabitləri redaktə olunan nümunədir («material/məkana görə arta-azala bilər»), defaultlar `lib/toolkit/benchmarks.ts`-də.
- Alət sayı: «35+ alət · 17-si pulsuz» (pnl = pnl-simulator, bir alət).
- Footer «DENİS TOMRİS MMC · VÖEN 1405471681» düzgündür; «Azərbaycanın ilk…» sahibin iddiasıdır, qalır.
- Kanallar: WhatsApp +994 50 256 62 79; Telegram açıq kanal t.me/dkagenc (köhnə t.me/dkagency yad kanaldır — heç vaxt linklənmir); təsdiqlənən xəbər kanala avtomatik gedir.

### TASK-0518-də edilənlər
- SES maddəsi çıxdı (43 maddə), açılış checklist irəliləyişi artıq yadda qalır; köhnə saxlanmış id-lər sayı pozmur.
- İnşaat büdcəsi, personel/mətbəx maaş-əmək fərziyyələri redaktə olunur (`AssumptionsPanel`); mətbəx «m²» sahəsi çıxdı (hesaba girmirdi).
- Telefonda KAZAN düyməsi nəticə panelinin üstünə çıxmır (ölçülüb).
- Rəqəm formatı dilə görə (az/tr «1.234,5», ru «1 234,5», en «1,234.5»); vahidlər tərcümə (кг/л/шт, kg/l/pcs, kg/lt/adet).
- Üzv alətlərində jarqon, bloq və KAZAN bilik bazasında BCG/«ulduz»/Trim loss təmizləndi; Yemək xərci səhifəsi `mqForms.yemekXerci`-yə köçdü (ru indi rusca), Excel-də food cost % öz sütununda.
- dk-validator PASS (10/0); tsc 30 (baza).

### Açıq işlər (növbəti sessiya buradan başlasın)
1. Telefonda cookie zolağı alət nəticə panelini örtür (KAZAN artıq üstdədir).
2. Üzv alətlərində qalan ingilis jarqonu: `app/b2b-panel/marketinq-ocagi/page.tsx` və `[slug]` («Channel ROI, CAC, LTV, payback»), `marketinq.roiCalculator` / `plSimulator` («LTV:CAC», «Benchmark»), `components/ToolkitShowcase.tsx` (food cost/labor cost mətnləri).
3. Admin-də 20 elan `submitted` gözləyir — təsdiqlənəndə «Son elanlar» görünür; son 7 gündə manşet işarəli xəbər yoxdur.
4. Canlı yoxlama (merge sonrası, tək sorğu): `/`, `/toolkit/menu-matrix`, `/haberler` şəkil ölçüləri (`/_next/image` Hostinger-də sharp ilə işləyirmi).
5. Telegram canlı test: bir WhatsApp klik, bir lead, bir xəbər təsdiqi → kanal t.me/dkagenc (bot kanalda admin olmalıdır).
6. Daxili səhifələr üçün növbəti fikirlər (bazar araşdırması 09.10): OCAQ Telegram səhər xülasəsi, faktura şəkli → təchizatçı qiymət tarixçəsi, delivery kalkulyatoruna kampaniya xərci — OCAQ işləri ayrı OCAQ sessiyasında.

### Qaydalar (bu sessiyada öyrənilən)
- Sessiya başında Bulgu Kasası + HANDOFF + ADR oxunur, açıq maddələr repo ilə müqayisə edilir (CLAUDE.md «Sessiya başında»).
- Hər audit düymələri real klikləyir (Təmizlə, əlavə et, sil) və «restoran sahibi bunu başa düşərmi?» meyarını yoxlayır.
- «Uydurma» hökmündən əvvəl iddianın bütün kod yolu yoxlanır (Sektor Nəbzi 41 RSS / 6 saat doğru idi).
- Qorunan fayllar: Header.tsx, app/globals.css, app/layout.tsx, components/layout/Footer.tsx, next.config.* — dəyişiklik Doğan-ın `ALLOW_PROTECTED=1` commit + push-u ilə.
- 8 GB RAM: eyni anda bir dev server; build/validator dev server dayanandan sonra.

---

## Session 9 Oktyabr 2026 — İç səhifələr v2, audit düzəlişləri (PR #516) + ana səhifə sübutu (TASK-0516)

**PR #516** (`feat/TASK-0514-inner-pages`, merged) — TASK-0514 + TASK-0515:
- İç səhifələr v2: `/toolkit` kataloqu (tablar, 17 pulsuz alət, ikonlar), bütün alət səhifələri yeni shell-də (geri düyməsi, yapışqan nəticə, mobil bottom sheet), Food Cost WhatsApp/PDF/lead; Sektor Nəbzi real DB sayğacları, kateqoriya örtüyü, t.me/dkagenc zolağı; Bloq seçilmiş yazı, kateqoriya tabları, TOC, alət kartı, müəllif kartı; nazik cookie zolağı.
- Alət formulları: menyu matrisi Kasavana & Smith (70% populyarlıq, çəkili CM), Food Cost trim (11,76 ₼), P&L/işçi/qonaq evi/mətbəx 0 və mənfi halları, delivery hər platformanın öz komissiyası, AQTA risk zonası. Mənbəsiz rəqəmlər çıxdı; hədlər `lib/toolkit/benchmarks.ts`-dən.
- Onluq parser `lib/toolkit/parse-decimal.ts` + `DecimalInput` («12,5» = «12.5») bütün alətlərdə.
- Mobil/a11y: inputlar 16px, delivery kart görünüşü, tap target-lər, solğun mətnlər, kontrast.
- Tünd qırmızı: ağ yazı #D63B54 (`bg-dk-red-strong`, hover `bg-dk-red-deep`), #E94560 bəzək (sayt + admin + b2b-panel).
- Xəbər admin bağlantısı: manşet → MansetVitrin, top → grid önü, `showcase_ready` elanlar → «Son ilanlar», `news-inline`/`news-sidebar` reklamları.
- `/tanitim` Inter öz serverindən (InterVariable.woff2); AI modeli `deepseek-v4-flash` → `deepseek-flash`; OG üçün Inter 4.1 paketləndi.

**TASK-0516** (`feat/TASK-0516-home-proof`, bu sessiya):
- Ana səhifədə sübut bloku (sahib qərarı 04.10: müştəri rəqəmi yox → Doğan-ın fotosu + 1986-dan sahə + «necə işləyir»): `DoganNote` v2 görünüşündə StepsTimeline-dan dərhal sonra; `/haqqimizda` eyni komponenti `embedded` rejimdə işlədir.
- Üzən WhatsApp düyməsi (ana səhifə, sol-aşağı; KAZAN sağ-aşağıdadır) `/api/leads/whatsapp` üzərindən (lead + Telegram). Cookie zolağı görünəndə WhatsApp və KAZAN onun üstünə qalxır (`--dk-cookie-bar-h`).
- Admin reklam yuvaları: `home-mid` ana səhifədə (xəbər + Bazar blokundan sonra), `blog-inline` məqalənin ortasında. Aktiv reklam yoxdursa heç nə görünmür. Ana səhifə server `page.tsx` + client `components/home/v2/HomeV2.tsx`-ə bölündü.
- Marketinq Ocağı-nın 5 formu: mətnlər `messages/*.json` → `mqForms`, düymələr tünd qırmızı.
- Xəbər şəkilləri `next/image` ilə (`next.config.ts` istənilən https host — sahib təsdiqi; config dəyişikliyi koordinatorundur): ölçüyə görə kiçildilir, alınmasa kateqoriya örtüyü.

### Açıq
- `components/layout/Header.tsx` (qorunan) kontrast: «USTALIĞIN NİŞANI» ~2.5:1, kiçik dil/«Daxil ol» linkləri — koordinator dəyişib, commit edilməyib; DEC/sahib commit-i lazımdır.
- Xarici xəbər şəkillərinin kiçildilməsi `next.config.ts` (qorunan) dəyişikliyinə bağlıdır — koordinatorun commit-i ilə birlikdə getməlidir; Hostinger-də `/_next/image` optimizatoru (sharp) canlıda yoxlanmalıdır.
- 20 elan `submitted` statusunda gözləyir (admin baxışı lazımdır; «Son ilanlar» yalnız `showcase_ready` göstərir).
- Marketinq Ocağı `menyu-analitik`: «Food Cost (AZN)» sahəsi API-yə `costPercent` adı ilə gedir (məbləğ/faiz qarışıqlığı) — ayrıca kart.

---

## Session 8 Oktyabr 2026 — Landing v2, Telegram, kanal (release/2026-10-08-dk)

**Branch:** `release/2026-10-08-dk` — TASK-0505/0507/0508/0509/0510 + bu sessiya: 0509 (tanitim v2), 0511 (Telegram), 0512 (ana səhifə v2), 0513 (OG + AI SEO + əlaqə, işdə). Qərarlar: [ADR-0017](docs/ADR/0017-landing-v2-identity-and-channels.md).

### Tamamlanan
- `/tanitim` Kutlerri/R365 üslubunda yenidən (telefon hero, mega menyu, ekosistem halqası, Gəlir/Xərc tabları, addım xətti, kalkulyator, Qurucu); mənbəsiz iddialar çıxdı, Sektor Nəbzi iddiası (41 RSS, 6 saat) doğru olduğu üçün qaytarıldı.
- Ana səhifə v2: HeroPhone → Qəbz (ReceiptHero v2) → Faktlar → Sektor Nəbzi → B2B Bazar → Halqa → Modul tabları → Addımlar → AI testi → Bloq → Sürətli keçid → CTA. Köhnə ToolkitShowcase/StageSelector/AdsPreview ana səhifədən çıxdı (fayllar qalır).
- Telegram: lead/WhatsApp klik/üzv/B2B elan (✅/❌) bildirişləri, həftəlik xülasə workflow (B.e. 08:00 Bakı), təsdiqlənən xəbər → t.me/dkagenc kanalı. Yad `t.me/dkagency` linkləri düzəldildi.
- `CLAUDE.md` kimliyi yeniləndi; `dk-validate.sh` heap 8192 → 4096.
- Hər mərhələdə dk-validator PASS (10/0).

### Açıq
- `components/layout/Header.tsx` (Modullar mega menyu) commit edilməyib — qorunan fayl, Doğan `ALLOW_PROTECTED=1` ilə commit edir.
- Prod-da: GitHub Secret `CRON_SECRET`; bot t.me/dkagenc kanalında admin («Post messages»). Canlı Telegram testi merge-dən sonra.
- Növbəti: iç səhifələr v2 (Toolkit → Xəbərlər → Bloq) ayrıca PR, əvvəl HTML ilə sahib təsdiqi.

---

## Session 6 İyun 2026 — F2.8 Sektor Dynamic [slug] Route

**Branch:** `feat/f28-sektor-dynamic-route` (origin/main üstündə)

### Tamamlanan
- Config-driven dinamik `app/[locale]/sektor/[slug]/` route — `lib/data/sektorConfigs/` SSOT
- 3 yeni sektor: **otel, restoran, kafe** (+ migrasiya olunmuş qonaq-evi) — config + i18n (4 dil)
- Sektor index `app/[locale]/sektor/page.tsx`, slug-aware OG, lokalizə not-found
- `e2e/sektor-config.test.ts` integrity test (PASS)
- Köhnə statik qonaq-evi route-ları silindi (A1)

### ✅ Production-da doğrulandı (`next build` + `next start`)
- `/sektor/{qonaq-evi,otel,restoran,kafe}` (az, prefix-siz) → **200**
- `/sektor/bilinmeyen` → **404** (SektorNotFound) ; `/az/sektor/otel` → **307** ; `/sektor` → **200** ; `/en/sektor/otel` → **200** ; `/sektor/otel/opengraph-image` → **200 png**
- Kritik dərs (L-038): default-locale (az) prefix-siz route **root-level mirror** tələb edir (`app/sektor/...` → `app/[locale]/sektor/...`). Köhnə root route silinmişdi → əvvəlcə 404 verdi, mirror əlavə edilib düzəldildi.
- Qeyd: bu mühitdə `next build` üçün `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` lazımdır (Google Fonts TLS).

### Növbəti
- `/sektor` index-i naviqasiyaya (Header MegaMenu) bağla
- Yeni sektor: **catering** — 1 config + 1 i18n namespace + (lazımsa) root mirror; kod yox
- Yeni `[locale]` route əlavə edən hər kəs: ROOT MIRROR yaratmağı unutma (L-038)

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
