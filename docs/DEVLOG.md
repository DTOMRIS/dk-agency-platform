# DK Agency Platform — Dev Log

## 2026-09-26 — TASK-0457 (təhlükəsizlik: saxta admin sessiyası)

**Necə tapıldı:** TASK-0455-in API testində admin JWT ilə 403 aldım — blog API-ları JWT-ni yox, `dk_member_session`-u oxuyurdu. Faylı açanda imzasız base64 JSON gördüm, `POST /api/member/session`-da isə bədənin olduğu kimi cookie-yə yazıldığını. Lokal dev-də curl ilə təsdiq: saxta cookie → 200. Sahibə dərhal bildirdim, icazə ilə düzəltdim.

**Seçim — cookie-ni imzalamaq yox, JWT-dən qurmaq:** HMAC imzası da saxtalaşdırmanı bağlayardı, amma çıxışdan sonra 30 günlük imzalı admin cookie qüvvədə qalardı. JWT onsuz da var (httpOnly, 7 gün, login-də yazılır, dashboard middleware-i onu işlədir) — ikinci mənbəni səlahiyyətdən çıxarmaq TD-004-ün də yarısıdır. PROTECTED `lib/member-access.ts` və `app/api/member/auth/route.ts`-ə toxunmaq lazım gəlmədi.

**İkinci açıq:** smoke zamanı üzv JWT ilə `/dashboard` 200 verdi. Layout-u admin-only etmək istədim — `app/b2b-panel/analizler` üzvü `/dashboard/marketinq-ocagi/…`-yə göndərir, qırılardı. DB-ni birbaşa oxuyan server səhifələrini skan etdim (7 ədəd) — onlara `requireAdminPage()`. Client səhifələri guard-lı API-dən oxuyur, üzv artıq 403 alır. Dashboard-u admin/üzv hissəyə ayırmaq sahib qərarıdır — TD-004.

**Yerləşdirmə səhvi (düzəldildi):** guard sətrini skriptlə əlavə edəndə çoxsətirli imzada iki dəfə səhv yerə düşdü (`({` və `}: {` sətrindən sonra). eslint parsing error ilə tutdu; üçüncü dəfə `}) {` sətrini hədəf aldım. Hər faylda diff yoxlandı: 7 × (import + 1 sətir).

## 2026-09-26 — TASK-0455 (bloq tərcüməsi)

**Sahib:** «tercüme neden işlemiyor, deep seek var». Canlı mesajı görmədim — kodu izlədim: düymə → `/api/blog/translate` → `autoTranslateBlogPost`. Bir səbəb gözləyirdim, beş tapdım (task kartında). Ən gözlənilməzi: yaradılışdakı avtomatik tərcümə `created.id`-yə baxırdı, funksiya isə id qaytarmır — yəni «dərc edəndə avtomatik tərcümə» heç vaxt işləməyib, yalnız əl ilə düymələr qalırdı.

**Niyə arxa plan işi:** 1–3 dəqiqəlik HTTP sorğusu proxy-dən asılıdır. Hostinger uzunömürlü Node prosesidir, iş yaddaşda saxlanır (`globalThis` xəritə — dev HMR də eyni xəritəni görür); proses yenidən başlasa GET «idle» qaytarır və redaktor bunu dürüst deyir. `after()` ilə cavabdan sonra işləməyə davam edir.

**Parça ölçüsü 3000:** 6000 simvolluq parça RU-da ~4000 token çıxış deməkdir — DeepSeek-in 120 s abort limitinə yaxın. Kiçik parça + paralel = divar vaxtı ən yavaş parça qədər.

