# Tech Debt Registry — DK Agency Platform

Texniki borc qeydleri. Her giris prioritet, sprint ve hell plani ile.

---

## TD-010 — Koddakı `t('…')` açarlarının JSON-da mövcudluğu yoxlanmır

**Tarix:** 2026-09-26
**Sprint:** TASK-0453 zamanı qeydə alındı
**Status:** ACIQ
**Prioritet:** Orta

### Problem
Bloq yazısının CTA blokunda canlıda «blogDetail.ctaTitle» kimi xam açarlar görünürdü (TASK-0453): kod `t('ctaTitle')` çağırırdı, `messages/*.json`-da açar heç vaxt olmayıb. Mövcud i18n yoxlaması yalnız 4 dilin bir-biri ilə paritetinə baxır — hamısında eyni açar yoxdursa, paritet «PASS» verir.

### Hell
Skript: `useTranslations('ns')` / `getTranslations('ns')` namespace-i ilə eyni fayldakı sabit `t('key')` çağırışlarını toplayıb `messages/az.json`-da `ns.key` yolunu yoxlasın; dinamik açarlar (template string ilə qurulan) atlanır. `verify:staged` və CI quality-gates-ə qoşulsun.

### Elaqeli
- app/[locale]/blog/[slug]/page.tsx
- messages/*.json

---

## TD-005 — `hero` səhifəsində saxta «Saxla» / «Dərc et»

**Tarix:** 2026-09-13
**Sprint:** TASK-0445 zamanı qeydə alındı
**Status:** HELL EDILDI — TASK-0447 (səhifə silindi)
**Prioritet:** Orta

### Problem
`app/dashboard/hero/page.tsx` — 0 `fetch`. «Saxla» (`:235`) və «Dərc et» (`:243`) yalnız toast göstərir; TR/EN tərcümə düymələri `onClick={() => undefined}`. Saxta «Saxlanıldı ✓» etibarı ən çox zədələyən şeydir (CLAUDE.md: mock ilə «tamam» demə).

### Hell
Sahib «hallet» dedi (2026-09-13). Araşdırma: landing `components/Hero.tsx` mətni 4 dildə kodda yazılıb, `hero_content` cədvəlini tətbiq kodu heç yerdə oxumur (yalnız tərcümə skriptləri); redaktorun sahə modeli canlı Hero ilə uyğun deyil (RU yox, CTA sabit `/auth/register`); `defaultHeroContent` saxta rəqəmlər daşıyırdı («150+ aktiv restoran», «32% xərc azalması») — «Saxla» real olsaydı bunlar canlıya gedərdi. Qərar: 0444 presedenti («C sil») — səhifə + `[locale]` mirror + sidebar linki + `nav.hero` i18n (4 dil) + `defaultHeroContent` silindi. Real hero redaktoru = ayrıca feature: 4 dilli `hero_content` API/repo + landing Hero-nun DB-dən oxuması + revalidate — HANDOFF yol xəritəsində.

### Elaqeli
- app/dashboard/hero/page.tsx
- drizzle/0001_add_ru_locale_columns.sql (hero_content)

---

## TD-006 — `ilanlar` səssiz `MOCK_LISTINGS` fallback-i

**Tarix:** 2026-09-13
**Sprint:** TASK-0445 zamanı qeydə alındı
**Status:** ACIQ
**Prioritet:** Yüksək

### Problem
`app/dashboard/ilanlar/page.tsx:239-262` — `/api/listings` sınanda catch `MOCK_LISTINGS`-ə keçir, statistikanı saxta datadan hesablayır, **heç bir xəbərdarlıq göstərmir**. Admin saxta rəqəmi istehsal sanır; üstəlik altdakı xətanı gizlədir. (`listingRepository.ts:342` bare `select()` + schema-da miqrasiyasız 13 sütun → bu fallback normal yol ola bilər.)

### Hell
1. Fallback-i sil; xəta halında «DB əlçatmazdır» kartı (contact-tracking nümunəsi). 2. `listings` üçün çatışmayan sütunların miqrasiyasını yaz (`contact_name, contact_email, lng, price_label, equipment, images, ai_check_result, committee_notes, approved_at, approved_by, rejected_reason, view_count, expired_at`) və bare `select()`-i açıq sütun xəritəsinə çevir.

### Elaqeli
- app/dashboard/ilanlar/page.tsx
- lib/repositories/listingRepository.ts
- lib/data/mockListings.ts

---

## TD-007 — `[locale]/dashboard/layout` locale-i cookie-dən oxuyur, `params`-dan yox

**Tarix:** 2026-09-13
**Sprint:** TASK-0445 zamanı qeydə alındı
**Status:** ACIQ
**Prioritet:** Orta

### Problem
`app/[locale]/dashboard/layout.tsx` kök layout-u re-export edir; o isə `NEXT_LOCALE` cookie-sindən oxuyur. `/tr/dashboard/*`-a AZ cookie ilə gələn TR istifadəçi AZ dashboard görür (L-011 layout səviyyəsində təkrarlanır).

### Hell
`[locale]` ağacına öz layout-u: `params.locale` əsas, cookie fallback.

### Elaqeli
- app/[locale]/dashboard/layout.tsx
- app/dashboard/layout.tsx

---

## TD-008 — Dashboard vizual birləşmə — `.dk-card` rollout, `<DashboardPageHeader>`, TopBar başlığı

**Tarix:** 2026-09-13
**Sprint:** TASK-0445 zamanı qeydə alındı
**Status:** ACIQ
**Prioritet:** Orta

### Problem
TASK-0443 primitivi (`.dk-card`) yaratdı, amma 9 radius / 4 sərhəd rəngi hələ səhifələrdədir; 8 fərqli H1 üslubu; `DashboardTopBar.tsx:19-26` başlığı URL slug-ından düzəldir («B2b Yonetimi», `/faturalar/<uuid>` → çılpaq UUID). Emoji ikon sistemi (`contact-tracking`, `faturalar`, editor toolbar-ları) lucide ilə qarışıqdır. `lib/design-tokens.ts` heç yerdən import olunmur.

### Hell
1. `.dk-card`-ı 19 səhifəyə yay, `design-tokens.ts`-i sil və ya `@theme inline`-a köçür. 2. Tək `<DashboardPageHeader>` (eyebrow + `font-display text-3xl` h1 + subtitle + action slot). 3. TopBar: `href → t('dashboardSidebar.nav.*')`. 4. `CHANNEL_ICONS`/`SOURCE_ICONS` lucide xəritələri.

### Elaqeli
- app/globals.css (.dk-card)
- components/dashboard/DashboardTopBar.tsx
- lib/design-tokens.ts

---

## TD-009 — `drizzle-kit push` canlıda qadağandır — amma gate yoxdur

**Tarix:** 2026-09-13
**Sprint:** TASK-0445 zamanı qeydə alındı
**Status:** ACIQ
**Prioritet:** Aşağı

### Problem
DEPLOYMENT.md və CLAUDE.md `db:migrate`-i tək yol elan edir (L-049). Texniki maneə yoxdur — kimsə vərdişlə `drizzle-kit push` işlədə bilər (sütun silmə riski, iz yoxdur).

### Hell
`package.json`-da `db:push` scripti yoxdur — yaxşı; `drizzle.config`-də `strict: true` + README xəbərdarlığı; istəyə görə `scripts/verify-*`-də `drizzle-kit push` istinadını axtaran yoxlama.

### Elaqeli
- docs/DEPLOYMENT.md
- docs/RUNBOOK.md §6
- scripts/migrate.mjs

---

## TD-004 — İki paralel auth sistemi

**Tarix:** 2026-09-13
**Sprint:** TASK-0439 zamanı aşkarlandı
**Status:** QISMƏN HƏLL — TASK-0457 (2026-09-26): `session.plan` artıq imzalı JWT-dən qurulur (member cookie saxtalaşdırıla bilirdi — L-055); DB-ni birbaşa oxuyan 7 dashboard səhifəsinə `requireAdminPage()`. Qalan: dashboard layout yalnız JWT varlığını yoxlayır — client səhifələrin shell-i üzvə açılır (data API-dən 403); dashboard-u admin / üzv (`marketinq-ocagi`) hissəyə ayırmaq sahib qərarıdır.
**Prioritet:** Orta

### Problem
Eyni ağacda iki müstəqil sessiya sistemi işləyir:

1. `lib/auth/guards.ts` → JWT cookie, `user.role === 'admin'`
   (məs. `app/dashboard/funnel/page.tsx:10`)
2. `lib/members/server-session.ts` → `session.plan === 'admin'`
   (məs. `app/api/settings/route.ts:10-12`, `/ilan-ver`)

Nəticə: `role` və `plan` ayrı-ayrı mənbələrdən gəlir və biri
dəyişəndə digəri xəbərsiz qalır. Hansının hara aid olduğu yazılı deyil,
ona görə yeni route yazan adam təsadüfi seçir — TASK-0439-da dörd
route-un ümumiyyətlə yoxlamasız qalmasının səbəblərindən biri budur.

### Müvəqqəti vəziyyət
`lib/api/guards.ts` (TASK-0439) API route-ları üçün tək giriş nöqtəsi
yaradır və 2-ci sistemin üzərində qurulub, çünki dashboard API-larının
əksəriyyəti onu işlədir. Bu, problemi həll etmir — yalnız sərhədi
bir yerə toplayır.

### Hell
1. Hansı sistemin SST olduğuna qərar ver (`plan` tövsiyə olunur —
   daha çox route onu işlədir və üzvlük məntiqi ona bağlıdır)
2. `role` istifadələrini ona köçür
3. `app/dashboard/layout.tsx`-ə tək rol yoxlaması qoy — hazırda
   layout yalnız token varlığını yoxlayır, yəni `member` planlı
   istifadəçi bütün dashboard səhifələrini aça bilir
4. Köhnə sistemi sil

### Elaqeli
- lib/api/guards.ts
- lib/auth/guards.ts
- lib/members/server-session.ts
- app/dashboard/layout.tsx

---

## TD-001 — Marketing tier mapping role-a baglidir

**Tarix:** 2026-05-09
**Sprint:** 1 (kesf), 2 (qebul)
**Status:** ACIQ
**Prioritet:** Asagi (Stripe inteqrasiyasina qeder)

### Problem
`lib/marketing-gating.ts` → `mapPlanToTier()` MemberPlan
(free/member/admin) → MarketingToolTier (sagird/kalfa/usta) edir.
Bu o demekdir ki, her `member` plan istifadecisi avtomatik KALFA-dir.
Stripe/Payriff inteqrasiyasi gelende bu yanlis olacaq.

### Hell
1. `member_subscriptions` cedvelinde `marketing_tier` enum column elave et
   (sagird/kalfa/usta)
2. Stripe webhook-dan odenis statusuna gore bu column-u yenile
3. `mapPlanToTier()`-i extend et: evvel marketing_tier yoxla, varsa
   istifade et, yoxsa role mapping-e fall back

### Elaqeli
- docs/MARKETINQ_OCAGI_SPEC.md bolme 2.1.1
- lib/marketing-gating.ts
- Sprint 5 (Stripe/Payriff)

---

## TD-002 — ANTHROPIC_API_KEY production validation

**Tarix:** 2026-05-10
**Sprint:** 2
**Status:** ACIQ
**Prioritet:** Orta

### Problem
Marka Kompasi prod-da ai_provider=deepseek qaytarir (fallback), Claude
primary islenir. Spec-de Claude primary qeyd edilmisdir
(positioning ucun April Dunford terzi nuanced cavab).

### Sebeb (ehtimal)
- ANTHROPIC_API_KEY Hostinger panel env-de yoxdur, ya da
- Movcuddur amma key kecersizdir/format yanlisdir, ya da
- Model adi `claude-sonnet-4-20250514` movcud deyil (model adlandirmasi
  deyismis ola biler)

### Hell
1. Dogan: Hostinger panelde ANTHROPIC_API_KEY movcudlugunu yoxla
2. Var olarsa: lokalda eyni key ile tek cagris test et
3. Test fail olsa: model adi movcud deyil — model siyahisini yoxla
4. Duzelt → restart Hostinger app → yeniden test (yeni run
   ai_provider='claude' olmalidir)

### Elaqeli
- lib/ai-router.ts (callClaude funksiyasi)
- DEVLOG TASK-0102 netice bolmesi

---

## TD-003 — b2b-panel ana sehife Pattern C (inline Record<Locale>)

**Tarix:** 2026-06-07
**Status:** HELL OLUNDU (TASK-0212, 2026-06-07)
**Prioritet:** Orta (qayda pozuntusu, amma islenir)

> HELL: `app/b2b-panel/page.tsx` Pattern A-ya (`useTranslations('b2bPanel')`)
> kecirildi; string-ler `messages/{az,ru,en,tr}.json`-a verbatim kocuruldu.
> Lokal `copy` obyekti kohne shape-i sakladi → 23 istifade noktasi deyismedi.
> Build PASS, 4 dil acar-butovluyu PASS, /b2b-panel 307->200 (L-010 saglam).

### Problem
`app/b2b-panel/page.tsx` ~180 setirlik `pageCopy: Record<Locale, ...>`
inline tercume bloku (Pattern C) saxlayir — L-004/L-009 qaydasina ziddir.
Eyni qovluqdaki `components/b2b-panel/B2BSidebar.tsx` ARTIQ Pattern A
(`useTranslations`) islenir, yeni uygunsuzdur. PR #298 ile genislendi.

### Niye derhal duzelmedi
30+ istinad noktasi (`copy.statLabels[0]`, `copy.categoryLabels[cat]`,
`copy.offerItems[i]` ...) + array/nested obyekt strukturlari var. Teze
merge olunmus auth-yaxin faylda telesik refaktor runtime MISSING_MESSAGE
bug riski yaradir. Ayrica fokuslu task lazimdir (L-016: kohne borc cari
isi bloklamamalidir).

### Hell (gelecek task — TASK-0212 namizedi)
1. `b2bPanel` namespace-i `messages/{az,ru,en,tr}.json`-a kocur
   (string-ler artiq movcuddur — VERBATIM kocurme, yeni tercume yox).
2. Array-lar ucun `t.raw('statLabels')`, nested ucun `t('statusLabels.active')`.
3. `pageCopy` + `normalizeLocale(pathname)` copy mentiqini sil,
   `useTranslations('b2bPanel')` ile evez et (locale provider-den gelir).
4. Hemise prefix-siz `/b2b-panel` HEM de `/en/b2b-panel` smoke et;
   build + MISSING_MESSAGE konsol yoxlamasi.

### Elaqeli
- app/b2b-panel/page.tsx (Pattern C)
- components/b2b-panel/B2BSidebar.tsx (Pattern A referans)
- docs/LESSONS.md L-004, L-009
