# DEVLOG — DK Agency Platform

## 2026-10-09 — TASK-0521: «Bütün müraciətlər» admin inbox + header hesab menyusu, paneldən «Pulsuz diaqnostika» çıxdı

**Why:** Sahib qərarları 09.10: ADMIN_EMAIL-ə gələn müraciətlərin paneldə vahid siyahısı yox idi (`listing_leads` heç bir admin səhifəsində siyahılanmırdı; kliklər yalnız contact-tracking-də, KAZAN və franchise ayrı səhifələrdə, bülletən abunəsinin səhifəsi yox). Header-də «Üzv ol» kompüterdə yox idi (TASK-0520 açıq sualı) → hesab menyusu; telefon panelində «Pulsuz diaqnostika» artıqdır.

**What:** `lib/repositories/inboxRepository.ts` — `getInboxItems(period)`: 5 paralel SELECT (`listing_leads` LEFT JOIN `listings`, `leads`, `kazan_leads`, `franchise_leads`, `email_preferences` where `consent_source IN (homepage_newsletter, blog_newsletter)`), hər biri `created_at >= now-period`, `ORDER BY desc LIMIT 200`, vahid `InboxItem`-ə normallaşdırılır; `countInboxSince(7)` — 5 COUNT. Bülletən tarixi `coalesce(consent_given_at, last_updated_at)`, parametr `::timestamptz`. Franchise kanal = `score.source` (ota-guide / franchise-radar `tool_source='consulting'` yazır, əsl mənbə jsonb-dədir) yoxsa `tool_source`; `contact` `@` ilə e-poçt/telefon ayrılır. `app/dashboard/muracietler/page.tsx` — server komponent, `requireAdminPage()` (kazan-leads ilə eyni) + layout-un admin yoxlaması; filtrlər `source/period/q` URL-də, axtarış və mənbə filtri yaddaşda; saylar dövr + axtarışa görə (mənbə filtrindən asılı deyil). `[locale]` güzgüsü digər dashboard səhifələri kimi re-export. `GET /api/dashboard/muracietler/count` — `requireApiAdmin`. Sidebar: `Inbox` ikonu, «Satış və Leadlər»-də birinci, nişan `inboxCount || undefined`. Mesajlar `dashboardInbox` × 4 dil. `Header.tsx` (sahib təsdiqi): qonaq üçün `account-menu-button` + `#dk-account-menu` (`userMenuRef`/`isUserMenuOpen` üzv menyusu ilə ortaqdır — yalnız biri render olunur, xaricə klik/Esc artıq işləyir); RU-da `xl:max-[1439px]:hidden` ikon; panel altından diaqnostika `<a>` silindi. `e2e/dashboard-smoke.spec.ts` KEPT-ə `muracietler`.

**Yoxlama:** tsc 30 (baseline 30; dəyişən fayllarda 0); eslint 7 dəyişən fayl 0. Playwright `next dev :3917` (`JWT_SECRET` test sirri ilə, `.env` oxunmadı): çıxışda `/dashboard/muracietler` və `/ru/dashboard/muracietler` → 307 `/auth/login`; role=member token → 307 `/b2b-panel`; API çıxışda 401, üzvdə 403. Admin token (dashboard-smoke ilə eyni `jwt.sign`): 390 və 1280 × (`/dashboard/muracietler`, `/ru/…`, `?source=listing&period=90`, `?period=90&q=zzzz-no-match`) = 8 — hamısı 200, console xətası 0, scrollWidth = en; 30 gün 11 müraciət (hamısı klik), 90 gün 14 klik + 1 franchise, axtarış boş nəticə → 0 və boş vəziyyət; sidebar nişanı 9. Header 4 dil × 390/1280/1440 = 12: console 0, daşma 0, üst-üstə düşmə 0, ən hündür element 44px; hesab menyusu açılır (aria-expanded true, viewport daxilində), Esc və xaricə klik bağlayır, «Üzv ol» → `/auth/register`; RU 1280 son düymə sağ kənarı ikonla 1283 → ikonsuz 1259. 390 panel: «Pulsuz diaqnostika» yoxdur, son linklər Daxil ol / Üzv ol / Elan ver. `npm run build` və dk-validator işlədilmədi (8 GB RAM). Ekranlar: scratchpad `task-0521/`.

## 2026-10-09 — TASK-0520: qlobal header v2 (/tanitim nav-ı bütün enlərdə), navy üst zolaq silindi, KAZAN düyməsi < lg gizli, çek pill-ləri

