# DK AGENCY — CLAUDE-DESIGN.md
# ═══════════════════════════════════════════════════════════
# Bu faylı hər PR-dan əvvəl oxu. Pozsan cavabdehsən.
# Son yenilənmə: 4 Aprel 2026
# ═══════════════════════════════════════════════════════════

## 1. PROYEKT KİMLİYİ

**Ad:** DK Agency — Azərbaycanın ilk AI-dəstəkli HoReCa B2B platforması
**Hədəf:** Restoran sahibkarları (Azərbaycan + Türkiyə bazarı)
**Repo:** github.com/DTOMRIS/dk-agency-platform
**Canlı:** Vercel deploy
**Qurucu:** Doğan Tomris (Bakı, UTC+4)

## 2. TECH STACK (KİLİDLİ — DƏYİŞMƏ)

| Qat | Texnologiya | Qeyd |
|-----|-------------|------|
| Framework | Next.js 14 | App Router |
| Style | Tailwind CSS | design-tokens.ts ilə |
| ORM | Drizzle ORM | drizzle-kit push |
| Database | Neon PostgreSQL | TQTA ilə shared |
| Auth | Custom member system | lib/member-access.ts + /api/member/auth |
| Deploy | Vercel | Auto-deploy on PR merge |
| Media | Cloudinary | Env hələ aktiv deyil |
| Email | Resend | Env hələ aktiv deyil, 6 template hazır |
| AI (primary) | DeepSeek API | KAZAN AI provider |
| AI (fallback) | Anthropic API | İkinci provider |
| AI (dev) | Claude + Gemini CLI | Development zamanı |

### ⛔ QADAĞAN
- NextAuth adapter istifadə etmə — custom member sistemi genişləndir
- Framework dəyişikliyi təklif etmə
- Dark theme (utility bar + CTA strip xaricində)
- "Agentlik", "Holdinq", "CRM", "Pipeline" sözləri
- Playfair Display font-unu dəyişmə (headings üçün)

## 3. DİZAYN SİSTEMİ

### Rənglər
```
Navy (primary text):     #1A1A2E
Gold (accent):           #C5A022
Gold Light (bg):         #FFF8E7
Red (CTA):               #E94560
Red Light (bg):          #FFF0F3
Background:              #FAFAF8
Surface:                 #F9FAFB
Text Muted:              #6B7280
Border:                  #E5E7EB
Purple (badge):          #8B5CF6
Green (success):         #059669
```

### Fontlar
- **Headings:** Playfair Display (serif) — DƏYİŞMƏ
- **Body:** DM Sans (sans-serif)
- **Mono:** JetBrains Mono (kod blokları)

### Layout qaydaları
- Light tema ONLY (dark QADAĞAN, utility bar xaricində)
- Max container width: 1200px
- Section padding: 80px 32px
- Card border-radius: 12px
- Button border-radius: 8px

### Design tokens faylı: `lib/design-tokens.ts`
Bu fayl bütün rəng/font/spacing məlumatlarının single source of truth-udur.

## 4. MARKA KİMLİYİ (Ahilik/Əxilik)

| Konsept | İzah | İstifadə yeri |
|---------|------|---------------|
| KAZAN AI | AI chatbot ("mətbəx qazanı" + "qazan/qələbə") | /kazan-ai |
| OCAQ | Sahibkar/admin paneli | /dashboard |
| Şədd Rozeti | Audit/keyfiyyət sertifikatı | Gələcək feature |
| Cavanmərdlik | Güvən inşası tonu | Bütün mətnlər |

**Slogan:** "Ustalığın Nişanı, Dijitalin Şeddi"
**AZ:** "Mütəxəssislik möhürü, rəqəmsalın şəddi"

## 5. DOSYA YAPISI (KRİTİK)

