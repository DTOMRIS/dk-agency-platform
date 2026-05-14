# DEVLOG — DK Agency Platform

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

---
