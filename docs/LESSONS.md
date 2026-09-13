# DK Agency — Acı Dərslər (yeni task-dan əvvəl oxu)

Bu sənəd hər Claude Code sessiyasının başlanğıcında CLAUDE.md tərəfindən referans verilir.

## L-001: TASK-0127 Phantom Fix
- **Səhv:** "yemek-xerci tamamlandı" deyildi, amma yalnız task card əlavə olundu
- **Kök səbəb:** Builder agent "PR merged = done" qəbul etdi, ekran yoxlamadı
- **Qayda:** PR merge ≠ done. Production smoke məcburi.
- **Hook gücləndirməsi:** `pre-commit-gate.sh` build+lint+i18n yoxlayır

## L-002: TASK-0128 audit (auth contract drift)
- **Səhv:** İlk versiyada `auth.id`, `auth.plan`, `db.input/output/provider` istifadə olundu
- **Kök səbəb:** TypeScript runtime auth/DB contract-ını bilmir
- **Qayda:** Yeni endpoint üçün `dk-validator` 4-cü və 5-ci maddələri yoxlayır
- **Düzgün:** `auth.userId`, `auth.role`, `inputData`, `outputData`, `aiProvider`

## L-003: Sarmal — mail bug 50+ commit
- **Səhv:** devDependencies, HOSTNAME, trustHostHeader ayrı-ayrı düzəldildi
- **Kök səbəb:** 2 fail-dən sonra yanaşma dəyişmədi, kök tapılmadı
- **Qayda:** 2 dəfə eyni fix fail-sə, DUR, web/Reddit/GitHub axtar, kök səbəbi tap
- **Mexanizm:** Builder bunu eləməyə bilər — Doğan əli ilə yönəldir

## L-004: i18n hardcoded — "62/62 page tamam" yalanı
- **Səhv:** Audit raportu hardcoded olmayanları doğru saydı, 120 fayl/3012 sətr buraxıldı
- **Kök səbəb:** İki fərqli i18n pattern (useTranslations vs Record<Locale>) qarışdırıldı
- **Qayda:** Yeni komponent üçün **yalnız Pattern A** (`useTranslations`)
- **Hook gücləndirməsi:** `pre-commit-gate.sh` mərhələ 3 (hardcoded scan)

## L-005: Hostinger devDependencies
- **Səhv:** `@types/*` `devDependencies`-də idi, prod build fail
- **Kök səbəb:** Hostinger Web Apps devDependencies install etmir
- **Qayda:** Hər `@types/*` paketi `dependencies`-də olmalıdır
- **Düzgün:** `package.json` build script: `npm install --include=dev && next build`

## L-006: Hostinger reverse proxy hostname
- **Səhv:** Email confirmation linkləri localhost-a yönəldi
- **Kök səbəb:** Next.js standalone 0.0.0.0 hostname qəbul edir
- **Qayda:** `.env.production` build-time `NEXT_PUBLIC_APP_URL` inject + `experimental.trustHostHeader=true`
- **Anti-pattern:** HOSTNAME env Hostinger panel-də QOYMA (port qoşur)

## L-007: Skill-driven prompt qaydası
- **Səhv:** Claude Code-a "et" demək, fayl yolu vermədən
- **Kök səbəb:** Builder agent path-i tahmin edir, parallel UI yaranır
- **Qayda:** Hər prompt absolute path + mövcud pattern referansı verir
- **Skill:** `.claude/skills/task-prompt-writer/SKILL.md`

## L-009: Trust layer — DoganNote Pattern C-dən Pattern A-ya
- **Səhv:** DoganNote CTASections.tsx-in içindəki inline `copyByLocale` (Pattern C) idi.
- **Kök səbəb:** L-004 qaydası TASK-0105-dən əvvəl tətbiq edilməmişdi; köhnə Pattern C fayl başqa bir fayl içindəydi.
- **Qayda:** Hər mövcud Pattern C komponent ayrı task kimi yenidən yazılmalıdır. "Ayrı fayl deyilsə Pattern A tətbiq etmək çətindir" bəhanəsi qəbul edilmir.
- **Nəticə:** DoganNote `components/home/DoganNote.tsx` kimi ayrı fayl, 4 dil, useTranslations. Köhnə CTASections.tsx smart-quote encoding xətası da düzəldildi.

