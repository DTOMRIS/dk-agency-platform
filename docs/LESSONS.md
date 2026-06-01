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