**Why:** Sahib (09.10 21:30, PR #519 canlıdan sonra telefon ekranları): «baktım ama rezalet — üst kısmı unutuyorsun». Header kompüterdə köhnə idi (navy üst zolaq, `logo-mobil.png` + DM Sans, qızılı «Elan ver», 7 link), telefonda köhnə loqo; üzən KAZAN düyməsi «Pulsuz üzv ol» və xanaları örtürdü; çek seçim zolağı 390-da «Fı» kəsilirdi (yan sürüşmə), printer yarığı kağızdan enli idi.

**What:** `Header.tsx` (qorunan, sahib təsdiqi): üst zolaq silindi; `<header>` `inter.className`, `bg-[#F6F1E9]` + `border-[#E4DCCD]`, iç `max-w-[1360px]`, `h-[68px] xl:h-[76px]`; `BrandMark` (36px ink kvadrat «DK» + Inter 800). **Qeyri-şəffaf** — /tanitim-in `rgba(246,241,233,.86)` + blur-u app-də boz görünür, çünki `body` fonu `rgb(10,10,26)`-dir (globals.css; ölçüldü). Nav sırası Modullar/Alətlər(Link + hover MegaMenu)/Resurslar/Franchise/İlanlar/Haqqımızda, `text-[14.5px] px-2` (1440+: 15px, px-3); `isActivePath` ilə `aria-current`. Yeni: dil popover-i (`#dk-lang-menu`, `hrefLang`, xaricə klik/Esc), üzv avatar menyusu (+ İdarə Paneli; nav-dan çıxdı, panel siyahısında qalır), `diagShort`/`postShort` (yalnız RU fərqlənir: «Диагностика», «Подать объявление» — tam mətn `title`-də və md–lg-də). `topBadge/topText` açarları silindi, `language` əlavə olundu. İş elanları Resurslar-a keçdi; KAZAN `beta` sahəsi → «Beta» nişanı. `isScrolled` silindi. `MegaMenu` panel çərçivəsi v2. `--hdr` (inner) və `.tabbar` (home) xl-də 64 → 76; `.v2[id]` scroll-margin 68/76. `FloatingKazanWidget` launcher `hidden lg:flex` (alt menyu ilə eyni hədd; `kazan:open` paneli telefonda açmağa davam edir). `ReceiptHero.module.css`: ≤640 `.pills` 2 sütunlu grid, `white-space: normal`, tək qalan pill 2 sütun; desktop `.pills` `flex-wrap: wrap` (scroller yox); ≤640 `.slot { margin: 0 12px }` = `.paperClip`.

**Yoxlama:** tsc 30 (baseline 30); eslint 4 dəyişən TSX — 0 xəta, 0 xəbərdarlıq (köhnə 2 `<img>` xəbərdarlığı getdi). Playwright `next dev :3917`: 5 en (390 iPhone isMobile dpr2 / 768 / 1024 / 1280 / 1440) × 9 route (`/`, `/toolkit`, `/haberler`, `/blog`, `/elaqe`, `/tanitim`, `/ru`, `/en`, `/tr`) = 45 — hamısı 200, console xətası 0, scrollWidth = en, header-də viewport-dan kənar 0, 46px-dən hündür (sınmış) header elementi 0; y=2 nöqtəsindəki element header-dir (üst zolaq yoxdur). Header hündürlüyü 69 (< xl) / 77 (xl+) = /tanitim 77. Header eni (brend | nav | sağ) 1280: az 136|532|424, ru 136|589|466, en 136|523|417, tr 136|539|402 (sığma həddi 1208); 1440 ru 136|651|466. Sticky tablar: `/` və `/toolkit` 390-da top 68 / header altı 69, 1280-də 76 / 77. Dil menyusu → «Русский» → URL `/ru`, «Войти». Modullar: 1 «Beta», Esc bağlayır. Resurslar: Bloq, Sektor Nəbzi, İş elanları. Üzv (localStorage `dk_user`): avatar menyusu İdarə Paneli / Hesabım / Elanlarım / Çıxış, «Daxil ol» gizli. 390: KAZAN launcher DOM-da, görünmür; alt menyu KAZAN → `/kazan-ai`; panel açılır (body overflow hidden), Resurslar 3 alt link, Esc → bağlı + overflow bərpa, fon → bağlı; `/elaqe` `kazan:open` → panel görünür. Çek 390: zolaq sw=cw=318, 5 pill-in heç birində sw > cw yoxdur (RU də), yarıq = kağız = 326px (x 32). `npm run build` və dk-validator işlədilmədi (8 GB RAM). Ekranlar: scratchpad `task-0520/` (before/after, compare-1280/390).

## 2026-10-09 — TASK-0519: mobil çərçivə v2 (header, menyu paneli, alt menyu, çərəz zolağı, WhatsApp, çek animasiyası)

**Why:** Sahib: «neden mobilde dizayn farklı?» — 390-da məzmun v2 (krem/ink/qırmızı), amma header `bg-white/95` boz görünürdü (altdakı body fonu), menyu köhnə ağ dropdown, alt menyu navy/qızılı, çərəz zolağı ~91px (3 sətir), WhatsApp + KAZAN + alt menyu + çərəz bir-birinə sıxılırdı; çek bölməsi scroll-a qədər boş kağız idi.

**What:** Header (sahib təsdiqi 09.10, qorunan fayl): < xl `bg-[#F6F1E9]` (qeyri-şəffaf; blur yalnız xl+), `border-[#E4DCCD]`; xl+ köhnə ağ/scroll kölgəsi. Köhnə mobil dropdown silindi; yeni panel `<header>`-dən **kənarda** render olunur (header-in `backdrop-filter`-i `fixed` uşaqları header-ə nisbi edirdi). `role=dialog aria-modal`, Esc, fon klik, `body.style.overflow` kilidi, fokus idarəsi, framer `useReducedMotion`. Modul qrupları `moduleColumns`-dan (desktop ilə eyni mənbə); grid `minmax(0,1fr)` + `min-w-0` (əks halda `truncate` təsviri kartı panel enindən çıxarırdı). `NAV_COPY` + `diag`, `close`. Alt menyu: `stripLocalePrefix` ilə aktiv yoxlama (`/az/...` də işləyir), `aria-current`, `h-[63px]` + 1px border = 64px; `pb-safe` (təyin olunmamış sinif) → `pb-[env(safe-area-inset-bottom)]`. Çərəz: `.ckLong/.ckShort` (≤640px qısa mətn, `nowrap+ellipsis`), düymələr 32px; mesaj `innerV2.cookie.textShort/privacyShort` ×4. WhatsApp `hidden md:block`. Çek: `.armed .paper` gizlətmə silindi, `dkPrint` −104% → −14px, `dkLine` 0 → 0,55 şəffaflıq, gecikmələr 0,9+0,15i → 0,1+0,06i, IO threshold 0,25 → 0,1. `Reveal`: `threshold 0, rootMargin 0 0 15% 0`.

**Yoxlama:** tsc 30 (baseline 30; dəyişən fayllarda 0); eslint 6 dəyişən TSX 0 xəta (2 `<img>` xəbərdarlığı — loqo, köhnə naxış). Playwright `next dev :3917`, 390 (isMobile, hasTouch, dpr 2) / 768 / 1280 × `/`, `/toolkit`, `/toolkit/food-cost`, `/haberler`, `/blog`, `/elaqe`, `/ru` = 21 — hamısı 200, console xətası 0, viewport-dan kənar 0, scrollWidth = en. Header fonu 390/768 `rgb(246,241,233)`, 1280 ağ (0,95). Alt menyu aktiv: `/`, `/ru` → Ana səhifə/Главная; `/toolkit`, `/toolkit/food-cost` → Alətlər; `/haberler`, `/blog`, `/elaqe` → heç biri. 390 ölçülər: header 69px; çərəz zolağı 66,9px (y 713–780), `--dk-cookie-bar-h: 67px`; alt menyu y 780, h 64; KAZAN [322–378 × 633–689] — alt menyu, çərəz zolağı, «Pulsuz diaqnostika» (410–464) və «Necə işləyir» (476–530) ilə kəsişmir. WhatsApp 390-da görünmür, 768/1280-də var. Menyu: qruplar «Gəlir artımı», «Xərc nəzarəti»; 44px-dən kiçik hədəf 0; açıqkən body overflow hidden; Esc → bağlı, overflow bərpa; fon → bağlı; «Alətlər» → `/toolkit`, bağlı. Üzv sessiyası (`/ru`, localStorage) → panel üzv kartı + «Мой аккаунт / Мои объявления / Выйти / Панель управления», console 0. Alt menyu etiketləri 4 dildə kəsilmir. Çek: scrollIntoView-dan 120ms sonra 7 sətir görünür (şəffaflıq 0,55), 820ms-də 1,00. `npm run build` və dk-validator işlədilmədi (8 GB RAM).

## 2026-10-09 — TASK-0518: toolkit — nümunə rəqəmlər redaktə olunur, SES çıxdı, KAZAN vs nəticə paneli, dilə görə rəqəmlər

**Why:** Sahib qərarları 09.10 (SES silinsin; büdcə və maaş rəqəmləri fakt kimi görünməsin; «Mətbəx sahəsi» hesablamaya girmir) + TASK-0517 hesabatındakı açıq maddələr (KAZAN düyməsi 390-da «Nəticəni aç»-ı örtür; addim-xerci/staff-retention hər dildə `de-DE`, basabas `toFixed(1)`; food-cost vahidləri; üzv alətlərində jarqon; bloq və AI prompt-larında BCG/heyvan adları).

**What:** `components/toolkit/AssumptionsPanel.tsx` (+ `AssumptionField`) — başlıq + «nümunədir» qeydi + öz `ToolResetControls`. Default-lar `lib/toolkit/benchmarks.ts`-də: `STAFF_PLANNER_*`, `KITCHEN_*`, `CONSTRUCTION_BUDGET_DEFAULTS` (1.22/1.15 vurucuları `extraPct` 22/15 oldu). İnşaat büdcəsi `insaat-checklist-budget-v1` açarında; irəliləyiş yüklənəndə yalnız mövcud id-lər saxlanır (insaat number id, aqta string id); açılış siyahısında `h4` id-si təqaüdə çıxdı, say yalnız mövcud id-lərdən. `ToolkitStudioLayout` sheet `position: fixed` olanda `--dk-tool-sheet-h` (bağlı panelin hündürlüyü) və açıqkən `<html data-dk-sheet-open>` yazır; `FloatingKazanWidget` və `WhatsAppButton` `bottom: calc(5.5rem + cookie + sheet)` və `[[data-dk-sheet-open]_&]:hidden`. Rəqəm formatı `formatNumber`/`numberLocale` ilə. KAZAN `knowledge-base` kateqoriyaları `keep/fixPrice/promote/remove`, `_brain/methodology` `bcgMatrix` → `menuActions` (mənbəsiz «30-40%» hədəfləri çıxdı). `lib/marketing-tools-config.ts` metbex `inputSchema`-dan `mutfaqMetrekare` silindi (heç yerdə oxunmur).

**Yoxlama:** tsc 30 (baseline 30); eslint dəyişən 25 fayl 0 xəta (1 köhnə `<img>` xəbərdarlığı); `e2e/*.test.ts` 10/10; spec-lər insaat-checklist (6) + az-hydration (2) — 8/8. Playwright `next dev :3917`: 13 route × 390/1280 = 26 — hamısı 200, console xətası 0, viewport-dan kənar 0, qadağan söz (SES/СЭС/BCG/Boston/Prime Cost/Payback/Trim loss) 0. Qarşılıqlı yoxlama 27/27: KAZAN ↔ panel 390-da kəsişmir (köhnə qayda ilə kəsişirdi), panel açılanda KAZAN gizlidir; insaat köhnə `[53,54,999,63,"x"]` → 2/62; büdcə 75.000–150.000 → prep 3000 → 76.000 → Təmizlə «—» → Geri al → Nümunə → yenidən yükləmədən sonra qalır; AQTA köhnə `["storage-1","h4","bogus"]` → 1/5; işçi planı maaş 900 → 7% → 10%, Təmizlə «—», Geri al, Nümunə 450; mətbəx maaş 600 → 5% → 7%, m² xanası yoxdur; format az/ru/tr «66,7%», en «66.7%», az «3.744 ₼», en «3,744 ₼»; food-cost vahidləri 4 dildə (dəyərlər `kq,qr,litr,ml,ədəd`). `npm run build` və dk-validator işlədilmədi (8 GB RAM, swap).

## 2026-10-09 — TASK-0517: toolkit sıfırlama UX + menyu matrisi əmrləri + 17 alətdə sadə dil

**Why:** Sahib rəyi 09.10 (restoran sahibi gözü, telefon): heyvan/BCG adları, izahsız ingiliscə terminlər, «Sıfırla işləmir» (menu-matrix eyni nümunəyə qaytarırdı — heç bir rəy yox; food-cost hər şeyi silirdi; 5 alətdə sıfırlama yox idi).

**What:** `ToolResetControls<T>` (snapshot/restore/onClear/onLoadExample, `role=status`, UNDO_MS 8000, testid `tool-clear/tool-example/tool-undo/tool-reset-status`); `ToolIntro` (`innerV2.toolkit.tools.<slug>.what/how[3]`, `t.has` ilə — açar yoxdursa render olunmur) ToolkitStudioLayout + ToolPageShell-də; panel `data-testid="tool-inputs"`. Basabas-ın 43 `useState`-i bir `form` obyektinə yığıldı (snapshot üçün). FranchiseQuiz: optional `resetControls`, `franchbookCtaIndex` (default köhnə davranış). Menyu matrisi kateqoriya id-ləri (star/plowHorse/puzzle/dog) daxildə qalır, UI etiketləri əmrdir; AI prompt `keepCount/fixPriceCount/promoteCount/removeCount`. Mesajlar 5 paralel alt-agentin patch fayllarından bir skriptlə birləşdi (2 848 yazı; yeganə toqquşma `innerV2.foodCost.afterMenuDesc` — menyu versiyası saxlanıldı). Menyu Analitiyi: `lib/marketing/cost-percent.ts` + `e2e/menu-cost-percent.test.ts` (6/6).

**Yoxlama:** tsc 30 (baseline 30; WhatsappTemplatesPanel:73 köhnə xətadır); eslint 59 dəyişən fayl 0 xəta (2 köhnə xəbərdarlıq); `e2e/*.test.ts` 10/10. Playwright `next dev :3917`, 17 alət × 390/1280 = 34: hamısı 200, console xətası 0, viewport-dan kənar 0; Təmizlə → boş + status → Geri al → əvvəlki → Nümunəni yüklə 11 formlu alətdə PASS, 3 yoxlama siyahısında tick → Təmizlə → Geri al PASS, 2 testdə cavab → Təmizlə → 1-ci sual → Geri al PASS, WhatsApp şablonları yalnız kopyalamadır (sıfırlama yox); food-cost «Məhsul əlavə et» 3→4 / sil 4→3, menu-matrix «Yemək əlavə et» 6→7 / sil 7→6. 390-da görünən az mətndə qadağan sözlər 0. ru/en/tr 51 alət səhifəsi + 4 `/toolkit` + bloq + haqqımızda: 200, console 0, daşma 0. Spec-lər: blog-cta (4), addim-xerci (8), insaat-checklist (6) — 18/18. `npm run build` və dk-validator işlədilmədi (8 GB RAM, swap).

## 2026-10-09 — TASK-0516: ana səhifə sübutu, üzən WhatsApp, admin reklam yuvaları, Marketinq Ocağı formları i18n, xəbər şəkilləri next/image

**Why:** Sahib qərarı 04.10 (canvas «DK Agency v2 Dizayn»): «Müştəri rəqəmi yayımlanmır. Sübut: Doğan-ın fotosu + 1986-dan sahə + 'necə işləyir'». TASK-0515 kartının qalanları: `WhatsAppButton` yazılıb heç yerdə işlənmirdi; `home-mid` / `blog-inline` admin-də seçilir, heç bir səhifə göstərmirdi; 5 formda hardcoded mətn (dk-validator [3]). 09.10 sahib təsdiqi: `next.config.ts` istənilən https host (koordinator dəyişdi) → xəbər şəkilləri next/image.

**What:** `DoganNote` yerində v2-yə keçdi (portret 800×902, `fill` + `sizes`, «Doğan Tomris · Qurucu» caption, faktlar 1986 / 40 il, sitat, lokallı linklər — əvvəl `/kazan-ai` prefikssiz idi); ana səhifədə StepsTimeline-dan sonra, `/haqqimizda`-da `embedded`. Kart `container-type: inline-size` + `@container (max-width: 760px)` ilə dar valideyndə bir sütun. Ana səhifə: `app/[locale]/page.tsx` server komponent → `components/home/v2/HomeV2.tsx` (köhnə client gövdə, məzmun eyni) + `adSlot` prop (`<AdSlot placement="home-mid" wrapperClassName={styles.homeAd} />`, B2BMarket-dən sonra). `AdSlot.wrapperClassName` — zolaq yalnız reklam varsa. Bloq: gövdə orta `##`-də bölünür; alət kartı varsa reklam ikinci yarının ortasına, başlıq azdırsa gövdədən sonra. `WhatsAppButton`: `whatsappHref` (`/api/leads/whatsapp`), `whatsappFloat` 4 dil, `<a>` (prefetch yox), sol-aşağı, `motion-safe:animate-ping`. `CookiesBanner` ResizeObserver ilə `--dk-cookie-bar-h` yayır; WhatsApp və KAZAN `bottom: calc(5.5rem|2rem + var(--dk-cookie-bar-h, 0px))`. Formlar: `mqForms.{kst,marka,menyu,persona,sikayet}`; option dəyərləri kodda massiv, etiketlər messages-də; Menyu-nun JSX-də hardcoded AZ etiketləri (əsl görünən mətn) köçdü, istifadə olunmayan köhnə `formCopy` açarları atıldı; AZ/TR kateqoriya adlarında diakritik düzəldi (Şorba, Əsas yemək, İçki; Çorba, Balık…), RU kateqoriyaları ingiliscə idi → rusca. Marka-kompası network xətası əvvəl competitorGap help mətnini göstərirdi → `errors.network`. Düymələr `bg-dk-red-strong hover:bg-dk-red-deep`. Xəbər şəkilləri: `components/inner/NewsCoverImage.tsx` (client, `next/image fill`, `onError` → generasiya olunan örtük, http → `unoptimized`), `NewsCover`-ə `sizes`; priority yalnız lead, manşetin 1-ci slaydı, detal hero; ana səhifə `NewsPreview` də next/image (`.nwThumb` `position: relative`).

**Əvvəl/sonra (`/haberler`, `next dev`, CDP encodedDataLength, cache açıq, scroll ilə lazy-lər daxil):** şəkillər 2 450 KB → 183 KB (8 şəkil; ən böyüyü bta.bg 1 546 KB → 20 KB), səhifə cəmi 4 063 → 1 827 KB (dev JS minify olunmur — prod rəqəmi deyil; audit prod-da 3 174 KB ölçmüşdü). Cache bağlı 390-da bəzi şəkillər iki dəfə yüklənir (336 KB) — cache açıq olanda 183 KB / 8.

**Yoxlama:** tsc 30 (baseline 30, dəyişən fayllarda 0); eslint dəyişən 19 fayl 0 problem; messages ×4 JSON etibarlı. Playwright `next dev :3917`, 390 + 1280: `/`, `/ru`, `/en`, `/tr`, `/haqqimizda`, `/blog/1-porsiya-food-cost-hesablama`, `/haberler`, bir xəbər detalı + 5 form → hamısı 200, console/page xətası 0, viewport-dan kənar 0, scrollWidth = en. Ana səhifə: WhatsApp 390-da [12–68 × 609–665], KAZAN [322–378 × 609–665], cookie [689–780], alt menyu [768–844] — üst-üstə düşmə yox; 1280-də WhatsApp [32–88], KAZAN [1184–1248], cookie [848–900] — yox; cookie qəbul olunandan sonra WhatsApp aşağıdan 88 / 32 px, dəyişən silinir. DoganNote 4 dildə görünür, foto yüklənir. Formlar üzv girişi tələb edir (307 → /auth/login) → müvəqqəti harness səhifəsi ilə render edildi (AZ kst, RU marka, EN menyu, TR persona, AZ şikayət; düymə rgb(214,59,84) + ağ), sonra silindi. DB-də aktiv reklam yoxdur → `home-mid`/`blog-inline` boş halda heç nə render etmir (müsbət hal göstərilmədi). `/api/leads/whatsapp` klik edilmədi (prod DB + Telegram). `npm run build` və dk-validator işlədilmədi.

## 2026-10-09 — TASK-0515: toolkit/mobil audit düzəlişləri + qırmızı tokeni + xəbər hissələri

**Why:** 09.10 auditləri (formul xətaları, onluq input, validasiya, mobil/a11y) + sahib qərarları: A) ağ yazı brend qırmızısı üstündə oxunmur → tünd ton (admin daxil); B) TASK-0514-də çıxan xəbər hissələrindən «Son İlanlar» və MansetVitrin (admin idarə edirsə) qayıtsın, saxta bülleten və boş «Reklam sahəsi» qayıtmasın.

**What:** `lib/toolkit/parse-decimal.ts` (vergül/nöqtə onluq; nöqtə yalnız `^\d{1,3}(\.\d{3})+$` olanda min ayırıcı) + `components/toolkit/DecimalInput.tsx` (draft mətn saxlayır, xarici dəyişikliyi render zamanı sinxronlayır, blur-da lokal formata salır). `lib/toolkit/food-cost.ts` `usableLineCost`, `lib/toolkit/menu-matrix.ts` `classifyMenu/menuThresholds` (səhifə faylından çıxdı — Next page faylı əlavə export qəbul etmir). `lib/toolkit/benchmarks.ts` — P&L KPI/insight/xəbərdarlıq mətnləri ICU `{prime}/{rent}/{low}/{value}` ilə. `branch-opening-model.ts` `orPreset()`. Qırmızı: `globals.css` `--dk-red-deep` + `--color-dk-red-deep`, `--dk-gold-text`; homeV2 `.tokens` `--red-ui/--red-ui-h`; Tailwind codemod — eyni sətirdə `text-white` olan `bg-[var(--dk-red)]|bg-brand-red|bg-dk-red|bg-[#E94560]` → `bg-dk-red-strong`, hover → `hover:bg-dk-red-deep` (119 sətir / 85 fayl; Header.tsx və HospitalityHeader-lər toxunulmadı). Xəbərlər: `getMansetNewsArticles()` (yalnız `is_manset` + ≤7 gün), `/haberler` manşet varsa `MansetVitrin` (v2, auto 7 s, hover/focus və reduced-motion-da dayanır), yoxdursa köhnə tək lead; grid-də `isTop` önə; `AdSlot news-inline` siyahıda və detalda; detalda `getLatestShowcaseListings(3)` (yalnız kart sahələri, əlaqə məlumatı yox). `/tanitim` InterVariable.woff2 (352 KB, OFL) + preload.

**Admin → səhifə xəritəsi:** dashboard/xeberler «Xəbər manşet olsun?» → /haberler manşet slayderi (≤7 gün); «Xəbər top olsun?» → kart grid-də önə (və manşet yoxdursa lead seçimində); dashboard/ilanlar status `showcase_ready` → xəbər detalında «Son ilanlar»; dashboard/reklamlar `news-sidebar` → detal sidebar, `news-inline` → siyahıda lead-dən sonra + detalda məqalənin altında. `home-mid`, `blog-inline` placement-ləri admin-də seçilir, amma heç bir səhifə render etmir (açıq məsələ).

**Əvvəl/sonra:** menyu matrisi 100/40/30/30 (CM 8/6/9/5): həddi 50 → 35, CM həddi 7,0 → 7,3 (çəkili), 40-lıq yemək «dog» → «plowHorse». Trim 1 kq·15%·10 ₼: 11,50 → 11,76 ₼. P&L «12.5» (az): 125 → 12,5. İşçi 0, 12 gedən: 1200% → «—». Qonaq evi doluluq 150: qəbul (aylıq brutto 18 000) → 100-ə endirilir + mesaj (12 000). Mətbəx 0 çek: «ideal» → «—». AQTA risk: həmişə 10 → yoxlanmamış (30, bir işarədən sonra 29). Delivery: Wolt 30% / Bolt 25% ayrıca.

**Yoxlama:** tsc 30 (baseline 30); eslint dəyişən 115 fayl 0 xəta (32 köhnə xəbərdarlıq); `parse-decimal` 71/71, `toolkit-formulas` 10/10, bütün `e2e/*.test.ts` 9/9 PASS. Playwright `next dev :3917` 11 route × 390/1280 = 22: hamısı 200, üfüqi daşma 0, viewport-dan kənar 0, 390-da 16px-dən kiçik input 0; kontrast/tap qalıqları yalnız Header.tsx-də (qorunur). Mövcud spec-lər: addim-xerci (spec «6,01» qəbul edəcək şəkildə yeniləndi), pnl number format ru/en/tr keçdi; `pnl-simulator «renders correctly» ru/en/tr` (h1 «P&L») və `financial-viability` (390-da nəticə paneli bağlıdır + Windows `C:/tmp` yolu) TASK-0514-dən qalan uyğunsuzluqdur. Manşet slayderi və «Son ilanlar» yalnız lokal filtr müvəqqəti genişləndirilərək göstərildi (DB-də təzə manşet 0, `showcase_ready` elan 0, reklam 0) — sonra geri qaytarıldı. `npm run build` və dk-validator işlədilmədi.