## L-010: B2B Panel auth guard
- **Səhv:** `/b2b-panel/*` layout auth-suz idi; public visitor mock portal shell-i görürdü.
- **Kök səbəb:** Dashboard layout JWT guard ilə qorunurdu, amma B2B panel layout `getServerMemberSession()` çağırmırdı.
- **Qayda:** Server-side member guard üçün helper `@/lib/members/server-session`-dədir. `getServerMemberSession()` null qaytarmır; guest halda `{ loggedIn: false }` qaytarır. Null check silent fail edə bilər.
- **Nəticə:** B2B panel layout `session.loggedIn` yoxlayır və guest-i `/auth/login`-ə redirect edir. Protected fayllar (`lib/member-access.ts`, `middleware.ts`) toxunulmadı.

## L-011: Locale re-export page metadata
- **Səhv:** `/[locale]/kazan-ai` flat `/kazan-ai` page-ni re-export edirdi; UI ilə birlikdə AZ metadata da miras qalırdı.
- **Kök səbəb:** Component i18n yetərli deyil; route metadata ayrıca locale-aware olmalıdır.
- **Qayda:** Locale route üçün `generateMetadata({ params })` + `getTranslations({ locale, namespace })` istifadə et. Flat route yalnız default locale fallback kimi qalsın.
- **Nəticə:** KAZAN AI UI Pattern A oldu, metadata da locale-aware edildi. System prompt dili ayrı task kimi saxlanıldı.

## L-012: next-intl dot key trap
- **Səhv:** Audit log JSON-da DB action kodları `member.created` kimi flat key saxlanmışdı, amma next-intl nöqtəni nested path ayırıcısı kimi oxuyur.
- **Kök səbəb:** Data enum shape-i (`member.created`) ilə i18n message shape-i qarışdırıldı.
- **Qayda:** DB/API action kodu dot-lu qalırsa, JSON nested olmalıdır: `actions.member.created`. Kodda enum dəyişmək migration və data riski yaradır.
- **Nəticə:** `dashboard.auditLog.actions.member.*` 4 dildə nested edildi; komponentlərə, DB enum-lara və API-lərə toxunulmadı.