```
app/
├── page.tsx                      # Ana səhifə
├── kazan-ai/page.tsx             # KAZAN AI chat (Phase 1)
├── blog/[slug]/page.tsx          # Blog yazı
├── ilanlar/page.tsx              # İlan vitrini
├── ilan-ver/page.tsx             # İlan vermə formu (5 step)
├── auth/login/page.tsx           # Giriş
├── auth/register/page.tsx        # Qeydiyyat
├── dashboard/                    # Admin OCAQ paneli
│   ├── ilanlar/page.tsx          # İlan idarəsi
│   ├── ilanlar/[id]/page.tsx     # İlan detay/review
│   └── ...                       # digər admin səhifələr
├── [locale]/                     # i18n wrappers (az/tr/en)
│   └── (hər route-un locale mirror-u)
├── api/
│   ├── kazan-ai/route.ts         # AI chat API
│   ├── member/auth/route.ts      # Custom auth
│   ├── member/session/route.ts   # Session management
│   ├── listings/route.ts         # İlan API
│   └── news/                     # Xəbər API (route map var, impl yox)
components/
├── kazan-ai/KazanAiChatClient.tsx  # Chat UI (228 sətir, tam hazır)
├── listings/                       # İlan komponentləri
├── dashboard/                      # Admin panel komponentləri
├── blog/                           # Blog komponentləri
├── layout/                         # Header, Footer, MegaMenu
lib/
├── db/schema.ts                    # Drizzle schema (10+ table)
├── db/index.ts                     # DB connection
├── member-access.ts                # Custom auth system
├── data/
│   ├── listingFieldConfig.ts       # ⚡ SINGLE SOURCE OF TRUTH
│   ├── mockListings.ts             # 12 mock ilan
│   ├── blogArticles.ts             # Blog data (DB-yə migrate olunub)
│   └── newsSources.ts              # 6 RSS source
├── kazan-ai/
│   ├── knowledge-base.ts           # 10 mövzu bilgi bazası
│   └── system-prompt.ts            # KAZAN AI davranış qaydaları
├── utils/
│   ├── imageUtils.ts               # Şəkil sıxışdırma
│   ├── listingStatus.ts            # Status workflow
│   └── tracking.ts                 # DK-2026-XXXX tracking
```

## 6. DATABASE SCHEMA (Neon PostgreSQL)

