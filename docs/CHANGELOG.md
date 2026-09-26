# CHANGELOG

- `TASK-0417` fix(news): **preview saves before opening** — manual news editor preview no longer opens an unsaved `/haberler/{draftSlug}?preview=true` URL. It first saves/PATCHes the article as `fetched`, captures the API returned slug, then opens preview with the saved slug so new drafts do not 404.

- `TASK-0415` fix(security): **dependency vulnerability sweep** — direct runtime packages upgraded (`next` 16.2.9, `drizzle-orm` 0.45.2, `@google/genai` 2.10.0, `cloudinary` 2.10.0, `nodemailer` 9.0.1, SheetJS `xlsx` 0.20.3 tarball), `drizzle-kit` moved to devDependencies, and vulnerable transitive packages pinned with npm overrides. Audit reduced to **0 critical / 0 high / 4 moderate**; remaining moderate chain is upstream Next bundled PostCSS. Lint + production build pass.
- `TASK-0416` fix(dashboard): **locale funnel route mirror** — `/tr/dashboard/funnel` canlıda 404 verirdi, çünki yalnız root `app/dashboard/funnel/page.tsx` vardı; `app/[locale]/dashboard/funnel/page.tsx` re-export mirror-u əlavə edildi. Build route list-də `ƒ /[locale]/dashboard/funnel` göründü; lokal built smoke `307 /auth/login` qaytardı (404 yox).

- `TASK-0414` fix(toolkit): **Açılış checklist hüquqi dəqiqləşdirmə** — “İcra Hakimiyyəti razılığı” ADRA icazəsi ilə əvəz edildi; Azərbaycan Respublikasının Dövlət Reklam Agentliyinin tam adı və fəaliyyət ünvanı üzrə 15 rəqəmli obyekt kodu maddəsi AZ/RU/EN/TR dillərində əlavə edildi. Checklist 43→44.

Butun ehemiyyetli deyisiklikler bu faylda qeyd olunur.

## [Unreleased]

### Fixed
- `TASK-0456` fix(blog): **yazılarda siyahı nöqtələri və nömrələri görünmürdü** — sahib canlıda «İşıq, qoxu, musiqi» yazısında gördü: «kafe, şirniyyat…» siyahısı və «1. Ümumi işıq…» maddələri işarəsiz, sadəcə girintili mətn kimi çıxırdı. Kök səbəb: `app/globals.css`-dəki ☐ checklist qaydası `.blog-content li { list-style: none }` bütün siyahılara tətbiq olunurdu. `globals.css` PROTECTED olduğu üçün düzəliş `MarkdownRenderer`-də: adi maddə `ul`/`ol`-un işarəsini geri alır (qırmızı nöqtə/nömrə), ☐/☑ və GFM `- [ ]` maddələri işarəsiz qalır. Yol üstündə tapılan ikinci səhv: **390px-də cədvəlli yazı 494px üfüqi daşırdı** — `article` grid elementi `min-width: auto` ilə cədvəlin enini götürürdü; `min-w-0` əlavə olundu, cədvəl öz qutusunda sürüşür. **Sübut:** yeni `e2e/blog-lists.spec.ts` (@smoke) — düzəlişsiz **FAIL** (reproduksiya), düzəlişlə `blog-lists` + `blog-cta` **12/12** (`--repeat-each=2`); 28 statik yazı × AZ/RU 390px-də daşma 0. tsc baza (35), eslint 0 error.

### Added
- `TASK-0454` feat(blog): **bloq redaktoruna «📄 Markdown faylı yüklə»** — sahib: «yazıyı atardım alırdı, düzenleyip koyardı». Canlıdakı spagetti yazısında `##` başlıqlar, cədvəllər və sitatlar düz mətnə çevrilmişdi; kök səbəb renderer deyil — yazı ekranda göstərilən (render olunmuş) formadan kopyalanıb yapışdırılıb, markdown işarələri itib. İndi `.md` faylı seçilir: faylın əvvəlindəki meta blokundan (`Başlıq`, `SEO başlıq`, `Slug`, `Kateqoriya`, `Oxu müddəti`, `Müəllif`, `Meta təsvir`) sahələr dolur, AZ mətni formatı ilə olduğu kimi girir; ilk `# H1` və «*Kateqoriya: … | Oxu müddəti …*» sətri mətndən çıxır (səhifə başlığı ayrıca göstərir). Qoruyucular: mövcud mətn təsdiqsiz əvəzlənmir; redaktə olunan yazının slug-ı dəyişmir (köhnə linklər qırılmasın); kateqoriya/müəllif emoji-siz müqayisə ilə siyahıya uyğunlaşdırılır, uyğun gəlmirsə xəbərdarlıq; 60/160 limitdən uzun SEO dəyəri söz ortasında kəsilmir — boş qalır və xəbərdarlıq verir. Parser təmiz funksiyadır (`lib/blog/parseMarkdownImport.ts`), API/DB dəyişmədi. **Sübut:** yeni `e2e/blog-md-import.spec.ts` (@smoke) **3/3** (`--repeat-each=3`) — sahələr, format (`##`, cədvəl, sitat), H1 çıxarılması, «Ləğv» mətni saxlayır / «OK» əvəzləyir, slug başlıqdan; sahibə veriləcək 6 real yazı faylı parser-dən xəbərdarlıqsız keçdi; 390px daşma 0. tsc baza (35), eslint 0 error.

### Fixed
- `TASK-0453` fix(blog): **yazı səhifəsinin sonundakı əlaqə blokunda xam açarlar görünürdü** («blogDetail.ctaTitle», «blogDetail.ctaWhatsapp», «blogDetail.ctaContact») — sahib canlıda gördü. Kök səbəb: kod `t('ctaTitle')` və s. çağırırdı, amma `messages/*.json`-da `blogDetail.cta*` açarları heç vaxt yaradılmamışdı; next-intl açar adını qaytarır. 4 dildə 5 açar əlavə olundu (`ctaTitle`, `ctaDesc`, `ctaWhatsapp`, `ctaContact`, `ctaWhatsappMessage`). WhatsApp linkinin hazır mesajı kodda yalnız azərbaycanca idi (`Salam, "…" yazısı ilə bağlı sualım var.`) — indi dilə uyğun, yazının adı ilə. Yeni `e2e/blog-cta.spec.ts` (@smoke): 4 dildə xam açar 0, WhatsApp düyməsi və mesajı dilə uyğun — **8/8** (`--repeat-each=2`).

### Fixed
- `TASK-0452` fix(toolkit): **Toolkit səhifəsində «Buradakı 5 alət» yazılırdı, amma 6 alət var** — sahib canlıda gördü. TASK-0450 «Böyüt» bölməsinə «Addım Xərci Kalkulyatoru»nu əlavə etdi, bölmə mətni isə sayı sabit yazırdı. Say düzəldilmədi, **çıxarıldı** (4 dildə «Buradakı alətlər…», «Bu bələdçilər…») — növbəti alət əlavə olunanda mətn yenə köhnəlməsin; «Böyüt» mətninə «addım» sözü əlavə olundu. Yoxlama: lokal `/toolkit`, `/en`, `/tr`, `/ru` → yeni mətn, «5 » sayı 0.

### Changed
- `TASK-0451` chore(process): **«Hər PR-da STATE.md yenilənməlidir» qaydası ləğv edildi → «STATE.md-yə PR-da toxunma»**. Səbəb: CI (quality-gates, «Generate STATE.md») main-ə hər push-dan sonra `docs/STATE.md`-ni özü yaradıb commit edir; PR da həmin faylı dəyişəndə hər bot commit-i konflikt verir — PR #450 iki dəfə bu səbəbdən «This branch has conflicts» göstərdi (L-054). Sahib qərarı ilə `CLAUDE.md` (PR Disiplini) və `.github/pull_request_template.md` checklist-i yeniləndi. Bu PR-ın özündə STATE.md dəyişməyib.

### Added
- `TASK-0449` feat(toolkit): **İnşaat checklist-ə «Əməliyyat dizaynı» mərhələsi — tikintidən əvvəl 10 yoxlama, 52 → 62 maddə**. Mövcud checklist tikinti və rəsmi işlərdə güclü idi, amma memarın eskizi gələndə yoxlanacaq əməliyyat qərarları yox idi — halbuki ən bahalı səhvlər (sökülən divar, kəsişən axın) məhz orada edilir. Siyahının **əvvəlinə** yeni mərhələ: konsept–tutum–menyu–avadanlıq uyğunluğu, küçədən görünmə testi, qonaq yolu, məhsul yolu (qəbuldan boşqaba), kirli/təmiz axının ayrılması, eskiz üstündə spagetti diaqramı, saatlıq güc, oturma zonaları, əlçatanlıq və təxliyə, sınaq açılışında ölçüləcək vaxtlar. Mətnlər Pattern A ilə **4 dildə** (AZ/RU/EN/TR, 23 açar, paritet 194/194/194/194). **İrəliləyiş qorunur:** yeni maddələrə id 53–62 verildi, mövcud 1–52 dəyişmədi — `localStorage`-dakı köhnə işarələr yerində qalır; ekranda isə id yox, **sıra nömrəsi** göstərilir (ilk maddə «1.», «53.» deyil). «52» yazılan bütün alət səthləri 62 oldu (4 dildə `pageDesc`, metadata, HowTo strukturlu data-ya yeni addım, mega menyu). Bloq yazısının «52 Maddəlik» başlığı qəsdən toxunulmadı — o yazı öz 52 tikinti maddəsini sadalayır. Sahib spesifikasiyanı təsdiqlədi («10 madde tamam»). **Sübut:** yeni `e2e/insaat-checklist.spec.ts` (@smoke) **6/6** — 4 dildə route 200, ilk mərhələ dizayn, `0/62`, «1.» və «10.» maddələr; köhnə irəliləyiş `[1,2,3]` → `3/62` və «Ön hazırlıq» `3/12`; 390px daşma yox. tsc baza (35), eslint 0 error.
- `TASK-0450` feat(toolkit): **yeni alət — «Addım Xərci Kalkulyatoru» (`/toolkit/addim-xerci`)**. Aşpaz və ofisiantın gündə boş yola sərf etdiyi vaxtı aylıq və illik əmək haqqı itkisinə çevirir: `artıq dəqiqə × işçi × saatlıq əmək haqqı ÷ 60 × iş günü`. Sahibin «Spagetti diaqramı» bloq yazısının hədəf alətidir və **uydurma statistika vermir** — bütün girişlər istifadəçinin öz 30 dəqiqəlik müşahidəsindən gəlir (alətdə 5 addımlıq «necə ölçərsən» təlimatı). İki giriş rejimi: dəqiqə ilə və ya gediş sayı × bir gedişin saniyəsi; saatlıq əmək haqqını bilməyənlər üçün aylıq maaş ÷ ayda iş saatı köməkçisi. Nəticə: ayda ₼, ildə ₼, gündə və ayda itən saat + «bu yalnız maaşdır» qeydi. Hesab təmiz funksiyada (`lib/toolkit/addimXerci.ts`, mənfi/NaN giriş 0 sayılır). Pattern A, **4 dil** (`toolkit.addimXerci`, 39 açar × 4, komponentdə sabit mətn 0), kök + `[locale]` route (L-038), toolkit səhifəsində «Böyüt» qrupunda kart (4 dil), `TOOLKIT_CATALOG`-da qeyd (llms.txt və xəbər→alət eşləşməsi avtomatik götürür). Kontrast qaydası: etiketlər və seçilməmiş rejim düyməsi `text-slate-700`, seçilmiş `text-slate-900`. AI şərhi qəsdən yoxdur (sadə hesab). **Sübut:** `e2e/addim-xerci.spec.ts` (@smoke) **24/24** (8 test × `--repeat-each=3`) — 4 dildə route 200 və nümunə giriş **312₼ / 3 744₼ / 2 saat**; gediş rejimi 60 × 40 s → yenə 312, 120 gediş → 624; maaş köməkçisi 1250 ÷ 208 → 6.01 ₼/saat → 313; toolkit siyahısında kart; 390px daşma yox. Test əvvəl təsadüfi düşürdü — iki gizli yarış tapıldı (dil detektoru `en-US` brauzeri `/en`-ə yönləndirir; hidrasiyadan əvvəlki klik itir) → L-053. tsc baza (35), eslint 0.

