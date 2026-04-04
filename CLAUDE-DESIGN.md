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
- BaÅŸla → Başla
- MÃ¼hendis → Mühendis
- dÉ™yiÅŸ → dəyiş
- Ã¼ → ü
- Ã¶ → ö

Bütün fayllar UTF-8 olmalıdır. BOM olmadan.