## 2026-10-09 — TASK-0514: iç səhifələr v2 (Toolkit → Xəbərlər → Bloq) + cookie zolağı + alət sayı

**Why:** Doğan `~/Desktop/DK-ic-sayfalar-v2.html` maketini təsdiqlədi (09.10). Qərarlar: xəbərdə «Bu həftə 1 addım» kartı və yeni DB sahəsi YOX (b variantı), `lib/news/editorial.ts` dəyişmir; Food Cost-a WhatsApp/PDF/lead; «90%» iddiası çıxır; alət sayı 35+ (17 pulsuz).

**What:** Ortaq hissələr: `components/inner/inner.module.css` (tokenlər `homeV2.module.css` `.tokens`-dən `composes` ilə — `.v2` də ondan compose edir), `components/inner/InnerParts.tsx` (BackLink, TelegramBand, ShareLinks, NewsCover, FounderCard, KazanBox, ToolMini, `formatInnerDate`, `readMinutes`), `shared.tsx` ikonları genişləndi, `whatsappHref` `lib/contact-channels.ts`-ə köçdü (server səhifələri də işlədə bilsin; shared re-export edir). `lib/toolkit/tool-directory.ts` — TOOLKIT_CATALOG üstündə qrup/ikon, `FREE_TOOLKIT_COUNT` (pnl-simulator alias → 17), `BLOG_TOOL_MAP` (alət səhifələrinin artıq bağladığı cütlər). `/toolkit` → `ToolkitDirectory`; `ToolkitStudioLayout` props müqaviləsi eyni, yeni optional `resultSummary`, `headerAside`; mobil bottom sheet MobileBottomNav-ın üstündə (64px). 4 öz-UI aləti (qonaq evi, otel, OTA, WhatsApp) `ToolPageShell`-də. Food Cost: maket sətir düzümü (telefonda kart), sektor zolaqları alətin özününkü (28–32 / 22–28 / 35–40), status həddi köhnə (>35, >30), WhatsApp = `wa.me/?text=` (lead deyil), «Doğan bəylə» = `/api/leads/whatsapp`, PDF = `@media print` vərəqi + `window.print()`. Xəbərlər: `getPublicNewsStats()` (yalnız SELECT count), lead story = `getVitrinNewsArticles(1)`, linklər lokallı; köhnə saxta abunə formu, «Son İlanlar» qutusu və MansetVitrin bu səhifədən çıxdı (fayllar qalır), AdSlot sidebarda qalır. Bloq: siyahı server-render (`getBlogPostsFromDb`), `lib/blog/category-groups.ts` qarışıq açarları kodda normallaşdırır, `lib/blog/toc.ts` + `MarkdownRenderer headingIds`, oxu proqresi mövcud `BlogContentWrapper`-dən, KAZAN AI — yalnız link (`/kazan-ai`-də `?q=` prefill yoxdur). Cookie: eyni `dk-cookie-consent` açarı/forması, mətnlər `innerV2.cookie`. `WeeklyActionsPanel` hidrasiya xətası (server boş href) düzəldi. Say: FactsStrip/platformCards/CTASections/page/qiymet/tanitim/llms.txt.

**Yoxlama:** tsc 30 (baseline 35); eslint dəyişən 29 fayl 0 xəta. Playwright `localhost:3917` 12 səhifə × 390/1280 = 24: hamısı 200, console/page xətası 0, viewport-dan kənar element 0. Food Cost: qiymət 10 → 35,3% (əl hesabı 3,529/10), WhatsApp linki nəticə mətni ilə, PDF düyməsi `window.print` çağırır, print media-da vərəq görünür. `npm run build` və dk-validator işlədilmədi.

## 2026-10-08 — TASK-0513: OG önizləmə v2 + AI SEO + /elaqe

**Why:** Doğan WhatsApp önizləməsini paylaşdı (tünd göy kart, serif «HoReCa İdarəetmə, KAZAN AI & Biznes Ekosistemi») — «bizim kimi şirkətə yaraşmır»; `/elaqe` ikonları «berbat»; AI axtarış mühərrikləri üçün məhsul təsviri köhnə idi (llms.txt «toolkit + bloq + elanlar», sosial hesablar JSON-LD-də yox).