### Fixed
- `TASK-0448` fix(ci): **«Daily News Fetch» skripti «Done»-dan sonra çıxmırdı — GitHub 6 saat sonra cancel edirdi, o günün xəbəri commit olunmurdu**. 0446-nın planlı yoxlaması (12 gün sonra): merge-dən sonrakı 5 icradan 3-ü uğurlu (3–9 dəq, `pendingNews.json` commit olunur — cron **düzəlib**), 2-si (#179, #183) düz 360 dəqiqədə «cancelled». Log: `[fetch-news] Done.` 13:20:01 → `The operation was canceled.` 19:16:52, arada heç nə; «Commit and push» addımı skipped. Yəni skript işini bitirir, amma proses çıxmır (rss-parser/`fetch` açıq soketləri event loop-u saxlayır). Eyni simptom 2026-09-13-də sandbox-da görülmüş, «proxy şübhəsi, CI-da yoxlanacaq» yazılmışdı — CI-da təsdiqləndi. **Düzəliş (3 sətir):** `scripts/fetch-news.mjs` `main().then(() => process.exit(0))` (fayl sinxron yazılır, itki yoxdur); DeepSeek `fetch`-ə `AbortSignal.timeout(30_000)` (əvvəl heç bir timeout yox idi — cavabsız API bütün cron-u asa bilərdi); `fetch-news.yml` job-a `timeout-minutes: 15` (normal icra 3–9 dəq; ilişmə 6 saat yox, 15 dəq itsin və «cancelled» yerinə açıq «timed out» görünsün). **Sübut:** lokal `npm run fetch:news -- --limit=1 --no-translate` → əvvəl «Done»-dan sonra 90s timeout (exit 124), indi **exit 0, 4 saniyə**; `node --check` + eslint 0. Növbəti cron icraları ≤15 dəq olmalıdır — check-in qurulub. L-052.

- `TASK-0447` fix(dashboard): **mobil daşma `blog` + `food-cost`; `hero` saxta «Saxla» redaktoru silindi (TD-005); smoke spec 390px yoxlaması bütün səhifələrə**. Sahib «hallet» dedi. **(1) Mobil:** 0445-dən sonra 20 səhifə × 390/360px ölçüldü — 18 təmiz, 2 daşırdı. `blog` başlıq sətri `flex justify-between` sarılmırdı, «Yeni yazı +» 432px-ə çıxırdı → `flex-wrap` + sol bloka `min-w-0` + düymə qrupuna `flex-wrap`; `food-cost` tab zolağı `flex` sarılmırdı (437px) → zolağa `overflow-x-auto`, tablara `shrink-0 whitespace-nowrap` (tab-lar sarılmır, sürüşür — mobil tab standartı). Diff: 6 + 4 sətir. **(2) hero:** qərar araşdırma ilə — landing `components/Hero.tsx` mətni 4 dildə kodda yazılıb; `hero_content` cədvəlini tətbiq kodu heç yerdə oxumur (yalnız tərcümə skriptləri); redaktorun sahə modeli canlı Hero ilə uyğun deyil (RU yox, CTA sabit); `defaultHeroContent` saxta rəqəmlər daşıyırdı («150+ aktiv restoran», «32% xərc azalması») — «Saxla» real olsaydı bunlar canlıya gedərdi. 0444 presedenti («C sil»): `app/dashboard/hero/page.tsx` + `[locale]` mirror, sidebar linki, `dashboardSidebar.nav.hero` (4 dil, paritet 20/20/20/20), `defaultHeroContent` (−21 sətir) silindi; `hero_content` DB cədvəli və schema toxunulmadı. Real hero redaktoru = ayrıca DB-bağlı 4 dilli feature (HANDOFF). **(3) Spec:** `MOBILE_PAGES` 5 səhifədən bütün `KEPT` siyahısına (5 səhifəlik siyahı bu iki daşmanı qaçırmışdı); `hero` `REMOVED`-a. **Prettier hook tələsi (L-051):** `Edit` sonrası hook 3 faylı tam formatladı (27/160/314 sətir) — geri alınıb `perl` ilə minimal tətbiq edildi. **Sübut:** spec **5/5 (16.4s)** — 16 silinən route × (kök + `/tr`) 404, 19 səhifə render, sidebar 6 bölmə/8 link, **19 səhifə × 390px `scrollWidth <= clientWidth`**, `.dashboard-scope` rəngi; `next build` OK; tsc baza; eslint 0 error (2 köhnə warning blog-da, toxunulmadı); `verify-lessons` 38/38. Dashboard 19 → **18 route**.

- `TASK-0446` fix(ci): **«Daily News Fetch» cron-u 3 aydır səssiz sınırdı — `node --env-file` fayl yoxdursa exit 9**. Sahib Actions-da qırmızı `fetch` job-unu göstərdi (run #171, `main` fbbe5c7). Log: `node: .env.local: not found` → `Process completed with exit code 9`. **Kök səbəb:** `fetch:news` script-i PR #394-dən (2026-06-14) bəri `node --env-file=.env.local …` idi; `--env-file` məcburidir, CI-da isə `.env.local` heç vaxt olmur (sirlər workflow `env:` ilə gəlir). Son **100 icranın 100-ü FAIL** (ən azı 2026-06-06-dan) — scheduled workflow heç kimin axınına düşmədiyi üçün görünmədi; `pendingNews.json` 3 ay yenilənməyib. **Düzəliş:** `package.json`-da 4 script (`fetch:news`, `content:translate`×3) `--env-file` → `--env-file-if-exists` (fayl yoxdursa xəbərdarlıq verib davam edir; `--env-file-if-missing` deyə bayraq YOXDUR — Node 22 «bad option»); `fetch-news.yml` Node 20 → 22 (`engines: >=22`, EBADENGINE xəbərdarlığı da gedir). PROTECTED `package.json` sahib icazəsi ilə (`ALLOW_PROTECTED=1`), yalnız script bölməsi. **Sübut:** `.env.local` olmadan `npm run fetch:news -- --limit=1 --no-translate` → `.env.local not found. Continuing without it.` → `[fetch-news] Done.` (RSS 403-lər sandbox proxy-sidir; CI-da açıq şəbəkə). Merge-dən sonra `workflow_dispatch` ilə yaşıl icra gözlənilir. L-050.

### Added
- `TASK-0445` chore(system): **sessiya sistemə yazıldı — dərslər, task kartları, handoff, deploy proseduru, daimi smoke test**. Sahib «hər şeyi sistemə əlavə et» dedi. **(1) LESSONS.md:** kodda istinad edilən 2 itmiş dərs bərpa (L-013 skorlar SSOT, L-023 fakt/şərh/hipotez) + bu günün 10 dərsi (L-040…L-049: uğur yolu testi, Neon-http tək ifadə + `sql.transaction`, `pgrep -x` / canlı serverin altında `.next`, köhnə `.next` tsc artefaktları, Playwright `lab()` + görünürlük, grid `min-w-0`/`flex-wrap`, route-a auth-dan əvvəl çağıranlar, JSDoc `*/`, qaydasız class no-op, miqrasiya idempotentliyi). Səhərki «13 dərs itib» iddiası düzəldildi — əslində 2, qalanı `### L-0XX —` formatında var idi. **(2) `scripts/verify-lessons.mjs`** — kodda/sənəddə istinad edilən hər `L-0XX` LESSONS.md-də olmalıdır; `dk-validate.sh`-ə 5b yoxlaması kimi bağlandı (36 istinad ✓). **(3) Task kartları** `docs/tasks/TASK-0426…0444.md` — konvensiya 0425-də dayanmışdı; 19 kart (0433 ID toqquşması kartda qeyd olunub). **(4) HANDOFF.md** sessiya bölməsi; **DEPLOYMENT.md** `drizzle-kit push` → `npm run db:migrate` proseduru + «yeni route restart tələb edir»; **CLAUDE.md** brend qırmızısı `#E94560` (sahib: olduğu kimi qalır) + API guards / miqrasiya istinadları; **CLAUDE-BRAIN.md** §9 sessiya invariantları; **TECH_DEBT** TD-005…TD-009 (hero saxta Saxla, ilanlar mock fallback, [locale] dashboard layout, dk-card/page-header rollout, push qadağası); **ADR-0016** route təmizliyi qərarı. **(5) `e2e/dashboard-smoke.spec.ts` (@smoke)** — bu günün ad-hoc Playwright yoxlamaları daimi spec oldu: silinən 15 route 404 (reqressiya qoruyucusu), 20 səhifə render + görünən xəta yox, sidebar 6 bölmə/8 link, 390px daşma, `.dashboard-scope` rəngi; `JWT_SECRET` yoxdursa SKIP. `playwright.config.ts`-ə istəyə bağlı `PW_CHROMIUM_PATH` (sandbox-da hazır Chromium, CI-da təsirsiz). Sübut: runner-də **5/5 passed (42s)**; `verify-lessons` ✓; tsc 35 (baza); eslint 0.

### Removed
- `TASK-0444` chore(dashboard): **34 route → 19: 15 saxta/boş səhifə silindi, 8 real səhifə menyuya girdi, sidebar bölmələndi**. Dashboard-da 34 top-level route vardı, sidebar 13-ünü göstərirdi; qalan 21-i yalnız ünvanla açılırdı. Sahib qərarı ilə **hardcoded data göstərən 14 səhifə** silindi — `pipeline`, `deal-flow`, `raporlar`, `roller`, `loglar`, `mesajlar`, `etkinlikler`, `b2b-yonetimi`, `trends`, `haberler` (saxta xəbər admini; əsl olan `xeberler`-dir), `duyurular`, `toolkit` və `site` (saxta «Saxla»), `ilan-onaylari` (yalnız yönləndirmə) — plus `settings` boş stub-ı (18 sətir, yalnız başlıq); əsl ayarlar `ayarlar`-dır və sidebar-ın Parametrlər linki ona yönəldi. Hər route-un `[locale]` mirror-u da silindi (**31 fayl**), yalnız `trends` işlədən `data/trends-mock.ts` və yalnız silinən səhifələrin işlətdiyi **10 i18n namespace** (`dashboardPipeline`…`dashboardSettings`) 4 dildə paritetlə təmizləndi (49/49/49/49). `mockNewsDB` **qaldı** — açıq saytın xəbər komponentləri işlədir. Silmədən əvvəl bütün `app/`, `components/`, `lib/`, `tests/`, `scripts/`, `.github/` taranıb: silinən route-lara **sıfır istinad**. **Menyuya girən 8 real səhifə:** `franchise-leads`, `faturalar`, `fatura-kateqoriyalar`, `food-cost`, `auditor`, `aqta-checklist`, `profil-onay`, `ayarlar`. 20 link düz siyahıda oxunmadığı üçün sidebar **6 bölməyə** ayrıldı (Məzmun · Satış və Leadlər · Maliyyə · Keyfiyyət · Üzvlər · Sistem) — Pattern A, 4 dildə `dashboardSidebar.sections.*` + 4 yeni `nav.*` açarı, paritet ✓. Alt menyu (4 element) dəyişmədi. Sübut: 15 silinən route × (kök + `/tr`) → **30/30 404**; qalan 20 səhifə auth ilə **20/20** render (sidebar var, görünən xəta yox — raw HTML-də error.tsx fallback mətni həmişə olduğu üçün görünürlük yoxlanılır); sidebar 6 bölmə, 8 yeni link, silinənə link 0, `settings` → `ayarlar`; 390px daşma yox. tsc bazaya bərabər (silinən route-lara istinad edən köhnə `.next/types/validator.ts` yalançı 31 xəta verirdi — generasiya faylı, təmizləndi). STATE: 257 → **227 route**.

### Fixed
- `TASK-0443` fix(dashboard): **dizayn təməli + mobil daşma — görünməz mətn, 200 kontrast yamağı, 8 səhifədə 390px daşma**. **(1) Kök səbəb — işıq teması heç vaxt yazılmayıb:** `DashboardLayout.tsx:15` `dashboard-scope` class-ı yazır, amma bütün repoda onun üçün bir CSS qaydası da yox idi; `body { color: #eaeaea }` qaranlıq landing üçündür, nəticədə dashboard-da rəng verilməyən hər mətn **ağ üstündə ağ** olurdu (məs. haberler «Yenilə» düyməsi, pipeline bağlama `✕`). TASK-0131 yalnız input-ları yamamışdı. İndi `.dashboard-scope { color: var(--dk-ink) }` — bir sətir, sinif bütöv düzəlir. **(2) Kontrast:** `text-slate-400`/`gray-400` (ağda **2.56:1**, WCAG AA-nı keçmir) dashboard-da KPI etiketi, cədvəl başlığı və ana səhifə bölmə başlıqları kimi **əsas mətn** üçün işlənirdi — 40 faylda **200 istifadə** `600`-ə (7.5:1) çevrildi; qaranlıq fon istisnası olmadığı yoxlanıldı. **(3) Tək kart primitivi** `.dk-card` `globals.css`-də — 9 fərqli radius / 4 sərhəd rənginin əvəzinə tək mənbə (rollout ayrı task). **(4) Mobil (`PLATFORM-STANDARDS` §3 «80% mobile»):** pipeline çekmecesi `w-[500px]` → `w-full max-w-[500px]`; prefikssiz `grid-cols-3/4/5` KPI şəbəkələri (pipeline, etkinlikler, loglar, haberler) → `grid-cols-2 lg:…`; fatura-kateqoriyalar cədvəl sarğısı `overflow-hidden` → `overflow-x-auto` (kəsilirdi, sürüşmürdü). **Real test ilkin düzəlişdən sonra 3 daşma daha tapdı:** etkinlikler, loglar, deal-flow, faturalar-da filtr çip-zolağı `flex gap-2` sarılmırdı (525/451px) → `flex-wrap` (yalnız `.map(`-lı çip zolağı sətirləri, digər `flex gap-2`-lər toxunulmadı); deal-flow-da grid uşağı `min-width:auto` olduğundan içindəki `overflow-x-auto` cədvəl sütunu 426px-ə itələyirdi → grid uşaqlarına `min-w-0`. PROTECTED `app/globals.css` sahib icazəsi ilə (`ALLOW_PROTECTED=1`), **+20 sətir, silinən yoxdur**. Sübut: Playwright 390px, auth-lu dashboard, **13/13 PASS** — 8 səhifədə `scrollWidth == clientWidth`, «Yenilə» düyməsi `rgb(15,23,42)` (əvvəl `#eaeaea`), `.dashboard-scope` kök rəngi, `text-slate-600` tətbiqi (Tailwind v4 `lab()` → canvas ilə rgb), ana səhifədə `-400` mətn 0. tsc 35 (baza), eslint 0 error, `✓ Compiled successfully`.

### Fixed
- `TASK-0442` fix(db): **miqrasiya runner-i Neon-da işləmirdi — `cannot insert multiple commands into a prepared statement`**. Sahib ilk dəfə canlı bazada işlətdi və birinci faylda sındı. **Səbəb:** Neon-un HTTP drayveri hər sorğunu prepared statement kimi göndərir, prepared statement isə **bir neçə SQL ifadəsini qəbul etmir**; mən isə fayl mətnini olduğu kimi göndərirdim. **İkinci, gizli problem:** `BEGIN`/`COMMIT`-i ayrı sorğularla göndərmək neon-http-də transaksiya yaratmır — hər sorğu müstəqil HTTP çağırışıdır, yəni «hər fayl öz transaksiyasında» vədim də **əslində işləmirdi**. **Həll:** (1) `splitStatements()` — SQL-i ifadələrə bölən parser; sadə `split(';')` yaramır, çünki `DO $ … $` bloklarının içində nöqtəli vergül var, ona görə tək dırnaqlı sətirlər (`''` escape daxil), dollar-quoted bloklar (`$` və `$tag# CHANGELOG

- `TASK-0417` fix(news): **preview saves before opening** — manual news editor preview no longer opens an unsaved `/haberler/{draftSlug}?preview=true` URL. It first saves/PATCHes the article as `fetched`, captures the API returned slug, then opens preview with the saved slug so new drafts do not 404.

- `TASK-0415` fix(security): **dependency vulnerability sweep** — direct runtime packages upgraded (`next` 16.2.9, `drizzle-orm` 0.45.2, `@google/genai` 2.10.0, `cloudinary` 2.10.0, `nodemailer` 9.0.1, SheetJS `xlsx` 0.20.3 tarball), `drizzle-kit` moved to devDependencies, and vulnerable transitive packages pinned with npm overrides. Audit reduced to **0 critical / 0 high / 4 moderate**; remaining moderate chain is upstream Next bundled PostCSS. Lint + production build pass.
- `TASK-0416` fix(dashboard): **locale funnel route mirror** — `/tr/dashboard/funnel` canlıda 404 verirdi, çünki yalnız root `app/dashboard/funnel/page.tsx` vardı; `app/[locale]/dashboard/funnel/page.tsx` re-export mirror-u əlavə edildi. Build route list-də `ƒ /[locale]/dashboard/funnel` göründü; lokal built smoke `307 /auth/login` qaytardı (404 yox).

- `TASK-0414` fix(toolkit): **Açılış checklist hüquqi dəqiqləşdirmə** — “İcra Hakimiyyəti razılığı” ADRA icazəsi ilə əvəz edildi; Azərbaycan Respublikasının Dövlət Reklam Agentliyinin tam adı və fəaliyyət ünvanı üzrə 15 rəqəmli obyekt kodu maddəsi AZ/RU/EN/TR dillərində əlavə edildi. Checklist 43→44.

Butun ehemiyyetli deyisiklikler bu faylda qeyd olunur.

), `--` və `/* */` şərhləri izlənir. (2) İcra `sql.transaction([...])`-ə keçirildi — bütün ifadələr **bir HTTP sorğusunda, real transaksiya daxilində**; izləmə qeydi də eyni massivdədir, yəni «fayl tətbiq olunub amma qeyd yoxdur» vəziyyəti mümkün deyil. Sübut: **lokal Postgres 16-da 100 ifadə × 2 keçid, 0 xəta** (hər ifadə ayrıca icra olunub — Neon-un davranışı təqlid edilib), üstəlik `fetch` tutularaq `sql.transaction()`-in göndərdiyi gövdə yoxlanılıb: 3 sorğu bir çağırışda, `DO $` bloku bütöv, parametrlər düzgün bağlanıb.

### Fixed
- `TASK-0441` fix(db): **`db:migrate` lokalda `.env.local`-ı oxumurdu**. TASK-0440-da göndərdiyim skript `process.env.DATABASE_URL`-ə baxırdı, amma Next.js-dən fərqli olaraq sadə `node` skripti `.env.local`-ı avtomatik yükləmir — nəticədə dəyər faylda mövcud olduğu halda `DATABASE_URL təyin edilməyib` verirdi və skript lokalda **ümumiyyətlə işlədilə bilmirdi**. Node-un `--env-file` bayrağı 20.6-dan əvvəl yoxdur və fayl olmayanda sınır, ona görə oxuma asılılıqsız şəkildə skriptin içinə salındı: `.env.local`, sonra `.env`; `export ` prefiksi, tək/cüt dırnaq və `#` şərh sətirləri emal olunur. **Mövcud mühit dəyişəni üstündür** — Hostinger/CI-ın verdiyi dəyər əzilmir. Fayllara **yazılmır**, yalnız oxunur (layihə qaydası: `.env*` fayllarına yazma). Xəta mesajı da dəqiqləşdirildi — harada axtarıldığını sadalayır.

### Fixed
- `TASK-0440` fix(db): **miqrasiya sistemi — 16 yetim miqrasiya artıq tətbiq olunur**. `drizzle/` qovluğunda **25 .sql faylı** var, `_journal.json`-da isə yalnız **9-u** qeydlidir; `package.json`-da `db:migrate` scripti, kodda isə migrator çağırışı **ümumiyyətlə yox idi**. Yəni 0009-dan sonrakı hər miqrasiya yetim qalırdı və yalnız kimsə əl ilə işlədəndə tətbiq olunurdu — TASK-0433-dəki `/dashboard/contact-tracking` çökməsi (`column "source_url" does not exist`) məhz bu idi. **Niyə journal-a əlavə etmədim:** `drizzle-kit` tətbiq olunanları `__drizzle_migrations`-da **hash** ilə izləyir; 16 faylı journal-a salmaq mövcud hash-ləri dəyişir və canlı bazada təkrar icraya/uyğunsuzluğa gətirir. **Həll — iş bölgüsü:** journal-dakı fayllar `drizzle-kit`-in, qalan 16-sı yeni `scripts/migrate.mjs` runner-inin məsuliyyətindədir. Runner `_journal.json`-u oxuyur və orada qeydli faylları **atlayır**; qalanını ad sırası ilə, hər birini **öz transaksiyasında** icra edir və `dk_migrations` cədvəlində izləyir. **Real testdə iki gerçək baq tapıldı:** (1) iki fayl eyni `0007` nömrəsindədir — əlifba sırası `0007_add_user_priorities`-i `0007_tidy_monster_badoon`-dan əvvələ salır və ikincisi `column "priorities" already exists` ilə **sınırdı**; journal ayrımı bunu həll etdi, çünki drizzle faylları öz sırası ilə əvvəl gedir. (2) `0013_email_preferences.sql`-də üç `CREATE INDEX` `IF NOT EXISTS`-siz idi — təkrar icrada sınırdı; düzəldildi. **Təhlükəsizlik qərarı:** `db:migrate` **yalnız** əl ilə yazılmış idempotent faylları işlədir. `drizzle-kit migrate` ayrı `db:migrate:bootstrap` scriptindədir, çünki drizzle-in generasiya etdiyi 0000–0008 idempotent **deyil** və `__drizzle_migrations` boş olarsa canlıda sınar — RUNBOOK §6-da açıq xəbərdarlıq var. Sübut: **lokal Postgres 16-da real icra** — təmiz bazada 25/25 OK, təkrar icrada 16/16 OK (idempotentlik), və canlı ssenari uçdan-uca: 0020 sütunları silindi → səhifə sorğusu `column "source_url" does not exist` verdi → runner 0020-ni tətbiq etdi → həm sorğu, həm `/api/leads/track` insert-i işlədi. PROTECTED `package.json` sahib icazəsi ilə (`ALLOW_PROTECTED=1`), diff **3 sətir**.

### Security
- `TASK-0439` fix(security): **internetə açıq 4 API route bağlandı + 2 gizli baq**. `middleware.ts` matcher-i yalnız `/(az|ru|en|tr)/:path*` tutur, yəni **`/api/*` ümumiyyətlə middleware-dən keçmir** — bu dörd route-da isə heç bir auth yoxlaması yox idi. **(1) `/api/orchestrator`** sərbəst mətni Gemini-yə göndərir: internetdən istənilən adam `GEMINI_API_KEY` ilə istədiyini işlədə bilirdi. İndi giriş + saatda 10 hədd. Qanuni çağıran yalnız `ListingForm`-dur və o, girişli səhifələrdə render olunur, üstəlik onsuz da 401/403 emal edirdi (`ListingForm.tsx:139`) — yəni auth nəzərdə tutulmuş, sadəcə server tərəfdə yazılmamışdı. **(2) `/api/audit`** (+`[id]`) və **(3) `/api/invoice-categories`** — tam CRUD, `DELETE` daxil, qorunmasız: kənar adam restoran auditlərini silə bilirdi. 11 handler-in hamısına admin tələbi. **(4) `/api/food-cost` qarışıq idi** — `lookup` açıq `/toolkit/food-cost` alətindən, `report/trend/suppliers/products/all` isə dashboard-dan çağırılır. Bütün route-a admin qoymaq **pulsuz aləti sındırardı**, açıq saxlamaq isə **real faktura və təchizatçı datasını** internetə açıq qoyurdu — ona görə qorunma əməliyyat səviyyəsindədir: `lookup` açıq + IP üzrə 60/dəq, qalanı admin. Kor-koranə auth əlavə etmək iki açıq funksiyanı sındıracaqdı. **Yanaşma:** kopyalanan yoxlama əvəzinə tək `lib/api/guards.ts` modulu (`requireApiAdmin` / `requireApiMember`) — dörd route-un yoxlamasız qalmasının səbəbi məhz hər route-un öz yoxlamasını kopyalaması idi. **Yanaşı tapılan iki baq:** (a) `lib/analytics/homeEvents.ts:39` ana səhifə analitika beacon-unu **AI endpoint-inə** (`/api/orchestrator`) göndərirdi; o route `taskType`+`userPrompt` tələb etdiyi üçün **hər beacon 400 alırdı — ana səhifə hadisələri heç vaxt qeydə düşməyib**, üstəlik hər ziyarətçi AI endpoint-inə dəyirdi. Doğru ünvana (`/api/analytics/track`, sendBeacon üçün qurulub) yönləndirildi. (b) `lib/utils/rate-limit.ts:51` `request.ip` oxuyurdu — Next 15-də silinib, yəni ölü kod + daimi tip xətası; silindi, **tsc 36 → 35**. Aşkarlanan borc `TD-004` kimi qeydə alındı (iki paralel auth sistemi). Sübut: 10 route/əməliyyat üzrə canlı HTTP testi (qorunanlar 401, açıq alət 200), rate-limit 59×200 → 429 + düzgün başlıqlar, açıq səhifələrdə reqressiya yox, `✓ Compiled successfully`.

### Fixed
- `TASK-0438` fix(listings): **açıq /ilanlar bütün elanları yükləyir (20-cap aradan qalxdı)** — səhifə `/api/listings?showcase=true` sorğusunu limit-siz atırdı, API default 20-də kəsirdi, sonra süzgəc/axtarış yalnız həmin 20 sətir üzərində işləyirdi → **müştəri 20-dən sonrakı elanı tapa bilmirdi (biznes itkisi)**. Sorğuya `&limit=500` əlavə edildi (API-də max cap yoxdur). Səhifə onsuz da URL-ə sync olur və client süzgəci ani olduğundan başqa dəyişiklik lazım deyil. 500-dən çox showcase elan olsa server-side pagination lazımdır (ayrıca). Mənbə: axtarış audit. (DoD #11: sandbox npm 403, deploy-da test.)

### Added
- `TASK-0437` feat(dashboard-mobile): **Apple-vari alt naviqasiya + kəsilən cədvəllər düzəldildi** — dashboard-da mobil naviqasiya yalnız yuxarı-soldakı hamburger idi (başparmaq çatmır). Yeni `DashboardBottomNav`: 5 slot (Ana / İlanlar / **KAZAN** ortada highlight / Xəbərlər / Daha çox), `fixed bottom-0 pb-safe lg:hidden`, ≥44px toxunuş sahəsi, aktiv-state sidebar məntiqi ilə eyni; «Daha çox» tam sidebar-ı açır (13 element əlçatan qalır). `DashboardLayout`-a mount + content `pb-20 lg:pb-0`. i18n `nav.more` 4 dil. Əlavə: `blog` və `xeberler` cədvəl konteynerləri `overflow-hidden` → `overflow-x-auto` (telefonda kəsilmə → üfüqi sürüşmə). Mənbə: 12-13.09 mobil audit. (DoD #11: sandbox npm 403 → build/tsc icra olunmadı, deploy-da test.)

### Fixed
- `TASK-0436` fix(dashboard): **`roller` səhifəsi artıq yalan danışmır** — rollar səhifəsi tam mock idi: «Yeni rol», per-rol «Redaktə»/«Sil» düymələrinin `onClick`-i yox idi, icazə dəyişiklikləri yalnız local state-də qalıb **saxlanmırdı**. İşləməyən düymələr `disabled` + izahlı `title` edildi, «Redaktə/Saxla» toggle-ı deaktiv oxu-rejiminə keçdi, yuxarıya «hazırlanır — dəyişikliklər saxlanmır» bildirişi əlavə olundu (i18n `previewNotice`, 4 dil). `HospitalityHeader`-dəki ölü axtarış qutusu heç yerdə render olunmadığı üçün toxunulmadı. Mənbə: 12-13.09 dashboard audit. (DoD #11: sandbox npm 403 → build/tsc icra olunmadı, deploy-da baxılmalı.)

### Fixed
- `TASK-0435` perf(blog): **tərcümə 3 dili paralel edir + blog şəkilləri lazy-load** — (1) `autoTranslateBlogPost` 3 dili (ru/en/tr) ardıcıl əvəzinə `Promise.all` ilə eyni anda tərcümə edir → admin «Tərcümə et» **~3× sürətli**, brauzer donması azalır; hər dil yalnız öz sütunlarını yazdığı üçün concurrent row update təhlükəsizdir. (2) `BlogGridPageClient` blog kartı şəkillərinə `loading="lazy" decoding="async"` — ekran-altı şəkillər əvvəlcədən yüklənmir. Kök səbəb: şəkillər hər yerdə xam `<img>` (next/image yox), tərcümə isə tam ardıcıl idi. Qeyd: sandbox npm 403 → tsc/build icra olunmadı (DoD #11 texniki skip), deploy-dan sonra test lazımdır. Qalır: next/image miqrasiyası + xəbər şəkli cloudinary proxy (ayrıca task).

### Added
- `TASK-0434` feat(tracking): **əlaqə kanalı klik izləməsi zənginləşdirildi** — `leads` cədvəlinə `source_url`, `prefill_text`, `destination_phone` (nullable, migration `0020` idempotent). `/api/leads/track` yeni sahələri sanitize edərək saxlayır və admin email-ində göstərir (**client dəyərləri HTML-escape** — injection qoruması). SST `lib/contact-channels.ts` (WhatsApp nömrəsi + Telegram URL) — `ContactFunnel` və wa.me redirect oradan oxuyur. contact-tracking səhifəsi: Səhifə / Hazır mesaj / Hədəf / Cihaz sütunları; **sayğac uyğunsuzluğu düzəldildi** (total indi `GROUP BY count(*)`, display limitindən asılı deyil). Sidebar-a «Əlaqə Kanalları» (4 dil). Qeyd: klik mesajın məzmununu deyil (WhatsApp söhbəti sayta gəlmir), niyyətini göstərir. Yoxlama: sandbox npm 403 səbəbindən tsc/eslint icra olunmadı (DoD #11 texniki skip), diff + review ilə təsdiqləndi.

### Fixed
- `TASK-0433` fix(campaign): **açılış kampaniyası bərpa olundu** — `LAUNCH_CAMPAIGN.endDateISO` 2026-09-01-də bitmişdi, ona görə `isLaunchActive()` `false` qaytarırdı və kampaniyaya bağlı pulsuz giriş / OCR yükləmə deaktiv idi. Sahib göstərişi ilə (kampaniya davam etsin) bitmə tarixi **2026-12-31**-ə uzadıldı (`lib/marketing-tools-config.ts:663`). Bir sətirlik, geri-dönümlü konfiq dəyişikliyi — real bitmə tarixi dəqiqləşəndə yenilənməlidir. Səbəb: 12.09.2026 audit sessiyası, WhatsApp tracking araşdırması zamanı kampaniyanın 11 gün əvvəl bitdiyi aşkarlandı.

### Added
- `TASK-0433` feat(seo): **`/llms.txt` + öz başlığı olmayan 6 səhifəyə metadata**. İki hissə var. **(1) `/llms.txt`** (`app/llms.txt/route.ts`) — llmstxt.org formatı, sitemap-dan fərqli iş görür: sitemap crawler-ə «bu URL-lər var» deyir, llms.txt isə cavab mühərriklərinə (ChatGPT, Perplexity, Claude) **hər səhifənin nə etdiyini** bir cümlə ilə deyir, yəni model saytı gəzmədən hansı səhifəni sitat gətirəcəyini seçə bilir. **Heç bir mətn yenidən yazılmadı** — bütün sətirlər mövcud SSOT-lardan gəlir: `TOOLKIT_CATALOG` (17 alət, öz label + description-ları ilə), sektor configlərinin `metaDescription`-ları + namespace `pageTitle`-ları, `franchisePillar` mesajları (6 franchise səhifəsi), bloq isə **DB-dən canlı** (`revalidate = 3600`), ona görə səhifə mətni dəyişəndə fayl da dəyişir. DB əlçatmazsa try/catch ilə bloq bölməsi düşür, fayl qalan bölmələrlə qaytarılır (TASK-0422 dərsi). Nəticə: **63 link, 6 bölmə, 13.7 KB**, `content-type: text/plain; charset=utf-8`. **(2) Metadata boşluğu:** sitemap-dakı bütün 16 giriş səhifəsi süpürüldü və **6-sının öz `<title>`-ı olmadığı, kök layout-un başlığını miras aldığı** tapıldı — `/blog` (priority 0.9), `/haqqimizda`, `/marketinq`, `/toolkit`, `/elaqe`, `/sedd-rozeti`. `/haqqimizda` xüsusilə vacibdir: **hər bloq yazısındakı Article JSON-LD-də `author.url` məhz bu səhifəni göstərir** (E-E-A-T siqnalı), yəni Google-un müəllif etibarını yoxladığı səhifənin adı yox idi. TASK-0430-dakı nümunə ilə eyni həll — 5 `'use client'` mirror üçün `layout.tsx`, `sedd-rozeti` server komponenti üçün birbaşa `export const metadata`; mətnlər səhifələrin **öz kopyasından** götürüldü (PAGE_COPY, `contact`/`toolkit` namespace-ləri, `/haqqimizda`-nın öz «2010», «40 il», «ilk AI dəstəkli HoReCa B2B platformasıyıq» cümlələri). `app/blog/layout.tsx` `/blog/[slug]`-ı da bürüyür, ona görə yazı səhifəsinin öz `generateMetadata`-sının üstün gəldiyi ayrıca yoxlanıldı. **Article markup üçün iş görülmədi — artıq mövcud idi**: `app/[locale]/blog/[slug]/page.tsx:157` BlogPosting + BreadcrumbList + Organization + (FAQ varsa) FAQPage buraxır; canlı yazıda parse edilib təsdiqləndi (ISO tarixlər, `author=Doğan Tomris`, `publisher.logo` ✓, `wordCount=1420`). Yoxlama: 6 səhifədə başlıq render olunur, bloq yazısı öz başlığını saxlayır, `/llms.txt` 200, `✓ Compiled successfully`, tsc 36 (baza), eslint 0 error.

### Added
- `TASK-0432` feat(seo): **Header-dən `/franchise` pillar səhifəsinə daxili keçid** (4 dildə). Pillar səhifə naviqasiyadan link almasa Google onu ikinci dərəcəli sayır — TASK-0431-in təsirini tamamlayan addımdır. `franchiseLinks` massivinin başına bir sətir əlavə edildi; massiv həm desktop dropdown (Header.tsx:151), həm də mobil menyu (Header.tsx:262) tərəfindən işlədilir, yəni bir dəyişiklik hər ikisini örtür. **Anchor mətni qəsdən açar sözdür** — «Azərbaycanda Franchise» / «Franchise in Azerbaijan» / «Франшиза в Азербайджане» / «Azerbaycan'da Franchise» — daxili link mətni sıralamaya təsir edir. PROTECTED `components/layout/Header.tsx` sahib icazəsi ilə dəyişdirildi (`ALLOW_PROTECTED=1`); prettier hook faylı tam yenidən formatlayıb 465 sətirlik diff yaratdığı üçün dəyişiklik orijinal formatı qoruyaraq yenidən tətbiq olundu — **yekun diff 6 sətir**. Yoxlama: desktop dropdown-da link mövcuddur (anchor «Azərbaycanda Franchise»), mobil menyuda mövcuddur, TASK-0426 mega menyu 3 endə reqressiya vermir, tsc 36 (baza), eslint 0 error.

### Added
- `TASK-0431` feat(seo): **`/franchise` pillar səhifəsi — «Azərbaycanda franchise» üçün sıralanacaq səhifə** (4 dildə). TASK-0430 indeksləşməni açdı, amma açar söz üçün səhifə yox idi: `app/franchise/page.tsx` mövcud deyildi, yalnız 5 alət vardı. Səhifə sahibin öz materialından quruldu — mətn uydurulmadı: hero və alət təsvirləri mövcud alət səhifələrindən, Doğan Tomrisin sahibkarlara müraciəti hazırlıq testindən, FAQ cavabları isə blog yazılarının öz cümlələrindən (ad haqqı/royalti/reklam bədəli üçlüyü; «qeydiyyatdan keçməyən markanı franchise vermək, sahibi olmadığın evi icarəyə vermək kimidir»). Struktur iki yola bölünür — **franchise VERMƏK** (hazırlıq testi + AI françbuk) və **franchise ALMAQ** (radar + ROI + alıcı çeklisti) — çünki alətlərin özü bu iki auditoriyaya işləyir. Bloq bölməsi DB-dən real franchise yazılarını çəkir (`tags`/`focusKeyword` üzrə filtr, DB əlçatmazsa try/catch ilə səhifə sınmır — TASK-0422 dərsi). JSON-LD: Organization + BreadcrumbList + **FAQPage** (AI cavab motorları üçün də). i18n Pattern A, 4 dildə 39 açar, parity ✓, hardcoded mətn 0. Sitemap-a əlavə edildi (296 → **300 URL**). Yoxlama: 4 locale üzrə 200, canonical `/franchise`, h1 «Azərbaycanda franchise», FAQPage+BreadcrumbList render olunur, auth gating toxunulmayıb.

### Fixed
- `TASK-0430` fix(seo): **texniki SEO təməli — canonical, sitemap və 17 səhifəyə metadata**. Sahib «Azərbaycanda franchising axtardım, saytım çıxmadı» dedi; araşdırma göstərdi ki, problem məzmun deyil, indeksləşmə siqnallarıdır. **(1) Canonical:** `lib/seo/alternates.ts` AZ üçün canonical-ı `/az/...` qururdu, halbuki `localePrefix: 'as-needed'` `/az/X`-i `/X`-ə redirect edir (L-038) — yəni hər AZ səhifəsi canonical olaraq redirect göstərirdi. Eyni faylda `structured-data.ts → localeUrl()` artıq düzgün edirdi, yəni bu qərar deyil, uyğunsuzluq idi. **(2) Prefiksiz səhifələrdə canonical ümumiyyətlə yox idi** — `getAlternates` yalnız `[locale]` ağacında çağırılırdı; root layout-a `alternates: { canonical: './' }` əlavə edildi (PROTECTED, sahib icazəsi ilə) və bütün prefiksiz AZ ünvanları öz-özünə istinad edən canonical aldı. **(3) `[locale]/layout.tsx` canonical-ı `'/'`-ə hardcode etmişdi** — yəni `/ru/toolkit` özünü RU ana səhifəsinin dublikatı elan edirdi və indeksdən düşürdü; nisbi `'./'` ilə əvəz edildi. **(4) Sitemap:** 17 toolkit + 5 franchise + 4 sektor + 9 giriş səhifəsi əlavə edildi; redirect olunan `/az/...` sətirləri tamamilə çıxarıldı. **296 URL, `/az/` sıfır.** **(5) Metadata:** 17 səhifədə başlıq/təsvir yox idi — 7 `'use client'` səhifə üçün `layout.tsx`, 10 mirror üçün birbaşa export; mətnlər mövcud `[locale]` metadata və `messages/az.json`-dan götürüldü, uydurulmadı. Yoxlama: build ✓, 10 route üzrə canonical düzgün (4 dil), auth gating qorunub (`/dashboard` 307, `POST /api/admin/ads` 403).

### Security
- `TASK-0429` fix(security): **`sharp` 0.34.5 → 0.35.3 — son production runtime HIGH bağlandı** (libvips CVE-2026-33327/33328/35590/35591). **Sadə bump işləmirdi:** `next@16.2.12` `sharp: ^0.34.5` elan edir, yəni 0.35.3 onun aralığına düşmür — üst səviyyədə qaldıranda npm `node_modules/next/node_modules/sharp@0.34.5` yaradırdı və `next/image` məhz **zəif olanı** işlədirdi; `npm audit` bump-dan sonra da HIGH bildirirdi. Sübutla yoxlandı. Heç bir stabil `next` versiyası `sharp ^0.35`-i qəbul etmir (yalnız 16.3.0-preview/canary). Həll: `overrides: { "sharp": "$sharp" }` — ağacda tək `sharp 0.35.3` qalır. `sharp` kod bazasında **heç yerdə birbaşa import olunmur**, yeganə istifadəçi `next/image` optimizasiyasıdır, ona görə risk səthi məhduddur. Buna baxmayaraq `next`-i elan etdiyi aralıqdan kənar versiyaya məcbur etdiyimiz üçün şəkil optimizasiyası real olaraq test edildi: `/_next/image` 5 endə (256/640/828/1200/1920) HTTP 200, çıxış **AVIF** (libvips-in ən ağır yolu), hər ölçüdə düzgün resize, `sharp` ilə problemsiz dekod. **Advisory 9 → 8**, paket 11 → 10. PROTECTED `package.json` sahib icazəsi ilə dəyişdirildi (`ALLOW_PROTECTED=1`), diff cəmi 2 sətir, `xlsx` pin-i toxunulmadı.

### Security
- `TASK-0428` fix(security): **Hostinger 2026-08-01 skanı — advisory 24 → 9** — Hostinger 25 zəiflik bildirdi; araşdırma göstərdi ki, Hostinger **CVE/advisory** sayır, `npm audit` isə **paket** qruplaşdırır (11 paket = 24 advisory) — eyni reallıqdır, yeni tapıntı deyil. Ən kritik: `next` **16.2.9**-da idi və 9 advisory-nin **hamısı 16.2.11-də bağlanıb** — içində **Middleware / Proxy bypass (HIGH)**, Server Actions və rewrites üzrə **SSRF (HIGH ×2)**, Server Actions **DoS (HIGH)**. `middleware.ts` platformada auth gating etdiyi üçün bypass birbaşa üzv qapısı riski idi. `package.json`-dakı `^16.2.9` aralığı düzəlişə onsuz da icazə verirdi — problem yalnız köhnə lockfile idi, ona görə **`package.json` (PROTECTED) toxunulmadı**, yalnız `package-lock.json` yeniləndi: `next` 16.2.12, `postcss` 8.5.25 + transitive-lər. **Qalan 9 advisory** (ayrıca qərar tələb edir): `sharp` 0.34.5 → 0.35.3 major/breaking (yeganə production runtime HIGH, libvips CVE-ləri — şəkil emalı); `next`-in daxili pin edilmiş `postcss@8.4.31` (upstream, build vaxtı); `js-yaml` (eslint → devDependency, build vaxtı); `dompurify` (LOW) və `protobufjs` — üçü də `package.json` `overrides` bloku ilə pin edilib, dəyişmək üçün PROTECTED fayl lazımdır.

### Fixed
- `TASK-0427` fix(ai): **Claude fallback yeni modellərə keçəndə 400 verməyəcək** — hər iki Claude çağırışı (`lib/ai-router.ts`, `app/api/kazan-ai/route.ts`) sorğuya `temperature` qoyurdu. Bu parametr Claude-un yeni nəsillərində (Opus 4.7+, Sonnet 5, Opus 5, Fable 5) API-dən silinib və göndərilsə sorğu **400** qaytarır — yəni `KAZAN_ANTHROPIC_MODEL` env-ini yeni modelə çevirmək (kod deploy-u olmadan) fallback yolunu sındırırdı. İndi `claudeAcceptsTemperature()` allowlist-i ilə yalnız qəbul edən modellərə göndərilir; tanınmayan model ID-də **göndərilmir** (fail-safe — göndərmək sorğunu sındırır, göndərməmək yalnız default dəyər deməkdir). Həmçinin SST pozuntusu bağlandı: `claude-sonnet-4-6` 3 yerdə hardcoded idi, indi `lib/ai-models.ts`-dəki `AI_MODELS.claude.fallback` + `resolveClaudeModel()`-dən oxunur (`generate-audit.mjs` daxil). Davranış dəyişmir — köhnə modeldə `temperature` əvvəlki kimi gedir. Sübut: saxta Anthropic endpoint-inə qarşı wire-level test, hər iki çağırış yolu, **10/10 PASS**.

### Fixed
- `TASK-0426` fix(nav): **«Alətlər» mega menyusu artıq ekrandan daşmır** — kök səbəb: panel `absolute left-1/2 -translate-x-1/2` ilə **trigger düyməsinin** mərkəzinə görə yerləşirdi, viewport-a görə yox; düymə header-in solunda olduğu üçün 880px-lik panelin sol kənarı mənfi X-ə düşürdü (1280px-də ≈ −200px). Panel `MegaMenuPanel` komponentinə çıxarıldı, üfüqi mövqe `useLayoutEffect`-də ölçülür və 16px gutter ilə viewport daxilinə clamp olunur (`resize` ilə yenilənir); alçaq ekranlar üçün `max-h-[calc(100vh-8rem)] overflow-y-auto`. PROTECTED `Header.tsx`-ə toxunulmadı. Playwright sübut: 1024/1280/1440/1920 → 4/4 PASS (`panel.x ≥ 0`, `scrollWidth == clientWidth`). Build ✓, lint ✓.

### Session xülasəsi — 2026-07-16/17 (onboarding + blog/news + üzv görünmə sprinti)

Canlı sayt baxışı əsasında ardıcıl 7 fix (TASK-0419 → 0425), hamısı ayrıca PR + CI (quality-gates) yaşıl + merge. Kök səbəblər sübutla tapıldı (təxminlə deyil):

- **Onboarding dead-end (0419):** prioritet seçib «Yadda saxla» → modal bağlanırdı, heç nə. İndi modal daxilində Step 2 nəticə ekranı (recap chip + ≤3 alət kartı + gap üçün «Tezliklə»+xəbər ver + dashboard CTA). Gizli canlı bug: `PRIORITY_TOOL_MAP`-də 5 route-suz slug 404 verirdi → təmizləndi; işləyən Şikayət Analizi aləti `getToolRoute()` resolver-i ilə (PROTECTED config toxunulmadan) bərpa; `RecommendationWidget` + nudge linkləri düzəldi.
- **Onboarding mobil polish (0420):** sticky CTA, ≥44px tap-target, WCAG kontrast; zərərli «seçiləni yuxarı sırala» qəsdən EDİLMƏDİ.
- **Üzv görünmə (0421):** admin panel `member_profiles`-dən oxuyur, amma register yalnız `users`-ə yazırdı → 7 üzvdən 6-sı görünmürdü. Register+confirm indi `member_profiles` yaradır/sinxronlaşdırır; mövcudlar üçün birdəfəlik Neon backfill (canlıda işlədildi, 7/7 göründü).
- **Blog crash — bütün bloglar (0422):** hər blog detayı «Xəta baş verdi» ilə çökürdü. Kök səbəb: `slug_redirects` cədvəli prod-da yox idi (migration 0016 işlədilməyib) və `getSlugRedirect` try/catch-siz idi → hər detay dərhal throw. Kod müdafiəli edildi (ads-repo «never throw» pattern-i) + cədvəl Neon-da yaradıldı → bloglar açıldı.
- **Blog mobil overflow (0423):** məqalələr mobil-də sağa daşırdı (`body overflow-x-hidden` iOS Safari-də sızır). `.blog-content`-ə `overflow-wrap/word-break` + `p`/`a` render-lərinə `break-words`.
- **Blog/news UX (0424):** mobil menyuya üst-səviyyə Blog linki; **%40 paywall söndürüldü** (`PAYWALL_ENABLED=false` — news bütün xəbərləri gate edirdi, indi hamı tam oxuyur); MansetVitrin `N/total` sayğacı mobil-də sarınmır.
- **Homepage real xəbər (0425):** «Sektordan ən son yeniliklər» hardcoded saxta `NEWS_ITEMS` əvəzinə `GET /api/news`-dən real xəbər çəkir, hər kart `/haberler/<slug>`-a linkləyir.
- **Deploy diaqnozu:** deploy build fail (bir müddət) — sübutla **kod deyil** (GHA `ci.yml` bütün commit-ləri, hətta kodsuz STATE-snapshot-ı build edir; `ignoreBuildErrors=true`). Platforma infra (OOM/keçici) idi; retry ilə deploy **Tamamlandı**. Hamısı canlıya çıxdı.

### Fixed
- `TASK-0425` fix(home): **"Sektordan ən son yeniliklər" real xəbər göstərir** — `NewsPreview` hardcoded saxta `NEWS_ITEMS` əvəzinə `GET /api/news`-dən real approved xəbər çəkir və hər kartı öz məqaləsinə (`/haberler/<slug>`) linkləyir. Dizayn/copy/newsletter dəyişmir, yalnız data mənbəyi + linklər. Şəkil yoxdursa DK gradient fallback. tsc 0 error.
- `TASK-0424` fix(ui): **blog/news UX (mobil menyu + paywall + carousel)** — (A) mobil hamburger menyuya üst-səviyyə Blog linki (Header.tsx); (C) %40 paywall söndürüldü — `BlogContentWrapper` `PAYWALL_ENABLED=false`, blog+news tam oxunur (news bütün xəbərləri gate edirdi), CTA-lar qalır; (Extra) MansetVitrin `N / total` sayğacı mobil-də `whitespace-nowrap`, nöqtələr `sm`-də. Minimal 13 sətir diff, tsc 0 error. (B — homepage NewsPreview saxta NEWS_ITEMS — ayrı, owner təsdiqi gözləyir.)
- `TASK-0423` fix(blog): **mobil horizontal overflow** — blog məqalələri mobil ekranda sağa daşırdı. `.blog-content`-ə `overflow-wrap: anywhere; word-break: break-word;` + MarkdownRenderer `p`/`a` render-lərinə `break-words`. Uzun URL/söz artıq sarınır (əvvəl `body overflow-x-hidden` maskalayırdı, iOS Safari-də sızırdı). Overflow-audit agenti ilə diaqnoz. 4 sətirlik minimal diff.
- `TASK-0422` fix(blog): **bütün blog detay səhifələri "xəta baş verdi" ilə çökürdü** — kök səbəb: `getSlugRedirect` (`slug_redirects`, migration 0016) və `getBlogPostDetail`-in `guru_boxes` sorğusu try/catch-siz idi; cədvəl prod-da yoxdursa (migration işlədilməyib) hər blog detayı DƏRHAL çökür (list işləyir). İkisi də try/catch ilə sarındı (ads repo "must NEVER throw" pattern-i) → cədvəl əskik olsa belə səhifə açılır. Operator prod-da migration 0015/0016 işlətməlidir (kod çökməni dayandırır, migration funksiyanı bərpa edir). tsc 0 error.
- `TASK-0421` fix(auth): **qeydiyyatlı üzvlər admin paneldə görünmürdü** — kök səbəb: admin siyahısı `member_profiles`-dən oxuyur, amma `/api/auth/register` yalnız `users`-ə yazırdı. İndi register `member_profiles` sətri də yaradır (`onConflictDoNothing`, try/catch — qeydiyyatı bloklamır), confirm isə təsdiqdə `member_profiles.email_verified`-i sinxronlaşdırır. Canlıda 7 üzvdən 6-sı görünmürdü. Mövcudlar üçün birdəfəlik Neon backfill SQL (task card-da). schema toxunulmadı. tsc 0 error.
- `TASK-0420` fix(onboarding): **modal mobil polish (P1)** — OnboardingModal-a responsive padding (`p-5 sm:p-8`), tap-target ≥44px (`min-h-11` skip/save/notify/dashboard), kontrast (skip `slate-500→600`, hint `slate-400→500` WCAG). Yalnız className dəyişikliyi — struktur/dizayn/logika toxunulmadı. "Seçiləni yuxarı sırala" qəsdən EDİLMƏDİ (barmaq altında kart tullanması anti-pattern). tsc 0 error.
- `TASK-0419` fix(onboarding): **dead-end + sınıq alət linkləri (P0)** — prioritet seçimindən sonra modal sadəcə bağlanırdı; indi Step 2 personalized nəticə ekranı açılır (recap chip-lər, ≤3 alət kartı, gap üçün «Tezliklə»+xəbər ver kartı, dashboard CTA). Daha dərin canlı bug: `PRIORITY_TOOL_MAP` 5 route-suz slug-a link verirdi (404) — təmizləndi; işləyən Şikayət Analizi aləti `getToolRoute()` resolver-i ilə (PROTECTED config toxunulmadan) `sikayat-analizi` route-una bərpa edildi. `RecommendationWidget` + `try_first_tool` nudge linkləri də düzəldi. Mobil: flex-col `max-h-[90vh]` sticky footer. 4 dil `onboarding.result.*`. encoding+protected verify PASS; build/lint sandbox-da xlsx CDN egress blokuna görə CI/Hostinger-ə ötürüldü.
- `TASK-0413` fix(toolkit): **WCAG kontrast sweep** — açıq zəmində oxunması çətin `text-slate-400/300` etiketlər `text-slate-600`-a qaldırıldı (19 fayl + shared `LikertScale`: ulduz slate-300→400, badge slate-400→500). 2 builder agent hər occurrence-ın bg-bağlamını doğruladı; koyu panel/ikon/slate-500+ toxunulmadı. 88 satır saf contrast swap, build ✓.
- `TASK-0412` fix(toolkit): **locale minlik ayraç — 4 alət** (delivery-calc, menu-matrix, yemek-xerci `money()` helperi, menyu-analitigi). 3 review agent denetimi ilə tapılan böyük-rəqəm ayraç boşluqları + finite guard.
- `TASK-0411` fix(finance): **basabas rəqəm formatı + EBITDA band + runway** — bütün manat dəyərləri locale-aware ayraçla (`fmt0`), EBITDA yaşıl band max 30→1000 (%49 marj artıq yaşıl), `runwayMonths` mənfi göstərmir.

### Added
- `TASK-0410` feat(sektor): **generateStaticParams for dynamic [slug] route** — Next.js build zamanı 4 sektor slug-ını (qonaq-evi, otel, restoran, kafe) statik olaraq pre-render edir.

### Fixed
- `TASK-0408` fix(ui): **HeroMotif build fix** — `glyphs.ts`-dən `GLYPHS` export eksik idi, `motifEngine.ts` import edirdi amma `glyphs.ts`-də 5×5 dot-matrix pattern tanımlı deyildi → build FAIL. Spark (diamond) + sprig (branch) glyph pattern-ləri əlavə edildi.

### Added
- `TASK-0408` feat(ui): **HeroMotif reusable animated canvas component** — 3 preset (brand/kazan/editorial), palette + cluster + glyph sistemi, IntersectionObserver + visibility pause, reduced-motion dəstəyi, dev preview route.
- `TASK-0319` fix(news): **Xəbər detay + listing UX sprint 1** — (1) Summary-dəki raw markdown (`### Nə baş verdi`) strip olundu, (2) DeepSeek sentez prompt-u yeniləndi — heading əvəzinə axıcı abzaslar, (3) Əlaqəli xəbərlər sidebar-ı `translated` + `approved` qəbul edir (daha dolu sidebar), (4) MansetVitrin slider hər səhifədə göstərilir (`getVitrinNewsArticles` ayrı sorğu).
- `TASK-0318` fix(news): **Xəbər detay UX** — Əlaqəli xəbərlər 1→5 (əvvəl eyni kateqoriya, sonra digərlər ilə doldur), oxuma müddəti badge, sidebar kartlarına resim + hover efekti.
- `TASK-0317` feat(ads): **bloq-sidebar slotu** — bloq detay səhifəsinin sticky sidebar-ına `<AdSlot placement="blog-sidebar" />`. Slot əhatəsi tamamlandı (news + blog). Aktiv reklam yoxdursa sidebar dəyişmir.
- `TASK-0316` feat(ads): **banner reklam sistemi PR-2 — public AdSlot + tracking**. `<AdSlot placement>` server komponenti (aktiv reklam yoxdursa `null`, DB-side `random()` rotasiya) + `<AdView>` client (image/gif/video render, mount-da göstərim beacon, klik-tracking link, "Reklam" açıqlama nişanı). Tracking API: `POST /api/ads/[id]/impression` (204) + `GET /api/ads/[id]/click` (302 + open-redirect qoruması). Repository read/increment-lər try/catch ilə müdafiəli — cədvəl yoxdursa belə public səhifə sınmır. İlk slot: xəbər detay sidebar (`news-sidebar`). CSP toxunulmadı (html5/lottie PR-3).
- `TASK-0315` feat(ads): **banner reklam sistemi PR-1 — DB cədvəli + admin CRUD**. Yeni `ads` cədvəli (format image|gif|video, placement, cədvəl tarixləri, göstərim/klik sayğacları, isActive), idempotent migration `drizzle/0019_add_ads.sql` (**Neon-da Doğan işlədir**), `adsRepository.ts` (CRUD + placement-əsaslı aktiv sorğu + sayğac artımı), admin-gated Zod API (`/api/admin/ads` + `[id]`), admin səhifəsi `/dashboard/reklamlar` + sidebar nav (Megaphone, 4 dil). Mövcud `AdsPreview` reklam deyil — elanlar lövhəsidir; bu sıfırdan banner sistemidir. CSP-yə toxunulmadı (html5/lottie PR-3). Public AdSlot + tracking = PR-2.
- `TASK-0314` feat(seo): **brendli default OG şəkli** (`app/opengraph-image.tsx`) — homepage və cover-siz səhifələr üçün 1200×630 brendli sosial paylaşım şəkli (gradient #1A1A2E→#E94560 + DK loqo + tagline). File-based opengraph-image avtomatik og:image + twitter:image doldurur; məqalə öz şəkli varsa onu üstələyir. Konkret hex rənglər (Satori CSS dəyişənlərini resolv etmir — mövcud `app/xeberler/opengraph-image.tsx` `var(--dk-*)` işlədir, render olmur; burada qaçınıldı). TASK-0313 follow-up.
- `TASK-0313` feat(seo): **sayt-geneli Open Graph + Twitter Card** — root `app/layout.tsx`-ə OG (website, siteName, locale, url) + Twitter (`summary_large_image`) əlavə olundu; homepage client component olduğu üçün metadata layout-da olmalıdır. Blog + news detay səhifələrinə mövcud openGraph-ı əks etdirən `twitter` bloku (şəkil cover/imageUrl-dan). Əvvəl sosial paylaşımda preview yox idi. (TASK-0300 audit.) Follow-up: cover-siz məqalələr üçün brendli default OG şəkli.

### Fixed
- `TASK-0312` fix(news): **RSS feed real xəbər yayımlayır** — `/api/rss/haberler` artıq `getAllBlogArticles()` (blog mock) əvəzinə `getApprovedNewsArticles()` çağırır. Əvvəl "DK Agency Xəbərlər" başlıqlı feed blog mock verir, `/haberler/<blog-slug>` linkləri 404 olurdu. GET indi async + `dynamic='force-dynamic'`. (TASK-0300 audit tapıntısı.)

### Security
- `TASK-0308` fix(email): **HTML injection kapatıldı** — 5 email template-də `leadName`, `ownerName`, `title`, `reason`, `message`, `phone`, `businessType`, `intent` dəyərləri `escapeEmailHtml()` ilə escape olunur. 14 sessiz `.catch(() => {})` → `console.error` ilə əvəz olundu.

### Added
- `TASK-0404` feat(news): **Manşet vitrini** — /haberler səhifəsində 8 xəbərli auto-advance slider (6 san). Resim solda (yazı üstünə binmir) + məzmun sağda. Ok + nöqtə naviqasiyası. Reklam slotu.
- `TASK-0403` feat(infra): **News pipeline GitHub Actions cron** — günde 2× (06:00+14:00 UTC) NewsData.io fetch + DeepSeek sentez. Failure → CTO-ya SMTP alert. Hostinger'a sıfır dokunuş.
- `TASK-0402` feat(news): **DeepSeek Model-B sentez** — fetched siqnaldan orijinal DK HoReCa analizi yaradır (5-blok: nə baş verdi / niyə önəmli / AZ dərsi / risk / DK baxışı). Forbidden terms guard, unpublishable flag. `npm run news:synthesize`. TASK-0254 bağlandı.
- `TASK-0401` feat(news): **NewsData.io keşif + scoring + draft insert** — `npm run news:fetch` ilə HoReCa/franchise/turizm xəbərləri çəkilir, keyword+source əsasında skorlanır (eşik ≥4), URL hash ilə dedup olunur, `origin='newsdata'` draft kimi DB-yə yazılır. Migration: `drizzle/0018_add_news_origin_columns.sql`.
- `TASK-0307` feat(listings): **Admin elan yaratma** — `/dashboard/ilanlar/yarat` route, "Yeni elan yarat" düyməsi, admin avantajları (birbaşa status seçimi, isFeatured/isShowcase toggle, daxili admin qeydi), YouTube/Instagram video embed (link-based), toplu foto silmə (checkbox seçimi). Migration yox, mövcud motora toxunulmadı.
- `TASK-0308` feat(email): **email_logs cədvəli** — hər `sendEmail()` çağırışı `email_logs`-a yazılır (sent/failed + messageId + errorMessage). Migration: `drizzle/0017_add_email_logs.sql`.
- `TASK-0308` feat(newsletter): **Footer newsletter formu** — ana səhifə footer-ında email abunə formu `POST /api/newsletter/subscribe` endpointinə bağlandı (`source: homepage_newsletter`).

### Fixed
- `TASK-0306` fix(listings): **Public `/ilanlar` mock fallback kaldırıldı** — DB əlçatmaz olanda uydurma 10 elan yerinə təmiz boş vəziyyət göstərilir. Dashboard admin mock fallback saxlandı.

### Fixed (prior)
- `TASK-0262` fix(brand): **"İstanbul HORECA Group" → "DK Agency"** (6 yer, kökündən). B2B portal welcome subtitle 4 dildə (`messages/{az,ru,en,tr}.json:69`), homepage `B2BDashboardMock` (ad + "IH" inisialları → "DK"), `app/dashboard/b2b-yonetimi` mock partner adı. Əvvəl təkrar qayıdırdı çünki 6 nüsxədən yalnız bəzisi silinirdi — `grep -rni "HORECA Group"` indi **0 nəticə**.
- `TASK-0261` fix(blog): **struktur migration parser düzəldildi (apply-dan əvvəl)**. Dry-run çıxışını yoxlayanda 3 real parse buqu tapıldı: (1) düz-dırnaqlı byline/rol sətri (`"The Restaurant Coach", …danışmanı`) guru sitatına qarışırdı; (2) çoxsətirli italic sitatın davam sətirləri itirdi (yalnız ilk `*"` sətri tutulurdu); (3) ASCII guru-box formatında yazılmış Doğan notu (`DOĞAN NOTU`) saxta guru kimi `guru_boxes`-a gedirdi (garson-satis, cografi-isare). `parseGuruBlock` indi italic sitat blokunu bütün davam sətirləri ilə tutur, byline-ı görməzdən gəlir, `isDogan` qaytarır; migration `isDogan` bloklarını `dogan_note`-a yönləndirir. Data korlanmasının qarşısı — apply-dan əvvəl dry-run yenidən yoxlanmalıdır.
- `TASK-0260` feat(blog): **struktur migration node CLI → admin endpoint**. `scripts/migrate-blog-structure.mjs` silindi; məntiq `migrateBlogStructure(apply)` (Drizzle) kimi repo-ya köçdü. `POST /api/blog/migrate-structure?dryRun=true|apply=true` (admin-gated, default dry-run). Status səhifəsində **[Öncəbaxış (dry-run)]** + **[Tətbiq et (apply)]** düymələri: dry-run hər blogun tapılan guru adı + sitat preview-i + Doğan preview-i göstərir (yazmadan), apply confirm tələb edir. Doğan node işlətmir — admin-də basır, server işlədir.
- `TASK-0259` feat(blog): **dual content model birləşdirildi + toplu tərcümə + canlı status ekranı**. (1) **Toplu tərcümə** — `POST /api/blog/translate/all` (admin-gated) bütün blogları echo-guard-lı `autoTranslateBlogPost` ilə bir job-da yenidən tərcümə edir (boş VƏ YA hələ AZ qalan sahələr; düzgün tərcüməyə toxunmur). `getAllBlogPostIds()` helper əlavə olundu. Per-blog klikləmə + SQL lazım deyil. (2) **Canlı status ekranı** — `/dashboard/blog/translation-status`: hər blog × 3 dil × 5 sahə (başlıq/xülasə/mətn/Doğan/guru) **yaşıl** (tərcümə var) / **sarı** (hələ AZ) / **qırmızı** (boş) — DB-dən canlı hesablanır (saxlanan flaq yox ki, yalan deməsin). "Hamısını tərcümə et" düyməsi + dashboard blog səhifəsindən link. Doğan SQL işlətmir — baxır, görür. (3) **Migration script** `scripts/migrate-blog-structure.mjs` — köhnə blogların markdown-embedded guru (╔═╗) + Doğan notunu strukturlu DB sahələrinə (`guru_boxes` + `dogan_note`) köçürür və markdown-dan təmizləyir (dual render qarşısı). DRY-RUN default, idempotent, `--apply` ilə yazır. ⚠️ Callout-lar (### başlıqlar) ayrı məsələdir (renderer marker fix) — bu migration guru+Doğan entity-lərini birləşdirir.
- `TASK-0258` fix(blog/translate): **başlıq echo kökü + related articles locale-aware**. (1) **Echo guard** — `lib/ai/translate.ts` DeepSeek-in qaytardığı mətni İNDİ yoxlayır: `looksUntranslated()` çıxışda `ə` (yalnız AZ-da var) tapsa, ya da `ru` üçün heç Kiril olmasa → cəhdi FAIL sayır, retry edir, tükənsə `null` qaytarır (AZ-ı bir daha "tərcümə" kimi YAZMIR). Kök səbəb: prompt DeepSeek-ə "ə varsa yenidən et" deyirdi, amma **kod heç vaxt yoxlamırdı** — qısa, brend-ağır başlıq ("Franchise Bədəlləri…") echo olub AZ kimi saxlanırdı. Brend adları yoxlamadan əvvəl çıxarılır (Latın brend ru/Kiril yoxlamasını çaşdırmasın). (2) **`needsTranslation` tr** — `ə` yoxlaması artıq `tr` daxil bütün hədəflərə şamildir (əvvəl yalnız ru/en); `title_tr` AZ qalsa yenidən tərcümə üçün flaglanır. (3) **Related articles locale-aware** — `app/[locale]/blog/[slug]` related yazıları statik AZ fayldan (`getRelatedArticles`, həmişə AZ + slug uyğunsuzluğu) yox, yeni `getRelatedBlogPosts(slug, category, locale)` ilə **DB-dən, locale-a uyğun** çəkir (eyni kateqoriya öncəlik, çatmazsa son yazılar). (4) `translate.ts` chunked `console.log` silindi (production qaydası). ⚠️ DB-də qalan köhnə pozuq başlıqlar üçün **kontrollü təkrar tərcümə** prod-da əl ilə tetiklenməli (bu commit echo-nu gələcəkdə kökündən bağlayır, mövcud DB dəyərlərini overwrite etmir).
- `TASK-0252` perf: **Hostinger bellek optimizasyonu** — `next.config.ts`-ə `webpackMemoryOptimizations: true` (build RAM ~%30 düşer), `preloadEntriesOnStart: false` (idle RAM düşer), `productionBrowserSourceMaps: false` (browser source map silindi). 503 OOM riskini azaldır.
- `TASK-0251` fix(blog): **guru kutusu başlığı locale-aware** — "MİCHAEL H. SEİD YANAŞMASI" hər locale-da AZ qalırdı (guruName tek sütun). Schema-ya `guru_name_ru/en/tr` əlavə olundu (migration 0015), `mapDbArticle` locale-a uyğun guru adı qaytarır, `autoTranslateBlogPost` guru adını da tərcümə edir.
- `TASK-0250` fix(blog): **blog detay səhifəsi tam i18n** — 11 hardcoded AZ string `getTranslations('blogDetail')` ilə əvəz olundu (Bloga qayıt, dəq oxu, Xülasə, Əlaqəli yazılar, Pulsuz Toolkit, Alətlərə bax, 404 metadata, breadcrumb). Tarix formatı sabit `az-AZ` → dinamik locale map (`ru-RU`/`en-US`/`tr-TR`). 3 locale-suz link (`/blog`, `/toolkit`, related articles) `withLocale()` ilə prefix aldı. Kateqoriya (8) və stage (3) etiketləri 4 dilə çevrildi. **5 component i18n-ləşdi:** BlogActionBar (share/save/unsave/linkCopied label-ləri prop ilə), DoganNote (variantLabel prop), GuruQuoteBox (sourceLabel/contextLabel prop), LegalDisclaimer (title/text prop). BlogActionBar-dan `console.log` silindi (production qaydası). Header navbar-da Rusça sıxışma düzəldildi: nav item padding `px-3` → `px-2 xl:px-3`, gap `gap-1` → `gap-0.5 xl:gap-1`, "Elan ver" butonu `lg:inline-flex xl:px-5`. 4 dil faylına `blogDetail` namespace əlavə olundu (30+ key).

### Fixed (prior)
- `TASK-0249` fix(blog): **başlıq RU/EN/TR tərcüməsi düzəldildi (self-healing)** — admin RU səhifəsində məzmun tərcümə olunurdu, amma başlıq AZ-də qalırdı. Kök səbəb: `title_ru` sütununda AZ mətni "çirklənmişdi" (tərcümə olunmamış kopya), `autoTranslateBlogPost` isə yalnız **boş** sahələri tərcümə edirdi → dolu (amma AZ) sahəni atlayırdı. İndi `needsTranslation()` köməkçisi sahəni **boş OLANDA və ya AZ mənbə ilə eyni olanda** yenidən tərcümə edir (title/summary/content/doğan notu/guru sitatı hamısına şamil). Növbəti "Avtomatik tərcümə" pozuq başlığı avtomatik Rus/EN/TR-ə çevirər. Həqiqi əl ilə tərcümələr (AZ-dən fərqli) toxunulmur.
- `TASK-0248` fix(blog): **Doğan Notu + Guru sitatları auto-translate-ə bağlandı** — `autoTranslateBlogPost` yalnız `title/summary/content` tərcümə edirdi, ona görə RU/EN/TR səhifələrində doğan notu və guru sitatları AZ-də qalırdı (və ya boş). (1) `doganNote` schema-da **tək AZ sütun** idi (tərcümə saxlamağa yer yox) → migration `0014` ilə `dogan_note_ru/en/tr` əlavə olundu, `mapDbArticle` indi locale-aware doğan notu qaytarır. (2) Tərcümə loopu indi həm `doganNote`-u (`dogan_note_<lang>`), həm də hər guru qutusunun sitatını (`quote_az → quote_<lang>`, mövcud sütunlar) tərcümə edir. Editor-dakı "Avtomatik tərcümə (RU/EN/TR)" düyməsi avtomatik bunları da əhatə edir — ayrıca guru tərcümə düyməsi lazım deyil. (3) Tərcümə promptu sərtləşdirildi: mənbə strukturunu 1:1 güzgüləməli, **nömrələmə/başlıq əlavə/silmə qadağan** (RU-da nömrə çıxıb AZ-də olmaması artefaktının kökü). ⚠️ **Migration `drizzle/0014` Neon-da əl ilə icra olunmalıdır** (idempotent, `IF NOT EXISTS`).
- `TASK-0247` fix(b2b): B2B sidebar **profil doluluğu (78%) + PREMIUM rozeti dinamikləşdirildi** — ikisi də sabit idi. (1) `GET /api/user/profile` indi `profileCompletion` qaytarır (16 əsas sahənin dolu nisbəti, tək həqiqət mənbəyi) → sidebar çubuğu real faizi göstərir (yüklənənə qədər `—`). (2) Plan rozeti `GET /api/member/session`-dakı `plan`-a bağlandı: `member`/`admin` → PREMIUM (qızıl), `free` → "Pulsuz" (boz). 4 dildə `freePlan` açarı əlavə olundu. Qeyd: daha incə tier-lər üçün `member_subscriptions` gələcəkdə bağlana bilər — hazırkı session modeli admin/member/free verir.
- `TASK-0246` fix(b2b): B2B ana səhifə (`/b2b-panel`) **mock → real DB**. (1) `MY_LISTINGS` sabit massiv (Kadıköy/₺ türk qalıqları) silindi → `GET /api/listings?scope=owner` ilə üzvün öz elanları çəkilir (loading + honest empty state, hər elan `/b2b-panel/ilanlarim/[id]`-ə bağlı). (2) Stat kartları real sayılır: **Aktiv Elanlar** (`showcase_ready`), **Ümumi Baxış** (viewCount cəmi), **Mesajlar** (leads cəmi); **Gələn Təkliflər** backend yoxdur → honest `0`. Uydurma trend sparkline + "Son 7 gün" + dəyişiklik faizi (`change`) silindi (zaman seriyası datası yoxdur). (3) "Son Təkliflər" paneli 3 uydurma kart (`offerItems`/`offerTimes`) → honest boş state (`noOffers`). `viewCount` `mapDbListing`-ə əlavə olundu (additive, MockListing tipi opsional). 4 dildə `noOffers`+`noListings` açarları əlavə olundu.
- `TASK-0245` fix(dashboard): admin sidebar-dan **üzv aləti `toolkit`** çıxarıldı — foodCost presedenti ilə eyni (üzv versiyası `/b2b-panel/toolkit`-də var). Audit "hər ikisini çıxar" deyirdi, amma araşdırma göstərdi ki, `marketinq-ocagi` üzv aləti deyil, **kanonik hub-dır**: 11 public `/marketinq/*` aləti + `b2b-panel/analizler` geri düyməsi ilə ona bağlanır — ona görə qaldı. İstifadə olunmayan `Wrench` import-u da silindi. Route-lar toxunulmadı (yalnız nav).
- `TASK-0244` fix(i18n): qadağan söz **"Tezliklə" → "Yaxında"** layihə boyu təmizləndi. Audit TASK-0240/PR#330-un bunu bitirdiyini iddia edirdi, amma kodda **9 canlı hit** qalmışdı (hətta guya düzəldilmiş `messages/az.json:52` daxil): `b2b-panel/{bildirimler,teklifler,destek}`, `qiymet`, `uzvluk`, `dashboard/marketinq-ocagi` (page + [slug]), `az.json` (`coming_soon` + `plannedToolsLabel`). Hamısı "Yaxında" oldu. `persona-ai-generator.ts` və `SikayetResult.tsx`-dəki *"Tezlik"* (=frequency, fərqli söz) toxunulmadı.
- `TASK-0243` fix(blog): blog editor şəkilləri **nəhayət saxlanır** — yüklənən şəkillər public səhifədə görünmürdü. Kök səbəb: `BlogEditorForm.handleImage` Cloudinary-ə **heç vaxt yükləmirdi** — `compressImage` `URL.createObjectURL()` qaytarır (`blob:` URL), o yalnız brauzer tab-ının yaddaşında yaşayır, amma həmin `blob:` sətri `featuredImage` kimi DB-yə yazılırdı və reload-da ölürdü; `resolveLocalCover` isə bunu `/blob:...`-a çevirib qırıq şəkil verirdi. İndi `handleImage` sıxılmış faylı mövcud `/api/upload` route-una (Cloudinary) POST edir və qaytarılan davamlı `https` URL-ni saxlayır (`blob:` preview yalnız anlıq UI üçün qalır). Əlavə qoruma: yükləmə zamanı save düymələri bloklanır, submit `blob:`/`data:` dəyərini heç vaxt persist etmir, `resolveLocalCover` köhnə `blob:`/`data:` dəyərlərini "yoxdur" sayır (legacy yazılar üçün). **Köhnə 2 yazı:** editor-da yenidən şəkil yükləyib saxla — indi düzgün işləyəcək.
- `TASK-0242` fix(blog): strukturlu **Doğan notu** + **Guru sitat qutuları** nəhayət public blog səhifəsinə bağlandı. Kök səbəb (Özbahçeci dərsi): editor `doganNote` və `guruBoxes` sahələrini field-by-field saxlayır, API DB-yə yazır (`guru_boxes` cədvəli + `dogan_note` sütunu), `mapDbArticle` qaytarır — amma `app/[locale]/blog/[slug]/page.tsx` yalnız `MarkdownRenderer` render edirdi, nə `article.doganNote`, nə `article.guruBoxes`. Köhnə yazılarda qutu markdown mətninə əl ilə yazıldığı üçün görünürdü; strukturlu sahələrlə yayınlanan yeni yazılarda qutular sakitcə yoxa çıxırdı. İndi markdown-dan sonra `GuruQuoteBox` (hər guru üçün) + `DoganNote` render olunur (root-mirror `/blog/[slug]` avtomatik miras alır, re-export). Markdown marker yolu toxunulmadı (additiv).
- `TASK-0241` fix(hooks): Stop gate indi handoff/changelog-u məcburi edir — kök səbəb tapıldı: (a) `pre-commit-gate.sh` yalnız `feat/*|fix/*|chore/*` branch-lərində işləyirdi, web session isə `claude/*`-də işləyir → qapı **tam keçilirdi**; (b) gate CHANGELOG/DEVLOG/HANDOFF-u **heç yoxlamırdı** (yalnız build/lint/i18n/auth/db). İkisi də düzəldildi: `claude/*` matcher-ə əlavə olundu və yeni **Check 6** gəldi — branch-range (`merge-base...HEAD`) + working tree-də `app|components|lib/*.{ts,tsx}` dəyişib amma `docs/(CHANGELOG|DEVLOG|HANDOFF).md` toxunulmayıbsa → BLOCK. (Qeyd: `dk-release` skill `disable-model-invocation:true` olduğu üçün avtomatik icra olunmurdu, `auto-journal` git hook-u isə web konteynerdə quraşdırılmırdı — enforcement Stop hook-a köçürüldü, çünki web-də həmişə işləyən yeganə nöqtə odur.)
- `TASK-0240` fix(i18n): qadağan söz "Tezliklə" `messages/az.json`-da hələ CANLI idi → "Yaxında" (2 string: `coming_soon`, `plannedToolsLabel`). TASK-0239 (#328) bu i18n hissəsini push etməzdən əvvəl squash-merge olunduğu üçün `/dashboard/marketinq-ocagi` render-də hələ "Tezliklə" göstərirdi. Real dev-server HTML yoxlaması ilə tutuldu (minted-JWT), "build keçdi" aldatmırdı.
- `TASK-0249` fix(blog): **başlıq RU/EN/TR tərcüməsi düzəldildi (self-healing)** — admin RU səhifəsində məzmun tərcümə olunurdu, amma başlıq AZ-də qalırdı. Kök səbəb: `title_ru` sütununda AZ mətni "çirklənmişdi" (tərcümə olunmamış kopya), `autoTranslateBlogPost` isə yalnız **boş** sahələri tərcümə edirdi → dolu (amma AZ) sahəni atlayırdı. İndi `needsTranslation()` köməkçisi sahəni **boş OLANDA və ya AZ mənbə ilə eyni olanda** yenidən tərcümə edir (title/summary/content/doğan notu/guru sitatı hamısına şamil). Növbəti "Avtomatik tərcümə" pozuq başlığı avtomatik Rus/EN/TR-ə çevirər. Həqiqi əl ilə tərcümələr (AZ-dən fərqli) toxunulmur.
- `TASK-0248` fix(blog): **Doğan Notu + Guru sitatları auto-translate-ə bağlandı** — `autoTranslateBlogPost` yalnız `title/summary/content` tərcümə edirdi, ona görə RU/EN/TR səhifələrində doğan notu və guru sitatları AZ-də qalırdı (və ya boş). (1) `doganNote` schema-da **tək AZ sütun** idi (tərcümə saxlamağa yer yox) → migration `0014` ilə `dogan_note_ru/en/tr` əlavə olundu, `mapDbArticle` indi locale-aware doğan notu qaytarır. (2) Tərcümə loopu indi həm `doganNote`-u (`dogan_note_<lang>`), həm də hər guru qutusunun sitatını (`quote_az → quote_<lang>`, mövcud sütunlar) tərcümə edir. Editor-dakı "Avtomatik tərcümə (RU/EN/TR)" düyməsi avtomatik bunları da əhatə edir — ayrıca guru tərcümə düyməsi lazım deyil. (3) Tərcümə promptu sərtləşdirildi: mənbə strukturunu 1:1 güzgüləməli, **nömrələmə/başlıq əlavə/silmə qadağan** (RU-da nömrə çıxıb AZ-də olmaması artefaktının kökü). ⚠️ **Migration `drizzle/0014` Neon-da əl ilə icra olunmalıdır** (idempotent, `IF NOT EXISTS`).
- `TASK-0247` fix(b2b): B2B sidebar **profil doluluğu (78%) + PREMIUM rozeti dinamikləşdirildi** — ikisi də sabit idi. (1) `GET /api/user/profile` indi `profileCompletion` qaytarır (16 əsas sahənin dolu nisbəti, tək həqiqət mənbəyi) → sidebar çubuğu real faizi göstərir (yüklənənə qədər `—`). (2) Plan rozeti `GET /api/member/session`-dakı `plan`-a bağlandı: `member`/`admin` → PREMIUM (qızıl), `free` → "Pulsuz" (boz). 4 dildə `freePlan` açarı əlavə olundu. Qeyd: daha incə tier-lər üçün `member_subscriptions` gələcəkdə bağlana bilər — hazırkı session modeli admin/member/free verir.
- `TASK-0246` fix(b2b): B2B ana səhifə (`/b2b-panel`) **mock → real DB**. (1) `MY_LISTINGS` sabit massiv (Kadıköy/₺ türk qalıqları) silindi → `GET /api/listings?scope=owner` ilə üzvün öz elanları çəkilir (loading + honest empty state, hər elan `/b2b-panel/ilanlarim/[id]`-ə bağlı). (2) Stat kartları real sayılır: **Aktiv Elanlar** (`showcase_ready`), **Ümumi Baxış** (viewCount cəmi), **Mesajlar** (leads cəmi); **Gələn Təkliflər** backend yoxdur → honest `0`. Uydurma trend sparkline + "Son 7 gün" + dəyişiklik faizi (`change`) silindi (zaman seriyası datası yoxdur). (3) "Son Təkliflər" paneli 3 uydurma kart (`offerItems`/`offerTimes`) → honest boş state (`noOffers`). `viewCount` `mapDbListing`-ə əlavə olundu (additive, MockListing tipi opsional). 4 dildə `noOffers`+`noListings` açarları əlavə olundu.
- `TASK-0245` fix(dashboard): admin sidebar-dan **üzv aləti `toolkit`** çıxarıldı — foodCost presedenti ilə eyni (üzv versiyası `/b2b-panel/toolkit`-də var). Audit "hər ikisini çıxar" deyirdi, amma araşdırma göstərdi ki, `marketinq-ocagi` üzv aləti deyil, **kanonik hub-dır**: 11 public `/marketinq/*` aləti + `b2b-panel/analizler` geri düyməsi ilə ona bağlanır — ona görə qaldı. İstifadə olunmayan `Wrench` import-u da silindi. Route-lar toxunulmadı (yalnız nav).
- `TASK-0244` fix(i18n): qadağan söz **"Tezliklə" → "Yaxında"** layihə boyu təmizləndi. Audit TASK-0240/PR#330-un bunu bitirdiyini iddia edirdi, amma kodda **9 canlı hit** qalmışdı (hətta guya düzəldilmiş `messages/az.json:52` daxil): `b2b-panel/{bildirimler,teklifler,destek}`, `qiymet`, `uzvluk`, `dashboard/marketinq-ocagi` (page + [slug]), `az.json` (`coming_soon` + `plannedToolsLabel`). Hamısı "Yaxında" oldu. `persona-ai-generator.ts` və `SikayetResult.tsx`-dəki *"Tezlik"* (=frequency, fərqli söz) toxunulmadı.
- `TASK-0243` fix(blog): blog editor şəkilləri **nəhayət saxlanır** — yüklənən şəkillər public səhifədə görünmürdü. Kök səbəb: `BlogEditorForm.handleImage` Cloudinary-ə **heç vaxt yükləmirdi** — `compressImage` `URL.createObjectURL()` qaytarır (`blob:` URL), o yalnız brauzer tab-ının yaddaşında yaşayır, amma həmin `blob:` sətri `featuredImage` kimi DB-yə yazılırdı və reload-da ölürdü; `resolveLocalCover` isə bunu `/blob:...`-a çevirib qırıq şəkil verirdi. İndi `handleImage` sıxılmış faylı mövcud `/api/upload` route-una (Cloudinary) POST edir və qaytarılan davamlı `https` URL-ni saxlayır (`blob:` preview yalnız anlıq UI üçün qalır). Əlavə qoruma: yükləmə zamanı save düymələri bloklanır, submit `blob:`/`data:` dəyərini heç vaxt persist etmir, `resolveLocalCover` köhnə `blob:`/`data:` dəyərlərini "yoxdur" sayır (legacy yazılar üçün). **Köhnə 2 yazı:** editor-da yenidən şəkil yükləyib saxla — indi düzgün işləyəcək.
- `TASK-0242` fix(blog): strukturlu **Doğan notu** + **Guru sitat qutuları** nəhayət public blog səhifəsinə bağlandı. Kök səbəb (Özbahçeci dərsi): editor `doganNote` və `guruBoxes` sahələrini field-by-field saxlayır, API DB-yə yazır (`guru_boxes` cədvəli + `dogan_note` sütunu), `mapDbArticle` qaytarır — amma `app/[locale]/blog/[slug]/page.tsx` yalnız `MarkdownRenderer` render edirdi, nə `article.doganNote`, nə `article.guruBoxes`. Köhnə yazılarda qutu markdown mətninə əl ilə yazıldığı üçün görünürdü; strukturlu sahələrlə yayınlanan yeni yazılarda qutular sakitcə yoxa çıxırdı. İndi markdown-dan sonra `GuruQuoteBox` (hər guru üçün) + `DoganNote` render olunur (root-mirror `/blog/[slug]` avtomatik miras alır, re-export). Markdown marker yolu toxunulmadı (additiv).
- `TASK-0241` fix(hooks): Stop gate indi handoff/changelog-u məcburi edir — kök səbəb tapıldı: (a) `pre-commit-gate.sh` yalnız `feat/*|fix/*|chore/*` branch-lərində işləyirdi, web session isə `claude/*`-də işləyir → qapı **tam keçilirdi**; (b) gate CHANGELOG/DEVLOG/HANDOFF-u **heç yoxlamırdı** (yalnız build/lint/i18n/auth/db). İkisi də düzəldildi: `claude/*` matcher-ə əlavə olundu və yeni **Check 6** gəldi — branch-range (`merge-base...HEAD`) + working tree-də `app|components|lib/*.{ts,tsx}` dəyişib amma `docs/(CHANGELOG|DEVLOG|HANDOFF).md` toxunulmayıbsa → BLOCK. (Qeyd: `dk-release` skill `disable-model-invocation:true` olduğu üçün avtomatik icra olunmurdu, `auto-journal` git hook-u isə web konteynerdə quraşdırılmırdı — enforcement Stop hook-a köçürüldü, çünki web-də həmişə işləyən yeganə nöqtə odur.)
- `TASK-0239` fix(portal): çalışmayan çıxış düymələri + b2b mock təmizliyi. (1) Çıxış (logout) həm admin həm b2b sidebar-da ölü düymə idi (`onClick` yox) → `/api/auth/logout` POST + `/auth/login` redirect. (2) `b2b-panel/mesajlar` 5 uydurma mesaj silindi → real boş state; "AI Hesabatları" sərt `2` → real sayım. (3) b2b sidebar mock badge-lər (`incomingOffers:3`, `messages:5`) silindi. (4) Food Cost admin sidebar-dan çıxdı — üzv alətidir, B2B portalda qalır.
- `TASK-0236` fix(dashboard): dashboard home **premium LIGHT 2026** redesign — TASK-0235 dashboard-u dark Midnight Navy (`bg-[#0e0f22]`) etmişdi, bu layihənin "Light theme only / Premium light for dashboard" qaydasını pozurdu və yalnız 1 səhifəyə tətbiq olunduğundan qalan light alt-səhifələrlə uyumsuz idi. AQTA admin referansı ilə premium light-a qaytarıldı (brand tokens, qızıl aksent xətti, yumşaq kölgə, incə hover lift). Sidebar: "DK" mətn qutusu → həqiqi logo (`/images/logo-mobil.png`); təkrar "Doğan Tomris USTA" identity kartı silindi. `dk-glass-card`/`dk-hover-glow` (login işlədir) toxunulmadı; 503 dərsi — heavy blur yoxdur.
### Changed
- `TASK-0238` chore(skills): `dk-content-engine` skill ARES ruhunda zənginləşdirildi — məcburi iş sırası (yaddaş → scout → təklif → taslaq → keyfiyyət/hüquq qapısı → handoff), yaddaş faylı `DK-ICERIK-DURUM` (kanonik blog siyahısı, drift önləyici), keyfiyyət/hüquq checklist (fact-check, Fəsil 11 iftira, telif <15 söz, AQTA SST, drift-safe slug), marka səsi (Əxilik, stage/kateqoriya, tək-AZ master + auto-translate, qadağan terimlər), DK şablonu detalları, repurpose, təqvim balansı, ton. Yalnız skill markdown — runtime təsiri yox; mövcud infra-ya istinad edir (`dk-blog-publish`, TASK-0225 auto-translate, TASK-0215/0217 AI SEO).

### Added
- `TASK-0228` feat(skills): `dk-content-engine` skill — human-in-the-loop content pipeline (scout → propose → draft → approve → publish). Builds on `dk-blog-publish` + auto-translate (TASK-0225) + AI SEO (TASK-0215/0217). Seeds the franchise topic backlog (Economist "AI-proof" angle, Para fee categories — 8 posts), scout source list, DK draft template (FAQ for AEO), multi-channel repurposing, and HALT rules (no auto-publish; legal/AQTA review). Never auto-publishes.
- TASK-0227 feat(kazan): KAZAN Leads CRM — notes timeline, lead scoring (computeLeadScore), and next-contact reminder. PATCH /api/kazan-ai/leads accepts addNote/leadScore/nextContactAt; lead actions show score + reminder badges + notes panel. Uses migration 0008 columns (notes/lead_score/next_contact_at). i18n 4 langs.

### Added
- `TASK-0226` feat(invoices): **Fatura B2B + September launch campaign (PR-4)**. OCR invoice module opened to members at `/b2b-panel/faturalar` (+ `/[locale]` L-038 mirror); data is session-scoped via `/api/invoices` (SEC-P0 #318). `LaunchCampaignBanner`: free until 2026-09-01, ≤30-day countdown warning, then grace notice (old invoices + CSV/PDF export always open; only new upload/OCR/AI become premium — no data hostage). B2B sidebar "Faturalar" entry (4 langs). Post-Sept upload-gating enforcement is a follow-up (free period active now).

### Fixed
- `TASK-0224` (LAUNCH-P0) fix: hide mock/half-finished admin surfaces + remove fake stats before launch. Homepage `StatsBarSection` hidden (was "6.7M impressions"/"99.9%" vanity numbers); admin sidebar no longer shows `auditor`/`faturalar`/`site` (mock data / no-op save); `/dashboard/site` save buttons disabled (previously faked a "saved" toast); b2b panel KPI stats show 0/"—" instead of fabricated 4/2847/8/15.
### Security
- `TASK-0223` (SEC-P0) fix(invoices): `/api/invoices` was a P0 IDOR — it trusted a `userId` from the request and had no auth, so anyone could read any user's invoices and **delete ANY invoice by id**. Now GET/POST/DELETE require a logged-in session, the userId is derived from the session (request userId ignored), and `bulkDeleteInvoices` is ownership-scoped. Verified: all endpoints → 401 without session.

### Added
- `TASK-0225` feat(blog): auto-translate AZ → ru/en/tr on publish. New `lib/ai/translate.ts` (server-side DeepSeek, timeout, brand guard) + `autoTranslateBlogPost` fills only empty locale fields; `POST /api/blog` fires it fire-and-forget on publish (Hostinger long-running, no serverless timeout). New blog no longer stays AZ-only.

### Added
- `TASK-0220` feat(leads): WhatsApp/Telegram contact clicks now send admin email notification to `info@dkagency.com.tr`. New `/dashboard/franchise-leads` panel (filter by toolSource, summary cards, full lead table). New `/dashboard/contact-tracking` panel (WhatsApp/Telegram/KAZAN click tracking, last 100 entries, channel filter).
- `TASK-0219` feat(franchise-radar): Franchise Radar added to navbar as first item in Franchise dropdown. 7-Eleven (convenience sector, master_license, 84K+ units) and Arby's (QSR, Inspire Brands, already in Turkey) added to catalog — now 10 brands. New `convenience` sector type with 4-lang i18n.
- `TASK-0218` content(blog): blog-29 "Orada Bir Starbucks Var Uzaqda" (Starbucks/Burger King marka qeydiyyatı) added to static config + DB sync (id=149, published, paywall=true, stage=Böyüt, category=marketinq).
- `TASK-0218` content(blog): FAQ section for blog-29 (trademark article) via an idempotent DB script `scripts/blog-29-faq.mjs` — adds `## Suallar və cavablar` (5 Q&A) so the post earns an FAQPage (AEO, TASK-0217). DB-first (L-037); run locally: `node --env-file=.env.local scripts/blog-29-faq.mjs`.
- `TASK-0217` feat(seo): AI SEO Faza 2 — site-wide brand entity + FAQPage. Homepage now emits Organization + WebSite JSON-LD (`components/seo/SiteJsonLd.tsx`) for AI knowledge-graph recognition (GEO). Blog posts auto-emit **FAQPage** (highest AEO impact) when their markdown has an FAQ section — `extractFaqFromMarkdown` + `faqNode`, graceful no-op when absent. Builds on the TASK-0215 structured-data module.
- `TASK-0216` feat(franchise): **F-RADAR Faza 1 — Franchise Radar**. Curated directory of franchise brands not yet in Azerbaijan (`/franchise/radar`, + root mirror for the no-prefix az URL, L-038) with sector filter, per-brand lead funnel (`/api/lead/franchise-radar`), and analytics (`franchiseEvents`). Field-by-field SSOT (`lib/data/franchiseDirectory/`, 8 pilot brands from open sources) ready for a Faza-2 DB migration. No brand logos hosted (sector icons + name only) + "not an official representative" disclaimer (L-039). i18n in 4 languages. Lead route reuses the `consulting` enum + `score` jsonb (schema.ts is PROTECTED — not extended).
- `TASK-0215` feat(seo): AI SEO (SEO + AEO + GEO) structured-data upgrade for blog. New reusable `lib/seo/structured-data.ts` and an enriched JSON-LD `@graph` on every blog post (BlogPosting + BreadcrumbList + Organization) so ChatGPT/Perplexity/Google AI Overviews can extract & cite content. Adds the previously-missing `publisher.logo`, `mainEntityOfPage` object, `articleSection`, `wordCount`, breadcrumb trail, and a standalone Organization entity. `faqNode` helper ready for Phase-2 FAQPage.

### Changed
- `TASK-0212` refactor(b2b): converted `app/b2b-panel/page.tsx` from Pattern C (inline `Record<Locale>` pageCopy, ~180 lines) to Pattern A (`useTranslations('b2bPanel')`), resolving TD-003 / L-004. Strings moved verbatim to `messages/{az,ru,en,tr}.json`; a local `copy` object preserves all 23 usage sites. Build PASS, 4-lang key completeness verified (no MISSING_MESSAGE), `/b2b-panel` 307→200 (L-010 guest guard intact).

### Fixed
- `TASK-0214` fix(branding/pwa): replaced the default Next.js favicon (the "triangle" mistaken for a Vercel mark in the browser tab) with the DK Agency logo via `app/icon.png`, and added `app/apple-icon.png` + `public/icon-192.png`/`icon-512.png` so mobile "Add to Home Screen" uses the DK icon. `app/manifest.ts` now references the PNG/maskable icons. No PROTECTED files touched (used Next.js file conventions).
- `TASK-0213` fix(kazan): mobile widget no longer overflows the screen — panel height `100vh` → `100dvh` (mobile address bar made `100vh` exceed the visible viewport). Also made the KAZAN AI call resilient: `callDeepSeekWithPrompt`/`callAnthropicWithPrompt` now use `fetchWithTimeout` (30s AbortController) inside try/catch, so a provider network failure/timeout degrades to the useful static answer (200) instead of a 500 that surfaced as the "canlı cavab gecikir" error fallback. (Real AI answers still require a valid `DEEPSEEK_API_KEY` + reachability on Hostinger.)
- `TASK-0211` perf(logo): optimized `logo-mobil.png` from 1.2 MB / 1254×1254 to ~9 KB / 144×144. The logo (Header, Footer, B2B sidebar — displayed at ≤48px) was shipping a >1 MB image on every page load. Filename unchanged, so no PROTECTED file edits.

### Added
- `TASK-0210` infra(agents): `AGENTS.md` — thin cross-tool agent instruction file (open AGENTS.md standard) so Codex and other agents load the same rules as Claude Code, pointing to canonical sources (CLAUDE.md, CLAUDE-BRAIN.md, LESSONS.md) without duplication.
- `TASK-0209` infra(skills): real Agent Skills (agentskills.io format) replacing the paper SKILL-MATRIX — 3 auto-loading reference skills (`dk-deploy-reality`, `dk-i18n-pattern`, `dk-design-system`) and 3 task skills (`/dk-new-tool`, `/dk-release`, `/dk-blog-publish`), built around real recurring pain (404/503/deploy gap, i18n, blog drift). `dk-validator` agent gained `memory: project` (native persistent memory). Step 3/3 of the Claude memory/skill infrastructure.
- `TASK-0208` infra(memory): automatic git-persistent session journal — `scripts/auto-journal.mjs` runs as a git pre-commit step and appends one memory line per commit to `docs/SESSION-JOURNAL.md`, staged inside the same commit so it persists in git (survives ephemeral containers) with no dirty-state side effects. `scripts/session-brain.mjs` now reads back the last 8 entries at SessionStart, closing the write→read memory loop (step 2/3).
- `TASK-0207` infra(memory): SessionStart "brain" injection — `.claude/memory/CLAUDE-BRAIN.md` (curated rules, architecture invariants, deploy reality, recurring traps) is auto-loaded into every new session via `scripts/session-brain.mjs` so Claude starts with full project knowledge instead of from zero (compact-context-loss fix; step 1/3 of the Claude memory/skill infrastructure).

### Fixed
- `TASK-0200` Fixed cover image 404s on the blog detail page by ensuring relative DB paths (e.g. `images/blog-13.png`) are resolved with a leading slash `/` inside `resolveLocalCover`.
- `TASK-0200` Synchronized static config slug `isleyen-franchise-təhvil almaq` to `isleyen-franchise-devralmaq` to match the database and support proper fallback resolutions.

### Added
- `TASK-0205` content(blog): added blog-026, blog-027, and blog-028 (müşteri şikayet yönetimi) including cover images.
- `TASK-0109` Localized KAZAN AI system prompt to respond in user's locale (AZ/TR/RU/EN) with localized markdown CTA links and Ahilik quote suffix.
- `TASK-0197` F2.7: Yandex Metrica events for sektor pages (`trackSektorEvent` wrapper + 5 component wire)
- `TASK-0197` OG social card: dynamic 1200x630 `opengraph-image.tsx` for `/sektor/qonaq-evi`
- `TASK-0197` OTA Guide PDF: 8-section jsPDF generator, auto-sent as email attachment on lead capture
- `TASK-0197` SMTP attachment support: `EmailAttachment` interface in `lib/email/smtp.ts`
- `TASK-0197` Sektor analytics constants added to `lib/analytics/events.ts`
- `TASK-0186` AI Franchbook Generator: USTA-gated franchise manual skeleton tool
- `franchbook_projects` table and `0011_franchbook_projects.sql` migration
- Fixed AFA Akademiya franchbook outline SSOT
- `/franchise/francbuk-generatoru` and `/{locale}/franchise/francbuk-generatoru`
- `POST/PATCH /api/franchise/franchbook` with JWT owner binding, USTA gate, AI generation, and edit save
- `franchbook_gate` lead source for lower-tier upgrade interest
- `/dashboard/funnel` — admin-only activation funnel page (role gate: admin only)
- `ActivationFunnelWidget` — 4-stage funnel bar chart (registered → priorities → tool click → D7 return)
- Dashboard sidebar: "Aktivasiya funeli" nav item with BarChart3 icon (4 locales)
- `user_events` table (migration 0008) — adoption loop telemetry with cascade delete
- `POST /api/user/events` — JWT auth, 10/min rate limit, 7 event types
- `lib/track.ts` — fire-and-forget client tracker (keepalive, never blocks UI)
- OnboardingModal: tracks modal_opened, priorities_set, priorities_skipped
- RecommendationWidget: tracks tool_recommended_clicked
- NudgeBanner: tracks nudge_shown, nudge_clicked, nudge_dismissed
- `e2e/smoke.spec.ts` — 4 baseline @smoke tests (homepage, login, listings, API gating)
- CLAUDE.md DoD item 11: dk-validator 8/8 PASS mandatory with skip justification

### Fixed
- dk-validate.sh OOM: build now uses 8GB heap explicitly (#233 fix)
- Playwright check 8 now always runs @smoke suite (not only changed specs)

## [1.0.0] - 2026-05-28 — Ahilik Studio Launch Sprint (16 PR, #204-#220)

### Added
- AI Insight: real DeepSeek integration for 9/10 toolkit pages (#214, #215)
- SYSTEM-AUDIT.md auto-generator: `npm run audit:system` (#216)
- Listings schema: 15 new columns + 9-status workflow + equipment jsonb (#217)
- Cloudinary env + deployment guide (#219)
- owner_id binding: real JWT user in listings (#220)
- Equipment field: dynamic add/remove in CreateListingForm (#220)
- i18n: ~1,100 new translations (nav, footer, devir, blog, news, toolkit, dashboard)
- L-031: schema duplicate prevention lesson
- L-032: "boşluq varsayma" lesson (email+OCR already existed)

### Changed
- AI stack: deepseek-chat → deepseek-v4-flash, gemini-2.0 → 2.5-flash GA (#204-206)
- lib/ai-models.ts: centralized model IDs (SST, 22 call sites)
- Toolkit: 10 pages unified ToolkitStudioLayout (#207, #208)
- Homepage: Ahilik Studio dark + gold palette (#A01)
- Devir marketplace: Pattern A, DK Onaylı badge, search filter (#209)
- Header/Footer: Pattern A, gold CTA, USTALIĞIN NİŞANI tagline (#210)
- Dashboard/OCAQ: warm palette, tier badge, backdrop-blur (#212)
- Blog/News: Pattern A, gold accent, 4-language hardcoded strings removed (#213)
- Protected files: reconciled settings.json ↔ PROTECTED.md to 14 files (#211)
- SYSTEM-AUDIT.md: email backend + OCR + Cloudinary auto-scan (#218)

### Fixed
- Gemini 2.0-flash → 2.5-flash (Jun 1 shutdown deadline)
- deepseek-chat → v4-flash (Jul 24 deprecation deadline)
- Protected file list sync (ghost app/page.tsx removed)

### Security
- AI insight: rate limit 20/hour, prompt injection sanitize
- Listings: owner_id from server JWT (client cannot spoof)
### Added
- docs/ONBOARDING.md — 5-minute new developer guide (TASK-0179A)
- docs/README.md — documentation index with all file links (TASK-0179A)
- docs/ADR/ — 15 retroactive Architecture Decision Records (TASK-0179C)
- docs/DATA-MODEL.md — 30 table inventory + Mermaid ERD (TASK-0179C)
- docs/API-MAP.md — 69 endpoint inventory with auth, rate-limit, categories (TASK-0179B)
- docs/archive/ — archived old reports (8 files moved) (TASK-0179A)

### Removed
- docs/n8n-setup.md (duplicate of docs/n8n/SETUP.md) (TASK-0179A)
- docs/NEWS-TRANSLATION.md (duplicate of XEBER-TERCUME-SISTEMI.md) (TASK-0179A)
- Archived: DRIFT-REPORT, PROJECT-STATUS, CTO-DAILY-REPORT-TEMPLATE, WEEK-EXECUTION-PLAN, 4 audit reports (TASK-0179A)

### Previous
- Toolkit: Metro 3-block descriptions for KALFA tier 12 tools in 4 languages (TASK-0178B)
- Toolkit: Metro 3-block descriptions for ŞAGIRD tier tools — Marka Kompası, KST Yoxlayıcı, Yemək Xərci (TASK-0178A)
- Toolkit: ToolDescription.tsx reusable component with collapsible accordion (TASK-0178A)

### Fixed
- AI Readiness: option label i18n key mismatch — removed spurious `.label` suffix (TASK-0177)
- Recommendation engine: severity ranges now use Infinity — values >100% correctly return CRITICAL (TASK-0177)
- Recommendation engine: default fallback changed from OK to CRITICAL for out-of-range values (TASK-0177)

### Added
- KAZAN AI: context-aware auto-greeting from P&L Simulator and AI Readiness (TASK-0176A)
- KAZAN AI: system prompt injection with user metrics for personalized responses (TASK-0176A)
- KAZAN AI: sanity check for impossible metric values (TASK-0176A)
- Yandex Metrica: consent-aware integration with KVKK compliance (TASK-0175)
- Analytics event taxonomy: 10 events for AI Readiness, Weekly Actions, Registration (TASK-0175)
- CSP whitelist: mc.yandex.ru, mc.webvisor.org domains (TASK-0175)
- P&L Simulator: "Bu həftə nə etməliyəm?" Weekly Actions panel with sector benchmarks (TASK-0174)
- Recommendation engine: 8 actions, 4 metrics, 3 severity levels (TASK-0174)
- Homepage: AI Readiness Score wizard — 10 questions, 3 segments, Toolkit/KAZAN integration (TASK-0173)
- EN + RU legal markdown content: privacy, terms, cookie-policy — 4 locale tam (TASK-0170)
- UI: consent checkboxes on register form — terms+privacy required, marketing optional (TASK-0168-C)
- API: upgrade register endpoint to Zod schema validation with z.literal(true) consent (TASK-0168-B)
- Centralized CONSENT_VERSION constant in lib/legal/consent-version.ts (TASK-0168-B)
- DB: consent tracking fields on users table — terms/privacy accepted_at, ip, version + marketing_consent (TASK-0168-A)
- Migration: drizzle/0005_consent_fields.sql (KVKK Md. 7(2) + GDPR Art. 7(1))
- Footer bottom-bar legal links: privacy/terms/cookies in 4 languages (TASK-0167)
- Wire AZ/TR markdown files to /privacy /terms /cookies routes (TASK-0169)
- Shared LegalRenderer + LegalPageLayout components (TASK-0169)
- RU/EN fallback to AZ with notice banner (TASK-0169)
- legal.fallbackNotice i18n key in 4 languages (TASK-0169)

### Verified
- E2E production test: KVKK register flow — DB consent fields, Zod validation, UI checkbox, 12 legal URLs 200 OK (TASK-0171)

### Fixed
- Cookie URL in privacy.md: /cookie-policy → /cookies (TASK-0169)

### Previous
- AZ/TR legal Markdown content import for terms, privacy, and cookie policy (TASK-0164)
- Locale-aware tarix formatı (Intl.DateTimeFormat) — faturalar detail (TASK-0157D)
- .gitignore: tests/screenshots/, playwright-report/, temp migration scripts (TASK-0157D)
- toolkit.pnl.education.structure parity for RU/TR (operatingProfit, controllableProfit) (TASK-0158)
- [TASK-0140] feat(admin): soft-delete single + bulk + login block + double confirm
  - `deletedAt` column: users + memberProfiles (migration 0004)
  - DELETE /api/admin/members/[id] — soft-delete, self-protection, audit log
  - DELETE /api/admin/members/bulk — batch (max 50), self-filtered, per-item audit
  - Login blocked for soft-deleted users (403)
  - Siyahıdan gizlənir (deletedAt IS NULL)
  - MembersTable: checkboxes + bulk action bar + per-row delete
  - Detail page: double confirm (confirm → type "SİL")
- [TASK-0139] feat(admin): admin-initiated password reset + email + audit
  - POST /api/admin/members/[id]/reset-password (token + email)
  - adminPasswordReset email template (4 languages, "admin tərəfindən sıfırlanıb" mesajı)
  - Detail page: "Şifrəni Sıfırla" button with confirm dialog + loading + toast
  - Audit: member.password_reset (token/hash NEVER in metadata)
  - Reuses existing passwordResetTokens + /reset-password page (zero new pages)
- [TASK-0138] feat(admin): member detail page + GET endpoint + audit preview
  - GET /api/admin/members/[id] — profile data (no passwordHash) + last 10 audit logs
  - /dashboard/users/[id] detail page (profile card, status badges, audit timeline)
  - MembersTable "Bax" link per row
  - i18n: dashboard.memberDetail namespace (4 languages)
- [TASK-0137] feat(admin): audit log — DB schema, API, UI, immutable
  - `admin_audit_logs` Drizzle table (OWASP 2025: UTC timestamp, admin+target, metadata jsonb)
  - GET /api/admin/audit-logs (pagination, action filter, date range)
  - /dashboard/audit-logs UI page (table + filters + action badges)
  - Retroactive: TASK-0135 PATCH + TASK-0136 POST now write audit entries
  - Sidebar link added (4 languages)
  - Immutable: no delete capability in API or UI
- [TASK-0136] feat(admin): manual member creation + set-password email flow
  - POST /api/admin/members — passwordless user + invite email (24h token)
  - AddMemberModal component: name, email, role form
  - adminInvite email template (4 dil — wrapEmail + CTA + fallback URL)
  - Dual-table insert: users (auth) + memberProfiles (admin panel)
  - 409 duplicate email check, email-failed graceful warning
  - OWASP 2025 compliant: plain-text password never emailed
- [TASK-0135] feat(admin): role assignment UI + PATCH API endpoint
  - PATCH /api/admin/members/[id] — rol dəyişdirmə (member ↔ admin)
  - Self-role protection: admin öz rolunu dəyişə bilməz (403 + UI disabled)
  - MembersTable: rol sütunu select dropdown ilə (cari admin badge-only)
  - i18n: dashboard.members.roles.* (4 dil — az/en/ru/tr)
  - E2E smoke: PATCH 401 + invalid role + invalid id tests

### Changed
- faturalar/[id] səhifəsi Pattern A i18n (TASK-0157D)

### Removed
- Unused "marketing" i18n namespace from AZ (59 leaf, TASK-0158)
- Unused STATUS_CONFIG export (TASK-0158)
- Köhnə C3 i18n migration script artifacts (TASK-0161) — 4 lokal fayl, 336 sətir

### Fixed
- RU/TR P&L education-da əskik riyazi operator işarələri (TASK-0163)
- RU/TR P&L education orphan keys (canlı bug: istifadəçi açar adlarını görürdü)
- i18n parity 4 dildə tam (185 missing/drift → 0)
- Repo lint 4 error → 0 (TASK-0161)
- [TASK-0134-FIX] fix(admin): resolve validator blocks — spec locale fix + i18n pageCopy
  - E2E spec: locale prefix (`/${locale}/dashboard/users`) silindi, dashboard route-ları locale-independent
  - pageCopy inline obyekti component-dən çıxarıldı, `useTranslations('dashboard.members')` ilə əvəz
  - messages/az.json, en.json, ru.json, tr.json: `dashboard.members.*` namespace (4 dil tam)
  - dk-validator L-004 (inline pageCopy) + E2E locale prefix block-ları həll edildi

### Added
- TASK-0134: Admin İstifadəçilər page → real DB (mock removed)
  - GET /api/admin/members (admin-only, JOIN profiles+subscriptions, pagination, stats)
  - MembersTable component (filter, pagination, plan badges, 4 dil)
  - 4 stat cards: total/verified/KALFA/USTA
- TASK-0131: Dashboard input/textarea/select contrast fix (globals.css systemic)
  - Root cause: body color #eaeaea (landing dark) inherited by dashboard inputs on bg-white
  - Fix: global input/textarea/select { color: var(--dk-ink) } + placeholder { color: var(--dk-ink-soft) }
  - Affects all 11 marketing tools + dashboard forms
- TASK-0130: Reklam Yazıcısı AI tool (Marketinq Ocağı, KALFA tier)
  - 3 variant: attention / informative / sales
  - Platform-specific: Instagram, Facebook, TikTok, Google Ads
  - POST /api/ai/ad-writer (DeepSeek + Claude fallback)
  - 4-language i18n, Playwright smoke tests
- TASK-0128: Şikayət Cavablandırıcı AI tool (Marketinq Ocağı, KALFA tier)
  - 3 component: SikayetCavablandiriciPage, SikayetForm, SikayetCavablari
  - POST /api/ai/complaint-response (DeepSeek primary, Claude fallback)
  - lib/ai/complaint-prompt-builder.ts (Ahilik dəyərləri, few-shot)
  - 4-language i18n (az/ru/en/tr) in messages/*.json
  - Playwright smoke tests (4 locale + API 401 check)
  - 20 responses/day rate limit per user

## [0.9.0] - 2026-05-04
### Added — i18n Phase 2: public route translations (TASK-0049 – TASK-0053)
- [TASK-0049] `app/toolkit/page.tsx`: 4-language copy (az/tr/en/ru) — hero badge, title, subtitle, 10 tool names & descriptions, section headings, CTA label; locale detected from pathname
- [TASK-0050] `components/listings/ListingsShowcasePage.tsx`: 4-language copy — hero, CTA buttons, filter labels, empty state, active count, verified badge
- [TASK-0051] `app/haberler/page.tsx`: 4-language copy — page badge, title, subtitle, category tabs, editor pick label, no-source label, empty state
- [TASK-0052] `app/[locale]/blog/page.tsx`: 4-language copy — hero badge, subtitle, error message, read CTA, reading time label; locale detected from pathname
- [TASK-0053] `app/[locale]/qiymet/page.tsx`: verified already fully translated in Phase 1 — no changes needed

## [0.8.0] - 2026-05-04
### Fixed — Auth redirect / hostname fix package (TASK-0030 – TASK-0034)
- [TASK-0030] next.config.ts: `experimental.trustHostHeader: true` — Hostinger reverse proxy hostname fix
- [TASK-0031] Auth redirects: replaced `request.nextUrl.origin` and raw env var reads with `getBaseUrl()` in confirm, register, and route handlers
- [TASK-0032] New utility: `lib/utils/get-base-url.ts` — single source of truth for public base URL
- [TASK-0033] Deleted duplicate `postcss.config.js` (CJS) — canonical config is `postcss.config.mjs`
- [TASK-0034] Pinned Node.js to >=22 (`package.json` engines + `.nvmrc`)

## [0.7.0] - 2026-04-30
### Added — Restoran Auditor (tam yeni feature)
- DB schema: `restaurant_audits` + `restaurant_audit_actions` (2 tablo, 2 enum, Neon push)
- AI engine: `lib/audit/photo-analyzer.ts` (Gemini Vision + kateqoriya fallback)
- AI engine: `lib/audit/menu-analyzer.ts` (menyu foto → qiymet/kateqoriya)
- AI engine: `lib/audit/social-scraper.ts` (Instagram/Facebook public data)
- AI engine: `lib/audit/full-audit.ts` (DeepSeek SWOT + tovsiye + WhatsApp sablon)
- Repository: `lib/repositories/auditRepository.ts` (CRUD + actions + stats)
- API: `POST/GET /api/audit` (yaratma + siyahi + bulk delete)
- API: `GET/PATCH/DELETE/POST /api/audit/[id]` (detal + status + action log)
- Dashboard: `/dashboard/auditor` — 3 view (list/new/detail), mobile-first, kanban filter
- PDF export: `lib/audit/audit-pdf.ts` (jsPDF, AZ karakter sanitize)
- WhatsApp template: AI auto-generate, clipboard copy
- Sidebar: "Auditor" linki (ClipboardCheck icon)

### Added — Toolkit Food Cost Real Data
- Product lookup API: `/api/food-cost?type=lookup&q=toyuq` (son 90 gun orta qiymet)
- Repository: `lookupProductPrices()` — avg/min/max qiymet, vahid, occurrences
- Toolkit autocomplete: `/toolkit/food-cost` mehsul adina gore fatura qiymetleri onerisi
- Auto-fill: onerini secdikde ad, vahid, qiymet avtomatik doldurulur
- "Fatura qiymetleri aktiv" badge (DB-de data varsa)

## [0.6.0] - 2026-04-30
### Added — Fatura OCR Faza 9-10 (Food Cost + KAZAN AI + Export)
- Food Cost hesablama motoru: `getFoodCostReport()`, `getMonthlyTrend()`, `getSupplierComparison()`, `getTopProducts()`
- Food Cost API: `/api/food-cost?type=report|trend|suppliers|products|all`
- Food Cost Dashboard: `/dashboard/food-cost` (4 KPI, trend chart, 3 tab, ay secici)
- KAZAN AI real data inject: `lib/kazan-ai/food-cost-context.ts` + `isFoodCostIntent()`
- KAZAN AI artiq "Bu ay en cox neye xerclemisem?" sualina real reqemlerle cavab verir
- Sidebar: "Food Cost" linki (CookingPot icon)

### Added — PDF Import (Faza 4)
- PDF parser: `lib/invoice-ocr/pdf-parser.ts` (pdf-parse v2 PDFParse + DeepSeek text parse + regex fallback)
- PDF API: `POST /api/invoice-pdf` (FormData → text extract → AI parse → structured rows)
- Import modal: PDF butonu artiq isleyir (eskiden "tezlikle" yazirdi)

### Changed — CSV/Excel Export Encoding Fix
- CSV separator: virgul (`,`) → noqteli vergul (`;`) — AZ/TR locale-da Excel duzgun acilir
- UTF-8 BOM + CRLF setir sonu
- Status/Menbe etiketleri AZ diline cevirildi
- Food Cost CSV/Excel/PDF export funksiyalari elave edildi
- Excel export: `bookSST: true` (string table optimizasiyasi)

### Dependencies
- `jspdf` (PDF export)
- `pdf-parse` (PDF import)

## [0.5.0] - 2026-04-28
### Added — Fatura OCR Faza 1-8
- DB schema: 5 tablo (invoices, invoice_items, invoice_categories, invoice_imports, invoice_category_rules), 4 enum
- Seed: 12 default kateqoriya + 64 auto-mapping rule
- OCR pipeline: Gemini 2.5 Flash Vision (primary) + DeepSeek Text (fallback)
- Client-side sekil sixilma: browser-image-compression, WebP, 70%+ azalma
- Manual giris: +1/+5/+10 toplu setir elavesi
- Excel/CSV import: SheetJS, AZ/TR/EN/RU sutun tanima
- Detail page: field-by-field inline edit
- Admin: bulk delete, filter, pagination
- Mobil UX: kart view, kamera, bottom bar
- Kateqoriya admin: `/dashboard/fatura-kateqoriyalar`
- Export: CSV (UTF-8 BOM) + Excel (.xlsx)
- Sidebar: "Faturalar" linki
- PR #65 merged to main

## [0.4.0] - 2026-03-26
### Added
- `KAZAN AI` knowledge base (`lib/kazan-ai/knowledge-base.ts`) - 10 yazidan cixarilan formula, range, checklist, praktik addim ve guru sitatlari
- `KAZAN AI` system prompt (`lib/kazan-ai/system-prompt.ts`) - AZ ton, sales layer, toolkit/blog yonlendirmesi
- `POST /api/kazan-ai` Anthropic proxy route - server-side system prompt + knowledge injection
- `/kazan-ai` real chat UI - sample questions, clickable markdown linkler, toolkit enteqrasiyasi
- `/toolkit/insaat-checklist` ve locale wrapper - temiz interactive checklist, upload util istifadəsi
- `lib/utils/image-resize.ts` - client-side image resize/validation util

### Changed
- `components/layout/Footer.tsx` - toolkit ve insaat linkleri yenilendi, encoding temizlendi
- `components/layout/MegaMenu.tsx` - insaat checklist linki elave olundu, encoding temizlendi
- `app/kazan-ai/page.tsx` teaser sehifeden real chat shell-e cevrildi

## [0.3.0] - 2026-03-24
### Added
- i18n altyapisi (next-intl v4, 3 dil: az/tr/en, 168 key)
- Database schema (Drizzle + 6 tablo: blog, ilan, partner, hero, guru, settings)
- Image optimization (sharp + Cloudinary/Unsplash config)
- Design tokens (colors, fonts, shadows, radius — typed)
- Prettier config (.prettierrc)
- /toolkit — index page (3 alet karti)
- /toolkit/food-cost — porsiya maya deyeri hesablayici (interaktiv)
- /toolkit/pnl — ayliq P&L simulyatoru (KPI + editable cedvel)
- /toolkit/checklist — 43 maddelik restoran acilis checklist (7 bolme, progress bar)
- Blog detail: MarkdownRenderer ile zengin formatlama (guru box, dogan notu, warning/tip, cedvel, code block)
- Blog detail: related articles sidebar, tag-lar, xulase paneli
- .claude/CLAUDE.md — proyekt kontekst faylI
- docs/BRAND-GUIDE.md, docs/CODING-STANDARDS.md

### Changed
- Blog list: components/constants -> lib/data/blogArticles (9 yazi duzgun gosterilir)
- Blog detail: ReactMarkdown -> MarkdownRenderer (zengin formatlama)
- Xeberler: basliq + UI AZ diline cevirildi ("En Cox Oxunan", "oxunus")
- StageSelector: /basla/checklist linki -> /toolkit/checklist (404 fix)

### Fixed
- CI: 10 ESLint error hell edildi (unescaped quotes, unused imports, Math.random in render, mojibake)
- verify-encoding.mjs: binary fayllari (PNG/JPG) skip edir, oz-ozunu skip edir
- Butun bos route qovluqlari (toolkit/food-cost, toolkit/pnl) sehifeyle dolduruldu

## [0.2.0] - 2026-03-24
### Added
- Utility bar (KAZAN AI banner)
- MegaMenu (880px, 18 item, TEZLIKLE badge)
- OCAQ Panel mockup (hero section)
- Sedd Rozeti konsepti
- Axeptio stili cookies banner (localStorage consent)
- 5 illustrasiya (hairline stil)
- CTO Durum Raporu
- Development journal sistemi
- Kod standartlari (ESLint, Prettier, design tokens)

### Changed
- Hero: dark -> light tema, "pul itirdiyin" basliq
- Nav: Toolkit/Saglamliq/Xeberler -> Ana sehife/Trendler/Blog/Ocaq
- Footer: dark -> light (#FAFAF8), 5 sutun
- DoganNote: "riyaziyyat" -> Ahilik/Sedd hikayesi
- StageSelector: blue/red/emerald -> red/gold/purple
- ToolkitShowcase: tab layout -> 3 kart grid
- Font: Inter -> DM Sans

### Fixed
- Cift header problemi (light tema ile hell)
- Cookies banner imla xetalari (AZ herfleri)
- PNG encoding hook (binary skip)

## [0.1.0] - 2026-03-22
### Added
- Ilkin sayt qurulusu (52 route)
- 9 blog yazisi (statik TypeScript)
- 14 dashboard admin sehifesi
- B2B Panel (8 toolkit modulu)
- RSS xeber pipeline (6 menbe)
- Auth (localStorage, TEST_USERS)
- WhatsApp floating button

## [0.9.1] - 2026-05-09
### Added - TASK-0102 Contact lead funnel
- Contact page CTA funnel: KAZAN AI primary card, WhatsApp card, Telegram card.
- `POST /api/leads/track` writes contact CTA clicks to `leads` with `source`, `channel`, `locale`, `user_agent`, and `ip_hash`.
- `leads` table mapping and `idx_leads_source_channel` migration.
- 4-language `contact.funnel` namespace in `messages/*.json`.
- Playwright contact funnel checks for 4 locales and WhatsApp tracking payload.

### Changed
- Removed visible phone card from contact page; WhatsApp handoff remains via localized prefilled redirect.
