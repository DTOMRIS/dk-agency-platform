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

## L-008: Köhnə sessiya pattern tələsi
- **Səhv:** TASK-0148 PR-sız birbaşa main-ə push olundu (`git push --no-verify`)
- **Kök səbəb:** Agent köhnə sessiya tasklarına (TASK-0144/0145 PR-sız idi) baxıb onları nümunə götürdü. 5-qat control (PR #129) o tasklardan SONRA qurulmuşdu.
- **Qayda:** HƏR task = branch + PR + dk-validator. İSTİSNA YOXDUR. `git push --no-verify` QƏTİ QADAĞAN. Köhnə commit-lərdə PR-sız nümunə görsən belə, onları təkrarlama — köhnə git tarixçəsi ≠ cari qayda.
- **Yoxlama:** ƏVVƏL TANIŞ OL fazasında git log-a baxanda, köhnə pattern-i nümunə kimi qəbul etmə. Yalnız CLAUDE.md + LESSONS.md cari qaydadır.
- **Nəticə:** Post-merge manual audit ilə neytrallaşdırıldı (dublikat/PROTECTED/i18n/build təmiz). Amma audit xərci PR-dan 3x artıqdır — qaydaya riayət ucuzdur.