**What:** `lib/og/home-og.tsx` ümumi renderer (krem #F6F1E9, Inter 900 başlıq, `public/icon-512.png` data-URL ilə halqalar içində — logo-mobil.png 144 px idi, bulanırdı; nümunə kartı `homeV2.hero.phone.c1`-in 45% → 38% ssenarisindən). `app/opengraph-image.tsx` (AZ) + yeni `app/[locale]/opengraph-image.tsx` (ru/en/tr); `[locale]/layout` og/twitter image dilin öz ünvanına. Mətnlər `ogHome` namespace-də. Şrift: repoda TTF/OTF yoxdur → Inter Google Fonts-dan, `loadGoogleFont`-a 5 s timeout; alınmasa `fonts` ötürülmür (TASK-0508 qaydası), `force-dynamic` qalır. Animasiyalı loqo link önizləməsində mümkün deyil (statik PNG). SEO: `organizationNode` sameAs (SocialIcons-dakı 6 hesab, sahib təsdiqi) + WhatsApp contactPoint; `websiteNode.inLanguage` 4 dil; `serviceCatalogNode` (homeV2.eco.list + «Pulsuz diaqnostika» + KAZAN AI). FAQPage yoxdur (ana səhifədə FAQ yoxdur), SearchAction yoxdur (sayt-geniş axtarış route-u yoxdur). robots: AI crawler qrupu eyni disallow ilə. sitemap: `/tanitim` (yalnız AZ). `/elaqe`: ContactFunnel inline SVG (WhatsApp, Telegram, spark), tracking/`kazan:open`/`/api/leads/whatsapp` eyni.

**Yoxlama:** tsc 35 (baseline 35); eslint dəyişən 13 fayl 0 xəta. `/opengraph-image`, `/ru|en|tr/opengraph-image` → 200 image/png (~123 KB), gözlə baxıldı. `/`, `/ru`, `/en`, `/tr` HTML: yeni title/description, og:image dilin öz şəkli. `/robots.txt`, `/llms.txt`, `/sitemap.xml` → 200. Playwright `localhost:3917` `/`, `/elaqe`, `/ru|en|tr/elaqe` × 390/1280: 10/10 status 200, console 0, viewport-dan kənar 0, scrollWidth = en. `npm run build` və dk-validator işlədilmədi.

## 2026-10-08 — TASK-0511 (2): Telegram kanalı + düzgün vədlər

**Why:** Doğan açıq kanal açdı (t.me/dkagenc, `og:title` «DkAgency Sektör Nabzı» — curl ilə yoxlandı). Yoxlamada `TELEGRAM_HANDLE = 'dkagency'` → t.me/dkagency başqasının kanalı çıxdı («D k logo agency 💸🏷️», 10 abunəçi): sayt müştəriləri yad kanala göndərirdi. Alt CTA-da investisiya/24-7/ödənişsiz konsultasiya vədləri real deyildi (Doğan: «KAZAN var, DeepSeek bağlı; yatırımda yok»).

**What:** `lib/telegram/channel.ts` `postNewsToChannel()` (sendPhoto → olmasa sendMessage, HTML escape, heç vaxt throw etmir; env `TELEGRAM_CHANNEL_ID`, default `@dkagenc`). `approveNewsArticle` yalnız tək təsdiqdə çağırır (bulk `sideEffects:false` kanalı doldurmur). `TELEGRAM_HANDLE` → `dkagenc`, SocialIcons və `tgText` 4 dildə. CTASections vədləri 4 dildə yenidən yazıldı; «Telegram-a yazın» → «Telegram kanalımız».

**Yoxlama:** tsc 35 → 35; eslint dəyişən fayllarda təmiz. Canlı kanal göndərişi test edilməyib — bot kanalda admin olmalıdır.


## 2026-10-08 — TASK-0512 (3): sahib rəyi — sığma, köhnə bölmələrin v2-yə keçməsi

**Why:** Doğan 08.10 (ekran görüntüləri ilə): «səhifə ekrana sığmır, köhnə bölmələr çox bəlli — yaradıcı edin, bəzilərini çıxarın».

**What:** `homeV2.module.css` — `.hero` scoped ölçülər (h1 clamp(36px,4.2vw,58px), telefon 280×540), `phDone` son vəziyyət kartı; yeni bölmə stilləri (nw*, mk*, bl*, ai*, jn*). `NewsPreview.tsx` yerində v2 (data `/api/news?limit=4`, linklər eyni; mətnlər `homeV2.news`-a köçdü; şəkil yoxdursa/yüklənmirsə generasiya olunmuş örtük; mənbə = sourceName → author → host). Yeni `v2/B2BMarket.tsx` (page copy `b2b*` açarları qalır, emoji silindi, ikonlar `shared.tsx`-də), `v2/BlogPicks.tsx` (p3 = wolt-bolt-komissiyon, readMin 12 — `/api/blog` readingTime). `AiReadinessScore.tsx` və `CTASections.tsx` JoinCTA v2 (məntiq, tracking, mətn açarları eyni). `ReceiptHero`: pill bar nowrap + daxili üfüqi scroll, başlanğıc alətləri sol karta keçdi (ikon + `homeV2.receipt.hints`), footer trust + WhatsApp. `page.tsx`-dən ToolkitShowcase, StageSelector, AdsPreview çıxarıldı (`/api/listings` 4 dildə `data: []`).

**Yoxlama:** tsc 35 (baseline 35); eslint dəyişən 9 fayl 0 xəta/0 xəbərdarlıq. Playwright `localhost:3917` `/ /ru /en /tr` × 390/1024/1280×800/1440×900: 16/16 status 200, console 0, pageerror 0, viewport-dan kənar element 0, scrollWidth = en; hero bottom 729px (800 və 900 viewport). `npm run build` və dk-validator işlədilmədi.

## 2026-10-08 — TASK-0512: feat(home): ana səhifə /tanitim v2 dizaynında

**Why:** Doğan /tanitim satış səhifəsini təsdiqlədi və ana səhifənin də eyni hissi verməsini istədi (08.10).

**What:** `components/home/v2/` — `HeroPhone`, `FactsStrip`, `EcoOrbit`, `ModuleTabs`, `StepsTimeline` (+ `shared.tsx` ikonlar/reveal/reduced-motion, `homeV2.module.css`, `font.ts` Inter 400–900). `app/[locale]/page.tsx`: `ReceiptHero` → `HeroPhone` + `FactsStrip`, `PlatformCards` → `EcoOrbit`; sonra `ModuleTabs`, `StepsTimeline`, qalan bölmələr eyni ardıcıllıqla (heç nə silinmədi; ReceiptHero/PlatformCards faylları qalır). Kök div `overflow-x-hidden` → `overflow-x-clip` (hidden scroll konteyneri yaradıb sticky tab bar-ı sındırırdı). Mətnlər `homeV2` namespace-də 4 dildə (263 açar); nümunə cədvəl dəyərləri komponentdə sabitdir, hər dildə eynidir. WhatsApp CTA-ları `/api/leads/whatsapp`. `Header.tsx`: «Modullar» mega menyu (yalnız xl+), mobil menyuda açılan sadə siyahı; mətn Header-in öz `NAV_COPY` modelindədir (Header provider-dən asılı deyil). OCAQ bəndi `/#p-ocaq` → ana səhifədə OCAQ tabı açılır (`hashchange`). 7-ci menyu bəndi RU-da 1280px-də sətri sındırırdı — xl-də padding azaldıldı, 2xl-də əvvəlki ölçü.

**Yoxlama:** tsc 35 → 35 (baseline), eslint dəyişən fayllar 0 xəta (2 köhnə `<img>` xəbərdarlığı). Lokal `next dev` + Playwright: `/az` (307 → `/`), `/ru`, `/en`, `/tr` 200; 390 və 1280-də console/page xətası 0, viewport-dan kənar element 0 (bounding rect yoxlaması, tab bar uşaqları xaric), scrollWidth = en; tab keçidi, siqnal → addım dövrü, `/#p-ocaq`, sticky tab bar (header altı 64/68px), reduced motion (son vəziyyət) yoxlandı. `npm run build` və dk-validator bu sessiyada işlədilmədi.

## 2026-10-08 — TASK-0512 (2): bölmə ardıcıllığı, ReceiptHero v2, QuickAccess

**Why:** Doğan 08.10: ReceiptHero geri qayıtsın (ikinci bölmə, «biraz daha kaliteli»), 1000–1200px-də səhifə böyük görünür, PlatformCards əvəzinə kiçik sürətli keçid.

**What:** `ReceiptHero.tsx/.module.css` yerində yenidən stilləndi (funksiya və `home.receiptHero` mətnləri eyni; yeni `homeV2.receipt` başlığı 4 dildə; çek görünəndə «çap olunur» — IntersectionObserver, reduced motion-da statik; `Qalan` və itki rəqəmi count-up). Segment başlığı h1 → h3 (səhifədə tək h1 HeroPhone-dadır). Yeni `v2/QuickAccess.tsx` (`home.platformCards` + `homeV2.modules.beta` açarları). `StepsTimeline` opsional `image` prop-u alır — köhnə inline «how it works» bölməsinin konsaltinq şəkli (alt: `copy.consultingAlt`). `page.tsx`-də bloq bölməsi (sahibin siyahısında yox idi) StageSelector ilə AdsPreview arasında qalır. `.heroCta .btn` 52px / 0 26px / 16px / 12px.

**Yoxlama:** tsc 35 (baseline), eslint dəyişən fayllar 0 xəta (1 köhnə `<img>` xəbərdarlığı). Playwright (dev :3917): `/` (az), `/ru`, `/en`, `/tr` 200 × 390/1024/1280/1440 — console/page xətası 0, viewport-dan kənar element 0; kalkulyator: məhsul 19 000 → 30 000 ⇒ Qalan 9 000 → −2 000 ₼, food cost 38,0% → 60,0% (4 dildə). `npm run build` və dk-validator işlədilmədi.

## 2026-10-08 — TASK-0511: feat(telegram): owner business notifications

**Why:** Doğan «telegramı aktif olsun, yap hepsini» (08.10) — lead, üzv, elan və həftəlik xülasə Telegram-a.

**What:** `lib/telegram/notify-owner.ts` (heç vaxt atmır, konfiq yoxdursa `false`). Route-larda `after()` ilə çağırılır — lead yadda saxlanması və cavab bloklanmır. WhatsApp yönləndirməsi `leads`-ə `wa_redirect` yazır (varchar, migration yoxdur). Elan təsdiqi üçün `lib/listings/set-status.ts` çıxarıldı, `batch-status` da ona keçdi (eyni `canTransition`). Təsdiq düyməsi submitted → committee_review → showcase_ready addımlarını ardıcıl icra edir. Route-policy registry yoxdur.

**Yoxlama:** tsc xəta sayı 35 → 35 (dəyişməyib, mövcud xətalar), eslint dəyişən 13 fayl 0 xəta. Canlı Telegram testi EDİLMƏYİB (real mesaj göndərilmədi) — deploydan sonra yoxlanmalıdır; webhook callback-i də canlıda sınanmalıdır.

## 2026-10-08 — TASK-0509: feat(tanitim): /tanitim

**Why:** 07.10-da satış üçün tanıtım prototipi hazırlanmışdı (`~/Desktop/DK-Agency-Tanitim-Prototip.html`, DK reposunda da commit olunmamış nüsxə) — sayta qoşulmamışdı.

**What:** Prototip müstəqil səhifədir (öz nav/footer/CSS/JS), React-ə köçürmək dizaynı pozardı — təmizlənmiş nüsxə `public/tanitim/index.html`, `app/tanitim/route.ts` onu `/tanitim`-də verir (middleware yalnız dil prefiksli yolları tutur). Təmizləmə skripti repoda (`scripts/tanitim/clean_tanitim.py`). Çıxarılanlar: «240+» (kodda qarşılığı yox), VÖEN sətri (Doğan: VÖEN yoxdur), daxili TASK nişanları, og diaqnostika kartı. Əlavə: og/canonical meta, B2B grid-in mobil 1 sütunu. «Təsisçi» qaldı (Doğan təsdiqi). Ana səhifə toxunulmadı.

**Yoxlama:** lokal `next dev` + Playwright: `/tanitim` 200 `text/html`, 50.6 KB; mətndə VÖEN/TASK-0/240/og:title yoxdur; kalkulyator 60 000 ₼ + 45% → «108,000 ₼ / il» (60 000 × 15% × 12); JS xətası 0; 390px scrollWidth 390 (əvvəl 556), 1280px 1280. Tam səhifə ekran görüntüləri baxıldı.

## 2026-10-08 — TASK-0509 (3): düzəliş — Sektor Nəbzi iddiası doğru idi

Yoxlama agenti yalnız `newsSources.ts` və söndürülmüş `fetch-news.yml`-ə baxmışdı. Əslində `news-ingest.yml` hər 6 saatdan bir (`0 0,6,12,18 * * *`) işləyir və `lib/news/rss-ingest.ts`-də 41 RSS lenti var (Skift, Restaurant Dive, Hotel Dive, Hospitality Net, NRN, AZERTAC, Trend, Report…). İddia «40+ mənbə, hər 6 saatdan bir, Telegram təsdiqi» kimi səhifəyə qaytarıldı. Dərs: «uydurma» hökmündən əvvəl iddianın bütün kod yolunu (workflow + lib) yoxla.

## 2026-10-08 — TASK-0509 (2): /tanitim Kutlerri üslubunda yenidən

**Why:** Doğan kutlerri.ai-ni nümunə verdi («dizaynı süper»). Haiku agentinin sətir-sətir yoxlaması prototipdə mənbəsiz iddialar tapdı və onlar əl ilə təsdiqləndi: «İtkinin 80%-i 4 məhsulda», KAZAN cavablarında «ROI 14 ay», «100 addım = 1.5 saat», «3 saniyə», «Canlı API … TQTA bazasından cəlb», təsdiqsiz sitat.

**What:** `public/tanitim/index.html` sıfırdan yazıldı (müstəqil HTML, `app/tanitim/route.ts` dəyişmədi). Doğan qərarları (08.10): «40 il» doğrudur, «Qurucu», «Pulsuz diaqnostika» (müddət yazılmır), model = razılaşan şirkətə xüsusi xidmət, üzvlük «tezliklə». Statuslar koda uyğundur: 18 alət `app/toolkit/*`, delivery-calc, menu-matrix, food-cost; KAZAN AI beta (`messages/az.json`); OCAQ mətni ana səhifədəki «10+ filiallı şəbəkədə hər gün işləyir» ilə eyni. WhatsApp CTA-ları `/api/leads/whatsapp` üzərindən (nömrə `lib/contact-channels.ts`-dən). Nümunə cədvəllərdəki rəqəmlər daxili ardıcıldır (məs. 3,40/7,50 = 45%, 20 ₼ × 25% = 5 ₼). `prefers-reduced-motion` dəstəklənir, hər canlı kartda dayandırma düyməsi var. `scripts/tanitim/clean_tanitim.py` artıq istifadə olunmur (prototipi yenidən yazsa yeni səhifəni silər) — silinməsi Doğan-a verildi.

**Yoxlama:** Playwright (file://) 390 və 1280: scrollWidth = clientWidth (390/390, 1280/1280), JS xətası 0, kalkulyator 60 000 ₼ + 45% → «9 000 ₼ / ay»; ekran görüntülərinə baxıldı (hero, delivery tabı, mobil tam səhifə). Mətndə VÖEN/TASK-0/240/Skift/25+/14 ay/100 addım/80%/30 dəq/Təsisçi yoxdur.

## 2026-10-08 — TASK-0508: fix(ci): dk:validate həqiqətən yoxlasın

**Why:** TASK-0507 zamanı `/tmp/dk-playwright.log`-da Playwright çıxışı yox, tək sətir «ALL PASS (247 yoxlama)» görüldü. Səbəb: `e2e/az-format.test.ts` (29.09, TASK-0462) adi tsx skriptidir və import zamanı `process.exit(0)` çağırır; Playwright testDir-dəki bütün faylları toplayanda proses heç bir spec başlamadan 0 ilə çıxırdı. Üstəlik 6–8 addımları `localhost:3000`-ə curl edirdi — validator DK serverini özü qaldırmırdı. 29.09-dan bəri hər «dk-validator PASS» (bu sessiyada TASK-0503–0507 daxil) 6–8 üçün sübut deyildi.

**What:** `testMatch: '**/*.spec.ts'`; validator build-dən sonra öz `next start`-ını boş portda qaldırır və cavabda «DK Agency» axtarır; Playwright xülasəsi olmayan exit 0 = FAIL; Node skriptləri 8a-da; commit-dən sonra dəyişən fayllar `origin/main...HEAD`-dən; `npm install --no-save`. Yan tapıntı: TASK-0510 OG şəkli build prerender-ində Google Fonts alınmayanda boş `fonts: []` ilə satori «No fonts are loaded» verdi və build yıxıldı → OG şəkli `force-dynamic`, boş fonts ötürülmür.

**Yoxlama (ilk real qaçış):** `[6] http://localhost:3901` core routes 200/307; Playwright `34 passed, 18 skipped` (0 failed); Node skriptləri 7/7; build 210/210. 18 skip — `JWT_SECRET` env yoxdur; açıq qərar: validator test açarı versin? (bəzi testlər DB-yə yazır, lokal DB-nin canlı olub-olmadığı bilinmir).

## 2026-10-08 — TASK-0510: fix(seo): link önizləməsi

**Why:** Doğan: «dkagency.com.tr-ni WhatsApp-a kopyalayanda çıxan yazı və şəkil şık deyil». Canlı yoxlama (bir sorğu): og:image «DK» yazılı qırmızı kvadrat + `fontFamily: 'sans-serif'` — satori-yə şrift verilmirdi, 800 qalınlıq tətbiq olunmurdu; mətn tanıtım prototipindəki tövsiyəyə uyğun deyildi.

**What:** OG şəkli real loqo + Playfair/DM Sans (Google Fonts, yalnız lazımi gliflər); şrift endirilməsə standart şriftə düşür ki, build şəbəkəsiz yerdə yıxılmasın. Başlıq/açıqlama 4 dildə: kök `/` üçün `app/page.tsx` metadata, dillər üçün `[locale]/layout` openGraph — `app/layout.tsx` qorunan fayldır (pre-commit bloku), toxunulmadı. `[locale]` səviyyəsində openGraph verildikdə kök `opengraph-image` həmin seqmentdə düşürdü (`/ru`-da og:image yox idi) — şəkil açıq yazıldı. Şrift yükləyici `lib/og/load-google-font.ts`-ə çıxarıldı, xəbər kartı da onu işlədir.

**Yoxlama:** lokal `next dev`: `/opengraph-image` → 200, 134 KB PNG (gözlə yoxlandı: loqo, Playfair başlıq, 4 nişan); `/`, `/ru`, `/en`, `/tr`, `/ru/toolkit` HTML-də yeni og:title + og:image; `/toolkit` (prefikssiz) hələ köhnə mətn — root layout icazəsi gözləyir. eslint 0 xəta. Canlı sübut deploy sonra.

## 2026-10-08 — TASK-0507: feat(b2b-panel): 3 boş səhifə

**Why:** `teklifler`, `bildirimler`, `destek` 13.09 HANDOFF-dan bəri «Bu bölmə hazırlanır» idi (mətn də hardcoded AZ). Üzv menyudan basıb boş səhifə görürdü; panelin «Gələn Təkliflər» sayğacı da təklif siyahısına aparmırdı.

**What:** Yeni backend yoxdur. `GET /api/listings?scope=owner` (TASK-0499-dan sonra sahibə `leads` + status + `rejectedReason` qaytarır) ortaq `useOwnerListings` hook-u ilə oxunur; təkliflər və bildiriş lenti ondan qurulur. `source:'mock'` boş sayılır — `getOwnerListings` DB olmayanda bütün `MOCK_LISTINGS`-i istənilən üzvə verir, saxta təklif göstərilməsin. Dəstək kanalları `lib/contact-channels.ts`-dən. Tarix əl ilə `dd.mm.yyyy`: Chromium-da `toLocaleDateString('az-AZ')` «2026 M10 7» verir. FAQ cavabları yalnız sistemdə olan axını təsvir edir (müddət/vəd yoxdur).

**Yoxlama:** lokal `next dev` (port 3487 — 3123-ü OCAQ sessiyası tuturdu), imzalı test cookie, Playwright: fixture (1 yayımlanmış elan + 2 təklif, 1 rədd edilmiş elan) → təkliflər 2, bildirişlər 4 (2 təklif, rədd + səbəb, yayımlandı), dəstək 3 kanal; boş DB cavabı → «Hələ təklif yoxdur» + «Yeni elan». 390 və 1280-də `scrollWidth` = viewport. `/api/leads/whatsapp?text=Salam` → 307 `wa.me/994502566279?text=Salam`. eslint 0. Telefonda sidebar düzəlişi TASK-0506-dadır (bu branch main-dən açılıb). **Diqqət:** `dk:validate` 8-ci addımı (Playwright @smoke) 29.09-dan bəri əslində test işlətmir — `e2e/az-format.test.ts` toplama zamanı `process.exit(0)` çağırır və «ALL PASS (247 yoxlama)» onun öz çıxışıdır. Bu task-ın UI sübutu yuxarıdakı Playwright skriptidir, validator-un 8-ci addımı deyil.

## 2026-10-08 — TASK-0505: feat(marketinq-ocagi): «Xəbər ver»

**Why:** HANDOFF roadmap C — 5 alət `status:'planned'` idi, kart yalnız «Yaxında» yazırdı, maraq heç yerdə toplanmırdı. Hansı aləti əvvəl qurmaq lazım olduğunu bilmək üçün real tələb siqnalı lazımdır.

**What:** Yeni cədvəl açılmadı — mövcud `user_events` (`user_id`, `event_type`, `payload jsonb`) üzərində `tool_notify_request`. Ümumi `/api/user/events` istifadə edilmədi: o, slug-u yoxlamır və təkrarı saymır. Ayrıca `/api/marketing-tools/notify`: yalnız planned alət, bir üzv × bir alət bir sətir, GET admin-ə alət başına `count(distinct user_id)` verir. Kart: düymə → yaşıl «xəbər veriləcək»; admin üçün «N üzv gözləyir».

**Yoxlama:** eslint 0; tsc 35 = main 35 (yeni fayllarda 0); drizzle-in generasiya etdiyi 3 SQL (`payload->>'toolSlug'` filtr/group by) çap olunub yoxlanıldı — lokal Postgres yoxdur, canlı DB-yə yazılmadı. Lokal `next dev` (JWT_SECRET=x, imzalı test cookie): auth-suz GET/POST → 401; naməlum slug və hazır alət (`marka-kompasi`) → 400 `Invalid tool`; üzv GET → 200 `{"requested":[]}`, admin GET → 200 `{"requested":[],"counts":{}}`. Playwright (POST brauzerdə tutuldu, DB-yə getmədi): 4 «Yaxında» kartında düymə, klikdən sonra «Hazır olanda xəbər veriləcək», admin kartında «0 üzv gözləyir». dk:validate 9/9. **Ayrıca tapıldı (bu task-a aid deyil):** `/b2b-panel/*` 390px-də sidebar (288px) həmişə açıqdır, məzmuna ~100px qalır — bütün üzv portalı telefonda istifadə olunmur. Canlı sübut deploydan sonra: bir üzv basır → `SELECT event_type, payload FROM user_events WHERE event_type='tool_notify_request'`.

## 2026-10-08 — TASK-0506: fix(b2b-panel): mobil sidebar

**Why:** TASK-0505 yoxlamasında 390px ekran görüntüsü: `/b2b-panel/*`-da `<aside class="w-72 min-h-screen">` flex-də sabit qalırdı, heç bir mobil qayda yox idi → `main` x=288, en=102. Bütün üzv portalı telefonda istifadəyə yararsız idi (trafikin 60%+ mobildir).

**What:** Dashboard-dakı mövcud desen (`DashboardLayout` + `DashboardSidebar`) üzv sidebar-ına köçürüldü: `lg`-dən aşağı fixed + `-translate-x-full`, üst bar ☰, overlay, bağla düyməsi, Esc. Səhifə keçəndə bağlanma effektsiz edildi (açıldığı `pathname` saxlanır, `react-hooks/set-state-in-effect` qaydası). `main` `pt-14 lg:pt-0 min-w-0`. 4 dildə aria-label.

**Yoxlama:** lokal `next dev` + imzalı test cookie, Playwright ölçüləri: 390 bağlı `{mainX:0, mainW:390, sidebarX:-288, scrollW:390}`; ☰ → `sidebarX:0`; «Elanlarım» linki → `/b2b-panel/ilanlarim`, `sidebarX:-288`; Esc → `-288`; 1280 `{mainX:288, mainW:992, sidebarX:0}` (əvvəlki kimi). eslint 0 xəta (3 köhnə + 1 yeni `<img>` warning — faylın mövcud deseni). tsc-də yeni xəta yoxdur (2 əlavə sətir köhnə `.next/types`-dandır).

## 2026-10-08 — TASK-0504: chore(ci): Actions dəqiqə qənaəti

**Why:** Hesab GitHub Free-dir, ödəniş üsulu yoxdur; aylıq pulsuz dəqiqə hovuzu bütün özəl repolar arasında ortaqdır. Oktyabrın ilk 8 günündə $14.08 brüt (hamısı pulsuz paketdən): -ocaq-app $9.22, tqta-files $2.90, dk-agency-platform $1.96. Hovuz bitəndə GitHub heç bir işi başlatmır — DK, TQTA, OCAQ deploy-ları ay sonuna qədər dayanır. Doğan bütün sessiyalar üçün qayda istədi (`~/.claude/CLAUDE.md` §1).

**What:** `ci.yml` — `concurrency` + `cancel-in-progress`, `timeout-minutes: 15`, məzmun-only PR-da ağır addımlar ötürülür. `paths-ignore` seçilmədi: main qoruması "CI / quality-gates"-i tələb edir, iş heç başlamasa auto-merge-content PR-ı gözləmədə qalardı. drift-audit / state-snapshot / news-ingest notify-failure job-larına timeout (əvvəl 360 dəq. default idi).

**Toxunulmadı:** `news-ingest` gündə 4 dəfə (TASK-0494 qərarı) — ən çox dəqiqə yeyən DK işi budur (hər dəfə npm ci + 3 skript), azaltmaq Doğan-ın qərarıdır.

**Yoxlama:** 6 workflow js-yaml ilə yükləndi; job timeout cədvəli — hamısında var; scope skripti lokal: `da122c0` (yalnız sənəd) → `content=true`, `b3a07dc` (TASK-0503 kod) → `content=false`. Real Actions run-u PR açılanda görünəcək.

## 2026-10-08 — TASK-0503: fix(ai): Claude fallback → Sonnet 5.5

**Why:** DeepSeek çökəndə KAZAN AI `claude-sonnet-4-6`-ya düşürdü. Sonnet 5.5-də düşünmə default açıqdır və düşünmə tokenləri `max_tokens`-dan yeyilir — 1000–1200 limitli qısa çağırışlarda cavab boş qala bilərdi. 5.x həmçinin sonda qalan `assistant` mesajını prefill sayıb 400 qaytarır və təhlükəsizlik rəddini HTTP 200 + `stop_reason: "refusal"` kimi verir (əvvəl boş mətn kimi görünərdi).

**What:** `lib/ai-models.ts` fallback `claude-sonnet-5-5`; `claudeThinkingOff()` — Sonnet 5.5 üçün `{type:'between_tools'}` (`disabled` bu modeldə 400; effort göndərmirik, default `high` — limit daxilində). `temperature` yalnız allowlist modellərinə gedir (Sonnet 5.5 default olmayan dəyəri 400 ilə rədd edir); `claude-sonnet-4-5` allowlist-dən çıxdı. `ai-router.ts` + `kazan-ai/route.ts`: refusal tutulur, stream-də yalnız `text_delta` yığılır; KAZAN `normalizeMessages` tarixçənin baş/sonundakı `assistant`-i kəsir.

**Düzəliş (yarımçıq versiyada):** ilk qaralamada "ucuz rejim" üçün `claude-haiku-5-5` yazılmışdı — belə model YOXDUR (cari Haiku `claude-haiku-4-5`). Env-ə yazılsaydı fallback 404 verərdi. Silindi; Haiku 4.5 üçün thinking parametri lazım deyil (default söndürülüdür).

**Yoxlama:** model-check (tsx): default → `claude-sonnet-5-5`, temperature yox, thinking `between_tools`; `claude-sonnet-4-6` / `claude-haiku-4-5` → temperature var, thinking yox; `claude-sonnet-4-5` / naməlum → heç biri. eslint 0; tsc 35 = main 35 (toxunulan fayllarda 0); `npm run build` exit 0 (210/210). Canlı Claude çağırışı edilmədi (ödənişli açar) — deploydan sonra DeepSeek-i söndürmədən fallback yolu yalnız DeepSeek çökəndə işləyir.

## 2026-10-07 — TASK-0502: feat(home): əlaqə yolu, OCAQ kartı və düzgün rəqəmlər

**Why:** Ana səhifə auditi (Bulgu Kasası, 07.10): (1) `JoinCTA` formunun `onSubmit`/`action`-u yox idi — «Göndər» basan lead itirdi; (2) ana səhifədə WhatsApp yox idi, Bakıda HoReCa sahibi forma doldurmur, yazır; (3) OCAQ kartı «lead idarəsi, faktura OCR» deyirdi, real OCAQ isə çoxfilialı əməliyyat portalıdır, «OCAQ-a gir» admin-only `/dashboard/ilanlar`-a aparırdı (ziyarətçi login-ə düşürdü); (4) «10/11 alət» yazılırdı, `app/[locale]/toolkit/*/` — 18. Doğan: «kod yazabilirsin», «10 üstü filial deyək».

**What:** `JoinCTA`-da forma çıxarıldı → WhatsApp + Telegram düymələri, klik `ContactFunnel` ilə eyni `/api/leads/track` axını (`source: 'home_join'`, admin e-poçtu «Ana səhifə — WhatsApp»); hero-da CTA-ların altına ikinci dərəcəli «Sualınız var? WhatsApp-a yazın» (bir qırmızı düymə qaydası qorunur); OCAQ kartı yeni mətn (4 dil) + `/api/leads/whatsapp` hazır mesajla; kart linkləri `withLocale` (RU/EN/TR-də prefiks itirdi); ana səhifə və `/qiymet`-də alət sayı 18, bloq üçün dəqiq olmayan «10» çıxarıldı. Miqrasiya yoxdur (`leads.source` varchar).

**Yoxlama:** `next build` 0 xəta; eslint dəyişən fayllarda 0 xəta (2 köhnə warning); lokal `next start`: `/`, `/ru`, `/toolkit`, `/qiymet`, `/elaqe` → 200; `/api/leads/whatsapp?text=test` → 307 `wa.me/994502566279`; Playwright 1280/390 + `/ru`: `#join form` = 0, `/dashboard` linki = 0, OCAQ CTA `leads/whatsapp`, RU kart linkləri `/ru/toolkit/...`, yatay sürüşmə yox, pageerror yox. **Yoxlanmadı:** `POST /api/leads/track` `home_join` ilə — dev=prod Neon, müsbət test canlı bazaya sətir yazır; deploy sonrası klik ilə yoxlanmalıdır.

## 2026-10-06 — TASK-0501: feat(home): xəbərlər və elanlar yuxarı

**Why:** Doğan: "haberler ile ilanları biraz yukarı alsak". Xəbərlər 8-ci, elanlar 9-cu bölmə idi — ziyarətçi demək olar görmürdü.

**What:** `app/[locale]/page.tsx`-də `<NewsPreview />` + B2B elanlar bölməsi `<ReceiptHero />`-dan dərhal sonraya köçürüldü; digər bölmələr dəyişmədi. Öncə/sonra (canlı vs lokal build) 1440 və 390 px ekran görüntüləri sahibə göstərildi, təsdiq: "haberleri al yukarı".

## 2026-10-06 — TASK-0498: feat(supply): Təchizatçı bazası və Tələb lövhəsi

**Why:** Sahibin iki WhatsApp HoReCa qrupunda təchizatçı təklifləri və alıcı sorğuları («kimdə var?», «hardan tapım?») itib gedirdi. Qərar: son 6 ay sistemə idxal olunsun, məlumat admin panelində gizli qalsın (fərdi məlumat qanunu), açıq kataloq yalnız razılıqdan sonra (`public_consent` indi saxlanılır, açıq səhifə yoxdur).

**What:** Python prototipi (parse/classify2/report) TS-ə köçürüldü, mesaj-mesaj müqayisə ilə 3 uyğunsuzluq tapılıb düzəldildi: (1) JS `\b` ASCII-dir — `\bət\b` heç vaxt tutmurdu; (2) Python `re.I` `i`↔`ı`↔`İ`-ni bərabər sayır — «lazimdi» sorğu sayılmırdı (39 sorğu təklif kimi düşürdü); (3) emoji Python-da 1, JS-də 2 simvol. Nəticə 23 206/23 206. İdxal SQL-də birləşdirir (jsonb DISTINCT), təkrar idxal sayları şişirtmir; PGlite-da real Postgres üzərində sınandı. Böyük ZIP brauzerdə açılır (500 MB yükləmə yox). Tələb ↔ təchizatçı uyğunlaşdırması kateqoriya kəsişməsi ilə (`imtina` xaric). `.vcf` kartları idxal edilmir — üçüncü şəxsin nömrəsidir.

**Yoxlama:** build 0 xəta; lokal `next start`: səhifə admin 200 / auth-suz 307 / üzv 307; API auth-suz 401, üzv 403; canlı bazada cədvəl yoxdur → 503 `tables_missing` və UI-da «miqrasiyanı işə salın» halı; real ixracla preview 200 (bazaya yazmır). Canlıya: merge → deploy → `npm run db:migrate` → restart.

## 2026-10-06 — TASK-0500: fix(telegram): setup düyməsi və 429

**Why:** Doğan `/api/telegram/setup` açdıqda `"setWebhook":"Too Many Requests: retry after 1"` aldı. Brauzer ünvan sətrində yazılan URL-i əvvəlcədən yükləyir → route 1 saniyə içində 2 dəfə çağırılır, Telegram ikinci `setWebhook`-u 429 ilə rədd edir; birinci uğurlu olsa da sahib xəta görürdü.

**What:** route əvvəl `getWebhookInfo` — URL və `allowed_updates` (callback_query+message) artıq düzdürsə `setWebhook` çağırılmır; 429-da `retry after N` (≤5 s) gözləyib 1 dəfə təkrar; cavaba `allowedUpdates`; POST dəstəyi. Panel: WhatsApp import səhifəsində kart + düymə (4 dil), nəticə "Bot hazırdır" / səbəb.

## 2026-10-06 — TASK-0499: fix(security): elan API-də şəxsi məlumat sızması

**Why:** TASK-0497 zamanı aşkarlandı: `GET /api/listings/[id]` autentifikasiyasız işləyirdi, istənilən id üçün (qaralamalar da daxil) `leads` (maraqlanan şəxslərin ad, telefon, e-poçtu), `reviewNotes` və sahibin e-poçtunu qaytarırdı; id ardıcıl olduğu üçün hamısı sadalana bilərdi.

**What:** admin → tam (+privateContact); JWT sahibi (`ownerId === userId`) → tam; digərləri → yalnız `showcase_ready`/`sold`, `leads`/`reviewNotes` boş, `email` çıxarılıb; qalanı 404. İstehlakçılar: admin panel (admin), b2b-panel/ilanlarim (sahib) — dəyişmədən işləyir; ictimai detal səhifəsi server tərəfdə `getListingBySlug` istifadə edir.

## 2026-10-06 — TASK-0497: feat(listings): WhatsApp-dan elan

**Why:** Devir/franchise/icarə/ekipman elanları WhatsApp qruplarında dövr edir. Rəsmi WhatsApp API üçüncü tərəf qruplarını oxumur, qeyri-rəsmi scraping ban + fərdi məlumat riski daşıyır → sahib mətni yapışdırır və ya Telegram botuna forward edir, hər qaralamaya özü baxır.

**What:** Parser (`lib/listings/whatsapp-import.ts`) — iOS/Android ixrac sətirləri, media placeholder-lər atılır; DeepSeek batch; zod + `TYPE_SPECIFIC_FIELDS` (SST) ilə təmizləmə. Prompt qaydaları canlı sınaqdan sonra sərtləşdi: aralıq («38-42 min») rəqəm sahəsinə yazılmır, «yer axtarıram» tipli tələb mesajları keçilir, `propertyType` yalnız kirayə/satış açıq yazılıbsa. Ortaq insert `createListing()`; qaralama sətri `buildDraftValues()` (test SQL-ə kompilyasiya edir, icra etmir). Poster əlaqəsi `contact_*` sütunlarında — `mapDbListing` bunları açıq səhifəyə vermir; `GET /api/listings/[id]` açıq olduğu üçün `privateContact` yalnız admin sessiyasında əlavə olunur. Telegram: `classifyTelegramUpdate()` — callback həmişə birinci (xəbər axını), sonra yalnız `TELEGRAM_CHAT_ID`-dən komanda olmayan mətn; emal `after()` ilə cavabdan sonra (Telegram retry → dublikat qaralama olmasın).

**Yoxlama:** real DeepSeek ilə 11 nümunə (AZ/RU/TR/EN, 3 mesajlı ixrac, söhbət, qeyri-müəyyən) — 11/11 düzgün növ/skip, təsvirlərdə telefon qalmadı. `e2e/whatsapp-import.test.ts` 55/55 (oflayn stub). Lokal `next start`: səhifə admin 200 / qonaq və üzv 307; API qonaq 401, üzv 403, yanlış bədən 400, 31 element 400; admin önizləmə 200 (3,5 s, DB yazısı yox). Webhook simulyasiyası (Bot API preload stub ilə tutulur): yanlış secret 401, xəbər callback → «Naməlum əmr» (xəbər handler-i), başqa çat callback → «İcazə yoxdur», başqa çatdan mətn/`/start` → heç bir çağırış, sahibin söhbət mesajı → «Mesajda elan tanınmadı». Confirm canlı bazaya qarşı icra olunmadı (qadağa; lokal Postgres yoxdur). Screenshot-lar 1440/390, üfüqi overflow 0. dk-validator 9/9 PASS.

**Qeyd (köhnə, bu task-da düzəldilməyib):** `GET /api/listings/[id]` auth-suzdur və `leads` (müraciət edənlərin telefon/e-poçtu) qaytarır; açıq `getListingBySlug` status yoxlamır. Ayrıca task tələb edir.

## 2026-10-06 — TASK-0496: feat(header): İş elanları linki

**Why:** Doğan (sahib) Header.tsx dəyişikliyinə icazə verdi: "ekle". TASK-0495 ilə gələn `/is-elanlari` səhifəsi menyuda yox idi.

**What:** NAV_COPY-a `jobs` (4 dil), `navItems`-ə `/is-elanlari` (masaüstü + mobil eyni siyahı). 6 menyu bəndi ilə RU 1024px-də loqo və "Разместить объявление" iki sətrə düşürdü → masaüstü nav/Elan ver `lg`→`xl`, hamburger `lg:hidden`→`xl:hidden`. Yoxlama: ru 1024/1279/1280, az 1280, en 1440 — overflow yox, header 64-68px.

## 2026-10-06 — TASK-0495: feat(jobs): TQTA ilə işləyən «İş elanları» səhifəsi

**Why:** Sahib qərarı: DK vitrindir, TQTA mühərrikdir — CV, uyğunlaşdırma və müraciət TQTA-da qalır, DK bazasında vakansiya dublikatı olmur. DK-da kadr axtaran restoran sahibi üçün vakansiya səhifəsi və işəgötürən CTA-sı yox idi; KAZAN AI kadr sualına yalnız Personel Planlayıcı verirdi.

**What:** `lib/tqta/jobs.ts` — TQTA public API (`aktif=true&limit=100`; default 50 idi, 63 elan var), zod ilə hər sətir ayrıca yoxlanır, saf `processTqtaPayload` (süzgəc + normallaşdırma: şəhər variantları «Baki/BaKI/Nerimanov…» → Bakı, kateqoriya/iş tipi TQTA enum-ları + `kafe`/`idareetme`/`uzaqdan`), xətada `{ ok: false }`. `components/jobs/JobsPage.tsx` server komponenti (Pattern A, `jobs` namespace), filtr link çipləri (flex-wrap, L-045), kartlar, işəgötürən bloku. Route `[locale]` + kök re-export (L-038/L-056). KAZAN: `site-context.ts` top 10 vakansiya + işəgötürən linki (10 dəq keş), `system-prompt.ts` 13-cü qayda.

**Yoxlama:** build 0 xəta; 4 dil 200, `/az/is-elanlari` 307; TQTA host-u `.invalid`-ə yönləndiriləndə səhifə 200 + «hazırda yüklənmir»; 1440/390 px screenshot, üfüqi overflow 0; KAZAN (DeepSeek) AZ və EN cavabında `/is-elanlari` linki. TQTA-da vitrinə çıxmayan 2 elan: #67 «Açık kapı günü» (məzmun yoxdur, logo veb səhifə URL-i), #65 E2E test elanı.

## 2026-10-06 — TASK-0494: fix(news): Azərbaycan xəbərlərinin keçməməsi

**Why:** Doğan: "Yeni xəbərlərdə şəkillər var, amma Azərbaycan xəbəri yoxdur." 2026-10-05 21:19 run: 0 `.az` sətir. Səbəblər: (1) 30 yerlik limit bal üzrə doldurulurdu — uzun təsvirli xarici trade xəbərləri (10+ bal) yerləri tuturdu; (2) 4 günlük yaş limiti az həcmli Trend turizm lentini kəsirdi (300 "too old"); (3) RU "гастроном" yox idi; (4) Report.az GitHub-dan 403 (bot UA); (5) redaktor lint "Agentlik"i alt-sətir kimi axtarırdı → "Turizm Agentliyi" olan 2 xəbər düşdü.

**What:** `Feed.region='az'` → 14 gün, 10 ayrılmış yer, relevance +10 (sintez AZ-ı birinci yazır); Google News yoxlamasında yerli HoReCa xəbərlərinin çıxdığı 8 AZ saytının RSS-i əlavə edildi (yoxlanılıb: 200 + item); RU/AZ terminlər (гастроном, qastronom, кулинар, kulinar); AZ/RU zorakılıq başlıqları blok; brauzer UA; lint tam söz; cron 6 saatdan bir. Canlı dry-run: AZ lentlərindən 0 → 14 keçən xəbər; fixture 29/29.

## 2026-10-05 — TASK-0493: fix(news-admin): dərc olunmuş xəbərlərin toplu silinməsinə qoruma

**Why:** Doğan gözləyən/rədd edilmiş xəbərləri toplu sildi; "Hamısı" tabının ilk səhifəsində ən yeni dərc olunmuş xəbərlər də (AİİQA #1064, #1063, #1058, #1057) seçimə düşüb silindi. Panel yayımdakı xəbəri bu qədər asan silməyə imkan verməməli idi.

**What:** `deleteNewsArticles(ids, { includeApproved })` — approved sətirlər default qorunur (`skipped: approved_protected`); batch API `includeApproved` qəbul edir; UI seçimdə dərc olunmuş xəbər varsa ayrıca confirm (OK = onları da sil, Cancel = yalnız dərc olunmamışlar). `loadNews` əvvəlində seçim sıfırlanır, yüklənmə zamanı checkbox disabled.

## 2026-10-05 — TASK-0490: feat(news-admin): sürətli siyahı, toplu əməliyyatlar, vitrin, tərcümə 504

**Why:** Admin xəbər paneli ~1037 xəbəri content/summary ilə birlikdə tək sorğuda yükləyirdi (yavaş); toplu seçim yox idi; hansı xəbərin vitrində olduğu görünmürdü və iyun manşetləri vitrində həmişəlik ilişib qalmışdı; ingester mənbəni `author`-a yazdığı üçün "Mənbə yoxdur" görünürdü; əməliyyat sütunu kəsilirdi; "Tərcümə et" Hostinger proxy-dən 504 alırdı.

**What:** Siyahı select-i yüngül (content/summary yox, + `isManset/isTop/isGundem/newsType/origin`), `limit/offset` 50, sətir+say `Promise.all`. `POST /api/news/admin/batch` — `canAccessNewsAdmin`, zod (≤200 id), approve `approveNewsArticle(id, { sideEffects: false })` + 2 paralel arxa fon növbəsi (`performApproveSideEffects`), reject `inArray` update, delete `inArray` delete. UI: checkbox + səhifədə hamısını seç + sticky toplu panel, səhifələmə, nişanlar, "Vitrində" tabı, `table-fixed` + `line-clamp-2`. `getVitrinNewsArticles`: manşet/top yalnız `coalesce(published_at, created_at) >= now() - 7 gün` olduqda üstün. `translate.ts`: `thinking: disabled`, `max_tokens` = clamp(2×, 2000, 8000), 45 s timeout; `autoTranslateNewsArticle` dilləri və sahələri paralel işlədir.

**Ölçmə:** siyahı 1038 sətir/1.86 MB/~700 ms → 50 sətir/33 KB/~120 ms. Tərcümə 1480 simvol ×3 dil: 16.7 s (ardıcıl, köhnə) → 2.5 s (paralel, thinking off).
## 2026-10-05 — TASK-0491: feat(news): Azərbaycan mənbələri, AZ-uyğun scoring, RSS şəkilləri

**Why:** Araşdırma: AZ ümumi lentləri (report.az, apa.az, trend, azertag) heç vaxt bir xəbər də verməmişdi; 103 RSS sətrindən 99-u şəkilsiz idi. Kök səbəblər: suffiks `\p{L}{0,5}` "restoranlarında"/"restoranlardaki" formalarını tutmurdu, "İCTİMAİ İAŞƏ" `İ` hərfinə görə tapılmırdı, iaşə/yeməkxana/lokanta kimi əsas sözlər yox idi, şəkil yalnız enclosure-dan oxunurdu.

**What:** Scoring TR/AZ case-fold + standart fold (ikisindən biri), suffiks ≤3/4/≥5 hərf → 0/7/10, AZ/TR/RU core lüğəti, turizm core 2, `lig`/`neft`/`adex` tam söz, AZ domenləri +3, 3 səs-küy domeni −3, domen uyğunluğu dəqiq. `e2e/news-scoring.test.ts` 29 fixture: yeni 29/29, köhnə 16/29. RSS: 11 yeni lent, lent limiti 50, `feed-image.ts` şəkil seçicisi (rss-pipeline də onu işlədir). Canlı dry-run (DB-yə yazmadan, 37 lent, 970 item): 194 keçən, 674 şəkilli; Trend turizm AZ/RU/EN 6/7/12 keçən, hamısı şəkilli. NewsData: AZ dilli sorğu (7 nəticə), RU sorğusu çıxarıldı (0 nəticə). og:image backfill dry-run: 13 namizəd → 6 şəkil; `--apply` icra olunmadı.
## 2026-10-05 — TASK-0492: feat(news): redaksiya nəzarəti

**Why:** Doğan: "Haberler okunsun, bizimkiler aynı kalıp zorlama olmasın, editoryal kontrol yap." Hər xəbər eyni 6 başlıqla (Nə baş verdi / Niyə önəmlidir / Dərs / Risk / 1 addım / DK baxışı) yazılırdı; köhnə xəbərlər (2023 sammiti) də keçirdi; növbə RSS-ə görə doldurulduğu üçün AZ xəbərləri heç işlənmirdi.

**What:** `lib/news/editorial.ts` — müəllif (lid + 2-4 abzas, uzunluq siqnala görə, şablon başlıqları qadağan, terminlər: otel/mehmanxana) → redaktor (fakt-siqnal yoxlaması, dil, klişe, başlıq, təravət — mənbənin dərc tarixinə görə, xəbər dəyəri; ok/fixed/reject + sahibə qeyd) → mexaniki lint. `synthesize.ts` bunu çağırır; növbə `relevance_score desc` + son 14 gün. Telegram mesajında "🖊 Redaktor: …". Dry-run (8 real siqnal, DB-yə yazmadan): 2023 sammiti, 2016 Kəşmir hekayəsi, Tacikistan → rədd; Şamaxı otelləri, Jamba Juice, Userguest, Madrid F1, AİİQA → dərc səviyyəsində, uydurma fakt yoxdur.

## 2026-10-05 — TASK-0489: feat(news): sosial media kartı

**Why:** Doğan: "Haberleri yaptık, insta filan neden yapamıyoruz?" Meta Graph API şəkli public URL-dən çəkir; xəbərlərdə şəkil yoxdur → brend kartı lazımdır. Dizayn: iki variant ekranda göstərildi, Doğan "beyaz olsun" (B) seçdi.

**What:** `app/api/news/card/[id]/route.tsx` — `next/og` ImageResponse, nodejs runtime; yalnız `approved` xəbərlər (qalanları 404). Şriftlər Google Fonts-dan yalnız lazım olan qliflərlə TTF (Playfair Display 800, Inter 400/700). `?locale=` ilə 4 dil. Cache 1 saat / CDN 1 gün. Növbəti addım: Meta paylaşımı + Telegram düyməsi (Meta tokeni gələndə).

## 2026-10-04 — TASK-0488: fix(news): sintez JSON xətaları

**Why:** Hər işləmədə 3 xəbər `[parse] Invalid JSON` ilə düşürdü.

**What:** Ölçüldü (8 gözləyən xəbər, DB-yə yazmadan): 5/8 `finish_reason=length`, reasoning 1600–2500 token → cavab boş və ya yarımçıq JSON. `thinking: { type: 'disabled' }` ilə 8/8 etibarlı, completion ~750–870 token; analiz keyfiyyəti yoxlandı. `reasoning_effort: low` kifayət etmədi (3/8 yenə kəsildi).
## 2026-10-04 — TASK-0487: feat(kazan-ai): saytın bloq/toolkit/xəbər biliyi

**Why:** Doğan: "KAZAN AI suallara cavab verirmi? Bloq yazılarını, toolkitləri bilirmi? Ağıllandır." Canlı test: bloq başlığını uydururdu, link vermirdi, cavab yarıda kəsilirdi, sonda iki sitat çıxırdı.

**What:** `lib/kazan-ai/site-context.ts` — dərc olunmuş bloqlar + `TOOLKIT_CATALOG` + son təsdiqli xəbərlər (10 dəq yaddaş keşi), söz-kökü uyğunluğu ilə ən uyğun 2 yazının xülasə/parçası prompt-a. Prompt: yalnız siyahıdakı linklər, uyğun yazının linki məcburi, model sitat yazmır (sistem real sitat əlavə edir, model sitatları silinir). DeepSeek `deepseek-v4-flash` reasoning token-ları limitdən yeyirdi → `max_tokens` 700→2500, `finish_reason=length` olarsa son tam paraqrafda kəsilir.
## 2026-10-04 — TASK-0486: feat(dashboard): qalan admin səhifələri OCAQ v2 üslubunda

**Why:** Doğan: köhnə panel "istifadə olunmur, köhnə dizayn". TASK-0483/0484 yalnız icmal, istifadəçilər və blog səhifələrini yeniləmişdi.

**What:** Xəbərlər (təsdiq/rədd/editor pick/sil eyni), elanlar (batch "Rədd et" səbəb sahəsi ilə eyni), KAZAN leadləri (avatar, tərcümə olunmuş status/niyyət nişanları, WhatsApp + status panelləri), franchise leadləri, əlaqə kanalı izləmə, profil onayları (modal daxil), reklamlar — hamısı `#F2F2F7` fon + ağ `rounded-[22px]` kartlar, pill filtr/nişanlar, `#0A5BD6` aksent. Hardcoded AZ düymə/sütun mətnləri xəbər/elan səhifələrinin `pageCopy`-sinə 4 dildə köçürüldü. Data, API və handler-lər dəyişmədi.

## 2026-10-04 — TASK-0484: fix(dashboard): qərar növbəsi + blog səhifəsi

**Why:** Canlı panel ekranlarında "Qərar gözləyir" 44-190 günlük zibil xəbər/elanlar, admin-in öz profili və `**markdown**` ilə dolu idi; blog səhifəsi köhnə üslubda qalmışdı.

**What:** Növbə yalnız son 14 gün; admin profilləri xaric; başlıqlar markdown-suz; köhnə elementlərin sayı ayrıca sətirdə (siyahılara keçid). Blog idarə səhifəsi yeni üslubda. Sidebar `overflow-x-hidden` + truncate; çubuq qrafikdə ilk tarix etiketi kəsilmir.

## 2026-10-04 — TASK-0483: feat(dashboard): OCAQ v2 komanda mərkəzi + istifadəçilər

**Why:** Doğan: "dashboard rezalet, kullanımsız, çok eski dizayn… Apple dashboard'dan yap". Dil menyusu qarışıq dil göstərirdi.

**What:** Açıq boz fon, ağ yuvarlaq kartlar, böyük rəqəmlər; "Qərar gözləyir" ən üstdə (təsdiq gözləyən xəbər, yoxlamada elan, profil, son 3 günün françayz müraciətləri); son 30 günün müştəri müraciətləri çubuq qrafiki (4 mənbə) + mənbə halqası, istifadəçi artımı, yayınlanan xəbərlər, elan/bloq göstəriciləri — hamısı real DB, asılılıqsız SVG. İstifadəçilər səhifəsi eyni üslubda (avatar + ad + e-poçt bir xanada). Dil: layout və səhifələr URL-dən oxuyur, keçid `/ru/dashboard`-a. Top bar slug başlığı (TD-008) çıxarıldı; sidebar Apple üslubu.

**Doğrulama:** production build + test JWT; 4 dil, mobil, page error 0. dk-validator aşağıda.

## 2026-10-04 — TASK-0482: fix(news): sintez uyğunluq meyarı + format

**Why:** RSS axını işləyəndən sonra DeepSeek 15 xəbərdən heç birini yazmadı: 9-u "uyğun deyil" (dünya xəbərlərini AZ üçün əlaqəsiz saydı — meyar yox idi), 6-sı JSON kəsilməsi.

**What:** Prompt-a aydın UYĞUNLUQ meyarı (dünya HoReCa/AI xəbərləri uyğundur, əgər AZ sahibkarına dərs çıxırsa; yalnız qeyri-HoReCa mövzular rədd), yeni "### Bu həftə 1 addım" bölməsi, vendor rəqəmləri üçün "şirkətin açıqlamasına görə". `max_tokens` 1200 → 2500; JSON `{…}` hissəsi çıxarılıb ayrışdırılır.

## 2026-10-04 — TASK-0481: fix(news): RSS addımının asılı qalması

**Why:** İlk real run-da (37214292815) RSS addımı 30 xəbəri daxil edib nəticəni çap etdi, amma proses çıxmadı → job 10 dəq limitində ləğv olundu, sintez atlandı.

**What:** `scripts/news-rss-fetch.ts` sonunda `process.exit(0)`; `news-ingest.yml` `timeout-minutes` 10 → 20.

## 2026-10-04 — TASK-0480: feat(news): ticarət mətbuatı RSS → DB (Faz 2)

**Why:** NewsData axtarışı əsasən zibil qaytarırdı; real HoReCa/AI xəbərləri ticarət mətbuatındadır.

**What:** 25 yoxlanmış feed (Skift AI/Skift, Hospitality Net, Restaurant Dive, Hotel Dive, NRN, Restaurant/Hotel Technology News, Hotel Management, EHL, Food On Demand, MRM, 10min Hotel, Turizm Güncel/Ajansı/Günlüğü, Gastro Mondiale; Report.az/Trend AZ-RU-EN, APA, AZERTAC — sonuncular yalnız başlıq HoReCa olanda). Son 4 gün, run başına ≤30, başlıq dedup. `origin='rss'` sintezə daxil, limit 15. Köhnə JSON botunun cədvəli söndü.

**Doğrulama:** lokal quru sınaq 25/25 feed, 79 keçən (22 AI/tech). Real run merge-dən sonra.

## 2026-10-04 — TASK-0479: chore(news): filtr log-u (qəbul/rədd başlıqları)

**Why:** TASK-0478 sonrası run-da 40-dan 38 xəbər eşikdən aşağı idi; real xəbər kəsilirmi — görmək lazım idi.

**What:** `news:fetch` hər run-da `+ [bal] başlıq` və `- [bal] başlıq (domen)` yazır.

**Tapıntı (run 37213347139):** rədd edilənlər video oyunlar, Yəmən/Tigray müharibəsi, sitkomlar, ABŞ yerli təqvimləri idi — filtr düzgündür; NewsData `q` bütün mətndə axtardığı üçün nəticələrin çoxu HoReCa deyil. Həll: Faz 2 — yoxlanmış 21 ticarət RSS mənbəyi.

## 2026-10-04 — TASK-0478: feat(news): xəbər kapsamı (Faz 1)

**Why:** Off-topic xəbərlər (kriket, OPEC, Səudiyyə token əmlakı) keçirdi, AI/texnologiya heç hədəflənmirdi, slug-larda AZ hərfləri silinirdi (`liyev`, `xankndi`), NewsArticle müəllifi aqreqator ("Bundle") idi.

**What:** Skorlama Unicode söz-başlanğıcı ilə (şəkilçilərə icazə), əsas HoReCa termini şərti, 4 dildə mövzu bloklisti (başlıqda → rədd), AI/texnologiya terminləri + "technology" kateqoriyası məzmuna görə. NewsData: AI/hospitality-tech sorğusu, rus dili. Slug: `slugifyAz` (+ NFC), sintezdə AZ başlıqdan + id. NewsArticle: müəllif DK Agency, naşir loqosu, `isBasedOn` mənbə, düzgün dil URL-i.

**Doğrulama:** skorlama testi 10/10; slug `prezident-ilham-eliyev-xankendi-hotelinin-acilisinda`. dk-validator aşağıda.

## 2026-10-04 — TASK-0476: fix(news): sintez növbəsi ilişməsi

**Why:** "News Ingest Pipeline" 2026-10-03 axşamdan uğursuz (və 09-30-da); log: `Synthesized: 0`, eyni məqalələr (#400–#426, #870) hər run-da xəta.

**What:** `publishable:false` (və ya nə başlıq, nə mətn) cavabı artıq title/body yoxlamasından ƏVVƏL "unpublishable" işarələnir — sətir növbədən çıxır. `seo_description` 160 simvolla kəsilir (`[unpublishable] ` + 150 = 166 idi → DB xətası → workflow fail). Növbə ən yenidən emal olunur.

**Doğrulama:** tsc/lint təmiz; real sınaq merge-dən sonra workflow_dispatch.
## 2026-10-04 — TASK-0475: feat(seo): şirkət + qurucu entity schema, 40 il, llms.txt faktlar

**Why:** SEO/AI auditi: Organization schema-da yalnız ad/url/logo var idi, qurucu üçün Person yox idi, /haqqimizda-da JSON-LD yox idi; səhifədə "40 il" ilə "10+ il" ziddiyyəti AI sitatını bloklayırdı.

**What:** Organization → `["Organization","ProfessionalService"]` + legalName, taxID, foundingDate 2010, email, address (Bakı), areaServed (AZ, TR), iş saatları, founder. Yeni `personNode` (Doğan Tomris, 40 il, foto, 4 dildə təsvir); bloq author → Person `@id`. `/haqqimizda` (4 dil) AboutPage JSON-LD (server layout). `home.doganNote.body3` "10+ il" → "40 il" (4 dil). llms.txt: "Faktlar" bölməsi; üzvlük təsviri düzəldi.

**Qəsdən edilməyən:** `sameAs` — koddakı sosial linklər təxmin idi, `t.me/dkagency` başqasınındır. Telefon — /elaqe onu gizlədir.

**Doğrulama:** production build; /haqqimizda və /ru/haqqimizda-da AboutPage + Organization + Person; ana səhifədə zəngin Organization; llms.txt faktlar. dk-validator aşağıda.
## 2026-10-04 — TASK-0473: chore(ci): STATE snapshot PR axınına

**Why:** Geriyə dönük skan: `state-snapshot.yml` hələ `main`-ə birbaşa push edirdi; `main-koruma` ruleset bunu bağlayır (TASK-0466-da RSS botu eyni səbəblə köçürülmüşdü) → bazar ertəsi ilk cron uğursuz olacaqdı.

**What:** Snapshot `bot/state-*` branch-ə gedir və PR açılır (`NEWS_BOT_TOKEN`); `auto-merge-content.yml` yalnız `bot/state-*` branch-i və yalnız `docs/STATE.md` dəyişən PR-ı avtomatik merge edir. İnsan PR-larında `docs/STATE.md` qadağası qalır.

**Doğrulama:** hər iki workflow YAML kimi parse olunur; real sınaq: Actions → State Snapshot → Run workflow.
## 2026-10-04 — TASK-0477: feat(news): Telegram ilə xəbər təsdiqi

**Why:** Doğan: "telegrama bana onay gelsin, oradan okey vereyim paylaşsın" — paneldə təsdiq darboğazı idi.

**What:** DeepSeek xəbəri yazan kimi Doğan-ın Telegram chat-ına başlıq, AZ analizin önizləməsi, mənbə və ✅ Yayınla / ❌ Rədd et / ✏️ Paneldə aç düymələri gedir. Webhook (`/api/telegram/webhook`) bot token-dən törədilən secret və chat ID-ni yoxlayır, xəbəri yayınlayır (panel ilə eyni yol: RU/EN/TR tərcümə + alət uyğunlaşdırma) və ya rədd edir, düymələri "🔗 Saytda bax" ilə əvəzləyir. Təsdiq məntiqi `lib/news/approve.ts`-də birləşdi (admin API də onu işlədir). Admin `/api/telegram/setup` webhook-u qeydiyyatdan keçirir, `?pending=N` gözləyən xəbərləri göndərir.

**Doğrulama:** production build + fake token ilə təhlükəsizlik testləri (401/401/ignore/ignore/403). Real axın Doğan-ın secret-ləri ilə yoxlanacaq.

## 2026-10-04 — TASK-0474: fix(seo): kritik SEO xətaları

**Why:** SEO/AI auditi (2026-10-04): AZ bloq JSON-LD-də `dkagency.com.tr/undefined/blog/...`, `/listings` canonical `/undefined/ilanlar`, RU/EN/TR bloq `<title>` AZ, login/e-poçt/placeholder səhifələri indekslənirdi, sitemap-da redirect olunan və dublikat URL-lər.

**What:** `localeUrl`/`getAlternates` locale-i özləri normallaşdırır (root mirror-da `undefined` gəlirdi) — bütün çağırışlar birdən düzəldi. Bloq `seo_title/seo_description` yalnız AZ-da; digər dillərdə tərcümə başlığı/xülasəsi. 8 səhifə növünə `noindex, follow` layout. robots.txt: dashboard/b2b-panel/settings/api 4 dildə Disallow. Sitemap: `/xeberler` və `/b2b-panel` çıxarıldı, `addim-xerci` və təsdiqli elan detalları əlavə, statik səhifələrdə saxta `lastmod` yox. `/listings`, `/xeberler`, `/about`, `/contact`, `/news` → 308.

**Doğrulama (production build):** redirect-lər 308; noindex 8/8; robots Disallow 16 sətir; sitemap 296 URL, xeberler/b2b-panel 0; `/undefined/` 0 (5 səhifə + bloq yazısı AZ/EN). dk-validator aşağıda.

## 2026-10-04 — TASK-0472: fix(i18n+content): tərcümə olunmamış səhifələr, ictimai dev qeydləri, uydurma elanlar

**Why:** TASK-0471 çapraz yoxlamasının tapıntıları; Doğan: "düzelt paşam bulduklarını".

**What:**
- **Otel/OTA/qonaq evi alətləri:** RU/EN/TR mesajları AZ-ın surəti idi (143 açar) və 21 bölmə yox idi → 277 × 3 sətir tərcümə (placeholder/brend yoxlamalı).
- **`/uzvluk`:** ictimai səhifədə daxili dev qeydləri ("Supabase env", "Provider mode", inteqrasiya planı) → real üzvlük səhifəsi, 4 dil, yalnız həqiqi imkanlar (elan, müraciətlər, B2B panel); qiymət ödəniş hazır olana qədər yox. `/docs/member-env-checklist` ictimai səhifəsi silindi (məzmun `docs/`-dadır).
- **Ana səhifə elan lövhəsi:** uydurma elanlar real kimi göstərilirdi → `/api/listings`-dən real elanlar; boşdursa dürüst boş vəziyyət + "Elan yerləşdir" (`/ilan-ver`).
- **`/sedd-rozeti`, `ComingSoon` (`/terefdashlar`), e-poçt təsdiqi, e-poçt seçimləri, ana səhifə bloq kartları, xəbərlər "Reklam sahəsi", çıxış/ödəniş düymələri** → 4 dil. `ComingSoon` forması real bülleten API-sinə bağlandı. "Tərcif" → "seçim" (AZ yazı xətası), "approved" → "dərc olunmuş".
- **Razılıq mətnləri:** yalnız Türkiyə qanunu KVKK-ya istinad edirdi → əsas Azərbaycan «Fərdi məlumatlar haqqında» Qanunu, Türkiyədən müraciət edənlər üçün həmçinin KVKK (Doğan qərarı); 4 dil, 4 forma.
- **Marşrutlar:** `/news` (uydurma xəbər səhifəsi) → `/haberler`; `/ru|en|tr/xeberler`, `/…/auth/forgot-password` 404 → işləyir.

**Doğrulama:** production build; RU/EN/TR çapraz skan — qalan AZ mətn yalnız rəsmi adlar (Milli Ulduz Təsnifatı, e-qaimə) və lokal mock-data (DB-siz); canlıda bloq tərcüməlidir. dk-validator aşağıda.
## 2026-10-04 — TASK-0471: fix(ui): footer, dil yönləndirməsi, hüquqi 404, mobil overflow

**Why:** Doğan: "azericeyi rusça yapmışsın düzelt; footerlar yanlış durumda hepsine bak mobilde kontrol et çapraz bak herşeye".

**Tapıldı + düzəldildi:**
- **AZ → RU:** `DeviceLanguageDetector` rus dilli cihazda AZ saytı `/ru`-ya atırdı, header-də "AZ" seçmək geri atırdı, paylaşılan `/en/blog` linkini `/ru/blog` edirdi. Komponent silindi (qayda: UI default AZ); dil yalnız menyudan.
- **Hüquqi səhifələr AZ-da 404:** `/privacy` `/terms` `/cookies` root mirror-u yox idi + səhifə locale-siz `notFound()` edirdi → footer linkləri 404. Mirror + `undefined` = az. 8 başqa çatışmayan mirror da əlavə (L-038): about, contact, listings, pricing, qiymet, randevu, terefdashlar, ilanlar/[slug].
- **RU/EN/TR-də footer AZ:** hüquqi səhifələr `force-static` idi → kök layout build vaxtı locale bilmirdi. `force-static` çıxarıldı.
- **Footer mobil:** hüquqi zolaq alt menünün altında qalırdı (`pb-28 lg:pb-8`); linklər 2 sütun; sabit AZ mətnlər ("Abunə ol", "E-posta", "USTALIĞIN NİŞANI", xəta/uğur) → `footer.*` 4 dil; input `aria-label`.
- **`/ru/about`, `/en/contact`** redirect-i locale-i itirirdi → locale saxlanılır.
- **Alətlər mobil overflow:** `ToolkitStudioLayout` grid uşaqlarında `min-w-0` yox idi → food-cost/menu-matrix/delivery-calc 95–149 px üfüqi scroll. Düzəldi; geniş cədvəl kartın içində scroll olur.
- **KAZAN düyməsi** mobil alt menünün sağ ucunu örtürdü → menyunun üstünə qaldırıldı.

**Doğrulama (production build):** 69 AZ səhifə 390 px-də — 200, overflow 0, page error 0, kiril 0; RU/EN footer/header-də AZ sızıntı 0; dil ssenariləri (RU/TR/AZ cihaz, menyudan seçim, `/en/blog` birbaşa) düzgün. dk-validator aşağıda.
## 2026-10-04 — TASK-0470: chore(githooks): hook faylları icra icazəli

**Why:** macOS-da hook-lar heç işləmirdi: (1) əsas klonda `core.hooksPath` Windows yolunu göstərirdi, (2) `githooks/*` git-də `100644` idi — hər yeni worktree-də "hook was ignored because it's not set as executable".

**What:** `githooks/{commit-msg,pre-commit,pre-push}` → `100755`. Lokal `core.hooksPath=githooks` (konfiq). `docs/REPO-GOVERNANCE.md`-yə bir dəfəlik qurulum qeydi.

**Doğrulama:** bu commit-in özü yeni worktree-də hook-larla (pre-commit + commit-msg) keçdi.

## 2026-10-04 — TASK-0469: feat(home): v2 hero — seqment seçimi + çap olunan çek + canlı hesab

**Why:** Doğan bəyin "DK Agency v2 Dizayn" kanvası: ana səhifə üzvlük üçün qurulur — əvvəl dəyər (canlı hesab + çek), sonra "Hesabatı saxla — üzv ol".

**What:** Yeni `components/home/ReceiptHero.tsx` (Pattern A, `home.receiptHero`, 4 dil) köhnə `Hero`-nun yerinə. "Siz kimsiniz?" (Restoran/Kafe/Otel/Françayz/Açılış) başlığı, alt mətni və 3 başlanğıc alətini dəyişir (15 link, hamısı real route). Nümunə çek yuxarıdan çap olunur, sətirlər ardıcıl gəlir; satış/alış yazanda food cost %, itki məbləği (sayaraq) və çekin "QALAN"-ı dərhal yenilənir. Rəqəm formatı `lib/i18n/format.ts` (AZ: 50.000). Animasiyalar CSS module-dadır (`globals.css` qorunur), `prefers-reduced-motion`-a hörmət edir. Seqment düymələri `text-slate-700/900` + `aria-pressed`.

**Qərarlar:** foto yalnız `/haqqimizda`; Kalfa/Usta qiymətləri ödəniş hazır olana qədər yox.

**Doğrulama:** Playwright 35/35 (seqment, hesab 38,0%→30,0%→40,0%, itki 4.000/5.000, 15 alət linki 200, 390 px overflow 0, EN/RU/TR başlıq + raw key yox, page error yox). dk-validator aşağıda.

## 2026-10-04 — TASK-0468: fix(i18n): "Quranımızdan" → "Qurucumuzdan"

**Why:** Doğan bəy `/haqqimizda` kurucu bölməsində başlığın yanlış olduğunu gördü: "Quranımızdan" ("Quranımızdan" = Qurandan) yazılmışdı, düzgünü "Qurucumuzdan".

**What:** `messages/az.json` → `home.doganNote.eyebrow` düzəldildi. TR/EN/RU artıq düzgün idi (Kurucudan / From the Founder / От основателя). Layihədə başqa "Quran" hit-i yoxdur.

**Doğrulama:** `npm run dk:validate` 9/9 PASS; lokal `/haqqimizda`-da "Qurucumuzdan" görünür, "Quran" 0.

## 2026-10-04 — TASK-0467: feat(ui): kurucu fotosu avatar placeholder-larını əvəzləyir

**Why:** Doğan bəy real portret fotoşəkli göndərdi. Kurucu bölmələrində hələ placeholder-lar var idi: `/haqqimizda` DoganNote-da kitab ikonu, müxtəlif yerlərdə "DT" baş hərfləri.

**What:** Ortaq `components/ui/FounderAvatar.tsx` (next/image) + `isFounderName()` / `authorInitials()` köməkçiləri. Foto: `public/images/founder/` (256×256 üz kəsimi 19 KB, 800px portret 101 KB). Dəyişən yerlər: `home/DoganNote` (128px, qızılı çərçivə), blog `DoganNote` imzası, `MarkdownRenderer` DK Agency notu imzası, `GuruBox` (Doğan notları; xarici ekspertdə baş hərflər), `SektorNabziTabs` Viewpoint + seçilmiş xəbər müəllifi, `BlogSidebars` Viewpoint + AuthorCard. Müəllif Doğan Tomris deyilsə foto yox, müəllifin öz baş hərfləri göstərilir (əvvəl hər müəllifə "DT" yazılırdı).

**Qeyd:** İlk cəhd (TASK-0419 adı ilə) 155 commit geridə qalmış lokal main-dən açılmışdı və conflict verirdi; təmiz worktree-də güncəl main üzərinə yenidən quruldu. `BlogSidebars` hal-hazırda heç bir route-da import olunmur.

**Doğrulama:** `npm run dk:validate` 9/9 PASS. Playwright: `/haqqimizda` 1280px və 390px-də foto yüklənir (naturalWidth > 0). `/`, `/haqqimizda`, `/blog` → 200.

## 2026-10-04 — TASK-0466: chore(news): xəbər botu PR axınına

**Why:** `main-koruma` ruleset birbaşa push-u bağlayır; RSS botu növbəti cron-da sınardı.

**What:** fetch-news `bot/news-*` branch + PR açır (NEWS_BOT_TOKEN ilə — GITHUB_TOKEN PR-ı CI tetikləmir); auto-merge allowlist-ə `lib/data/pendingNews.json`.

**Sübut (əvvəlki addım):** PR #467 insan klik etmədən merge oldu (automerge=SUCCESS, quality-gates=SUCCESS).

## 2026-10-04 — TASK-0465: docs — L-059 + auto-merge testi

**Why:** TASK-0464-dən sonra `main` ruleset (PR + `quality-gates`) qoyuldu; məzmun PR-ının özü merge olduğunu sübut etmək.

**What:** LESSONS L-059. Yalnız sənəd.

## 2026-10-04 — TASK-0464: chore(ci): PR axını və bot deploy-larının azaldılması

**Why:** Doğan hər merge/deploy ilə əl ilə məşğul olur. Ölçülən sürtünmə: STATE botu hər merge-dən sonra `main`-ə commit edir (iyundan 166 dəfə) → Hostinger hər push-da yenidən build → 4 GB limitdə OOM/503 riski; TASK-0463 qeydi: "bot commit-ləri də düşür". CI Node 20, layihə Node 22.

**What:** `auto-merge-content.yml` (yalnız məzmun PR-ları, CI yaşıl olanda; kod PR-ları əl ilə) · `state-snapshot.yml` həftəlik + əl ilə · CI/snapshot Node 22 · CODEOWNERS düzəldi · CLAUDE.md "PR axını" + REPO-GOVERNANCE.

**Qəsdən edilmədi:** `fetch-news.yml` gündəlik `pendingNews.json` push-u qalır — admin təsdiq API-si faylı canlıdan oxuyur (`app/api/admin/news/pending`); DB-yə köçürmə ayrıca məhsul task-ıdır.

**Doğrulama:** workflow YAML-ları PR-da CI ilə işləyəcək; lokal build lazım deyil (tətbiq koduna toxunulmayıb).


## 2026-06-19 — TASK-0413: fix(toolkit): WCAG contrast sweep

**Why:** "diğer toolkitlere de bak" denetiminin 2. kümesi — kontrast. Açık zeminde `text-slate-400/300` (≈2.9/1.6:1) AA-dan keçmir (CLAUDE.md release-blocking).

**What:** 2 strict-kurallı builder agent her occurrence'ın bg-bağlamını doğrulayıp açık zemindeki muted etiketleri `slate-600`'a çıkardı (19 fayl) + shared LikertScale (ulduz slate-300→400, badge slate-400→500). 88 satır, hamısı saf contrast class swap.

**Doğrulama:** diff pattern (88+/88-, yalnız slate class), 0 lint error, build PASS. Koyu panel/ikon/slate-500+ toxunulmadı (false positive elendi).

## 2026-06-19 — TASK-0412: fix(toolkit): number format in 4 more tools

**Why:** Doğan "diğer toolkitlere de bak" dedi. 3 paralel review agenti basabas hata sınıflarını (ayraçsız sayı, band bug, negatif, kontrast) bütün tool-larda taradı.

**What:** Təsdiqlənmiş minlik-ayraç boşluqları düzəldildi — delivery-calc (`fmt0` + monthlyNet), menu-matrix (`fmt0` + avgSales), yemek-xerci (mərkəzi `money()` → bütün tool), menyu-analitigi (aylıq mənfəət).

**Tapıldı amma bu task-da deyil:** ~16 kontrast nöqtəsi (LikertScale text-slate-300, muted label) → ayrı WCAG sweep. menyu-analitigi hardcoded AZ mətn → ayrı i18n task. div-by-zero iddiası false positive (`item.price &&` guard var).

**Verify:** 4 fayl 0 lint error (1 pre-existing warning).

## 2026-06-19 — TASK-0411: fix(finance): basabas format + EBITDA band + runway

**Why:** Branch-opening canlıya çıxdı, Doğan ekran görüntüsü göndərdi — rəqəmlər ayraçsız (239804), EBITDA %49 "Zəif" (qırmızı) görünür, runway "-3.4 ay".

**What (3 düzəliş):**
- `fmt0` helper (`Intl.NumberFormat(locale)`) → 24 manat dəyəri minlik ayraçla (səhifə + HTML hesabat)
- EBITDA yaşıl band `max 30→1000` — %49 marj artıq yaşıl (band fallback bug)
- `runwayMonths` `Math.max(0,…)` — mənfi ay göstərmir

**Verify:** 0 TS/lint; band %49→yaşıl, %10→amber, %5→red; mobil stack OK (studio `lg:grid-cols`, input `sm:` grid).

## 2026-06-18 — TASK-0409: feat(finance): branch-opening engine on basabas

**Why:** Mövcud `basabas` aləti break-even verirdi, amma "yeni şöbə açmaq" üçün CAPEX + vergi + ramp-up + benchmark qatı yox idi. Ayrı tool yaratmaq əvəzinə mövcud motorun üstünə additive qat qoyuldu.

**What:**
- `lib/financial/azerbaijan-tax-config.ts` — AZ vergi sabitləri + benchmark band-ları (SSOT)
- `lib/financial/branch-opening-presets.ts` — 6 format preset
- `lib/financial/branch-opening-model.ts` — deterministik motor (CAPEX, working capital, funding gap, ramp loss, runway, payback, 3 ssenari, benchmark)
- `app/toolkit/basabas/page.tsx` + 4 dil mesajı

**Kök səbəb düzəlişi (build keçdi ≠ bitdi):** TS təmiz idi amma 3 səssiz hesablama xətası vardı —
1. mənfəət vergisi **gəlir** üzərindən hesablanırdı → düzgün baza mənfəət;
2. EBITDA benchmark mütləq manatı faiz bandı ilə müqayisə edirdi (həmişə red) → EBITDA marjı %;
3. taxBurden iki vergi rejimini ikiqat toplayırdı → tək rejim.
Numeric replay: net mənfəət müsbət, payback ≈5.5 ay, marj düzgün faiz.

## 2026-06-14 — feat(news): detail page world-class redesign

**Why:** Haber detay sayfası yarım kalmıştı — `**Nə baş verdi**` düz bold text olarak render oluyordu, section structure yok, share butonları altta, breadcrumb yok, sidebar CTA yok. CEO: "dünya çapında iş yapın dedik, bakıyorum tırt."

**What:**
- `app/haberler/[slug]/page.tsx`: `parseNewsContent()` — content'i section'lara böler (`event`/`important`/`lesson`), her biri renkli callout box olarak render edilir (📰 gri / 💡 mavi / 🎯 amber)
- Breadcrumb eklendi: Xəbərlər / Kategori / Başlıq
- ShareButtons header'a taşındı (başlık altı) + footer'da da kaldı
- Sidebar: "Son İlanlar" dark gradient CTA kutusu eklendi
- Newsletter CTA: "Həftəlik HoReCa xülasəsi" makale sonunda
- `components/news/ShareButtons.tsx`: LinkedIn butonu eklendi (WhatsApp + LinkedIn zorunlu)
- `components/blog/MarkdownRenderer.tsx`: H2 headings'e `font-display` (serif) eklendi
- `app/globals.css`: `--font-display` Tailwind theme token eklendi (Playfair Display)

**Referanslar:** Hospitality Net, Franchise Times, NRN — 12 agent araştırması sonucu

## 2026-06-13 — TASK-0319: fix(news): detail + listing UX sprint 1

**Why:** 3 user-reported bugs: (1) raw markdown `### Nə baş verdi` visible in detail summary, (2) related articles sidebar empty, (3) slider missing on page 2+. Plus synthesis prompt producing heading-heavy output.

**What:**
- `app/haberler/[slug]/page.tsx`: Added `stripMarkdown()` — strips `#`, `**`, backticks, links from summary before display
- `lib/news/synthesize.ts`: Rewrote SYSTEM_PROMPT — no headings allowed, flowing journalist-style paragraphs, bold only for brand names
- `lib/repositories/newsRepository.ts`: New `getRelatedNewsConditions()` accepts `translated` + `approved` for related sidebar. New `getVitrinNewsArticles()` fetches top 8 articles ordered by isManset/isTop/publishedAt
- `app/haberler/page.tsx`: Vitrin slider now fetched via dedicated query, shown on all pages (not just page 1)

## 2026-06-13 — TASK-0404: feat(news): manşet vitrin (8-article slider)

**Why:** Single hero shows only 1 article. User wants Sport Arena-style slider showing top 8 headlines with auto-advance.

**What:**
- `components/news/MansetVitrin.tsx`: Client component — image left (no text overlay), content right, arrow + dot navigation, auto-advance 6 seconds
- `app/haberler/page.tsx`: Replaced single hero with MansetVitrin (first 8 articles), added reklam slot placeholder

## 2026-06-12 — TASK-0403: feat(infra): news pipeline GitHub Actions cron

**Why:** F1a (fetch) and F1b (synthesize) work as manual scripts. Need automated daily execution without touching Hostinger (no deploy, no 503 risk).

**What:**
- `.github/workflows/news-ingest.yml`: schedule 06:00+14:00 UTC, workflow_dispatch for manual test. Runs `news:fetch` then `news:synthesize` against Neon via `DATABASE_URL` secret. On failure: SMTP alert to CTO via `dawidd6/action-send-mail@v3`.
- No Hostinger build/deploy triggered — Actions runner only writes to Neon DB.

**Secrets required:** `DATABASE_URL`, `NEWSDATA_API_KEY`, `DEEPSEEK_API_KEY`, `SMTP_USER`, `SMTP_PASS`

## 2026-06-12 — TASK-0402: feat(news): DeepSeek Model-B synthesis

**Why:** Fetched signals are raw English headlines. Need original DK-branded AZ analysis — NOT copy/paraphrase, legal-safe original content with HoReCa sector insight.

**What:**
- `lib/news/synthesize.ts`: DeepSeek JSON mode synthesis. System prompt enforces 5-block structure (nə baş verdi / niyə önəmli / AZ dərsi / risk / DK baxışı). Forbidden terms guard (CRM/Pipeline/Agentlik/Holdinq/Tezliklə). Unpublishable signals flagged in seoDescription, not written to content.
- `scripts/newsdata-synthesize.ts`: CLI for `npm run news:synthesize`
- Toolkit matching + translation already work at approve time — NOT rebuilt.

**Verified:** 7/8 articles synthesized, 1 weak signal correctly rejected. Re-run idempotent (only processes articles without contentAz).

## 2026-06-12 — TASK-0401: feat(news): NewsData.io discovery + scoring

**Why:** Manual news curation doesn't scale. Need automated HoReCa/franchise/tourism signal discovery from global sources, scored by relevance, with deduplication.

**What:**
- `lib/news/newsdata-fetch.ts`: NewsData.io API client with 4 query sets (restaurant/hotel/franchise/food-safety, AZ/TR focus). Fetches → scores → dedup (sha256 URL hash) → inserts as `origin='newsdata', status='fetched'`.
- `lib/news/scoring-config.ts`: SSOT for keyword weights (restoran +3, franchise +3, PR -2, spam -3), source domain weights (reuters +3, prnewswire -2), threshold ≥4.
- `scripts/newsdata-fetch.ts`: CLI for `npm run news:fetch`
- `lib/db/schema.ts` + `drizzle/0018`: `origin`, `source_url_hash` (unique index), `relevance_score` columns

**Action required:** Migration 0018 on Neon. `NEWSDATA_API_KEY` in `.env.local`.

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

## 2026-06-13 - TASK-0406: cross-sector viability + working capital

**Why:** New businesses commonly confuse sales with cash and underfund inventory, receivables, deposits, ramp-up losses, and operating reserves.

**What:** The existing `/toolkit/basabas` screen now supports five business types and produces deterministic viability metrics, conditional verdicts, three sensitivity levers, and a shareable single-file HTML report. The existing toolkit AI action is reused only for grounded commentary.

**Verification:** Build, focused lint, and deterministic multi-sector smoke checks passed. A final Playwright rerun remains for the next session.