## L-008: Köhnə sessiya pattern tələsi
- **Səhv:** TASK-0148 PR-sız birbaşa main-ə push olundu (`git push --no-verify`)
- **Kök səbəb:** Agent köhnə sessiya tasklarına (TASK-0144/0145 PR-sız idi) baxıb onları nümunə götürdü. 5-qat control (PR #129) o tasklardan SONRA qurulmuşdu.
- **Qayda:** HƏR task = branch + PR + dk-validator. İSTİSNA YOXDUR. `git push --no-verify` QƏTİ QADAĞAN. Köhnə commit-lərdə PR-sız nümunə görsən belə, onları təkrarlama — köhnə git tarixçəsi ≠ cari qayda.
- **Yoxlama:** ƏVVƏL TANIŞ OL fazasında git log-a baxanda, köhnə pattern-i nümunə kimi qəbul etmə. Yalnız CLAUDE.md + LESSONS.md cari qaydadır.
- **Nəticə:** Post-merge manual audit ilə neytrallaşdırıldı (dublikat/PROTECTED/i18n/build təmiz). Amma audit xərci PR-dan 3x artıqdır — qaydaya riayət ucuzdur.

### L-016 — Repo debt ≠ task fail (24 May 2026)
Bir task-ın target faylları təmiz olsa da, repo-wide lint/tsc fail oluna bilər
(köhnə fayllar üçün). next.config.ts-də ignoreBuildErrors aktivdirsə production-a
təsir yoxdur. Verification gate-də **target fayl + repo fərqini** göstər: target
fayl PASS-dursa, repo debt ayrı task-a köçür, mövcud task-ı bloklama.

Misal: TASK-0157D — target file lint=0, repo lint=4 error (scripts/*.js, sənin
yazmadığın). Davam et, debt ayrı task aç.

### L-017 — Audit rəqəmi ≠ avtomatik tərcümə (24 May 2026)
i18n parity audit-i missing key tapdıqda dərhal tərcümə yazma. Əvvəl
runtime istifadəni təsdiq et:
- useTranslations('ns') sayı
- getTranslations('ns') sayı
- Direct t('ns.X') istinadları
- Type/config faylların istifadəsi

Sıfır istifadə = ölü kod, tərcümə yox, sil.
Misal: TASK-0158 — "marketing" namespace 59 leaf, runtime = 0, silindi.
"marketinq" namespace 866 leaf, 25 yerdə istifadə, qoruyduq.

### L-018 — Orphan i18n key audit-də görünmür (24 May 2026)
jq ilə leaf saymaq paritet illüziyası verə bilər. RU/TR-də 5 açar,
AZ/EN-də 7 açar olsa, audit "4 missing" deyir. Amma əslində 2 açar
ORPHAN-dır (kod çağırmır), 4 açar tam YOXDUR.

Audit-də həmişə hər iki istiqamətdə yoxla:
- AZ var, X yox (missing)
- X var, AZ yox (orphan)
- Açar adları arasında naming mismatch (məs: sales vs revenue)

Misal: TASK-0158 toolkit.pnl.education.structure — RU/TR-də sales/net
orphan idi (legacy refactor qalığı), kod çağırmırdı, istifadəçi xam
açar adlarını görürdü (canlı bug). Audit bunu "4 missing" kimi rapor
etdi, əslində 2 orphan + 4 missing idi.

Bu dərs L-017-nin əkizidir: ikisi də avtomatik audit reaksiyasının
qarşısını alır.

### L-019 — Render kontekst i18n keyfiyyətinə təsir edir (24 May 2026)
i18n parity audit-i açar adları və leaf sayı yoxlayır, amma **vizual
formatı** yoxlamır. Mətnlər font-mono terminal blok, formal cədvəl, və
ya struktura görünüşdə render olunursa, formal simvollar (−, =, →, ✓,
•) tərcümənin parçasıdır.

Misal: TASK-0163 — RU/TR P&L education JSON parity 100% idi (TASK-0158
sonrası), amma vizual render-də AZ/EN düstur (− COGS), RU/TR yarımçıq.
Audit "missing" rapor etmədi — açar var idi, mətn də var idi, sadəcə
operator yox idi.

Audit pipeline-a əlavə etmək lazımdır:
- Render konteksti yoxla (font-mono? formal layout?)
- Bir dildən digərinə operator simvolu kopyalanır?
- Vizual snapshot test (Playwright screenshot diff)

Bu dərs L-017 (Audit ≠ tərcümə) və L-018 (Orphan key)-in 3-cüsüdür:
i18n audit avtomatik fix vermir, kontekst və render də yoxlanmalıdır.

### L-020 — Blog renderer ≠ Legal renderer (25 May 2026)
Blog markdown renderer-də xüsusi bloklar (GuruQuoteBox, DoğanNote,
warning/tip) və brand rəngləri (red accent) var. Bunlar hüquqi mətnə
uyğun deyil — cədvəlli, formal, minimal tipografiya tələb olunur.

"Mövcud var, istifadə et" düşüncəsindən qaç — kontekst fərqlidir.
Hər content sahəsi (blog, legal, email) öz renderer-ini tələb edə bilər.
Yanlış reuse bug-dan pis — sahə qarışıqlığı yaradır.

Doğru yanaşma: shared component yarat, amma blog-özəl blokları DAXIL
ETMƏ. rehype-sanitize əlavə et (blog renderer-də yoxdur — XSS riski).

### L-024 — Analytics yalnız consent ilə initialize edilir (27 May 2026)
KVKK uyğunluğu: Yandex Metrica (və ya istənilən analytics) yalnız
istifadəçi cookie consent vermiş olduqda yüklənir. Default vəziyyət:
heç bir tracking script yüklənmir. CookiesBanner-dən "Qəbul edirəm"
seçilmədikdə `localStorage['dk-cookie-consent']` boş qalır →
`YandexMetricaInit` component init çağırmır.

Bu qayda bütün gələcək analytics üçün tətbiq olunur: Google Analytics,
PostHog, Facebook Pixel — consent olmadan initialize etmə.

### L-027 — Range-based severity Infinity lazımdır (27 May 2026)
Severity thresholds `max: 100` ilə yazılmışdı. 300% labor cost girdikdə
heç bir range-ə düşmür → default `'OK'` qaytarır. Doğru yanaşma:
açıq range-lar `Infinity` (və ya `-Infinity`) istifadə etməli. Default
return da `'OK'` deyil `'CRITICAL'` olmalıdır — bilinməyən dəyər
güvənli deyil.

### L-028 — i18n validator nested key-ləri yoxlamalıdır (27 May 2026)
AI Readiness sualları + label-lar i18n-da mövcud idi, amma option
label-ları üçün component `.label` suffix əlavə edirdi — messages-da
bu suffix yox idi. Validator yalnız top-level key mövcudluğunu yoxlayır,
nested leaf-ləri yox. Audit-də runtime MISSING_MESSAGE check lazımdır.

### L-031 — Mövcud schema-nı tam oxu, dublikat yaratma (28 May 2026)
M5.1-də listings table yaradıldı — amma schema.ts:191-də artıq mövcud
idi. Build 3 xəta ilə fail oldu (duplicate export). Kök səbəb: 680
sətirlik schema.ts-ni tam oxumadan yeni table əlavə edildi.

Qayda: Hər schema/config dəyişikliyindən əvvəl mövcud export-ları grep
et. `grep "export const listing" lib/db/schema.ts` — 30 saniyəlik
yoxlama 30 dəqiqəlik debug-ı qaçırır.

### L-032 — "Boşluq" varsayma, koda bax (28 May 2026)
Email backend "MOCK/eksik" sanıldı — əslində tam hazır idi (Hostinger
SMTP, nodemailer, 5 template × 4 dil, 5 API route). OCR sistemi də
"yox" deyildi — əslində 10 faza bitmiş, Gemini Vision pipeline hazır.

Qayda: "Bu yoxdur" demədən əvvəl 3 yeri yoxla:
1. `grep -rn "sendEmail\|smtp\|resend" lib/` — kod mövcuddur mü?
2. `.env.local` — credentials dolu mu?
3. `grep -rn "import.*email" app/api/` — istifadə olunur mu?

Üçü də varsa → sistem işləyir, "boşluq" audit illüziyasıdır.
Bu dərs L-017 (audit rəqəmi ≠ runtime) ilə qardaşdır.

### L-033 — Böyük fayl oxumaları token yandırır (29 May 2026)
`messages/*.json` 830KB monolitdir — tam Read token büdcəni partladır.
Hər dəfə namespace/açar üzrə `grep` ilə hədəflə, tam fayl açma.
Eyni qayda: DEVLOG, SYSTEM-AUDIT, hər >200 sətir fayl → `offset`+`limit` ilə oxu.

### L-034 — Hostinger cold start, self-ping işləməz (29 May 2026)
Hostinger Web Apps idle prosesi öldürür → `setInterval` self-ping faydasızdır.
Xarici ping lazımdır (VPS crontab, UptimeRobot, və s.).
Script: `scripts/keep-alive.sh` — VPS crontab-a əlavə et.
### L-036 - next-intl default-locale redirect loop (31 May 2026)
`localePrefix: 'as-needed'` default locale path-larinda `/az/*` -> `/*`
redirect edir. Eger middleware unprefixed public path-lere de tekrar
next-intl uygularsa, `/*` yeniden internal `/az/*` rewrite alir ve loop
yaranir.

Qayda: middleware yalniz `/` ve real locale-prefixed path-lere next-intl
uygulamali; unprefixed public path-ler `NextResponse.next()` ile app route-a
buraxilmalidir. Regression test mutleq hem `/az/ilan-ver`, hem `/ilan-ver`,
hem de RU/EN/TR public route-lari yoxlamalidir.

**Yan effekt (31 May 2026, PR#252):** Fix sonrasi AZ default locale
prefix-siz URL-ler (`/blog/slug`) Next.js route-a catir, amma
`app/[locale]/blog/[slug]` strukturunda prefix-siz `app/blog/[slug]`
route yox idi → 404. Həll: `app/blog/[slug]/page.tsx` re-export yaradildi.

**Audit nəticəsi:** 14 route yoxlanildi (blog, ilanlar, ilan-ver, toolkit,
xeberler, uzvluk, haqqimizda + sub-route-lar). Yan effekt YALNIZ blog
`[slug]` detail-ə məxsus idi — digər səhifələr həm `/path` həm `/az/path`
formatinda 200 qaytarir. Variant C (middleware rewrite) lazim deyil.

### L-037 — Hardcoded blog override = test ediləməyən texniki borc (1 İyun 2026)
BLOG_OVERRIDES (page.tsx:13-193) 2 blog post-un AZ content-ini hardcoded
saxlayırdı, DB content-i əzirdi. Problemlər:
- DB-dəki content DeepSeek ilə tərcümə olunurdu, amma AZ override DB-dən
  gəlmirdi → AZ-da hardcoded, RU/EN/TR-də DB content → uyğunsuzluq
- Tərcümə skripti DB-ni yeniləyirdi, amma sayt hardcoded göstərirdi
- Content audit DB-yə baxırdı, real render fərqli idi

Qayda: DB-first content sistemində hardcoded fallback QADAĞANDIR. Content
yalnız DB-dən gəlməlidir. Override lazımdırsa, DB-də ayrı sütun istifadə et.

### L-038 — Default-locale (az) prefix-siz route üçün ROOT-LEVEL mirror MƏCBURİDİR (6 İyun 2026)
F2.8-də dinamik `[slug]` sektor route əlavə edildi. `app/[locale]/sektor/[slug]` yaradıldı,
köhnə root-level `app/sektor/qonaq-evi` silindi. Nəticə: `/en/sektor/otel` → 200, amma
`/sektor/otel` (az, prefix-siz) → 404 — **HƏM dev HƏM production** (real bug, dev kvirki yox).

Kök səbəb: bu codebase default-locale (az) prefix-siz route-ları middleware rewrite ilə
DEYİL, hər route üçün ROOT-LEVEL mirror ilə servis edir. `app-paths-manifest.json`-da
işləyən route üçün HƏM `/[locale]/blog` HƏM `/blog` qeydi var:
```
app/blog/page.tsx        → export { default } from '@/app/[locale]/blog/page';
app/blog/[slug]/page.tsx → export { default, generateMetadata } from '@/app/[locale]/blog/[slug]/page';
```
`as-needed`: `/az/sektor/otel` → 307 → `/sektor/otel`; əgər root `app/sektor` yoxdursa → 404.

Düzəliş: hər yeni `[locale]` route üçün eyni adlı root mirror yarat (page + [slug] + lazımsa
opengraph-image + not-found). Mirror-da `params.locale` YOXDUR → `[locale]` səhifədə locale-i
`params`-dan deyil, `getLocale()` (`next-intl/server`)-dən al ki, həm `[locale]` həm root işləsin.

Yoxlama qaydası: yeni route-u HƏMİŞƏ prefix-siz default-locale URL ilə test et
(`/sektor/otel`, `/blog`), təkcə `/en/...` ilə yox. Diaqnostika: `next build` + `next start`
+ `app-paths-manifest.json`-da `/X` (locale-siz) qeydinin varlığını yoxla.

Qeyd: bu mühitdə `next build` üçün `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1`
lazımdır (Google Fonts TLS fetch), yoxsa font-da fail edir — bu env kod problemi deyil.

### L-039 — Brend logolarini icazesiz HOST ETME (8 İyun 2026, F-RADAR-01)
Franchise Radar kataloqu ucun rekabet/brend markalari (Five Guys, Wendy's, ...)
gosterilir. Brend ADI + faktiki melumat (investisiya araligi, mense, tesis ili)
ACIQ FAKTDIR — problem deyil. Amma brend LOGOLARINI host etmek ticaret nisani
huququ riski yaradir.

Qayda: logo evezine sektor IKONU (lucide) + brend adi (metn). Hemise
"DK Agency bu markalarin resmi numayendesi deyil. Melumatlar aciq menbelerden
toplanib, deyise biler" disclaimer-i goster. Her brend uchun sourceNote saxla
(audit izi). Investisiya datasinda menbe (FDD / aciq menbe) qeyd et.

Texniki: toolSource enum-dur (franchiseToolSourceEnum) ve schema.ts PROTECTED-dir
— yeni enum deyeri elave etme. Movcud deyeri ('consulting') isit + real menbeni
score jsonb-de saxla: score: { source: 'franchise_radar', brandSlug } (ota-guide
route patterni ile eyni).

## L-013: Skorlar datadır, UI etiketi deyil (SSOT)
- **Səhv:** Test/checklist skor cədvəlləri və status etiketləri UI komponentinin içində, tərcümə mətni ilə qarışıq yazılırdı; eyni məntiq bir neçə yerdə təkrarlanırdı.
- **Kök səbəb:** «Görünən mətn» ilə «hesablanan dəyər» eyni yerdə saxlanılırdı — biri dəyişəndə digəri sürüşürdü.
- **Qayda:** Skor, hədd və status dəyərləri `lib/data/*` SSOT faylında yaşayır (`franchiseReadiness.ts`, `franchiseBuyer.ts`); UI yalnız `getStatusLabel()` kimi helper ilə etiketi i18n-dən alır. Data faylında tərcümə mətni olmaz, komponentdə skor cədvəli olmaz.
- **Nəticə:** TASK-0157D — `statusLabel` obyekti helper-ə çevrildi; franchise test/checklist skorları data faylına köçdü.

## L-023: Fakt / şərh / hipotez ayrımı — məzmun kod oxumasına əsaslanır
- **Səhv:** Alət təsvirləri və audit tapıntıları «belədir» deyə yazılırdı, amma qaynağı təxmin idi; sonra kod başqa şey edirdi.
- **Kök səbəb:** Fakt (kodda var), şərh (mənim yozumum) və hipotez (yoxlanmayıb) eyni tonda yazılırdı.
- **Qayda:** Məzmun yazmazdan əvvəl mənbə kodu oxu və GERÇƏK input/output-a əsaslan (TASK-0178A). Raportda hər iddianı işarələ: fakt (fayl:sətir), şərh, hipotez. Agent hesabatını olduğu kimi qəbul etmə — kritik iddiaları özün yenidən yoxla.
- **Nəticə:** TASK-0178A alət təsvirləri; 2026-09-13 auditlərində hər agent tapıntısı təkrar yoxlandı (bəziləri yanlış çıxdı: «13 dərs itib» → əslində 2).

## L-040: Xəta yolu keçdi ≠ uğur yolu keçdi
- **Səhv:** `scripts/migrate.mjs` sandbox-da yalnız «DATABASE_URL yoxdur → təmiz mesaj» yolu ilə sınandı; canlıda ardıcıl 3 baq çıxdı (`*/` şərh, `.env.local` oxunmur, çox-ifadəli sorğu).
- **Kök səbəb:** Uğur yolunu icra edə bilmədiyim halda «sintaksis keçir, xəta mesajı düzgündür»ü sübut saydım.
- **Qayda:** Uğur yolu sınanmayıbsa «hazırdır» demə — «yoxlanmayıb» yaz. Sandbox-da real Postgres qaldırmaq mümkündür (`/usr/lib/postgresql/16/bin`, `postgres` useri ilə `initdb`): DB toxunan hər skript orada uçdan-uca işlədilməlidir.
- **Nəticə:** TASK-0440/0441/0442 — üçüncü PR-da lokal Postgres-də 100 ifadə × 2 keçid sınandı.

## L-041: Neon-http — prepared statement tək ifadə qəbul edir; ayrı BEGIN/COMMIT transaksiya deyil
- **Səhv:** Miqrasiya faylı bütöv göndərildi → `cannot insert multiple commands into a prepared statement`. `BEGIN`/`COMMIT` ayrı `sql.query()` ilə gedirdi — hər çağırış müstəqil HTTP sorğusudur, transaksiya yaranmır.
- **Qayda:** SQL-i ifadələrə böl (`$$…$$`, `'…'`, `--`, blok şərhi nəzərə alınmaqla) və `sql.transaction([...])` ilə bir sorğuda göndər; izləmə qeydini eyni massivə qoş.
- **Nəticə:** TASK-0442 — `splitStatements()` + `sql.transaction`; canlıda 16/16 OK.

## L-042: Naxışlı `pkill/pgrep -f` öz shell-ini vurur; canlı dev serverin altında `.next`-ə toxunma
- **Səhv:** `pkill -f "next dev"` / `pgrep -f "…next dev"` mənim öz bash əmrimin mətninə uyğun gəldi → shell exit 144, build başlamadı (3 dəfə). `rm -rf .next/dev` işləyən serverin build qovluğunu sildi → hər sorğu 500; `ss -ltnp` pid-i göstərmədi, «port boşdur» sandım.
- **Qayda:** Prosesi `pgrep -x next-server` (dəqiq ad) ilə tap; port boşalana qədər gözlə; **yalnız sonra** `.next/dev` sil. Uzunmüddətli serveri tool-un arxa plan rejimi ilə qaldır.
- **Nəticə:** TASK-0443/0444 — smoke test təmiz serverdə 7/7.

## L-043: Köhnə `.next` artefaktları yalançı tsc xətası verir; ümumi saya yox, main ilə fərqə bax
- **Səhv:** tsc 482 (`.next/dev/types/routes.d.ts`) və 66 (`.next/types/validator.ts`, silinən route-lara istinad) — heç biri mənbə deyildi.
- **Qayda:** Saymazdan əvvəl `rm -rf .next/dev .next/types`. Baza ilə fərq üçün `origin/main`-i müvəqqəti worktree-də (`node_modules` symlink) tsc-dən keçirib `comm` ilə tutuşdur — «36 vs 35» yalnız fərq siyahısı ilə mənalıdır.
- **Nəticə:** TASK-0444 — 5 «yeni» xəta bazada da vardı; tək gerçək xəta tapılıb düzəldildi.

## L-044: Playwright — Tailwind v4 rəngi `lab()` verir; error.tsx mətni raw HTML-də həmişə var
- **Səhv:** `color === 'rgb(71,85,105)'` düzgün rəngdə FAIL verdi (`lab(35.56 …)` qayıdır). Raw HTML-də «Xəta baş verdi» axtaran regex 20/20 səhifədə «error boundary» dedi — mətn fallback kimi həmişə mövcuddur.
- **Qayda:** Rəngi canvas ilə rgb-yə çevir, ±3 tolerantlıq. Xəta boundary-ni `getByText(...).isVisible()` + səhifəyə məxsus element (sidebar) ilə yoxla. Test FAIL verəndə əvvəl testi şübhə altına al, işləyən kodu «düzəltmə».
- **Nəticə:** TASK-0443/0444 — hər iki test düzəldildi, kod dəyişmədi.

## L-045: Grid uşağı `min-width:auto` `overflow-x-auto`-nu ləğv edir; çip zolağı `flex-wrap` istəyir
- **Səhv:** deal-flow-da cədvəl düzgün `overflow-x-auto` içində idi, amma səhifə 426px-ə daşırdı. 4 səhifədə filtr çipləri `flex gap-2`-də sarılmırdı (525px).
- **Qayda:** `overflow-x-auto` sarğısı grid/flex uşağındadırsa uşağa `min-w-0` ver. Çip/düymə sıraları `flex flex-wrap`. KPI şəbəkələri prefikssiz `grid-cols-N` olmasın. 390px-də `scrollWidth == clientWidth` yoxlaması məcburidir.
- **Nəticə:** TASK-0443 — 8 səhifə 390px-də təmiz.

## L-046: «Route-a auth əlavə et» tövsiyəsindən əvvəl çağıranları izlə
- **Səhv (az qala):** Audit `/api/food-cost`-a admin qoymağı dedi; `type=lookup` açıq `/toolkit/food-cost` alətindən çağırılırdı — kor guard pulsuz aləti sındırardı.
- **Qayda:** `grep -rn "api/<route>"` ilə bütün çağıranları tap; qorunma lazımdırsa **əməliyyat səviyyəsində** ayır. Kopyalanan yoxlama əvəzinə `lib/api/guards.ts`. `middleware` `/api/*`-ı tutmur — hər route özü qorunmalıdır.
- **Nəticə:** TASK-0439 — lookup açıq (IP limit), qalan növlər admin.

## L-047: JSDoc içində `*/` şərhi bağlayır
- **Səhv:** Şərhdə `drizzle-orm/*/migrator` yazıldı → şərh erkən bağlandı, `SyntaxError`.
- **Qayda:** Blok şərhində yol/glob yazarkən `*/` ardıcıllığından qaç; `node --check` ilə yoxla.
- **Nəticə:** TASK-0440.

## L-048: Qaydası olmayan class səssiz no-op-dur — simptomu yox, kökü düzəlt
- **Səhv:** `DashboardLayout` `className="dashboard-scope"` yazırdı, CSS-də qayda yox idi; `body{color:#eaeaea}` qaranlıq landing üçündür → dashboard-da rəngsiz mətn ağ üstündə ağ. 200 `text-slate-400` yamağı bu simptomu örtmək üçün yığılmışdı.
- **Qayda:** Görünməz mətn görəndə yerinə boz yapışdırma; `grep -rn <class>` ilə qaydanın mövcudluğunu yoxla və kökü düzəlt. Dashboard kök rəngi `.dashboard-scope{color:var(--dk-ink)}`. `text-slate-400` əsas mətn üçün QADAĞAN (2.56:1).
- **Nəticə:** TASK-0443 — bir sətir + 200 istifadə → 600.

## L-049: Miqrasiya — əl ilə yazılan idempotent, drizzle-kit-inki redaktəsiz, runner journal-ı atlayır
- **Səhv:** 25 SQL faylı, journal-da 9; `db:migrate` yox idi. Eyni nömrəli fayllar (`0007_*` ×2) əlifba sırası ilə toqquşurdu. `0013`-də `CREATE INDEX` `IF NOT EXISTS`-siz idi.
- **Qayda:** Əl ilə yazılan hər miqrasiya `IF NOT EXISTS`/`DO $$ … EXCEPTION` ilə təkrar icraya davamlı olsun. Drizzle-in generasiya etdiyi faylları idempotent etmə. Runner `_journal.json`-dakıları atlayır. Canlıda `npm run db:migrate`; `db:migrate:bootstrap` yalnız sıfırdan baza. `drizzle-kit push` canlıda QADAĞAN.
- **Nəticə:** TASK-0440–0442; RUNBOOK §6.


## L-050: `node --env-file` fayl yoxdursa sərt dayanır — cron 3 ay səssiz sındı
- **Səhv:** `fetch:news` script-i `node --env-file=.env.local …` idi. CI-da `.env.local` heç vaxt olmur (sirlər `env:` ilə gəlir) → Node exit 9 «not found». «Daily News Fetch» cron-u son 100 icrada 100 dəfə FAIL etdi (2026-06-06-dan), heç kim baxmadı — pendingNews 3 ay yenilənmədi.
- **Kök səbəb:** (1) `--env-file` opsional deyil, məcburidir; opsional forması `--env-file-if-exists`-dir (`--env-file-if-missing` mövcud deyil). (2) Scheduled workflow-ların nəticəsi PR-da görünmür; qırmızı cron heç kimin axınına düşmür.
- **Qayda:** npm script-lərində env faylı həmişə `--env-file-if-exists=` ilə (və ya skript içində `loadEnvFiles()` — L-040). Workflow Node versiyası `engines`-ə uyğun olmalıdır. Sessiya başlanğıcında `Actions` səhifəsində scheduled workflow-ların son nəticəsinə bax — HANDOFF checklist-inə əlavə.
- **Nəticə:** TASK-0446 — 4 script `--env-file-if-exists`, workflow Node 22.

## L-051: Prettier PostToolUse hook 2 sətirlik düzəlişi 160 sətirlik diff-ə çevirir
- **Səhv:** TASK-0447-də `Edit` ilə `blog`/`food-cost`/`adminContent`-də 1–2 sətir dəyişdim; hook bütün faylı formatladı — 27 / 160 / 314 sətir kollateral. Reviewer 2 sətirlik fix-i 500 sətirin içində axtarmalı olardı.
- **Kök səbəb:** Repo faylları prettier ilə formatlanmayıb; hook isə hər `Edit`-dən sonra tam faylı formatlayır. Yalnız formatlanmamış fayllarda baş verir (`e2e/*.spec.ts` kimi yeni fayllarda problem yoxdur).
- **Qayda:** `Edit`-dən sonra `git diff --stat` — dəyişən sətir sayı gözləniləndən böyükdürsə `git checkout -- <fayl>` + `perl -0pi` / `sed` ilə minimal tətbiq. Diff yalnız nəyi düzəltdiyini göstərməlidir. Formatlama ayrıca «chore(format)» PR-ıdır.
- **Nəticə:** TASK-0447 diff: blog 6, food-cost 4, adminContent −21 sətir.