PR#11 ilə push olunub. Əsas cədvəllər:
- `users` — üzv məlumatları + bcrypt hash
- `listings` — elanlar (7 tip, jsonb typeSpecificData)
- `listing_media` — ilan şəkilləri
- `listing_leads` — maraqlanıram formları
- `listing_reviews` — admin rəyləri
- `blog_posts` — blog yazıları (PR#12 ilə migrate)
- `news_sources` — 6 HoReCa RSS source
- `news_articles` — xəbərlər
- `partners` — tərəfdaşlar
- `guru_boxes` — guru sitatları
- `site_settings` — sayt ayarları

**Seed data:** 12 ilan, 2 user, 6 news source.
**Admin seed password:** "admin123" — PRODUCTION-DA DƏYİŞ!

## 7. listingFieldConfig.ts — SINGLE SOURCE OF TRUTH

Bu fayl 7 ilan tipinin field təriflərini saxlayır:
- devir
- franchise-vermek
- franchise-almaq
- ortak-tapmaq
- yeni-investisiya
- obyekt-icaresi
- horeca-ekipman

**3 yer bu fayldan oxuyur:**
1. Admin detail səhifəsi (dashboard/ilanlar/[id])
2. Public ilan modal (ListingModal)
3. Elan vermə formu (ilan-ver multi-step)

**QAYDA:** Bu 3 yerdə hardcoded field yazma. Həmişə `getFieldsForType(type)` istifadə et.
Bu qayda Özbahçeci proyektindəki səhvdən öyrənilib — generic form layout əvəzinə field-by-field.

## 8. AUTH SİSTEMİ

**Custom member-based** (NextAuth DEYİL):
- `lib/member-access.ts` — writeMemberSession, MemberSession
- `/api/member/auth` — register + login
- Session: cookie-based via `/api/member/session`
- Password: bcrypt hash (PR#11)

**Mövcud auth flow-lar:**
- ✅ Register + Login
- ✅ Forgot password (form var)
- ✅ Reset password
- ✅ Change password (settings)
- ✅ Email verification (form var)
- ✅ Login logs
- ✅ Settings/profile page
- ⚠️ Real email göndərmə — Resend env aktiv deyil (console.log)

## 9. KAZAN AI ARXİTEKTURASI

```
İstifadəçi sualı
       ↓
KazanAiChatClient.tsx (frontend, 228 sətir)
       ↓ POST /api/kazan-ai
api/kazan-ai/route.ts
       ↓
Provider chain:
  1. DEEPSEEK_API_KEY varsa → DeepSeek API
  2. ANTHROPIC_API_KEY varsa → Anthropic API
  3. Heç biri yoxdursa → Statik nümunə cavab

System prompt: lib/kazan-ai/system-prompt.ts
Knowledge base: lib/kazan-ai/knowledge-base.ts (10 mövzu)
```

**Vercel env lazım:** `DEEPSEEK_API_KEY` (və/və ya `ANTHROPIC_API_KEY`)

## 10. QUALİTY GATES (hər PR üçün)

CI/CD workflow (GitHub Actions):
1. ✅ ESLint — 0 error (warning OK)
2. ✅ `npm run build` — xətasız keçməli
3. ✅ AZ encoding yoxla — ə, ö, ü, ş, ç, ğ, ı qorunmalı (mojibake QADAĞAN)
4. ✅ CHANGELOG.md yenilənməli

**Pre-push hook:** main-ə direct push bloklanır. PR açmaq lazım.
**Override:** `$env:ALLOW_PROTECTED='1'; git push` (yalnız lazım olanda)

## 11. ÖYRƏNILƏN DƏRSLƏR (POZMA!)

### TASK-0141 Menyu Analitiği formula
Menyu mühəndisliyi BCG matrisi yalnız verilən rəqəmlərlə hesablanır:
- Contribution Margin = Satış qiyməti - Yemək məsrəfi
- Food Cost % = Yemək məsrəfi / Satış qiyməti * 100
- Menu Mix % = Item satışı / Ümumi satış * 100
- Orta CM = bütün item CM cəmi / item sayı
- Orta Mix % = 100 / item sayı

Quadrant qaydası:
- ULDUZ: CM >= orta CM və Mix >= orta Mix
- İŞ ATI: CM < orta CM və Mix >= orta Mix
- BULMACA: CM >= orta CM və Mix < orta Mix
- İT: CM < orta CM və Mix < orta Mix

AI yalnız tövsiyə qatıdır. Kateqoriyanı AI yox, bu deterministik formula verir. DeepSeek çağırışı server action-da qalmalıdır; `DEEPSEEK_API_KEY` client bundle-a düşməməlidir.

### TASK-0143 P&L Simulyatoru formula və benchmark
P&L Simulyatoru USTA tier alətidir. Hesablama client-side deterministikdir, AI yalnız maliyyə şərhi və addım tövsiyəsi verir:
- Ümumi satış = yemək satışı + içki satışı + digər gəlir
- COGS = başlanğıc stok + alışlar - son stok
- Yemək məsrəfi % = COGS / ümumi satış * 100
- İşçi xərci % = işçi xərci / ümumi satış * 100
- Prime Cost = COGS + işçi xərci
- Prime Cost % = Prime Cost / ümumi satış * 100
- Overhead = icarə + kommunal + sığorta + lisenziya + marketing + digər
- Xalis mənfəət = ümumi satış - COGS - işçi xərci - overhead
- Zərərsizlik nöqtəsi = overhead / (1 - dəyişkən xərc %)

Benchmark qaydası:
- Food Cost <=30% yaxşı, 30-35% diqqət, >35% kritik
- Labor <=30% yaxşı, 30-35% diqqət, >35% kritik
- Prime Cost <=60% yaxşı, 60-70% diqqət, >70% kritik
- Net Profit >=5% sağlam, 3-5% diqqət, <3% riskli

AZ terminologiya: istifadəçiyə "gross margin" kimi yad ifadəni əsas label kimi göstərmə. "Ümumi mənfəət", "xalis mənfəət", "yemək məsrəfi", "işçi xərci", "zərərsizlik nöqtəsi" istifadə et. DeepSeek çağırışı server action-da qalmalıdır; `DEEPSEEK_API_KEY` client bundle-a düşməməlidir.

### TASK-0148 Sosial Media Metrik Analizatoru — KALFA tier, HoReCa benchmark
ER kalkulatoru (AI yoxdur, client-side hesablama). Instagram və TikTok üçün ayrı input/formula/benchmark.

Instagram ER: (likes+comments+saves+shares) / (posts×followers) × 100. Save+share 2026-da daxildir.
TikTok ER: (likes+comments+shares+saves) / totalViews × 100 (views-bazlı).

Benchmark (HoReCa 2025-2026): IG <10K: 2.53%, 10K-100K: 1.18%, 100K+: 0.70%. TikTok F&B: 2.65%.
Sağlamlıq balı: 0-100 (50=benchmark, 100=2x benchmark). Rəng: yaşıl/qızıl/qırmızı.

Kontent tipi ranking (opsional): Reels > Carousel > Single (2025-2026 median). Real data ilə override olunur.

Aksiyon kartları statikdir (AI çağırışı yoxdur). ER status-una görə fərqli tövsiyə set-i göstərilir.

### TASK-0149 Restoran Audit — KALFA tier, AZ kiçik restoran nəzarəti
Restoran Audit deterministik özünüqiymətləndirmə tool-udur. Sual sayı sabitdir: 6 oblast x 5 sual = 30. Yeni AZ-spesifik nəzarətlər əlavə sual kimi yox, generic sualların əvəzi kimi gəlməlidir.

Oblastlar: Maliyyə & kassa, Əməliyyat & mətbəx, Personal & xidmət, Müştəri təcrübəsi, Rəqəmsal mövcudluq, Uyğunluq & risk.

Maliyyə oblastı kiçik AZ restoran reallığını ölçür: günlük POS/Z-report kassa tutuşdurması, fiskal çek intizamı, aylıq xərc hesabatı, prime cost və top-10 məhsul marjası. Uyğunluq oblastı AQTA sənədləri, tibbi müayinə, çatdırılma temperaturu, dezinfeksiya logları və əmək/sığorta prosesini yoxlayır. AQTA üçün konkret rüsum/prosedur rəqəmi yazma; yalnız sənəd/qeydiyyatın qaydasında olub-olmadığını soruş.

Scoring `lib/marketing-tools/restoran-audit.ts` util-indədir: Bəli=2, Qismən=1, Xeyr=0; oblast balı `raw/10*100`; ümumi bal 6 oblast ortası. `>=80` Usta, `50-79` Kalfa, `<50` Şagird. Nəticədə native SVG chart, ümumi bal dairəsi, ən zəif 3 oblast üçün aksiyon planı, 0 bal suallar üçün təcili siyahı və "Nəyi bilmirsən?" kritik idarəetmə kartı göstərilir.

Tək real component `components/marketinq-ocagi/restoran-audit/RestoranAuditPage.tsx`-dir. Bütün UI string-ləri `marketinq.restoranAudit` namespace-indədir.

### TASK-0145 Müştəri Persona Yaradıcısı — USTA tier, AZ/TR kontekst
Persona yaradıcısı USTA tier alətidir. Restoran sahibi restoran profili (növ, şəhər, orta çek, xidmət modeli) və müştəri müşahidələri (yaş, cins, gəliş vaxtı/tezliyi, ödəmə, gəliş üsulu) daxil edir. DeepSeek JSON formatında 18 sahəli persona kartı qaytarır.

Persona 4-blok layout:
- Sol panel: profil (ad + yaş + peşə + tagline + demografiya)
- Sağ panel: insights (psixoqrafiya + rəqəmsal iz + davranış + pain points)
- Alt panel: marketinq tövsiyələri (ideal mesaj + ən yaxşı kanallar + menyu tövsiyəsi + do/don't)

AZ/TR lokalizasiya fərqi: Bakı, Gəncə, İstanbul müştərisi fərqli davranış nümunəsi göstərir. System prompt DeepSeek-ə yerli kontekst verir. Temperature: 0.7 (kreativ persona üçün). Rate limit: 5/10dəq (cookie-based). localStorage: son 3 persona tarixi.

`musteri-persona` config tier-i `kalfa`-dan `usta`-ya dəyişdirildi. monthlyRunLimit: sagird=0, kalfa=0, usta=unlimited.

### TASK-0146 Sezon Analitikası — KALFA tier, AZ təqvim kalibrasiyası
Sezon Analitikası deterministik cash-flow tool-udur. Input: orta aylıq dövriyyə, restoran tipi, hədəf işçi xərci faizi, hədəf food cost faizi. Hesablama component-də deyil, `lib/marketing-tools/sezon-analitikasi.ts` util-ində saxlanır.

Matrix 5 restoran tipi x 12 ay əmsalıdır:
- Şəhər restoranı: yanvar-fevral zəif, mart Novruz sıçrayışı, yay piki.
- Sahil-kurort: iyun-avqust pik, dekabr-fevral dərin enmə.
- Dağ-kurort: dekabr-mart qış piki, iyul-avqust zəif.
- Kafe-brunch: aşağı amplituda, sabit həftəsonu davranışı.
- Banket-catering: may-iyun və sentyabr-noyabr toy sezonu piki.

Vizual pattern: sol input panel, sağ KPI + SVG bar/line chart + risk kartları + mobil scroll table. Weak risk vurğusu `#E94560`, strong risk vurğusu `#C5A022`. Bütün UI string-ləri `marketinq.sezonAnalitikasi` namespace-indədir.

### TASK-0147 Reklam ROI — KALFA tier, awareness vs conversion
Reklam ROI deterministik reklam ölçmə tool-udur. Kampaniya tipi əvvəl seçilir:
- Conversion: ROAS, CAC, ROI %, LTV:CAC və kanal başına attributed müştəri hesabı.
- Awareness: reach, impressions, CPM və EMV təxmini. Bu rejim satış kampaniyası kimi şərh edilmir.

Kanallar AZ HoReCa reallığına görə seçilib: Instagram/Facebook, Google Ads, influencer, Telegram, WhatsApp. Influencer üçün hybrid model var: baza ödəniş + attributed revenue üzərindən komisyon. Hesablama component-də deyil, `lib/marketing-tools/reklam-roi.ts` util-ində saxlanır.

Vizual pattern: sol kampaniya tipi + kanal input paneli, sağ KPI kartları + LTV:CAC sağlamlıq kartı + kanal chart + mobil scroll table. Tək real component `components/marketinq-ocagi/reklam-roi/ReklamRoiPage.tsx`-dir. Bütün UI string-ləri `marketinq.reklamRoi` namespace-indədir.

### TASK-0144 ROI Kalkulatoru v2 formula və kanal müqayisəsi
ROI v2 KALFA tier alətidir. V1 `promosyon-roi` baz həftə vs promo həftə müqayisəsi idi; v2 çoxlu marketinq kanalını eyni ekranda müqayisə edir:
- Kanal ROI % = (gəlir - xərc) / xərc * 100
- ROAS = gəlir / xərc
- CAC = xərc / yeni müştəri sayı
- Payback gün = CAC / (orta çek * gündəlik ziyarət tezliyi)
- Ümumi ROI % = (ümumi gəlir - ümumi xərc) / ümumi xərc * 100
- Ümumi CAC = ümumi xərc / ümumi yeni müştəri
- LTV = orta çek * aylıq ziyarət * loyallıq müddəti (ay)
- LTV:CAC = LTV / ümumi CAC

Benchmark qaydası:
- ROI >100% sağlam, 0-100% diqqət, <0% kritik
- ROAS >3x sağlam
- LTV:CAC >=3:1 sağlam
- Payback <180 gün restoran üçün ideal

Pattern: kanal cədvəli ROI%-ə görə azalan sıralanır, ən yaxşı kanal gold highlight, ən pis kanal solğun göstərilir. AI yalnız büdcə yenidən bölüşdürmə tövsiyəsi verir; hesablamanı AI etmir. DeepSeek çağırışı server action-da qalmalıdır; `DEEPSEEK_API_KEY` client bundle-a düşməməlidir.

### AzHealth dərsi (5 gün, 57 commit)
"Field-by-field hazırdır" denildi, müştəri veri işləməyə başlayanda hər şeyin mock olduğu ortaya çıxdı.
**QAYDA:** Hər Phase-in REAL test checklist-i olmalı. Mock ilə "hazır" sayılmır.

### Özbahçeci dərsi
Admin paneldə generic form layout istifadə olundu, hər ilan tipi eyni göstərildi.
**QAYDA:** listingFieldConfig.ts = single source of truth. Hardcoded field QADAĞAN.

### 57 commit mail hatası
Resend env olmadan "email hazırdır" denildi.
**QAYDA:** Env key aktiv → real mail göndərilir → test → sonra "hazır".

### Encoding fəlakəti
Mojibake (Windows-1252 corruption) dəfələrlə baş verdi.
**QAYDA:** Hər commit-dən əvvəl AZ simvolları yoxla.

### "Sallama" yasağı
Kod yazmadan əvvəl mövcud faylları araşdır. Yoxla nə var, sonra yaz.
**QAYDA:** Hər task-dan əvvəl əlaqəli faylları oxu, anla, sonra dəyiş.

## 12. PHASE PLANI

| Phase | İş | Status | Test |
|-------|-----|--------|------|
| 0 | CLAUDE-DESIGN.md + CHANGELOG | ✅ | Fayl mövcuddur |
| 1 | KAZAN AI web chat activation | 🔄 | /kazan-ai açılır, sual cavablanır |
| 2 | Admin OCAQ real DB CRUD | ❌ | İlan yaradılır, DB-yə yazılır, oxunur |
| 3 | Resend email + Cloudinary media | ❌ | Real email gəlir, şəkil yüklənir |
| 4 | RSS news pipeline | ❌ | Xəbər fetch olunur, tərcümə olunur, admin onaylayır |
| 5 | KAZAN AI production upgrade | ❌ | Knowledge v2, toolkit context, sales layer |

## 13. ENCODING QAYDALARI

Azərbaycan əlifbası simvolları:
- Ə ə — LATIN CAPITAL/SMALL LETTER SCHWA
- Ö ö — LATIN CAPITAL/SMALL LETTER O WITH DIAERESIS
- Ü ü — LATIN CAPITAL/SMALL LETTER U WITH DIAERESIS
- Ş ş — LATIN CAPITAL/SMALL LETTER S WITH CEDILLA
- Ç ç — LATIN CAPITAL/SMALL LETTER C WITH CEDILLA
- Ğ ğ — LATIN CAPITAL/SMALL LETTER G WITH BREVE
- I ı — LATIN CAPITAL LETTER I / SMALL LETTER DOTLESS I

**Mojibake nümunələri (ƏGƏR GÖRÜRSƏNSƏ DÜZƏLt):**
- Mojibake "Basla" variantı → Başla
- Mojibake "Muhendis" variantı → Mühendis
- Mojibake "deyis" variantı → dəyiş
- Mojibake "u-diaeresis" variantı → ü
- Mojibake "o-diaeresis" variantı → ö

Bütün fayllar UTF-8 olmalıdır. BOM olmadan.

## 14. AI ROUTER API (TASK-0120)

`lib/ai-router.ts` Marketinq Ocagi tool-lari ucun ortaq AI gateway-dir.

```typescript
callAI({
  prompt: string,
  preferProvider: 'deepseek' | 'claude',
  maxTokens: number,
  stream?: boolean, // default false
  timeout?: number, // default 55000ms
  responseFormat?: 'json_object' | 'text', // default 'text'
})
```

Qaydalar:
- Sezon Planlama kimi uzun cavablar `stream: true`, `timeout: 55000`, `responseFormat: 'json_object'` ile cagrilmalidir.
- Diger live tool-lar regression riskini azaltmaq ucun default non-streaming davranisi saxlaya biler.
- Timeout `AbortError` kimi yuxariya qalxir; route handler bunu 504 qaytarmalidir.
- DeepSeek JSON mode ucun hem `response_format`, hem de prompt/system daxilinde JSON talimati lazimdir.

## TASK-0123 - Marketing Brain Module

`lib/marketing-tools/_brain/` marketing tools ucun ortaq knowledge base-dir.

API:

```ts
buildBrainContext(toolSlug)
```

`toolSlug` deyerleri:
- `sezon-planlama`
- `marka-kompasi`
- `kst-yoxlayici`
- `menyu-analitigi`
- `sikayet-analitigi`
- `promosyon-roi`
- `musteri-persona`

Qayda:
- Her yeni marketing tool AI prompt-u lazim olduqda once `buildBrainContext(slug)` yoxlanilir.
- `sezon-planlama` daha genis brain alir: Dogan Dersleri, AZ 2026 teqvim, region profilleri, KAHI roadmap, 7 pille, GEO/AEO, AI Decisioning, RCS, ROI qaydalari.
- `menyu-analitigi`, `promosyon-roi`, `musteri-persona` tool-specific brain alir.
- Kicik scope tool-lar yalniz Dogan core rules ile baslayir.
- Frontend premium render TASK-0125-de geleceyi ucun Sezon Planlama legacy quick-view JSON fields saxlanilmalidir.

## TASK-0134 - Dashboard Admin i18n Pattern

Dashboard admin səhifələri (app/dashboard/) üçün i18n qaydası:

**Namespace:** `dashboard.<page>` (məs: `dashboard.members`, `dashboard.ilanlar`)

**Fayl strukturu:**
- Component: `useTranslations('dashboard.members')` hook istifadə edir
- Açarlar: `messages/az.json`, `messages/en.json`, `messages/ru.json`, `messages/tr.json` — hər 4 dil TAM olmalı

**Qadağan:**
- Component içində inline `pageCopy`, `labels`, `translations` obyekti (L-004 pozuntusudur)
- E2E spec-lərdə dashboard URL-lərinə locale prefix əlavə etmə (`/dashboard/users` doğrudur, `/${locale}/dashboard/users` YANLIŞ)

**E2E spec pattern:**
```ts
// DOĞRU — dashboard locale-independent-dir
await request.get('/dashboard/users');
// YANLIŞ — locale prefix əlavə etmə
await request.get(`/${locale}/dashboard/users`);
```

## TASK-0135 - Admin Role Management

Admin istifadəçi rolunu dəyişdirmə sistemi:

**API:** `PATCH /api/admin/members/[id]` — body: `{ role: "member" | "admin" }`

**Self-protection qaydası:**
- API: `targetId === auth.userId` → 403 `self-role-forbidden`
- UI: `m.id === currentUserId` → select əvəzinə disabled badge + tooltip
- Bu ikili qat mütləqdir — gələcəkdə yeni admin əməliyyatları da eyni pattern izləməlidir

**currentUserId pattern:** GET `/api/admin/members` response-una `currentUserId: auth.userId` əlavə edilib — ayrıca session fetch lazım deyil

**Xəta statusları:** 400 (invalid role/id/body), 401 (no auth), 403 (not admin / self), 404 (user not found), 503 (DB unavailable)

## TASK-0136 - Admin-Created Users (Passwordless Invite)

Admin-yaradılmış istifadəçi flow-u:

**Pattern:** passwordless + token email (OWASP 2025 compliant)
- Plain-text şifrə HEÇ VAXT email-dən keçmir
- Mövcud `passwordResetTokens` + `/reset-password` page yenidən istifadə edilir
- Token expire: 24 saat (forgot-password 1h, invite 24h)

**Dual-table insert:**
- `users` — auth sistemi (login, JWT, password reset)
- `memberProfiles` — admin panel görüntüsü
- Hər ikisində yaradılmalıdır, yoxsa ya giriş ya da admin panel qırılır
- **Tech debt:** gələcəkdə bu iki cədvəl unified olmalıdır

**emailVerified = true:** Admin trust model. passwordHash=null unauthorized access-i bloklayır.

**Email fail graceful:** 201 + `{ emailSent: false, warning }` — rollback yox, admin resend edə bilər

**API:** `POST /api/admin/members` — body: `{ name, email, role }`
**Xəta statusları:** 400 (missing field), 401 (no auth), 403 (not admin), 409 (email exists), 503 (DB)

## TASK-0137 - Admin Audit Log (OWASP 2025)

Hər admin əməliyyatı immutable `admin_audit_logs` cədvəlinə yazılır.

**Table:** `admin_audit_logs` (serial id, admin_id, admin_email, action, target_user_id, target_email, metadata jsonb, created_at timestamptz)

**İmmutability qaydası:** DELETE endpoint/UI YOX. Log-lar heç vaxt silinə bilməz.

**OWASP 2025 credentials qaydası:** metadata-ya password, token, hash HEÇ VAXT yazılmaz.

**writeAuditLog() utility:** `lib/audit.ts` — fire-and-forget (audit xətası main operation-u bloklamır)

**Action növləri:**
- `member.created` — admin yeni istifadəçi yaratdı
- `member.role_changed` — admin istifadəçi rolunu dəyişdi (metadata: oldRole, newRole)
- `member.deleted` — admin istifadəçini sildi (gələcək TASK-0140)
- `member.password_reset` — admin şifrə sıfırlama göndərdi (gələcək)

**GET API:** `/api/admin/audit-logs?page=1&action=member.created&from=2026-01-01&to=2026-12-31`

**Hər yeni admin endpoint-ə:** uğurlu əməliyyatdan SONRA `writeAuditLog()` çağır. Əgər əməliyyat uğursuzsa — audit YAZILMIR.

## TASK-0138 - Member Detail Page

**Route:** `/dashboard/users/[id]` — admin-only, locale-prefix-siz

**GET API:** `/api/admin/members/[id]` — eyni route faylında PATCH ilə birlikdə. Response: `{ user, recentActivity }`

**Sensitiv sahə qaydası:** `memberProfiles`-dan named select istifadə et (explicit sütun siyahısı). Gələcəkdə cədvələ sensitiv sütun əlavə olunsa leak olmasın. `users.passwordHash` bu endpoint-dən HEÇ VAXT qaytarılmır.

**Audit preview:** Detail page-də `adminAuditLogs.targetUserId = id` ilə son 10 log göstərilir. Ayrıca fetch yox — GET response-un içindədir.

## TASK-0139 - Admin-Initiated Password Reset

**Route:** `POST /api/admin/members/[id]/reset-password`

**Pattern:** Eyni `passwordResetTokens` cədvəlini istifadə edir (token = crypto.randomUUID(), 1 saat expire). Mövcud `/reset-password` page token-i consume edir — yeni page lazım deyil.

**Email template:** `adminPasswordReset` — mövcud `passwordReset`-dən fərqli body ("administrator tərəfindən sıfırlanıb" + "bu siz deyilsinizsə nəzərə almayın").

**Token expire: 1 saat** (invite-dan fərqli: burada admin-user aktiv ünsiyyətdədir).

**Audit:** `member.password_reset` action — metadata: `{ initiatedBy: 'admin' }`. Token/hash metadata-da HEÇ VAXT.

**UI:** Detail page → Quick Actions → "Şifrəni Sıfırla" düyməsi → window.confirm → POST → toast.

## TASK-0140 - Soft Delete Members

**Hard delete QADAĞAN.** Audit log referansları qırılır. Yalnız soft delete (deletedAt timestamp).

**Schema:** `deletedAt timestamptz` — `users` + `memberProfiles` hər ikisində.

**DELETE /api/admin/members/[id]:** Self-protection (403), already-deleted check (409), dual-table soft-delete.

**DELETE /api/admin/members/bulk:** `{ ids: number[] }`, max 50. Admin özü filter olunur (id listdən çıxır, əməliyyat dayanmır). `inArray` batch update — loop yox.

**Siyahıdan gizlənmə:** GET members-ə `isNull(memberProfiles.deletedAt)` condition əlavə.

**Login bloklama:** `deletedAt IS NOT NULL` → 403 "Hesab deaktiv edilib". emailVerified-dən ƏVVƏL yoxlanılır.

**Double confirm (Detail page):** 2 addım: (1) window.confirm, (2) "SİL" yazma input → button disabled until exact match. MembersTable-da tək confirm.

**Bulk limit:** 50 — DoS qoruma. Daha çoxu üçün admin 2 request göndərməlidir.