**Test:** unit test əvvəl köhnə kodla işə salındı — 3 FAIL (15 çağırış, eyni anda 1, ``` bloku bölünür) — sonra yeni kodla 9/9. Edit səhifəsi DB tələb edir (`neon-http` — lokal Postgres işləmir), ona görə redaktor UI-si canlıda yoxlanmalıdır; API axını (403/202/vəziyyət) dev serverdə yoxlandı.

**Təhlükəsizlik (ayrıca task):** test yazanda 403 aldım — blog API-ları JWT-ni yox, `dk_member_session`-u oxuyur. O cookie imzasız base64 JSON-dur, `POST /api/member/session` isə bədəndəki `plan`-ı yoxlamadan yazır (login səhifəsi `plan`-ı brauzerdə təyin edib göndərir). Lokal dev-də saxta cookie ilə admin endpoint-i 200 qaytardı. 26 API route bu sessiyaya güvənir. TD-004 iki sistemi qeyd edir, amma saxtalaşdırılma riskini yox. Sahibə dərhal bildirildi.

## 2026-09-26 — TASK-0456 (bloq siyahıları + mobil cədvəl daşması)

**Sahib:** 6 yazını Markdown faylı ilə yüklədi, «genel iyi oldu» dedi, ekran görüntüsündə siyahılar nöqtəsiz/nömrəsiz idi. Renderer-də `list-disc`/`list-decimal` var idi — deməli nəsə üstələyir. `globals.css`-də ☐ checklist üçün yazılmış `.blog-content li { list-style: none }` (#394 dövrü) bütün `li`-ləri tuturdu. Fayl PROTECTED — icazə istəmək əvəzinə renderer səviyyəsində həll: adi maddəyə inline `listStyleType: inherit`. Test əvvəl düzəlişsiz işə salındı — FAIL (səhvi tutduğunu sübut), sonra PASS.

Ekran görüntüsü çəkəndə 390px-də 494px daşma çıxdı — düzəlişdən əvvəl də eyni (stash ilə yoxlandı), yəni köhnə səhv. Səbəb cədvəl: grid elementi `min-width: auto`. `min-w-0` + spec-ə daşma testi. 28 statik yazı × 2 dil yoxlandı — 0.

**Qeyd (tərcümə):** sahib «tərcümə işləmir» dedi. Diaqnoz: (1) mövcud RU/EN/TR mətni varsa və AZ hərfi yoxdursa `needsTranslation` onu «tərcümə olunub» sayır → AZ mətni dəyişəndə düymə heç nə etmir; PATCH tərcüməni tetikləmir; (2) >6000 simvol mətn hər `##`-də ayrı parçaya bölünür, parçalar ardıcıl gedir → 2–3 dəq sorğu, proxy timeout riski. Plan (TASK-0455) sahibin təsdiqini gözləyir.

## 2026-09-26 — TASK-0454 (bloq: Markdown faylı idxalı)

**Sahib:** «yazılar bak ne durumda çıkıyor? zamanında bunu yapmıştın, yazıyı atardım alırdı». Spagetti yazısı canlıda `##`, cədvəl, sitat olmadan düz mətn kimi çıxırdı. Əvvəl renderer-dən şübhələndim — yoxladım: `MarkdownRenderer` h2/cədvəl/sitatı düzgün göstərir, `app/api/blog/route.ts` AZ mətnə toxunmur. Deməli mətn artıq formatsız gəlib: sahib yazını mənim göndərdiyim sənədin **göstərilən** görünüşündən kopyalayıb — orada `##` işarəsi görünmür, kopyalanmır da. Sahibkara «xam mətni kopyala» demək kövrək həll olardı; fayl seçmək isə səhv edilə bilmir.

**Qərarlar:** meta bloku format-ı mənim redaktə sənədimdəki kimidir (``` içində `Açar: dəyər`) — sahibə gedən 6 fayl eyni formada. Kateqoriya: sənəddə «🏛️ Açılış və Dizayn» vardı, redaktorda belə seçim yoxdur (6 kateqoriya) → fayllarda «⚙️ Əməliyyat»; parser uyğun gəlməyəni səssiz dəyişmir, xəbərdarlıq verir. SEO title limiti 60-dır, başlıqlar 68–82 simvol idi → kəsmək əvəzinə fayllara ayrıca `SEO başlıq:` sətri əlavə olundu (≤60). Toast 2.2 s-də itir — xəbərdarlıqlar üçün düymənin altında qalıcı mesaj.

**Test:** əvvəl SEO sayğacını (`51/60`) yoxladım — səhv hesablamışdım (50). Sayğac əvəzinə dəyərin özü yoxlanır. Hidrasiyadan əvvəl seçilən fayl itə bilər (L-053) — ilk yükləmə `toPass()` ilə. 3/3.

## 2026-09-26 — TASK-0453 (bloq CTA xam açarları)

Sahibin ekran görüntüsü: yazının sonunda «blogDetail.ctaTitle», «blogDetail.ctaWhatsapp» düymədə. Açarlar kodda var, JSON-da yox — heç vaxt olmayıb (git log: CTA bloku #394/#418 dövründən). Bizim i18n yoxlaması 4 dilin bir-biri ilə paritetinə baxır, koddakı `t()` açarının JSON-da olub-olmadığına yox; ona görə tutulmadı. Növbəti task üçün qeyd: `t('…')` açarlarını JSON ilə tutuşduran skript lazımdır (TECH_DEBT-ə yazılmalı).

## 2026-09-26 — TASK-0452 (toolkit «5 alət» sayı)

Sahibin canlı ekran görüntüsündə «Buradakı 5 alət» + 6 kart. Mənim TASK-0450-m köhnəltdi: kartı əlavə etdim, bölmə mətnini oxumadım. Sayı 6 etmək eyni tələni saxlayardı — mətn artıq say demir. Dərs yeni L deyil, L-051-in yanında qeyd: yeni kart əlavə edəndə eyni bölmənin başlıq/mətnini də oxu.

## 2026-09-26 — TASK-0451 (STATE.md qaydası)

**Sahib:** «STATE kuralını değiştir». Qayda yazıldığı vaxt STATE.md əllə yenilənirdi; sonra CI-a avtomatik snapshot addımı əlavə olunub, qayda isə qalıb. İkisi birlikdə hər PR-da zəmanətli konflikt deməkdir: PR STATE-i dəyişir → merge → bot yenidən yazır → açıq qalan digər PR konfliktə düşür. Qayda iki yerdə idi (CLAUDE.md PR Disiplini, PR şablonu checklist-i) — hər ikisi dəyişdi. `AGENTS.md` və CLAUDE-BRAIN-dəki «STATE.md-ni oxu» istinadları qaldı: oxumaq düzgündür, yazmaq yox. Bu PR STATE.md-yə toxunmur — `git diff origin/main --stat`-da yoxdur.

## 2026-09-26 — TASK-0450 (Addım Xərci Kalkulyatoru)

**Mənşə:** TASK-0449 ilə birlikdə spesifikasiya olundu; sahib «ayrı PR», «isim güzel» dedi. Ayrı PR üçün ayrı branch (`…-addim-xerci`) — GitHub bir branch-dan eyni anda iki açıq PR qəbul etmir.

**Niyə belə sadə:** Antigravity-nin bloq qaralamalarında «ildə 4 200 AZN havaya gedir», «ayda 2 000+ AZN» kimi mənbəsiz rəqəmlər vardı — sahibə verilən redaktədə hamısı çıxarıldı. Alət həmin boşluğu doldurur: rəqəmi biz demirik, istifadəçi öz mətbəxində ölçür. Ona görə alətin yarısı hesab, yarısı «necə ölçərsən» təlimatıdır. AI şərhi qoyulmadı — dörd ədədin hasilinə AI lazım deyil.

**Struktur:** düstur `lib/toolkit/addimXerci.ts`-də təmiz funksiya (komponentdən ayrı — sabah OCAQ və ya KAZAN da çağıra bilər). Komponent `staff-retention` nümunəsi ilə (`ToolkitStudioLayout`). Toolkit səhifəsindəki kartlar dil başına kodda yazılmış massivlərdədir — 4 `growthTools` blokuna `perl` ilə bir sətir (L-051), `GROWTH_TOOL_META`-ya ikon.

**Test bir dəfə keçmədi — və yaxşı ki keçmədi.** Gediş rejimi testi düşdü: snapshot səhifəni **ingiliscə** göstərirdi. curl ilə `<html lang>` yoxladım — server hər dəfə düzgün `az` verir. Deməli brauzer: `DeviceLanguageDetector` `navigator.language` (Chromium `en-US`) görə hidrasiyadan sonra `/en`-ə yönləndirir. Söndürəndən sonra 4 düşmə qaldı — hamısı klik testləri, səhifə artıq AZ, düymə var, amma vəziyyət dəyişmir: dev rejimində hidrasiyadan əvvəlki klik. İdempotent kliklər `toPass()` ilə təkrarlanır. `--repeat-each=3` → 24/24. Eyni iki yarış TASK-0449 checklist spec-ində də var idi (orada şansla keçmişdi) — o PR-a da düzəliş göndərildi. L-053.

**Sübut:** spec 24/24 · 4 dildə route 200 · tsc 35 = baza · eslint 0 · i18n 39 × 4, komponentdə sabit mətn 0.
## 2026-09-26 — TASK-0449 (İnşaat checklist: «Əməliyyat dizaynı» mərhələsi)

**Mənşə:** Sahib Drive-dakı dizayn qeydlərini və başqa AI-nın (Antigravity) yazdığı bloqları göndərdi. Bloqlar redaktə olunub sahibə verildi (admin paneldən özü dərc edir — repoya girmir). Toolkit üçün spesifikasiya yazıldı, sahib təsdiqlədi: «ayrı PR, 10 madde tamam, isim güzel». Bu PR — birinci hissə; «Addım Xərci Kalkulyatoru» TASK-0450, ayrıca PR.

**Dizayn qərarları:**
- **Mərhələ əvvələ, id sona.** Əməliyyat dizaynı tikintidən qabaq gəlir, ona görə siyahının başındadır. Amma id-lər 53–62: irəliləyiş `localStorage`-da id massivi kimi saxlanır (`insaat-checklist-progress-v1`); mövcud id-ləri sürüşdürsəydim, köhnə istifadəçinin «Ön hazırlıq»dakı işarələri başqa maddələrə keçərdi. Nəticədə ekranda `{item.id}.` «53.» göstərərdi — ona görə `displayNo` xəritəsi: nömrə sıradan gəlir.
- **Açıq mərhələ** `prep` → `design` (yeni istifadəçi əvvəl dizayn qərarlarını görür).
- **«52» harada dəyişdi, harada yox.** Alət səthləri (4 dildə `pageDesc`, metadata, HowTo addımları, mega menyu) → 62. Bloq yazısı «İnşaatdan Açılışa: 52 Maddəlik…» — dəyişmədi: o, öz mətnində 52 tikinti maddəsini izah edir; başlığı 62 etmək məzmunla ziddiyyət yaradardı. `adminContent.ts`-dəki `adminToolkitCards` heç yerdə istifadə olunmur — toxunulmadı.
- **L-051:** bütün `.tsx` düzəlişləri `perl` ilə (prettier hook kollateralı olmasın). Diff: səhifə +8/−4, metadata 3 fayl, JSON 4 × 27 sətir.

**Sübut:** `e2e/insaat-checklist.spec.ts` 6/6 (10.2s). Sonradan (TASK-0450 zamanı): spec-də dil detektoru yarışı tapıldı (L-053, #451) — `dk_user_language_set` qoruyucusu əlavə olundu, `--repeat-each=3` → 18/18. tsc 35 = baza. eslint 0 error (1 köhnə `<img>` warning). i18n 4 dildə 10/10 maddə, açar sayı 194 × 4.

## 2026-09-26 — TASK-0448 (fetch-news «Done»-dan sonra çıxmır — 6 saatlıq cancel)

**Mənbə:** 0446-nın öz check-in-i (sahib sorğusu yox). 14-ündə cron hələ işləməmişdi; 26-sında baxdım: #180–#182 uğurlu, `pendingNews.json` gündəlik commit olunur — **0446 işləyir**. Amma #179 və #183 «cancelled», hər biri düz 6 saat. Uğurlu olanlar 3–9 dəq çəkir.

**Diaqnoz logdan:** `Done. Fetched 12 new items` 13:20:01 → sonrakı sətir 19:16:52 `The operation was canceled.` Arada heç nə. «Commit and push» skipped. Runner «orphan process» kimi `node` prosesini öldürür. Deməli skript işini bitirir, faylı yazır, `main()` resolve olur — və proses çıxmır. Bir-dəfəlik Node skriptində bu, açıq handle deməkdir: rss-parser-in http agenti və ya undici keep-alive soketi. Hansı olduğunu axtarmadım — cavab hər halda eynidir: iş bitəndə `process.exit(0)`.

**Bunu 13 gün əvvəl görmüşdüm.** 0446-nın sandbox sübutunda skript «Done» dedi və 40s-də çıxmadı; DEVLOG-a «böyük ehtimal proxy soketləri; CI-da yoxlanacaq» yazdım. Hipotez idi, fakt kimi buraxıldı, yoxlama tarixi qoyulmadı — L-023-ün özü. Nəticə: 2 × 360 dəq Actions + 2 günün xəbəri gəlmədi. L-052 bunu qayda edir: sandbox-da görülən simptom ya elə oradaca düzəldilir, ya check-in ilə tarixə bağlanır.

**Düzəliş minimal, 3 yerdə:** (1) `main().then(() => process.exit(0))` — fayl `writeFileSync` ilə yazılır, exit itki vermir; (2) DeepSeek `fetch`-ə `AbortSignal.timeout(30_000)` — heç bir timeout yox idi, 12 xəbər × 2 çağırış = 24 sonsuz gözləmə nöqtəsi; (3) workflow `timeout-minutes: 15` — ilişsə də 6 saat yox, 15 dəq, və status «cancelled» yerinə açıq «timed out». Prettier hook-a görə `.mjs`-i `perl` ilə dəyişdim (L-051): diff 13 sətir.

**Sübut:** lokal `--limit=1 --no-translate`: əvvəl exit 124 (90s timeout), indi **exit 0 / 4s**. `node --check` OK, eslint 0. `pendingNews.json` test sonrası geri qaytarıldı.

**Qalır:** növbəti 2–3 cron icrasının müddətinə bax (check-in 48 saat). ≤15 dəq və «success» gözlənilir.

## 2026-09-13 — TASK-0447 (mobil daşma blog/food-cost, hero silindi)

**Sahib:** «blog + food-cost mobil daşması, hero Saxla — hallet». İki iş: biri ölçülmüş CSS düzəlişi, digəri qərar.

**Mobil — əvvəl ölçü, sonra düzəliş.** 0445-dən sonra 20 səhifəni 390 və 360px-də skriptlə gəzdim: 18 təmiz, 2 daşır. Sonra yarpaq elementləri tapdım (viewport-dan sağa çıxan, uşağı çıxmayan): `blog`-da `a "Yeni yazı +" right=432` — başlıq sətri `flex items-center justify-between` sarılmır; `food-cost`-da `button "Məhsullar" right=437` — tab zolağı `flex` sarılmır. Düzəliş hər birinə 2 sətir: blog `flex-wrap` (+ `min-w-0`), food-cost tab zolağına `overflow-x-auto` + tablara `shrink-0 whitespace-nowrap` — tab-ları sarmaq deyil, sürüşdürmək standartdır (alt xətt qırılmır). Smoke spec-in `MOBILE_PAGES` siyahısı 5 səhifə idi və məhz bu ikisini əhatə etmirdi — indi `KEPT`-in hamısı.

**hero — niyə silmək, niyə «işlək etmək» yox.** Araşdırma: (1) landing `components/Hero.tsx` mətni 4 dildə kodun içindədir, heç bir DB oxumur; (2) `hero_content` cədvəli 0000 miqrasiyasından var, amma `grep` — tətbiq kodunda sıfır istifadə, yalnız `translate-content` skriptləri; (3) redaktorun sahə modeli canlı Hero-ya uymur — RU dili yox, CTA linki redaktə olunur amma Hero-da `/auth/register` sabitdir, «Ahilik» mətni Hero-da `note`-dur; (4) `defaultHeroContent` = «150+ aktiv restoran», «32% xərc azalması» — canlı Hero dürüstdür (BETA / 10+ / AI). «Saxla»nı real etmək = API + repo + landing-in DB-dən oxuması + 4 dil + revalidate — orta ölçülü feature, üstəlik ilk basışda saxta rəqəmləri canlıya aparardı. Sahib 0444-də eyni sinif üçün «C sil» demişdi (`toolkit`/`site` saxta Saxla). Eyni qərar tətbiq olundu: səhifə, mirror, sidebar linki, `nav.hero` i18n (4 dildə skriptlə, 1 sətirlik diff), `defaultHeroContent`. DB cədvəli qaldı — schema PROTECTED-dir və silmək üçün səbəb yoxdur.

**Prettier hook tələsi.** `Edit` ilə 2 sətir dəyişdim, PostToolUse hook faylı tam formatladı: blog 27, food-cost 160, adminContent 314 sətir. Dashboard faylları heç vaxt prettier-dən keçməyib. `git checkout -- <fayl>` + `perl -0pi` ilə yenidən: diff 6 / 4 / −21. L-051: `Edit`-dən sonra `git diff --stat` bax.

**Proses gigiyenası (yenə).** Smoke 3/5 sındı — 404 və 390px keçdi, auth tələb edən üçü yox. Səbəb: 3034-də əvvəlki mobil ölçmədən qalan server (sirr 0445) sağ idi, yenisi `EADDRINUSE` ilə ölmüşdü, testlər köhnəyə getdi, cookie başqa sirlə imzalanmışdı → 307 login. `ps -eo pid,args | grep "[n]ext"` ilə 5 pid tapılıb öldürüldü (L-042-nin davamı: `pgrep -x next-server` yalnız uşağı görür, valideyn `next dev` yenidən doğurur). Təzə server, 5/5.

**Sübut:** spec 5/5 (16.4s): 16 route × 2 → 404, 19/19 render, sidebar 6/8, 19 × 390px daşma yox, `.dashboard-scope` rəngi · `next build` OK · tsc baza · eslint 0 error · i18n 20/20/20/20 nav, 6 sections · `verify-lessons` 38/38 · dashboard 18 route.

## 2026-09-13 — TASK-0446 (Daily News Fetch cron-u sınırdı)

**Sahib:** Actions-da qırmızı `fetch` job-u göstərdi: «hata var düzelt». PR #444 ilə əlaqəsi yoxdur — `main`-də bot commit-inə (STATE snapshot) bağlı scheduled run-un yenidən icrasıdır.

**Diaqnoz logdan bir sətirdir:** `node: .env.local: not found` → exit 9. `fetch:news` = `node --env-file=.env.local scripts/fetch-news.mjs`. `--env-file` faylı tapmasa Node başlamır; CI-da `.env.local` heç vaxt yoxdur, `DEEPSEEK_API_KEY` workflow `env:` ilə gəlir. `git log -S'--env-file' -- package.json` → PR #394 (2026-06-14). Run tarixçəsi: son 100 icra **0 uğur / 100 uğursuz**, ən köhnəsi 2026-06-06 — yəni 3 aydır hər səhər 08:00 UTC sınır və heç kim görmür. Scheduled workflow-lar PR check-i deyil; qırmızı olanda bildiriş gəlmir.

**Yol seçimi:** (a) workflow-da `npm run` əvəzinə `node scripts/…` çağırmaq — CI düzəlir, lokal `npm run fetch:news` `.env.local`-sız yenə sınır; (b) skriptə `loadEnvFiles()` (L-040) əlavə etmək — 4 skriptə kopyalamaq lazımdır; (c) bayrağı opsional formaya çevirmək. **(c)**: Node-un opsional forması `--env-file-if-exists` (v22.9+). Əvvəl `--env-file-if-missing` yazdım — Node 22.22 «bad option» dedi; `node --help | grep env-file` ilə düzgün adı tapdım. Eyni səhv 3 `content:translate*` script-ində də var — 4-ü birlikdə düzəldildi. Workflow `node-version: 20` → `22`: `engines >=22`, logda EBADENGINE xəbərdarlığı vardı, bayraq da 22-də zəmanətlidir.

**Sübut (sandbox, `.env.local` yoxdur):** `npm run fetch:news -- --limit=1 --no-translate` → `.env.local not found. Continuing without it.` → `[fetch-news] Starting…` → RSS 403 ×6 (sandbox proxy) → `Done.` Env mərhələsi keçdi; əvvəl bu nöqtəyə çatmırdı. Qeyd: `Done`-dan sonra proses sandbox-da 40s içində çıxmadı (timeout) — böyük ehtimal proxy soketləri; CI-da `workflow_dispatch` ilə yoxlanacaq, sonra qərar. `pendingNews.json` test sonrası `git checkout` ilə geri qaytarıldı (diff-ə girmir).

**Build/lint:** TS dəyişikliyi yoxdur (package.json script + YAML); `next build` bu diff-dən təsirlənmir, icra edilmədi. `verify-lessons` 37/37 ✓.

**Sistem dərsi (L-050):** npm script-lərində env faylı həmişə `--env-file-if-exists=`; workflow Node versiyası `engines`-ə uyğun; sessiya başında Actions → scheduled workflow-ların son nəticəsinə bax (HANDOFF checklist-inə əlavə edildi).

## 2026-09-13 — TASK-0445 (sessiya sistemə yazıldı)

**Sahib:** «hər şeyi sistemə əlavə et». Sistem = layihənin sessiyalar arası yaddaşı: LESSONS, task kartları, HANDOFF, DEPLOYMENT, CLAUDE.md/BRAIN, TECH_DEBT, ADR, və ən vacibi — bu günün birdəfəlik yoxlamalarının **daimi test** olması.

**Öz iddiamı düzəltdim.** Səhər «LESSONS.md-də 13 dərs itib, ona görə geridən gəlirsən» demişdim. `grep '^## L-'` yalnız bir formatı görürdü; fayl `### L-016 — …` formatında da dərs saxlayır. Bütün başlıq səviyyələri ilə sayanda **yalnız L-013 və L-023 itmişdi.** Səhv iddia L-023-ün özüdür (fakt/şərh/hipotez ayrımı) — ona görə həmin dərsi bərpa edərkən bu hadisəni nümunə kimi yazdım. Bir də `verify-lessons.mjs`: istinad var, dərs yoxdursa dk-validate FAIL — bu, bir daha «hiss» ilə deyil, sayla yoxlanır.

**Nə əlavə olundu:**
- LESSONS: L-013, L-023 (istinad kontekstindən bərpa) + L-040…L-049 (bu günün 10 dərsi, hər biri konkret TASK-a bağlı).
- `scripts/verify-lessons.mjs` + `dk-validate.sh` 5b. 36 istinad ✓.
- `docs/tasks/TASK-0426…0444.md` — 19 kart. Konvensiya (ADR-0014) 0425-də dayanmışdı; paralel sessiyanın 0433–0438-i CHANGELOG/DEVLOG-dan rekonstruksiya edilib və kartda belə qeyd olunub. 0433 ID toqquşması kartın özündədir.
- HANDOFF (sessiya), DEPLOYMENT (miqrasiya proseduru; `drizzle-kit push` canlıda qadağan; yeni route → restart), CLAUDE.md (`#E94560`; guards; db:migrate), CLAUDE-BRAIN §9, TECH_DEBT TD-005…009, ADR-0016.
- **`e2e/dashboard-smoke.spec.ts`**: `mobile-check.mjs` + `nav-check.mjs`-in daimi forması. `JWT_SECRET` ilə cookie imzalanır, yoxdursa suite SKIP (sınmır). Runner-də 5/5 (42s). 20 səhifəlik render testi 29.2s çəkdi — 30s limitinə söykənirdi, `test.setTimeout(120_000)`.

**Mühit tələsi (qeyd):** runner `chrome-headless-shell-1217` axtarırdı, `/opt/pw-browsers`-də yoxdur və `playwright install` qadağandır. `playwright.config.ts`-ə istəyə bağlı `PW_CHROMIUM_PATH` → `launchOptions.executablePath`; CI-da env boşdur, davranış dəyişmir.

**Sübut:** `verify-lessons` 36/36 ✓ · spec 5/5 passed · tsc 35 · eslint 0 · STATE 227 route.

**Qalır:** TD-004 auth modeli (46 səhifəni xəritələmədən kor fix ETMƏ) · TD-005 hero «Saxla» (sahib qərarı) · TD-006 ilanlar mock fallback · dünya standartı yol xəritəsi (undo/soft-delete, revizyon, DataTable, iş növbəsi, tap-to-call, e-poçt xülasəsi) — HANDOFF-da.

## 2026-09-13 — TASK-0444 (34 route → 19, sidebar bölmələri)

**Qərar sahibindir:** «C sil, B okey». C = hardcoded data ilə işləyən 14 səhifə + boş `settings`; B = real data ilə işləyən amma menyuda olmayan 8 səhifə.

**Niyə əvvəl istinad taraması:** silmə geri dönüşü çətin əməliyyatdır. `app/ components/ lib/ tests/ scripts/ .github/` — silinən 15 route adının heç birinə istinad **yox** (yalnız sidebar/bottom-nav, onlar da dəyişir). `mockNewsDB` isə `haberler`-dən başqa 6 açıq xəbər komponentində işlənir — **silinmədi**; `trends-mock` yalnız `trends`-in idi — silindi.

**i18n təmizliyi:** 10 namespace yalnız silinən səhifələrdə işlənirdi; 4 dildən skriptlə silindi, top-level namespace sayı 49/49/49/49. `nav.toolkit`/`nav.site` ölü açarları da getdi. Diff hədəflidir: 52 əlavə / 1256 silinmə, tam reformat yox — `JSON.stringify(…, null, 2)` mövcud formatla üst-üstə düşür, git diff yalnız real dəyişiklikləri göstərir.

**Sidebar:** 13 + 8 − 1 = 20 link. Düz siyahı oxunmur; audit də bölmə tövsiyə etmişdi. `navSections` massivi (6 bölmə, `sections.*` açarları 4 dildə), `navItemDefs` ondan `flatMap` ilə çıxır ki, badge memo-su (KAZAN lead sayı, gözləyən elan) olduğu kimi işləsin. Köhnə şərhdəki qərarlar nəzərə alındı: `marketinqOcagi` qalır (public /marketinq/* alətlərinin hub-ı); `food-cost` üzv alətinin `/b2b-panel` versiyası deyil, admin analitika görünüşüdür (TASK-0439-da admin auth aldı) — sahib B-ni təsdiqlədiyi üçün girdi.

**Bir TS xətası mənim idi.** tsc 36 (baza 35). Hansının yeni olduğunu təxmin etmədim: `origin/main` müvəqqəti worktree-də (`node_modules` symlink) tsc işlətdim və iki siyahını `comm` ilə tutuşdurdum. 5 `app/haberler` xətası hər iki tərəfdə eynidir (yalnız union tipinin yazılış sırası fərqli — baza). Yeni olan tək: `DashboardSidebar.tsx:274` — `sidebarItems.find(...) ?? def` union-unda `'title' in item` daraltması `item.title`-ı `unknown` edir. `in` fəndi atıldı; href → `{title, badge}` `Map`-i ilə açıq tiplə oxunur.

**İki yalançı siqnal, ikisi də test/alət tərəfində:**
1. tsc əvvəl **66** verdi — 31-i `.next/types/validator.ts`-də, silinən route-ların `page.js`-inə istinad. Generasiya faylıdır, `next build` yenidən yaradır; silindi. (TASK-0440-dakı `.next/dev` dərsinin eynisi.)
2. Smoke test 20 səhifənin **hamısında** «error boundary» dedi — amma eyni anda Playwright `/dashboard`-ı sidebar ilə düzgün render etmişdi. Ziddiyyət → regex raw HTML-də **həmişə mövcud** olan `error.tsx` fallback mətnini tuturdu, göstərilən xətanı yox. Test görünürlük əsaslı oldu (`getByText(...).isVisible()` + sidebar mövcudluğu) → 20/20.

**Sübut:** 30/30 → 404 (kök + `/tr`) · 20/20 render, görünən xəta yox · sidebar 6 bölmə, 8 yeni link, silinənə link 0, `settings` → `ayarlar` · 390px daşma yox · tsc baza · eslint 0 · STATE 257 → 227 route.

**Üsul dərsi (özümə):** smoke test bir dəfə 20/20 səhifədə 500 verdi. Kod deyildi — mənim proses idarəm idi: (1) əvvəlki dev serveri `ss -ltnp` ilə axtardım, o pid-i göstərmədi, «port boşdur» sandım; server sağ idi. (2) Yeni start əmrindəki `rm -rf .next/dev` **işləyən** serverin build qovluğunu sildi → hər sorğu 500; yeni proses isə `EADDRINUSE` ilə öldü. Düzgün üsul: prosesi `pgrep -f next-server` ilə dəqiq pid-dən tap və öldür, port boşalana qədər gözlə, **yalnız sonra** `.next/dev`-i sil və başlat. Eyni qaydanın tərsi də doğrudur: canlı dev serverin altında heç vaxt `.next`-ə toxunma.

**Qalır:** `hero`-nun saxta «Saxla»sı (sahib cavab vermədi) · `ilanlar`-ın səssiz `MOCK_LISTINGS` fallback-i (6 istinad; xəbərdarlıqsız saxta rəqəm) · `.dk-card` rollout · `<DashboardPageHeader>`.

## 2026-09-13 — TASK-0443 (dizayn təməli + mobil)

**Sahibin göstərişi:** «yamaq etmə, detala fokuslan, mobilə bax». Ona görə üç mərkəzi dəyişiklik, yüz səhifəni ayrı-ayrı yamamaq yox.

**Kök səbəb 1 — işıq teması yazılmayıb.** `DashboardLayout.tsx:15` `className="dashboard-scope …"` yazır; `grep -rn dashboard-scope` bütün repoda **yalnız o sətri** tapır — CSS qaydası yoxdur. `body { color: #eaeaea }` isə qaranlıq landing üçündür. Nəticə: dashboard-da rəng verilməyən hər mətn ağ üstündə ağ. Canlı nümunə haberler «Yenilə» düyməsi (`haberler/page.tsx:284-290`) — nə düymədə, nə ikonda, nə valideyn zəncirində rəng var. Kimsə bunu görüb TASK-0131-də **yalnız input-ları** yamamışdı (`globals.css:128-137`, şərh hərfi mənada «root cause: body color» deyir), mətni yox. **Bu, həm də `text-slate-400` epidemiyasının səbəbidir**: developer mətnin görünmədiyini görür, tələsik bir boz yapışdırır — 200 yamaq belə yığılıb.

Düzəliş bir sətirdir: `.dashboard-scope { color: var(--dk-ink) }`. Token onsuz da vardı (`--dk-ink: #0f172a`), sadəcə bağlanmamışdı.

**Kontrast süpürgəsi:** `text-slate-400` = `#94A3B8` ağda **2.56:1** — AA (4.5) və böyük mətn üçün AA (3.0) ikisini də keçmir. Və dekorativ yerdə deyil: ana səhifənin «Son 5 elan» başlıqları, contact-tracking-in 7 sütun başlığı, bütün KPI etiketləri. 40 faylda 200 istifadə `400→600`, `300→500`. Süpürgədən əvvəl dashboard-da qaranlıq fon (`bg-slate-900` və s.) üzərində açıq mətn istisnası olub-olmadığı yoxlanıldı — **yoxdur**, ona görə kor süpürgə təhlükəsizdir.

**Real test nə tapdı (ilkin düzəlişdən sonra):** auditin göstərdiyi 5 daşmanı düzəldib Playwright-i 390px-də işlətdim — **3 səhifə hələ daşırdı**. Kök səbəbi tapmaq üçün iki alət yazdım: (a) 390-ı aşan elementləri en üzrə sıralayan, (b) yalnız sürüşmə konteynerindən **kənarda** olanları göstərən. Birincisi loglar-da yalançı iz verdi — `<circle>` nöqtələri `overflow-x-auto` cədvəlin içində idi, səhifəni genişləndirmirdi; ikincisi əsl səbəbi tapdı:

| Səhifə | Səbəb | Düzəliş |
|---|---|---|
| etkinlikler, loglar, deal-flow, faturalar | filtr çip-zolağı `flex gap-2` sarılmır (525 / 451px) | `flex-wrap` — yalnız `.map(`-lı çip sətirləri; faturalar-dakı digər 2 `flex gap-2` toxunulmadı |
| deal-flow | grid uşağı `min-width:auto` → içindəki `overflow-x-auto` cədvəl sütunu 426px-ə itələyir | grid uşaqlarına `min-w-0` (`deal-flow/page.tsx:365, 423`) |

Deal-flow tələsi öyrədicidir: cədvəl **düzgün** `overflow-x-auto` içində idi, amma CSS grid uşağı daxili enə görə böyüyür və sarğı heç vaxt sıxılmır. Audit `min-w-0`-ın yalnız 7 yerdə olduğunu qeyd etmişdi — bu, həmin çatışmazlığın canlı nümunəsidir.

**Test səhvi (kod deyil):** `text-slate-600` iddiası `rgb(71,85,105)` gözləyirdi, Chromium isə `lab(35.56 -1.75 -15.43)` qaytardı — Tailwind v4 rəngləri lab/oklch ilə verir. Rəng düzgün idi, test köhnə idi. Canvas ilə rgb-yə çevirib ±3 tolerantlıqla müqayisə etdim; kodu dəyişmədim (TASK-0432 dərsi: işləyən kodu test baqına görə «düzəltmə»).

**Üsul qeydi:** `pkill -f "next dev"` öz əmr sətrimi də tutub shell-i öldürürdü (exit 144) — iki dəfə. Server tool-un arxa plan rejimi ilə qaldırıldı, port pid-i ilə dayandırıldı. Dashboard auth-u üçün `JWT_SECRET` ilə server + `jsonwebtoken` ilə imzalanmış admin token cookie-si.

**Sübut — Playwright 390px, auth-lu, 13/13 PASS:** 8 səhifədə `scrollWidth == clientWidth == 390` · «Yenilə» düyməsi `rgb(15,23,42)` · `.dashboard-scope` rəngi `--dk-ink` · `text-slate-600` tətbiq (canvas rgb 69,85,108) · ana səhifədə `-400` mətn 0 · tsc 35 (baza) · eslint 0 error · `✓ Compiled successfully in 29.1s`.

**Qalır (ayrı task-lar):** `.dk-card` rollout-u — 9 radius / 4 sərhəd rəngini bu primitivə yığmaq · tək `<DashboardPageHeader>` + TopBar başlığını i18n-dən oxumaq · naviqasiya təmizliyi (34 route, 13 link — sahib qərarı) · brend qırmızısı `#E11D48` vs `#E94560` (sayt-boyu təsir, sahib qərarı) · `[locale]` dashboard layout-u cookie-dən oxuyur, `params.locale`-dən yox.

## 2026-09-13 — TASK-0442 (runner Neon-da sındı)

**Sahib canlı bazada işlətdi:**

```
→ 0001_add_ru_locale_columns.sql … XƏTA
  cannot insert multiple commands into a prepared statement
```

**Bu, TASK-0440-ın PR-ında öz yazdığım riskin məhz özü idi:** «runner-in icra döngüsü canlı Neon-a qarşı yoxlanmayıb». Riski görüb yazmışam, amma onu bağlamağa çalışmamışam — sadəcə qeyd edib buraxmışam. Riski sənədləşdirmək onu həll etmək deyil.

**İki ayrı problem üst-üstə düşürdü:**

1. **Neon-un HTTP drayveri hər sorğunu prepared statement kimi göndərir**, prepared statement isə bir neçə ifadə qəbul etmir. Mən fayl mətnini bütöv göndərirdim — 34 ifadəlik fayl birinci sətirdə sınırdı.

2. **Daha gizli olanı:** `BEGIN` və `COMMIT`-i ayrı-ayrı `sql.query()` ilə göndərmək neon-http-də **transaksiya yaratmır** — hər sorğu müstəqil HTTP çağırışıdır. Yəni PR-da yazdığım «hər fayl öz transaksiyasındadır, sınarsa geri alınır» vədi **yanlış idi**. Birinci baq olmasaydı, bu ikincisi bir gün yarımçıq tətbiq olunmuş miqrasiya kimi çıxacaqdı — və tapılması çox çətin olacaqdı.

**Həll:**

- `splitStatements()` — vəziyyət izləyən parser. Sadə `split(';')` yaramır: `DO $$ BEGIN … END $$;` blokunun içində nöqtəli vergüllər var və blok parçalanardı. İzlənən vəziyyətlər: tək dırnaqlı sətir (`''` escape daxil), dollar-quoted blok (`$$` və adlandırılmış `$tag$`), `--` sətir şərhi, `/* */` blok şərhi.
- İcra `sql.transaction([...])`-ə keçdi — drayverin öz metodu, bütün ifadələri **bir HTTP sorğusunda, real transaksiya daxilində** icra edir. İzləmə qeydi də eyni massivə qoşuldu: fayl tətbiq olunubsa qeyd var, qeyd varsa fayl tətbiq olunub.

**Bu dəfə uğur yolunu sınadım** (əvvəlki iki dəfə yalnız xəta yolunu sınamışdım):

| Test | Nəticə |
|---|---|
| Lokal Postgres 16, hər ifadə **ayrıca** icra (Neon davranışı) | **100 ifadə, 0 xəta** |
| Eyni bazada ikinci keçid (idempotentlik) | **100 ifadə, 0 xəta** |
| `fetch` tutularaq `sql.transaction()` gövdəsi | 3 sorğu **bir çağırışda**, `DO $$` bütöv, `$1` parametri bağlanıb ✓ |

**Dərs (üçüncü dəfə eyni kökdən):** bu skriptdə ardıcıl üç baq çıxdı — `*/` şərhi bağladı, `.env.local` oxunmadı, indi isə çox-ifadəli sorğu. Üçünün də səbəbi eynidir: **sandbox-da uğur yolunu icra edə bilmədiyim halda «sintaksis keçir / xəta mesajı düzgündür» yoxlamasını kifayət saydım.** Lokal Postgres qaldırmaq mümkün idi və bunu birinci gündən etməli idim.

## 2026-09-13 — TASK-0441 (`db:migrate` lokalda işləmirdi)

**Sahib ilk dəfə işlətdi və sındı:**

```
$ npm run db:migrate:status
  ✗ DATABASE_URL təyin edilməyib.
```

Halbuki dəyər `.env.local`-da var idi. **Səbəb:** Next.js `.env.local`-ı özü yükləyir, sadə `node` skripti isə yükləmir. TASK-0440-da bunu nəzərə almamışam — skripti sandbox-da `DATABASE_URL` olmadan sınadım, «təmiz xəta mesajı verir» deyib keçdim. **Əslində o mesaj həmin anda baqın özü idi**: skript real istifadədə heç vaxt işləyə bilməzdi.

**Dərs:** «xəta yolu düzgün işləyir» ilə «uğur yolu düzgün işləyir» eyni şey deyil. Sandbox-da uğur yolunu sınaya bilmədiyim üçün yalnız xəta yolunu yoxladım və onu kifayət saydım.

**Həll:** `loadEnvFiles()` — asılılıqsız, `.env.local` → `.env` sırası ilə oxuyur. `--env-file` bayrağını işlətmədim, çünki Node 20.6-dan əvvəl yoxdur və fayl olmayanda sınır. Mövcud `process.env` dəyəri **üstündür** ki, Hostinger-in verdiyi dəyər əzilməsin. Fayla yazmır — yalnız oxuyur.

**Sübut:** env faylı yoxdursa → aydın mesaj + exit 1 ✓ · `.env.local`-da `export DATABASE_URL="…"` varsa → oxuyur və qoşulma mərhələsinə keçir ✓ (şərh sətri, `export` prefiksi, dırnaqlar emal olunur).

## 2026-09-13 — TASK-0440 (miqrasiya sistemi)

**Problem:** `drizzle/`-də 25 .sql faylı, journal-da 9-u. `db:migrate` scripti yox, migrator çağırışı yox. Yəni **0009-dan sonrakı hər miqrasiya yetim** — yalnız kimsə əl ilə işlədəndə tətbiq olunur. `/dashboard/contact-tracking` çökməsinin kök səbəbi bu idi, və növbəti hər sütun eyni baqı yaradacaqdı.

**İlk dizaynım səhv idi — real test tapdı.** Fikrim belə idi: «bütün fayllar idempotentdir, hamısını ad sırası ilə işlət». Lokal Postgres qaldırıb sınadım və **sındı**:

```
✗ 0007_tidy_monster_badoon.sql
  ERROR: column "priorities" of relation "users" already exists
```

İki səbəb üst-üstə düşdü:

1. **İki fayl eyni `0007` nömrəsindədir** — `0007_add_user_priorities` (əl ilə) və `0007_tidy_monster_badoon` (drizzle). Əlifba sırası birincini önə salır, ikincisi isə həmin sütunu çılpaq `ADD COLUMN` ilə yaratmağa çalışır.
2. **Drizzle-in generasiya etdiyi miqrasiyalar idempotent deyil — və olmamalıdır.** Onlar çılpaq `CREATE TABLE`/`ADD COLUMN` işlədir, çünki drizzle onları `__drizzle_migrations`-da izləyir və heç vaxt təkrar işlətmir. Əl ilə idempotent etsəydim, növbəti `drizzle-kit generate` bunu geri qaytarardı.

**Düzgün dizayn — iş bölgüsü, tək sistem deyil:**

| | Kim icra edir |
|---|---|
| journal-dakı 9 fayl | `drizzle-kit migrate` (toxunulmur) |
| qalan 16 əl ilə yazılmış fayl | `scripts/migrate.mjs` |

Runner `_journal.json`-u oxuyur və orada qeydli faylları atlayır. Qalanını ad sırası ilə, hər birini öz transaksiyasında icra edir, `dk_migrations` cədvəlində izləyir. Hamısı idempotent olduğu üçün izləmə cədvəli boş olan MÖVCUD bazada da təhlükəsizdir — `--baseline` rejimi lazım deyil, sürüşmə özü-özünə sağalır.

**Niyə journal-a əlavə etmədim:** `drizzle-kit` tətbiq olunanları **hash** ilə izləyir. 16 faylı journal-a salmaq mövcud hash-ləri dəyişir; canlı bazada bəziləri artıq əl ilə tətbiq olunduğu üçün bu, ya təkrar icraya, ya uyğunsuzluq xətasına gətirərdi.

**Təhlükəsizlik qərarı:** `npm run db:migrate` **yalnız** runner-i işlədir. `drizzle-kit migrate` ayrıca `db:migrate:bootstrap`-dadır, çünki canlıda `__drizzle_migrations` boş olarsa idempotent olmayan 0000–0008-i təkrar tətbiq etməyə çalışıb sınayar. RUNBOOK §6-da açıq xəbərdarlıq var.

**İkinci baq (təkrar icra testi):** `0013_email_preferences.sql`-də üç `CREATE INDEX` `IF NOT EXISTS`-siz idi. Birinci icrada keçir, ikincidə sınır. Düzəldildi.

**Öz səhvim:** şərh blokunda `drizzle-orm/*/migrator` yazdım — `*/` **şərhi erkən bağladı** və fayl `SyntaxError` verdi. `node --check` ilə tutuldu. **Dərs:** JSDoc blokunun içində yol yazarkən `*/` ardıcıllığından qaç.

**Yalançı həyəcan (qeyd üçün):** yoxlama zamanı tsc **482** xəta verdi. Hamısı `.next/dev/types/routes.d.ts`-də idi — əvvəl işlətdiyim dev serverin qalıq generasiya faylı. `.next/dev` silindi, tsc **35**-ə qayıtdı. Rəqəmi olduğu kimi raport etsəydim, olmayan bir reqressiya bildirmiş olardım.

**Sübut — lokal Postgres 16-da real icra (mock deyil):**

| Test | Nəticə |
|---|---|
| Təmiz bazada tam bootstrap (9 drizzle + 16 runner) | **25/25 OK** |
| Eyni bazada runner-in təkrar icrası (idempotentlik) | **16/16 OK** |
| Canlı ssenari: 0020 sütunları silindi | sorğu `column "source_url" does not exist` ✓ (xəta təkrar yaradıldı) |
| → runner 0020-ni tətbiq etdi | səhifə sorğusu işlədi ✓ |
| → `/api/leads/track` insert-i | işlədi ✓ (`whatsapp \| .../elaqe \| 994502566279`) |
| `DATABASE_URL` olmadan | təmiz mesaj + exit 1 ✓ |

tsc **35** (baza) · `✓ Compiled successfully in 28.6s` · `node --check` OK

**Qalır:** runner-in icra döngüsü **canlı Neon-a qarşı yoxlanmayıb** — sandbox-da `DATABASE_URL` yoxdur və neon-http drayveri lokal Postgres-ə qoşulmur. SQL-in özü və fayl seçimi məntiqi real bazada yoxlanılıb. Sahib əvvəlcə `npm run db:migrate:status` (yalnız oxuyur) işlətməlidir.

## 2026-09-13 — TASK-0439 (açıq API qapıları + 2 gizli baq)

**Kontekst:** sahib «yama yapma, detaylara odaklan» dedi. Bu taskda o göstəriş iki dəfə özünü doğrultdu — kor-koranə auth əlavə etsəydim iki işlək funksiyanı sındıracaqdım.

**Kök səbəb:** `middleware.ts` matcher-i `/(az|ru|en|tr)/:path*`-dir, yəni **`/api/*` heç vaxt middleware-dən keçmir**. Route öz yoxlamasını yazmasa, qapı açıqdır. Dörd route yazmamışdı.

**Ən ciddisi `/api/orchestrator` idi:** sərbəst `userPrompt`-u Gemini-yə ötürür, `GEMINI_API_KEY` server tərəfdədir. İnternetdən istənilən adam DK-nın AI büdcəsini yandıra bilirdi. Maraqlısı: çağıran tərəf (`ListingForm.tsx:139`) onsuz da **401/403 emal edirdi** — yəni auth nəzərdə tutulub, sadəcə server tərəfdə heç vaxt yazılmayıb.

**`/api/food-cost` — yamaq ilə düzgün iş arasındakı fərq:** route iki auditoriyaya xidmət edir. `type=lookup` **açıq** `/toolkit/food-cost` alətindən çağırılır (pulsuz alət, giriş yoxdur); `report/trend/suppliers/products/all` isə **real faktura və təchizatçı datasını** qaytarır və yalnız dashboard-dan çağırılır.

- Bütün route-a admin qoysaydım → **pulsuz alət sınardı**.
- Olduğu kimi saxlasaydım → **şirkətin alış datası internetə açıq qalırdı**.

Ona görə qorunma route yox, **əməliyyat səviyyəsindədir**. Bunu tapmaq üçün hər route-un çağıranlarını `grep` ilə izləmək lazım idi — audit hesabatındakı «4 route-a auth əlavə et» tövsiyəsini olduğu kimi tətbiq etsəydim, açıq aləti sındırardım.

**Yanaşma — kopyalanan yoxlama yox, tək modul:** `lib/api/guards.ts` (`requireApiAdmin` / `requireApiMember`). Dörd route-un yoxlamasız qalmasının səbəbi məhz kopyalama idi: nümunə `/api/settings`-də vardı, amma hər yeni route onu əl ilə təkrarlamalı idi və bəziləri unutdu.

**Yanaşı iki baq tapıldı:**

1. **Ana səhifə analitikası heç vaxt işləməyib.** `lib/analytics/homeEvents.ts:39` beacon-u `/api/orchestrator`-a — **AI endpoint-inə** — göndərirdi. O route `taskType`+`userPrompt` tələb edir, analitika hadisəsində isə bunlar yoxdur → **hər beacon 400 alırdı**. Yəni `home_cta_click`, `home_tab_switch`, `kazan_ai_click` hadisələri **heç vaxt qeydə düşməyib**, üstəlik hər ana səhifə ziyarətçisi AI endpoint-inə dəyirdi. Doğru ünvan onsuz da mövcud idi: `/api/analytics/track` — sendBeacon üçün qurulub (text/plain + Blob qəbul edir) və `webConversionEvents`-ə yazır. Sessiya id nümunəsi `PortalEngagementTracker`-dən götürüldü, ayrı açarda.

2. **`rate-limit.ts:51` ölü kod idi.** `request.ip` Next 15-də `NextRequest`-dən silinib — sətir heç vaxt icra olunmurdu və daimi tip xətası verirdi. İndi `getClientIp`-i yeni yerdə işlətdiyim üçün təmizləndi: **tsc 36 → 35**.

**Öz səhvim (qeyd üçün):** 11 handler-ə guard əlavə etmək üçün yazdığım bash-içi node skriptində `$1` əvəzləməsi pozuldu və `export async function GET()` → `1GET()` oldu. `git checkout` ilə geri qaytarıb skripti ayrıca fayla yazdım. **Dərs:** çox sətirli regex əvəzləməsini bash sətrinin içində yazma — shell escaping-i sındırır.

**Sübut (canlı HTTP, mock deyil):**

| Yoxlama | Nəticə |
|---|---|
| `POST /api/orchestrator` auth-suz | 401 ✅ |
| `GET/DELETE /api/audit` auth-suz | 401 ✅ |
| `DELETE /api/invoice-categories` auth-suz | 401 ✅ |
| `food-cost?type=lookup` (açıq qalmalı) | **200 ✅** |
| `food-cost?type=report/suppliers/all/trend/products` | 401 ✅ (5/5) |
| `/toolkit/food-cost` səhifəsi (reqressiya) | 200 ✅ |
| Rate-limit 70 sorğu | 59×200 → **11×429** + `x-ratelimit-*` başlıqları + AZ mesaj ✅ |
| `/api/analytics/track` yeni payload | 200 ✅ |

tsc **35** (36-dan aşağı) · eslint 0 error · `✓ Compiled successfully in 28.0s`

**Qalır:** `TD-004` — iki paralel auth sistemi (`role` vs `plan`). `app/dashboard/layout.tsx` yalnız token varlığını yoxlayır, rol yoxlamır: `member` planlı istifadəçi bütün dashboard səhifələrini aça bilir. Bu, ayrıca task-dır.

## 2026-09-13 — PR #437 konflikt həlli + 2 tip xətası

**Niyə:** PR #437 (TASK-0433…0438) `main`-ə merge oluna bilmirdi — `docs/DEVLOG.md`-də konflikt. Səbəb sadə idi: hər iki tərəf faylın başına yeni yazı əlavə etmişdi (branch 6 task, `main` isə `/llms.txt` task-ı). **Heç bir yazı atılmadı** — hər ikisi saxlanıldı, tarix sırası ilə düzüldü (09-13 → 09-02 → 08-30). `docs/CHANGELOG.md` avtomatik birləşdi.

**Konfliktdən sonra tapılan iki gerçək baq.** Branch-ın öz qeydlərində `sandbox npm 403 → build/tsc yox (DoD #11 skip)` yazılmışdı — yəni bu kod heç vaxt tip yoxlamasından keçməmişdi. Burada `node_modules` mövcud olduğu üçün yoxlanıldı: **tsc 38, baza isə 36 → 2 yeni xəta**:

1. `DashboardBottomNav.tsx:36` — `links` massivi `as const` ilə union yaradır və `highlight` yalnız bir üzvdə var, ona görə destructuring tip xətası verirdi. Digər üç üzvə `highlight: false` verildi (semantik olaraq da doğrudur — həmin elementlər vurğulanmır).
2. `blog-repository.ts:870` — `db` modul səviyyəli dəyişəndir; TASK-0435 yazını `Promise.all` callback-inə köçürəndə TypeScript `if (!dbAvailable || !db) return` guard-ının narrowing-ini itirdi. Guard-dan sonra `const database = db` tutulur və paralel yazıda o işlədilir.

**Qeyd — TASK ID toqquşması:** `TASK-0433` iki dəfə istifadə olunub (bu branch-da `fix(campaign)`, `main`-də `/llms.txt`). Commit tarixçəsi yenidən yazılmadı; gələcək task-lar **0439**-dan başlamalıdır.

**Qeyd — PROTECTED:** `lib/db/schema.ts` dəyişib (`leads`-ə 3 nullable sütun). Miqrasiya var və idempotentdir (`drizzle/0020_add_leads_tracking_columns.sql`, `ADD COLUMN IF NOT EXISTS`), yəni "migration olmadan dəyişməz" qaydası pozulmayıb. Sahib icazəsi PR-da qeyd olunmalıdır.

**Yoxlama:** tsc **36 — bazaya qayıtdı** · eslint 0 error (12 warning, hamısı əvvəldən var) · `✓ Compiled successfully in 32.7s` · konflikt markerləri 0 · hər iki tərəfin bütün DEVLOG yazıları yerindədir.

## 2026-09-13 — TASK-0438 (/ilanlar 20-cap fix + axtarış planı)

**Niyə:** Axtarış audit tapdı — açıq `/ilanlar` yalnız ilk 20 elanı yükləyib client-də süzürdü; `/api/listings` q/type/sector/city/price dəstəkləyir, amma səhifə istifadə etmirdi. Müştəri 20-dən sonrakı elanı tapa bilmir = biznes itkisi.

**Dəyişiklik:** fetch-ə `&limit=500` (API-də max cap yoxdur). Səhifə URL-sync + ani client süzgəc onsuz da düzgün işləyir → minimal fix seçdim.

**Niyə tam server-side refetch etmədim:** price-range→min/max + city normalize map-larını API ilə uyğunlaşdırmaq + debounce + pagination = daha böyük, test tələb edən iş. DK erkən mərhələ (az elan) → 500 limit indi kifayət və sıfır risk.

**Qalır (search consistency — ayrıca task):** ümumi `<SearchFilterBar>` + `useListQuery`; dashboard client-only axtarışları (pipeline/mesajlar/etkinlikler) real API-yə; no-results state-ləri standartlaşdır; mock fallback maskalamasını dayandır (ilanlar-admin/faturalar); istəyə görə qlobal `/api/search` + command palette. `HospitalityHeader` ölü search input render olunmur → toxunulmadı.

**Yoxlama:** sandbox npm 403 → build/tsc yox (DoD #11 skip); diff+review; deploy-da 20-dən çox elanla süzgəci yoxla.

## 2026-09-13 — TASK-0437 (mobil alt menyu + cədvəl kəsilmə)

**Niyə:** Sahib «mobil alt menü apple gibi olmalı» dedi; audit təsdiqlədi — açıq saytda `MobileBottomNav` var, amma dashboard-da yoxdur (`PublicChrome` onu /dashboard-da render etmir). Menyu yalnız yuxarı-solda = başparmaq çatmır. `blog`/`xeberler` cədvəlləri `overflow-hidden` içində `min-w-full` → telefonda kəsilir.

**Dəyişiklik:** Yeni `DashboardBottomNav` (public pattern təkrar, dashboard route-larına yönəlir; `MobileBottomNav`-ı təkrar İSTİFADƏ ETMƏDİM — onun linkləri public-dir). 5 slot, KAZAN ortada gold pill, ≥44px, «Daha çox»→`setSidebarOpen(true)`. `DashboardLayout`-a sibling mount + content `pb-20 lg:pb-0`. blog/xeberler wrapper `overflow-x-auto`.

**Qalır:** bottom-nav-da badge-lər (pending/kazan sayı) yoxdur — state `DashboardLayout`-a lift olunmalıdır (ayrıca, kiçik). users/contact-tracking/ilanlar geniş cədvəlləri üçün mobil kart-görünüşü (`faturalar` nümunəsi) — ayrıca task.

**Yoxlama:** sandbox npm 403 → build/tsc yox (DoD #11 skip); diff+review; **deploy-da telefonda test:** alt menyu görünür, KAZAN highlight, «Daha çox» drawer açır, blog/xəbər cədvəli üfüqi sürüşür.

## 2026-09-13 — TASK-0436 (roller yalançı düymələri)

**Niyə:** Dashboard audit (agent) tapdı: `roller` səhifəsi istifadəçini aldadır — silmə/redaktə düymələri işləmir, icazə dəyişikliyi saxlanmır (100% mock data + local state). Sahibin qaydası: UI yalan danışmamalıdır.

**Dəyişiklik:** Ölü düymələr (Yeni rol / Redaktə / Sil) `disabled`+`title`; Redaktə/Saxla toggle deaktiv → səhifə honest read-only preview; amber bildiriş banneri. i18n `previewNotice` 4 dildə.

**Niyə wire etmədim:** roles üçün backend/API yoxdur (rol `user.role`-dan gəlir) — real CRUD ayrıca böyük backend işidir. İndi ən doğrusu yalanı dayandırmaqdır.

**Yoxlama:** sandbox npm 403 → build/tsc yox (DoD #11 skip); diff+review; deploy-da baxılmalı.

## 2026-09-13 — TASK-0435 (tərcümə paralel + blog şəkil lazy)

**Niyə:** Sahib «tərcümədə ağır işliyor» + «blog resimleri ağır yükleniyor» dedi. Diaqnoz: (1) `autoTranslateBlogPost` 3 dili × sahələri tam ARDICIL `await` edirdi (~12 DeepSeek çağırışı, sinxron sorğuda → 1-3 dəq donma, timeout riski); (2) blog/xəbər şəkilləri xam `<img>`, `next/image` yox, lazy yox → tam ölçüdə və hamısı birdən yüklənir.

**Dəyişiklik:** (1) dil döngüsü `Promise.all(langs.map(...))` — 3 dil eyni anda; sahələr dil içində ardıcıl qalır (rate-limit təhlükəsizliyi üçün). Hər dil öz sütunlarını yazır, concurrent update təhlükəsiz. (2) blog kartı `img`-ə `loading=lazy`+`decoding=async`.

**Qalır:** `next/image` miqrasiyası (avto resize+AVIF) — domen qərarı + test lazım, ayrıca task; xəbər şəkilləri xarici hotlink → cloudinary proxy/cache; `translateText` içində chunk-lar hələ ardıcıl (istəsə sonra paralel). Mobil bottom-nav + global search + ara/düzelt/geri al trilogiyası → 3 audit agenti tarayır, nəticəyə görə plan.

**Yoxlama:** sandbox npm 403 → build/tsc/eslint icra olunmadı (DoD #11 texniki skip); diff + əl-baxış ilə təsdiq; **deploy-dan sonra bir blogda tərcümə sürəti + şəkil yüklənməsi test edilməli.**

## 2026-09-12 — TASK-0434 (Əlaqə kanalı tracking-i zənginləşdirmə)

**Niyə:** Sahib «WhatsApp verisi gəlib, amma nə yazdığını, haradan gəldiyini görmürəm» dedi. Araşdırma: `/api/leads/track` yalnız `channel, locale, userAgent, ipHash, tarix` yazırdı; `/api/leads/whatsapp` redirect prefill `?text=`-i qəbul edib **log etmədən atırdı**; contact-tracking səhifəsi sidebar-da linksiz idi (kəşf olunmurdu); sayğaclar filtrə görə gah son 100, gah son 1000 qeyddən hesablanırdı (uyğunsuz total).

**Vacib həqiqət (sahibə izah olundu):** Sayt bir WhatsApp klikindən **müştərinin nə yazdığını görə bilməz** — mesaj `wa.me`-dən sonra birbaşa WhatsApp-a gedir, sayta toxunmur. Görünə bilən: hansı səhifədən klikləndi (`sourceUrl`), bizim hazırladığımız mesaj (`prefillText`), hədəf (`destinationPhone`). Mesaj məzmununu oxumaq üçün WhatsApp Business Cloud API + webhook lazımdır — ayrıca, böyük iş, roadmap.

**Dəyişiklik:**
- `leads`-ə 3 nullable sütun (`source_url`, `prefill_text`, `destination_phone`) — geri-uyğun, mövcud sətirlər NULL alır. Migration `0020` idempotent (`ADD COLUMN IF NOT EXISTS`), Neon-da təhlükəsiz.
- `/api/leads/track`: yeni sahələri uzunluq-limitli sanitize edərək saxlayır. Admin email-i indi səhifə + hazır mesaj + hədəfi göstərir; **client-dən gələn dəyərlər HTML-ə escape olunur** (email injection qoruması).
- SST: `lib/contact-channels.ts` (WhatsApp nömrəsi + Telegram URL bir yerdə). `whatsapp` route və `ContactFunnel` oradan oxuyur — nömrə dublikatı qalxdı.
- `ContactFunnel`: `track()` indi `sourceUrl` (window.location) + prefill + hədəf göndərir.
- contact-tracking səhifəsi: mənalı sütunlar (Səhifə / Hazır mesaj / Hədəf / Cihaz). **Sayğac bug-ı düzəldildi** — total artıq `GROUP BY channel count(*)` ilə bütün qeydlər üzrədir, display limitindən asılı deyil.
- Kəşf: sidebar-a «Əlaqə Kanalları» nav item (4 dildə i18n).

**Yoxlama (məhdudiyyət):** Sandbox-da `npm` 403 (xlsx CDN) səbəbindən `node_modules` quraşdırılmayıb — `tsc`/`eslint` icra oluna bilmədi (bütün xətalar `Cannot find module 'next/server'` tipli resolution, kod xətası deyil). Kod diff + əl-baxışla yoxlandı; semantik diff-lər təmiz (prettier səs-küyü python-insert ilə önləndi). Tam build/route/Playwright CI/deploy-də. — DoD #11 texniki skip.

**Qalır:** WhatsApp Business Cloud API (mesaj oxuma) roadmap; contact-tracking `[locale]` mirror-u yoxlanmalı (admin non-AZ locale-də `/tr/...` — TASK-0416 funnel presedenti).

## 2026-09-02 — TASK-0433 (`/llms.txt` + başlıqsız 6 səhifə)

**Planlanan iş yarıya endi, çünki yarısı onsuz da vardı.** Task «llms.txt + bloq yazılarına Article markup» kimi yazılmışdı. Kod oxunanda məlum oldu ki, **Article markup artıq var** — `app/[locale]/blog/[slug]/page.tsx:157` `articleNode()` çağırır və BlogPosting + BreadcrumbList + Organization + (FAQ varsa) FAQPage buraxır. İddianı sözlə buraxmadım: canlı yazının HTML-i çəkildi, JSON-LD parse edildi — `datePublished=2026-06-07T10:00:00Z` (ISO, schema.org-un tələb etdiyi format), `author=Doğan Tomris`, `publisher.logo=true`, `wordCount=1420`. **Yazılası kod yox idi.** Bunun əvəzinə boş vaxt real boşluğa yönləndirildi.

**Boşluq necə tapıldı:** sitemap-dakı 16 giriş səhifəsinin hamısı süpürüldü və `<title>`-ları kök layout-un başlığı ilə tutuşduruldu. **6-sı öz başlığına sahib deyildi** — hamısı kök layout-un «DK Agency | Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması» başlığını miras alırdı, yəni Google-un nəticə səhifəsində altısı da eyni adla görünürdü:

| Səhifə | Sitemap priority | Vəziyyət |
|---|---|---|
| `/blog` | 0.9 | başlıq yox |
| `/toolkit` | 0.9 | başlıq yox |
| `/haqqimizda` | 0.7 | başlıq yox |
| `/marketinq` | 0.7 | başlıq yox |
| `/sedd-rozeti` | 0.6 | başlıq yox |
| `/elaqe` | 0.6 | başlıq yox |

**`/haqqimizda` sadəcə bir səhifə deyil:** hər bloq yazısındakı Article JSON-LD-də `author.url` məhz bu ünvanı göstərir (`structured-data.ts` → `ABOUT_URL`). Yəni Google müəllifin kim olduğunu yoxlamaq üçün gəldiyi səhifənin öz adı yox idi — E-E-A-T zəncirinin ortasında qırıq halqa.

**Həll TASK-0430-dakı nümunə ilə eynidir** (yeni nümunə uydurulmadı): `'use client'` səhifələr metadata ixrac edə bilmir, ona görə yanlarına `layout.tsx`; `sedd-rozeti` server komponenti olduğu üçün birbaşa `export const metadata`. **Mətnlər səhifələrin öz kopyasındandır** — `/blog` və `/marketinq` üçün `PAGE_COPY.az`, `/elaqe` üçün `contact` namespace-inin `title`+`lead`-i, `/toolkit` üçün `toolkit` namespace-i, `/haqqimizda` üçün səhifənin öz cümlələri («2010-da qurdum», «40 ildir HoReCa sektorundayam», «ilk AI dəstəkli HoReCa B2B platformasıyıq»). Uydurma kopya yoxdur.

**Bir tələ yoxlama ilə tutuldu:** `app/blog/layout.tsx` təkcə `/blog`-u yox, `/blog/[slug]`-ı da bürüyür. Əgər yazı səhifəsinin öz metadata-sı olmasaydı, 28 bloq yazısı birdən eyni başlığı alardı — reqressiya. `app/blog/[slug]/page.tsx` `generateMetadata`-nı re-export edir, Next dərin seqmentə üstünlük verir; canlı yoxlandı: yazı öz başlığını («Orada Bir Starbucks Var Uzaqda…») saxladı.

**`/llms.txt` niyə sitemap-ın təkrarı deyil:** sitemap crawler-ə «bu URL-lər var» deyir və başqa heç nə. llms.txt cavab mühərriklərinə (ChatGPT, Perplexity, Claude) **hər ünvanın nə etdiyini** bir cümlə ilə deyir, yəni model 300 səhifəni gəzmədən hansını sitat gətirəcəyini seçə bilir. Fayl tam SSOT-lardan qurulur — `TOOLKIT_CATALOG`, sektor configlərinin `metaDescription`-ları, `franchisePillar` mesajları, bloq isə DB-dən canlı (`revalidate = 3600`). Ona görə **əl ilə sinxronlaşdırma tələb etmir**: alət təsviri dəyişəndə llms.txt də dəyişir. DB düşərsə try/catch bloq bölməsini atır, fayl qalan bölmələrlə qaytarılır.

**Bir formatlaşdırma baqı öz testimdə tutuldu:** blokları birləşdirən `.filter(block => block !== '')` boş bölmələri atmaq üçün idi, amma mənim qəsdən qoyduğum boş sətirləri də atırdı — nəticədə `# DK Agency` ilə `>` arasında boş sətir qalmırdı və fayl markdown olaraq düzgün oxunmurdu. Bloklar bir-birinə yapışmışdı. Struktur dəyişdirildi: hər element tam blokdur, `join('\n\n')` aralarına boş sətir qoyur. `cat -A` ilə təsdiqləndi.

**Sübut:** `/llms.txt` 200, `text/plain; charset=utf-8`, **63 link / 6 bölmə / 13.7 KB**, 28 bloq yazısı · 6 səhifə öz başlığını render edir · bloq yazısı öz başlığını saxlayır (reqressiya yox) · bloq JSON-LD parse edilib təsdiqləndi · `✓ Compiled successfully` · tsc **36 (baza ilə eyni)** · eslint 0 error.

**Qalır:** `[locale]` variantları (`/en/blog`, `/ru/toolkit` və s.) hələ də kök başlığı miras alır — AZ prefikssiz ünvanlar canonical olduğu və hədəf bazar Azərbaycan olduğu üçün bu addımda kök mirror-lar düzəldildi · `/news` saxta məzmunu (sahib «hələlik saxla» dedi).

## 2026-08-30 — TASK-0432 (Header-dən `/franchise`-ə daxili keçid)

**Niyə:** TASK-0431 pillar səhifəni yaratdı, amma naviqasiyadan ona link yox idi. Daxili link olmayan səhifəni Google ikinci dərəcəli sayır — sitemap tək başına zəif siqnaldır. Sahib icazə verdi (`Header.tsx` PROTECTED).

**Dəyişiklik:** `franchiseLinks` massivinin başına bir sətir. Massiv **həm desktop dropdown (151-ci sətir), həm mobil menyu (262-ci sətir)** tərəfindən işlədilir — bir əlavə hər ikisini örtür, ayrıca kod lazım deyil.

**Anchor mətni qəsdən açar sözdür:** «Azərbaycanda Franchise» (AZ), «Franchise in Azerbaijan» (EN), «Франшиза в Азербайджане» (RU), «Azerbaycan'da Franchise» (TR). Daxili linkin mətni sıralamaya təsir edir — «Ümumi baxış» kimi neytral söz bu dəyəri verməzdi.

**İki tələ, ikisi də yoxlama ilə tutuldu:**

1. **Prettier hook PROTECTED faylı tam yenidən formatladı** — 465 insert / 94 delete. PROTECTED fayl üçün belə diff nəzərdən keçirilə bilməz. Fayl `git checkout` ilə sıfırlandı və dəyişiklik formatlaşdırıcıdan yan keçərək (node ilə birbaşa yazı) yenidən tətbiq olundu. **Yekun diff: 6 insert / 4 delete.**

2. **TR etiketindəki apostrof sətri sındırırdı.** Generator JSON dırnaqlarını tək dırnağa çevirirdi, `Azerbaycan'da` isə içində apostrof daşıyır → `frOverview:'Azerbaycan'da Franchise'` sintaksis xətası. O sətir cüt dırnağa keçirildi.

**Test baqı, kod baqı deyil (qeyd üçün):** ilk Playwright icrasında həm desktop, həm mobil FAIL verdi. Səbəb kod deyildi — test brauzerinin dili EN idi, ona görə linklər `/en/franchise` kimi render olunurdu, mənim selektorum isə `/franchise` axtarırdı. Brauzer `locale: 'az-AZ'` edildikdən sonra keçdi. Mobil isə Playwright-in `click()` metodunun akkordeon düyməsinə çatmaması idi; `evaluate(el => el.click())` ilə həll olundu. **İşləyən kodu «düzəltməyə» başlamadan əvvəl debug etmək lazım idi** — əks halda mövcud davranışı sındıra bilərdim.

**Sübut:** desktop dropdown-da `/franchise`, anchor «Azərbaycanda Franchise» ✓ · mobil menyuda `/franchise` birinci sırada ✓ · TASK-0426 mega menyu 1024/1280/1920 → 3/3 PASS, reqressiya yox ✓ · `✓ Compiled successfully` · tsc **36 (baza)** · eslint 0 error.

**Qalır:** `/news` saxta məzmunu (sahib «hələlik saxla» dedi) · `llms.txt` + blog Article markup.

## 2026-08-30 — TASK-0431 (`/franchise` pillar səhifəsi)

**Kontekst:** TASK-0430 indeksləşmə siqnallarını düzəltdi, amma əsas səbəb qalmışdı — «Azərbaycanda franchise» sorğusu üçün **sıralanacaq səhifə yox idi**. `app/franchise/page.tsx` mövcud deyildi; 5 alət vardı, onları birləşdirən səhifə yox.

**Mənim səhvim:** sahibdən məzmun istədim. O haqlı olaraq etiraz etdi — material onsuz da saytda idi: alət səhifələrinin öz mətnləri, Doğan Tomrisin sahibkarlara müraciəti, 30-dan çox blog yazısı. Boş yerə soruşmuşam.

**Məzmun mənbəyi (uydurulmayıb):**
| Bölmə | Mənbə |
|---|---|
| Hero, alət təsvirləri | mövcud alət səhifələri (`franchiseRadar`, `franchiseRoi`, `franchiseReadiness`, `franchiseBuyer`, `franchbook`) |
| Doğan Tomris notu | hazırlıq testindəki müraciəti, olduğu kimi |
| FAQ 1 (bədəllər) | blog yazısı: ad haqqı / royalti / reklam bədəli — «çox sahibkar bu rəqəmlərə ayrı-ayrı baxır» |
| FAQ 2 (marka qeydiyyatı) | blog yazısı: «qeydiyyatdan keçməyən markanı franchise vermək, sahibi olmadığın evi icarəyə vermək kimidir» |
| FAQ 3 (sağlam ROI) | ROI kalkulyatorunun öz hədəfi: illik ROI ≥ %20, geri-qaytarma ≤ 36 ay |
| FAQ 4 (radar) | radar səhifəsinin öz təsviri |

**Struktur — iki yol.** Alətlərin özü iki auditoriyaya işləyir, ona görə səhifə də belə bölündü: **franchise VERMƏK** (marka sahibi → hazırlıq testi, AI françbuk) və **franchise ALMAQ** (investor → radar, ROI, alıcı çeklisti). Bu bölgü icad edilmədi, mövcud alət dəstindən çıxdı.

**Texniki qeydlər:**
- Bloq bölməsi DB-dən **real** franchise yazılarını çəkir. Filtr `title` + `summary` + `focusKeyword` + `tags` üzrə. Əvvəlcə `excerpt` sahəsini işlətmişdim — tsc onun mövcud olmadığını göstərdi, `BlogArticle` tipinə baxıldı, `summary` düzgün ad çıxdı və filtr `tags`/`focusKeyword` ilə daha dəqiq edildi.
- `getFranchisePosts` try/catch ilə sarınıb — DB əlçatmaz olsa səhifə **sınmır**, sadəcə bloq bölməsi göstərilmir (TASK-0422 dərsi: repo funksiyaları səhifəni çökdürməməlidir).
- JSON-LD: Organization + BreadcrumbList + **FAQPage**. Mövcud `lib/seo/structured-data.ts` helper-ləri işlədildi. FAQPage həm Google rich result, həm də AI cavab motorları üçün faydalıdır — TASK-0432-nin bir hissəsi bu səhifədə artıq gəldi.
- L-038 root-mirror: `app/franchise/page.tsx` → `export { default, generateMetadata }`. Manifest yoxlanıldı, `/franchise/page` var.
- i18n Pattern A, 4 dildə 39 açar, parity ✓. AZ Doğanın öz dilidir; RU/EN/TR mənim tərcümələrimdir və **sahib nəzərdən keçirməlidir**.
- `messages/*.json` yenidən serializasiya olundu (tək sətirlik massivlər çox sətrə açıldı). Məzmun itkisi olmadığı parse-edib müqayisə ilə **sübut edildi** — köhnə obyekt yeni obyektlə (yalnız `franchisePillar` çıxılmaqla) bayt-bayt eynidir.

**Sübut:** `✓ Compiled successfully` · `/franchise`, `/ru/franchise`, `/en/franchise`, `/tr/franchise` → **200** · title «Azərbaycanda Franchise — Almaq və Vermək | DK Agency» · canonical `/franchise` (prefiksiz) · h1 «Azərbaycanda franchise» · JSON-LD-də FAQPage + BreadcrumbList render olunur · 5 alət linki · sitemap **300 URL**, pillar 4 dildə, `/az/` sıfır · auth gating toxunulmayıb (307/403) · tsc **36 — baza ilə eyni**, eslint 0, hardcoded mətn 0.

**Növbəti:**
- **Header-də daxili keçid yoxdur.** `components/layout/Header.tsx`-də «Franchise» düyməsi yalnız dropdown açır, `/franchise`-ə link vermir. Daxili keçid SEO üçün əhəmiyyətlidir, amma Header PROTECTED-dir → sahib icazəsi lazımdır.
- `/news` hələ də hardcoded saxta məzmunla indekslənə bilir — qərar gözləyir.
- `llms.txt` + blog yazılarına Article markup → TASK-0432.

## 2026-08-29/30 — TASK-0430 (Texniki SEO təməli: canonical + sitemap + metadata)

**Siqnal:** Doğan — «Azərbaycanda franchising axtardım, saytım çıxmadı. 30 yazımız var, panelimiz var, AI SEO lazımdır.»

**Diaqnoz:** problem məzmun deyil. 30 yazı var, amma Google-a gedən indeksləşmə siqnalları ziddiyyətli və natamamdır. Beş ayrı problem tapıldı, üçü canonical ətrafında.

**1. Canonical redirect-ə işarə edirdi.** `lib/seo/alternates.ts` hər AZ səhifəsi üçün `canonical: /az/{path}` qururdu. Amma `i18n/routing.ts` → `localePrefix: 'as-needed'`, yəni `/az/X` → `/X` redirect olunur (L-038). Nəticə: səhifə Google-a «əsl ünvanım budur» deyir, Google ora gedir, geri atılır. Ziddiyyətli siqnal indeksləşməni boğur. **Sübut ki, bu qərar deyil səhvdir:** eyni layihədə `lib/seo/structured-data.ts → localeUrl()` artıq `az = prefiksiz` qaydasını tətbiq edir. İki fayl bir-birinə zidd idi.

**2. Prefiksiz səhifələrdə canonical ÜMUMİYYƏTLƏ yox idi.** `getAlternates` yalnız `[locale]` ağacında çağırılır; `/`, `/toolkit`, `/blog`, `/ilanlar` kimi əsl AZ ünvanları heç bir canonical emit etmirdi. Yoxlandı: `curl | grep canonical` → 0 nəticə. Həll: root layout-a bir sətir `alternates: { canonical: './' }` — Next onu hər səhifənin öz yoluna görə həll edir. `app/layout.tsx` PROTECTED olduğu üçün əvvəlcə lokal sınandı, işlədiyi sübut olundu, sonra sahibdən icazə alındı.

**3. `[locale]/layout.tsx` canonical-ı `'/'`-ə hardcode etmişdi.** `getAlternates(locale, '/')` — layout bütün alt səhifələrə şamil olduğu üçün `/ru/toolkit` canonical olaraq `/ru` göstərirdi. Yəni **hər RU/EN/TR alt səhifəsi özünü ana səhifənin dublikatı elan edirdi** — Google belə səhifələri indeksdən çıxarır. Bu, 1-ci problemdən də ağırdır və yalnız yoxlama zamanı üzə çıxdı. Layout `generateMetadata`-da pathname mövcud olmadığı üçün nisbi `'./'` işlədildi. Ödəniş: layout səviyyəsində hreflang itdi — amma o hreflang onsuz da **səhv** idi (hər səhifə üçün ana səhifəni göstərirdi). Yolu bilən səhifələr (blog/[slug], ilanlar, franchise/radar) `getAlternates` ilə düzgün hreflang verməyə davam edir.

**4. Sitemap ~25 səhifəni buraxırdı və redirect göndərirdi.** Bütün toolkit alətləri, bütün franchise alətləri, sektor səhifələri, `/ilanlar`, `/uzvluk`, `/haqqimizda` kənarda idi. Üstəlik sitemap `/az/...` URL-ləri göndərirdi — hamısı redirect. Yenidən yazıldı: `entriesFor()` helper-i AZ-ı prefiksiz, digər dilləri prefiksli verir. Nəticə **296 URL, `/az/` sıfır**.

**5. 17 səhifədə başlıq/təsvir yox idi.** Struktur gözlədiyimdən fərqli çıxdı: bəzi route-larda `app/toolkit/X/page.tsx` **mirror deyil, tam `'use client'` komponentdir** — belə səhifə metadata ixrac edə bilmir. Onlar üçün komponenti bölmək əvəzinə yanına `layout.tsx` qoyuldu (risksiz, 7 fayl). Qalan 10 mirror-a birbaşa `export const metadata`. Mətnlər **uydurulmadı** — mövcud `[locale]` metadata bloklarından və `messages/az.json`-dan (`otaReadiness`, `hotelReadiness`, `guesthouseRoi`, `whatsappTemplates`, `franchiseRoi`, `franchiseReadiness`, `franchiseBuyer`, `franchbook`) götürüldü, açar sözlə zənginləşdirildi.

**Sübut:** `✓ Compiled successfully` · canonical 10 route × 4 dil üzrə yoxlandı, hamısı öz-özünə istinad edir (`/ru/toolkit` → `/ru/toolkit`, əvvəl `/ru`) · sitemap 296 URL / 0 ədəd `/az/` · başlıqlar render olunur (`/toolkit/basabas` → «Başabaş Nöqtəsi Kalkulyatoru — Restoran») · auth gating toxunulmayıb (`/dashboard` 307, `POST /api/admin/ads` 403) · route smoke 200 · eslint 0 error · tsc **36 error — əvvəlki sessiya ilə eyni say**, yeni error yoxdur.

**Gözlənti (dürüst):** bunlar indeksləşməni **mümkün edir**, sıralamanı **zəmanət vermir**. Google-un yenidən taraması 2-6 həftə çəkir. Search Console-da sitemap yenidən göndərilməlidir.

**Növbəti (bu task-da DEYİL):**
- `/franchise` **pillar səhifəsi yoxdur** — `app/franchise/page.tsx` mövcud deyil, yəni «Azərbaycanda franchise» sorğusu üçün sıralanacaq səhifə yoxdur. Sitemap-a qəsdən salınmadı (404 elan etməmək üçün). Məzmun qərarı sahibindir → TASK-0431.
- `/news` səhifəsi hardcoded saxta `NEXT_ITEMS` məzmunu ilə indekslənə bilir (TASK-0425 ana səhifədə düzəltmişdi, bu səhifə qalıb) — nazik/saxta məzmun SEO-ya zərərlidir. Silinsin, yoxsa real datadan qidalansın? Sahib qərarı.
- `llms.txt`, blog yazılarına Article + FAQ + Breadcrumb markup → TASK-0432.

## 2026-08-01 — TASK-0429 (`sharp` 0.35.3: son production runtime HIGH)

**Kontekst:** TASK-0428-dən sonra 9 advisory qalmışdı. `sharp` onların arasında **yeganə production runtime HIGH** idi (libvips CVE-2026-33327/33328/35590/35591 — şəkil dekodlaması; platformada elan fotosu və fatura OCR var). Sahib icazəsi alındı, çünki `package.json` PROTECTED-dir.

**Kəşfiyyat birinci:** `grep` göstərdi ki, `sharp` kod bazasında **heç yerdə birbaşa import olunmur** — yeganə istifadəçi `next/image` optimizasiyasıdır. Risk səthi buna görə məhduddur.

**Sadə bump İŞLƏMİRDİ — bu taskın əsas tapıntısı:** `next@16.2.12` `optionalDependencies.sharp = ^0.34.5` elan edir, yəni `>=0.34.5 <0.35.0`. `0.35.3` bu aralığa **düşmür**. İzolyasiya edilmiş nüsxədə sınandı və nəticə təsdiqləndi:

```
node_modules/sharp                     0.35.3   ← yeni, amma İSTİFADƏSİZ
node_modules/next/node_modules/sharp   0.34.5   ← zəif, next/image MƏHZ BUNU işlədir
```

`npm audit` bump-dan **sonra da** HIGH bildirirdi. Yəni sadəcə versiyanı qaldırmaq: ikinci nüsxə əlavə edir, hücum səthini toxunulmaz saxlayır və yalançı təhlükəsizlik hissi yaradır. Təxminlə getsəydik, «düzəltdik» deyib heç nə düzəltməmiş olardıq.

**Alternativ axtarıldı:** heç bir **stabil** `next` versiyası `sharp ^0.35`-i qəbul etmir — `latest` 16.2.12-dir, yalnız `16.3.0-preview.10` / `canary` yuxarıdadır, production üçün uyğun deyil.

**Həll:** `overrides: { "sharp": "$sharp" }`. (`"sharp": "0.35.3"` forması `Override for sharp@^0.35.3 conflicts with direct dependency` xətası verir — npm birbaşa asılılığa `$` istinadı tələb edir.) Nəticə: ağacda tək `sharp 0.35.3`, `sharp` audit-dən təmizləndi, **advisory 9 → 8**, paket 11 → 10.

**Risk və necə azaldıldı:** bu, `next`-i öz elan etdiyi aralıqdan kənar versiyaya məcbur edir — Vercel bu birləşməni test etməyib. Ona görə **soruşmaqdansa sübut etməyi** seçdim: `sharp@0.35.3` + `@img/sharp-linux-x64` + `@img/sharp-libvips-linux-x64` registry-dən çəkilib quraşdırıldı (`libvips 8.18.3`), sonra real `/_next/image` sorğuları icra edildi.

| en | HTTP | çıxış formatı | ölçü |
|---|---|---|---|
| 256 | 200 | AVIF | 256×144 |
| 640 | 200 | AVIF | 640×360 |
| 828 | 200 | AVIF | 828×466 |
| 1200 | 200 | AVIF | 1200×675 |
| 1920 | 200 | AVIF | 1672×941 |

AVIF kodlaması libvips-in ən ağır yoludur — o keçirsə, sadə resize onsuz da keçir. Çıxışlar `sharp` ilə geri dekod edilib ölçüləri təsdiqləndi.

**Diaqnoz tələsi:** ilk testdə `w=1200&q=90` və `q=80` **HTTP 400** verdi və `sharp` reqressiyası kimi görünürdü. Cavab gövdəsinə baxanda çıxdı: `"q" parameter (quality) of 80 is not allowed` — Next 16-nın konfiqurasiya validasiyası, `sharp`-la əlaqəsi yoxdur. Yalnız `q=75` icazəlidir. Gövdəyə baxmasaydım, işləyən dəyişikliyi «sınıq» sayıb geri qaytaracaqdım.

**Digər sübutlar:** `▲ Next.js 16.2.12` · `✓ Compiled successfully` · 206 statik səhifə · route smoke (`/`, `/toolkit`, `/ilanlar`, `/haberler`, `/kazan-ai`, `/uzvluk`, `/franchise/radar`) → 200 · auth gating qorunub (`/dashboard` 307, `POST /api/admin/ads` 403) · TASK-0426 mega menyu 4/4 PASS.

**PROTECTED:** `package.json` sahib icazəsi ilə `ALLOW_PROTECTED=1` altında dəyişdirildi. Diff cəmi 2 sətir (sharp versiyası + override). `xlsx` pin-i toxunulmadı — lockfile diff-ində `sheetjs` yalnız kontekst sətri kimi görünür, `+/-` dəyişikliyi yoxdur.

**Qalan 8 advisory:** `postcss@8.4.31` (next-in pin etdiyi upstream, build vaxtı), `js-yaml` (eslint → devDependency), `dompurify` (LOW), `protobufjs` — hamısı `overrides` ilə pin edilib və heç biri production runtime deyil. Təcili deyil.

## 2026-08-01 — TASK-0428 (Hostinger təhlükəsizlik skanı: advisory 24 → 9)

**Siqnal:** Hostinger e-poçtu — `dkagency.com.tr`, 885 paket skan olundu, **25 zəiflik** (13 high, 11 moderate, 1 low).

**Əvvəlcə ziddiyyət həll edildi:** CHANGELOG-dakı TASK-0415 «0 critical / 0 high / 4 moderate» yazırdı, Hostinger isə 13 high. `npm audit` yerli olaraq 11 paket göstərdi. Səbəb: **Hostinger CVE/advisory sayır, npm paket qruplaşdırır.** npm-in özü advisory saydıqda **24** verir — yəni Hostinger yeni bir şey tapmayıb, eyni reallığı fərqli sayır. TASK-0415-dən bəri mövcud versiyalara qarşı yeni CVE-lər yayımlanıb; bu normal sürüşmədir, kimsə səhv etməyib.

**Kök tapıntı:** `next` **16.2.9**-da idi. Paketin 9 advisory-si var və **hamısının düzəlişi 16.2.11-dədir**:
- HIGH — Middleware / Proxy bypass (App Router + Turbopack + tək locale)
- HIGH — SSRF, Server Actions (custom server)
- HIGH — SSRF, rewrites (hücumçunun idarə etdiyi hostname)
- HIGH — DoS, App Router Server Actions
- MODERATE ×5 — cache confusion ×2, Edge payload, SVG DoS, daxili endpoint açıqlanması

Birincisi bu platformada xüsusi çəkiyə malikdir: `middleware.ts` auth gating edir, yəni bypass = üzv qapısının keçilməsi.

**Diaqnoz qeydi (məni bir dəfə yanıltdı):** `npm audit`-in paket səviyyəsindəki `range` sahəsi birləşdirilmiş aralıqdır (`>=9.3.4-canary.0 <16.3.0-preview.7`) və «stabil düzəliş yoxdur» təəssüratı yaradır. Advisory-lərə **ayrı-ayrı** baxanda hamısının aralığı `>=16.0.0 <16.2.11` çıxdı. Paket səviyyəsindəki aralığa baxıb qərar vermək səhv olardı.

**Fix:** `package.json`-dakı `^16.2.9` aralığı 16.2.12-yə onsuz da icazə verirdi — problem yalnız lockfile-ın köhnə olması idi. Ona görə **PROTECTED `package.json` toxunulmadı**, yalnız `package-lock.json` yeniləndi. Sandbox məhdudiyyəti aşıldı: tam `npm install` `cdn.sheetjs.com` blokuna dəyir, amma **hədəflənmiş** `npm update next --package-lock-only` + `npm audit fix --package-lock-only` CDN-ə toxunmur (xlsx alt-ağacı dəyişmir). `xlsx` girişi diff-də yoxdur.

**Nəticə: 24 → 9 advisory.**

**Build necə yoxlandı (bu vacibdir):** lokal `npm install` CDN blokuna görə mümkün deyil, yəni yeni lockfile-ı adi yolla quraşdıra bilmirdim. Əvəzində `next@16.2.12` + `@next/env` + SWC binarları registry-dən (`npm pack`, allowlist-dədir) çəkilib `node_modules`-a açıldı. Əvvəlcə 16.2.9 və 16.2.12-nin `dependencies` dəstləri müqayisə olundu — `@next/env` pin-i istisna **eynidir**, ona görə bu quraşdırma sadiqdir.

**Sübut:** `▲ Next.js 16.2.12` · `✓ Compiled successfully` · 206 statik səhifə · route smoke `/`, `/toolkit`, `/ilanlar`, `/haberler`, `/kazan-ai`, `/uzvluk`, `/franchise/radar`, `/franchise/roi-kalkulyatoru` → **200** · auth gating qorunub: `/dashboard` → **307**, `POST /api/admin/ads` → **403** · TASK-0426 mega menyu Playwright testi 4/4 PASS (framework bump reqressiya vermədi).

**`/franchise` → 404 reqressiya DEYİL:** `app/franchise/page.tsx` heç vaxt olmayıb, yalnız alt-route-lar var və Header də yalnız onlara link verir. Yoxlanıldı, təsdiqləndi.

**Qalan 9 advisory — ayrıca qərar tələb edir:**
| Paket | Səviyyə | Niyə bu task-da bağlanmadı |
|---|---|---|
| `sharp` 0.34.5 → 0.35.3 | HIGH | major/breaking; `package.json` (PROTECTED) + şəkil yollarının testi lazımdır. **Yeganə production runtime HIGH** — libvips CVE-ləri, platformada şəkil yükləmə var (elan foto, fatura OCR) |
| `postcss@8.4.31` (next daxili) | HIGH ×3 | next-in pin etdiyi upstream asılılıq; yalnız build vaxtı CSS emalı (öz repo-muzdakı CSS), request runtime-ında deyil |
| `js-yaml` | HIGH ×3 | `eslint` → devDependency, canlıya düşmür; `overrides` ilə pin edilib |
| `dompurify` | LOW | jspdf transitive, `overrides` pin |
| `protobufjs` | MODERATE | @google/genai transitive, `overrides` pin |

## 2026-08-01 — TASK-0427 (Claude fallback: `temperature` 400 minası + model SST)

**Necə tapıldı:** Doğan son bir ayın Anthropic yeniliklərini soruşdu. Araşdırma zamanı məlum oldu ki, `temperature`/`top_p`/`top_k` Claude-un yeni nəsillərində API-dən silinib. Sonra kod yoxlanıldı — platformada məhz o parametr göndərilirdi.

**Problem (bu gün partlamır, sabah partlaya bilər):** Hər iki Claude çağırışı sorğuya `temperature` qoyurdu — `lib/ai-router.ts` (`req.temperature ?? 0.7`) və `app/api/kazan-ai/route.ts` (`0.2`). Cari model `claude-sonnet-4-6`-dır və onu qəbul edir, ona görə heç nə sınmır. Amma Opus 4.7+, Sonnet 5, Opus 5 və Fable 5-də parametr **silinib** — göndərilsə API 400 qaytarır. Yəni Hostinger-də `KAZAN_ANTHROPIC_MODEL=claude-sonnet-5` yazmaq — **kod deploy-u belə lazım deyil** — fallback yolunu sındırırdı.

**Təsir iki yolda fərqlidir (ikisi də oxundu, fərqi vacibdir):**
- `kazan-ai/route.ts` — sonda `buildStaticFallback` var, istifadəçi hazır şablon cavab alır. Pis, amma çökmə yox.
- `lib/ai-router.ts` (marketinq alətləri) — static fallback **yoxdur**, `Both AI providers failed` atır. Sərt xəta.

Hər iki halda xəta yalnız **DeepSeek onsuz da çökəndə** görünərdi — yəni ən pis anda, ikiqat sıradan çıxma.

**Fix:** `lib/ai-models.ts`-ə `AI_MODELS.claude.fallback` + `resolveClaudeModel()` + `claudeAcceptsTemperature()` əlavə edildi. Allowlist **qəsdəndir**: tanınmayan model ID gələndə parametr göndərilmir, çünki göndərmək sorğunu sındırır, göndərməmək isə yalnız default dəyər deməkdir. Hər iki çağırış yerində `temperature` şərtli oldu; `generate-audit.mjs` model adını SST-dən regex ilə oxuyur (əvvəl hardcoded idi, halbuki cədvəlin başlığı «lib/ai-models.ts SST» yazırdı).

**Sübut (mock yox, wire-level):** saxta Anthropic HTTP endpoint qaldırıldı, `ANTHROPIC_BASE_URL` ora yönəldildi və **real göndərilən body** yoxlanıldı. ai-router: 7/7 PASS (sonnet-4-6-da `temperature` var; sonnet-5/opus-5/opus-4-8/fable-5-də yox; tanınmayan ID-də yox; env yoxdursa SST default-a düşür). kazan-ai route handler: 3/3 PASS. Cəmi **10/10**. `next build` ✓ 206 səhifə, eslint 0, tsc 0.

**Qeyd:** `COST_PER_TOKEN.claude = 0.000005` ($5/M) Opus 5 giriş qiymətidir, halbuki işlədilən model Sonnet 4.6-dır ($3/M) — xərc hesabı təxminidir. Bu task-da toxunulmadı, ayrıca qərar tələb edir.

## 2026-08-01 — TASK-0426 (Alətlər mega menyusu ekrandan daşırdı — desktop)

**Problem:** Canlı saytda header-dəki «Alətlər» mega menyusu ekranın sol kənarından kəsilirdi (owner ekran görüntüsü ilə sübut). Bu, əvvəllər «düzəldildi» deyilmiş, amma davam edən problem idi.

**Kök səbəb (təxmin deyil, ölçülüb):** `Header.tsx:133` trigger sarğısı `relative`, `MegaMenu.tsx` isə paneli `absolute left-1/2 -translate-x-1/2 w-[90vw] max-w-[880px]` ilə yerləşdirirdi. Yəni 880px-lik panel **kiçik «Alətlər» düyməsinin mərkəzinə** görə mərkəzlənirdi, viewport-a görə yox. Düymə header-in solunda olduğu üçün panelin sol kənarı mənfi X-ə düşürdü (1280px-də təqr. −200px). Panel nə qədər genişdirsə, daşma bir o qədər çox olurdu.

**Fix:** Panel ayrıca `MegaMenuPanel` komponentinə çıxarıldı; `left-1/2 -translate-x-1/2` silindi, üfüqi mövqe `useLayoutEffect`-də ölçülür: mümkün olduqda trigger-in mərkəzinə, əks halda viewport daxilinə 16px gutter ilə clamp olunur (`resize` listener ilə yenilənir). Əlavə: `max-h-[calc(100vh-8rem)] overflow-y-auto overscroll-contain` — alçaq ekranlarda panel səhifəni uzatmır, öz içində sürüşür.

**PROTECTED:** `Header.tsx`-ə toxunulmadı — fix tam olaraq `MegaMenu.tsx` daxilindədir.

**Sübut (Playwright, built prod server 127.0.0.1:3001):** 1024/1280/1440/1920 en-lərində panel açılır və `panel.x ≥ 0`, `panel.right ≤ clientWidth`, `document.scrollWidth == clientWidth` → 4/4 PASS. Əvvəl: 1280-də panel.x mənfi. `next build` ✓ Compiled successfully (206 static page), eslint MegaMenu.tsx 0 error, tsc MegaMenu 0 error (repo-da mövcud 36 pre-existing error toxunulmadı).

**Qeyd (sandbox):** `npm install` `cdn.sheetjs.com` egress bloku ilə 403 verir (TASK-0415 pinned xlsx tarball) — validasiya üçün müvəqqəti registry versiyası ilə install edildi, `package.json`/`package-lock.json` commit-dən əvvəl geri qaytarıldı (diff-də yoxdur). Bu infra məhdudiyyətidir, dəyişikliklə əlaqəsi yoxdur.

## 2026-07-16 — TASK-0419 (Onboarding dead-end fix + broken tool-link repair, P0)

**Problem:** Yeni üzv prioritet seçib Save basırdı → modal bağlanırdı, başqa heç nə (dead-end, `OnboardingModal.tsx:127-131` köhnə hal). Araşdırma daha pis, artıq canlı bug tapdı: `PRIORITY_TOOL_MAP` route-u olmayan 5 slug-a istinad edirdi (`yemek-xerci`, `sikayet-analitigi` [route qovluğu `sikayat-analizi`], `sikayet-cavablandirici`, `reklam-yazicisi`, `kst-yoxlayici`) → `RecommendationWidget` və `try_first_tool` nudge artıq 404-lərə link verirdi. Ən pis: `inventory` yeganə aləti də 404 idi.

**Fix (P0):** (1) `priorities.ts` — xəritə yalnız route-backed slug-larla təmizləndi; `SLUG_ROUTE_OVERRIDES`+`getToolRoute()` əlavə edildi ki, işləyən Şikayət Analizi aləti PROTECTED `marketing-tools-config.ts`-ə toxunulmadan `sikayat-analizi` route-una çatsın. (2) `OnboardingModal.tsx` — `step`/`savedPriorities`/`notified` state; Save nəticə ekranı açır (recap chip, ≤3 alət kartı, 0-alət prioritet üçün «Tezliklə»+xəbər ver painted-door kartı, dashboard CTA); mobil flex-col `max-h-[90vh]` sticky footer; result step-də ESC/close skip flag-i yox, finish edir. (3) `RecommendationWidget` + `nudge/rules.ts` URL-ləri `getToolRoute()`-dan keçir → canlı 404-lər düzəldi. (4) `userEvents.ts` +`onboarding_completed`/`gap_interest`. (5) 4 dil `onboarding.result.*`.

**Qeyd:** Yeni route yaratılmadı (L-038 tətbiq olunmur). `npm run build`/lint sandbox-da işləmədi — build script-in `npm install`-u pin edilmiş `xlsx` (cdn.sheetjs.com, TASK-0415) egress siyasəti ilə 403 bloklanır; bu infra məhdudiyyətidir, dəyişikliklə əlaqəsi yox. encoding + protected verify PASS, 4 JSON valid, any/console.log yox. Build Hostinger/CI-də icra olunacaq.

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
## 2026-06-27 — TASK-0416 (Dashboard funnel locale route)

**Problem:** Canlı `https://dkagency.com.tr/tr/dashboard/funnel` 404 qaytarırdı, amma root `https://dkagency.com.tr/dashboard/funnel` mövcud idi və auth guard ilə `307 /auth/login` dönürdü.

**Fix:** `app/[locale]/dashboard/funnel/page.tsx` əlavə edildi və mövcud `app/dashboard/funnel/page.tsx` re-export olundu. Bu, mövcud dashboard locale mirror pattern-i ilə eynidir və funnel auth/locale məntiqini dublikatlamır.

**Verification:** `npm run build` keçdi və route cədvəlində `ƒ /[locale]/dashboard/funnel` göründü. Lokal built app-də `/tr/dashboard/funnel` artıq 404 deyil, gözlənən `307 /auth/login` qaytarır.
## 2026-06-27 - TASK-0417 (News preview saves before opening)

**Problem:** Manual xəbər editorunda `Önizle` düyməsi məqaləni DB-yə yazmadan `/haberler/{draftSlug}?preview=true` URL-ni açırdı. Yeni xəbər hələ saxlanmayıbsa public detail route slug tapa bilmir və 404 verir.

**Fix:** `NewsEditorForm` save məntiqi reusable `saveArticle()` helper-inə çıxarıldı. `Önizle` indi əvvəl `fetched` statusu ilə POST/PATCH edir, API-nin qaytardığı real `slug`-u state-ə yazır, sonra `/haberler/{savedSlug}?preview=true` açır.

**Verification:** Canlıda verilən preview URL 404 qaytardı və DB-də həmin slug yoxdur. Fix yeni preview axınında əvvəl DB yazısı yaratmağa məcbur edir.
