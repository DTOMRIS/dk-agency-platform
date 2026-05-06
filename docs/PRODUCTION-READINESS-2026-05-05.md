# DK Agency Platform — Production Readiness Audit
**Tarix:** 2026-05-05 | **Auditor:** Claude Opus 4.6 | **Verdict: HAZIR DEYİL**

---

## 1. CƏMİ STATUS

### Yaşıl — İşləyən feature-lər
| Feature | Backend | Frontend | DB | Qeyd |
|---------|---------|----------|----|------|
| KAZAN AI | Real (DeepSeek+Anthropic) | 4 dil | - | Food cost context, Ahilik quotes |
| Blog CMS | Real | 4 dil | PostgreSQL | Admin guard, paywall, 10 məqalə |
| Food Cost | Real | Real calc | PostgreSQL | Ingredient math, supplier compare |
| Fatura OCR | Real | Dashboard | PostgreSQL | Gemini Vision + DeepSeek |
| Auth | Real | 4 dil | PostgreSQL | JWT+bcrypt, register/login/verify/reset |
| Email SMTP | Real | - | - | 6 branded template, Hostinger SMTP |
| Dashboard | Real | AZ only | PostgreSQL | 30+ section, JWT protected |
| Welcome Email | Real | - | - | Confirm sonrası branded |
| /api/news | Real DB | - | PostgreSQL | PR #85 ilə mock silindi |
| SEO hreflang | - | - | - | PR #84 ilə əlavə olundu |

### Sarı — Yarımçıq
| Feature | Nə var | Nə yox | Müddət |
|---------|--------|--------|--------|
| Toolkit (10 alət) | food-cost real, UI 4 dil | Digər 9 placeholder hesablama | 3 gün |
| Devir/Satış | API+vitrin+lead | M1-M5 workflow, ödəniş | 5 gün |
| News admin | API+guard (PR #79-da) | Admin UI yarımçıq | 1 gün |
| Auditor | Form+mock data | Real DB, scoring | 2 gün |
| Pricing | UI 4 dil, plan tiplər | Ödəniş provider bağlı deyil | 3 gün |
| i18n email | - | Template-lər yalnız AZ | 1 gün |
| i18n admin | - | Dashboard səhifələri AZ | 2 gün |
| Mobile dil switcher | Desktop var | Mobile yoxdur | 2 saat |

### Qırmızı — Kritik problemlər
| Problem | Təsir | Status |
|---------|-------|--------|
| **PR #79 merge olunmayıb** — security fix-lər production-da yoxdur | KRİTİK | AÇIQ PR |
| Hardcoded parollar (`mock-state.ts`, `seed.ts`, `CLAUDE-DESIGN.md`) | KRİTİK | PR #79 gözləyir |
| Admin API guard yox (news approve/reject) | KRİTİK | PR #79 gözləyir |
| JWT default secret | KRİTİK | PR #79 gözləyir |
| Rate limiting sıfır (auth, AI, OCR) | YÜKSƏK | Edilməyib |
| console.log 27 yerdə production API-da | ORTA | Edilməyib |
| Monitoring yox (Sentry, analytics) | ORTA | Edilməyib |

---

## 2. PRODUCTION BLOCKERS (TƏCİLİ)

### BLOCKER 1: PR #79 merge et (1 dəqiqə)
Security sprint PR hazırdır, gözləyir. İçində:
- TASK-0036: Demo credentials silindi
- TASK-0037: JWT_SECRET zorunlu
- TASK-0038: Admin API guard (`requireAdmin()`)
- TASK-0039: Hardcoded password silindi
- TASK-0040: Branded email templates

**Təsir:** Bu merge olunmadan production ciddən təhlükəlidir.

### BLOCKER 2: CLAUDE-DESIGN.md-dən "admin123" sil (5 dəq)
Sətir 145-də `"admin123"` sənədlənib. Silmək lazımdır.

### BLOCKER 3: seed.ts password fallback (15 dəq)
`lib/db/seed.ts` sətir 17-18: `?? 'DkAdmin2026!'` fallback var. Env var olmasa fail etməli.

### BLOCKER 4: Rate limiting (2 saat)
Auth login, register, forgot-password, kazan-ai, invoice-ocr — heç birində limit yoxdur.

### BLOCKER 5: console.log təmizliyi (1 saat)
27 yerdə. `forgot-password/route.ts`-da reset token console-a yazılır — bu çox pisdir.

---

## 3. DESIGN PROBLEMLƏRİ

### KRİTİK
| # | Problem | Fayl | Həll |
|---|---------|------|------|
| 1 | **`brand-red`, `brand-gold` Tailwind class-ları tanımsız** — 30+ faylda istifadə olunur amma heç bir config-də define olunmayıb | `CTASections.tsx`, `AdsPreview.tsx`, +28 fayl | globals.css-də `@theme` blokuna əlavə et ya CSS variable ilə əvəz et |
| 2 | **CTASections.tsx dark theme** — `bg-slate-950/bg-slate-900` istifadə edir, CLAUDE-DESIGN.md qadağan edir | `components/home/CTASections.tsx` | Light theme-ə çevir ya da istisna olaraq sənədlə |
| 3 | **Blog başlıqlarında Space Grotesk** — layout.tsx-da yüklənmir, Playfair olmalı | `globals.css` sətir 244 | `Space Grotesk` → `Playfair Display` dəyiş |
| 4 | **6 fərqli border-radius** — 12px, 16px, 24px, 28px, 32px, 48px istifadə olunur. CLAUDE-DESIGN.md 12px deyir | Bütün card/modal komponentlər | Standartlaşdır: card=16px, button=12px, pill=full |

### YÜKSƏK
| # | Problem | Fayl | Həll |
|---|---------|------|------|
| 5 | Form accessibility — `<label htmlFor>` yox, placeholder əvəzinə | `LeadForm.tsx`, `CreateListingForm.tsx`, `CTASections.tsx` | label+htmlFor əlavə et |
| 6 | Hardcoded hex rəngləri | `CTASections.tsx` (#1A1A2E, #C5A022) | `var(--dk-navy)`, `var(--dk-gold)` istifadə et |
| 7 | Button border-radius tutarsız | Layihə boyu | Standart: primary=`rounded-xl`, pill=`rounded-full` |
| 8 | Spacing tutarsız (p-5, p-6, p-8, p-10, p-12) | Card komponentlər | Token sistemi: card=p-6, section=p-8/p-12 |

### ORTA
| # | Problem | Həll |
|---|---------|------|
| 9 | Shadow token-ləri tanımlanıb amma istifadə olunmur | `var(--dk-shadow-card)` istifadə et |
| 10 | aria-label menu button-larda yox | Header mobile toggle-a əlavə et |
| 11 | Blog code block overflow-x | `.blog-content pre { overflow-x: auto }` |
| 12 | Focus state bəzi yerlərdə zəif kontrast | `focus:ring-rose-100` → `focus:ring-rose-300` |

---

## 4. KEÇMİŞ TASK-LAR

### Bitmiş (Verified)
TASK-0001, 0022, 0027-0035, 0041-0053, 0055-0059 — **Hamısı DONE**

### Gözləyən (PR #79-da)
TASK-0036-0040 — Security sprint, **PR AÇIQDIR, merge lazım**

### Mövcud olmayan (gap)
- TASK-0023 – TASK-0026: Heç vaxt yaradılmayıb (nömrə boşluğu)
- TASK-0010, 0011: Mövcud deyil
- TASK-0054: Skip olunub

---

## 5. BU HƏFTƏNİN PLANI (5 gün sprint)

### Gün 1 (Bazar ertəsi) — TEHLÜKƏSİZLİK
| İş | Müddət | Prioritet |
|----|--------|-----------|
| PR #79 merge et | 1 dəq | P0 |
| CLAUDE-DESIGN.md admin123 sil | 5 dəq | P0 |
| seed.ts password fallback sil | 15 dəq | P0 |
| Rate limiting (auth + AI) | 2 saat | P1 |
| console.log təmizliyi (27 yer) | 1 saat | P1 |

### Gün 2 (Çərşənbə axşamı) — DESIGN
| İş | Müddət | Prioritet |
|----|--------|-----------|
| brand-red/brand-gold define et (globals.css) | 30 dəq | P0 |
| Blog font fix (Space Grotesk → Playfair) | 15 dəq | P1 |
| Border-radius standartlaşdır (top 10 komponent) | 2 saat | P1 |
| CTASections dark theme fix | 1 saat | P1 |

### Gün 3 (Çərşənbə) — PERFORMANCE + SEO
| İş | Müddət | Prioritet |
|----|--------|-----------|
| Dynamic import (jspdf, xlsx) | 1 saat | P1 |
| og:image homepage + index pages | 1 saat | P2 |
| JSON-LD Organization schema | 1 saat | P2 |
| Build size audit | 1 saat | P2 |

### Gün 4 (Cümə axşamı) — İ18N + UX
| İş | Müddət | Prioritet |
|----|--------|-----------|
| Email template-ləri 4 dilə keçir | 4 saat | P1 |
| Mobile dil switcher | 2 saat | P2 |
| Form accessibility (label+htmlFor) | 1 saat | P2 |

### Gün 5 (Cümə) — FINAL TEST + DEPLOY
| İş | Müddət | Prioritet |
|----|--------|-----------|
| Sentry/monitoring setup | 2 saat | P2 |
| Full smoke test 4 dildə | 2 saat | P0 |
| Hostinger env var final check | 30 dəq | P0 |
| Admin password rotation | 15 dəq | P0 |

---

## 6. CANLIYA ÇIXIŞ CHECKLISTİ

### Pre-Launch (zorunlu)
- [ ] PR #79 merge olunub (security fixes)
- [ ] CLAUDE-DESIGN.md-dən admin123 silinib
- [ ] seed.ts password fallback silinib
- [ ] Rate limiting əlavə olunub (minimum auth login)
- [ ] console.log-lar silinib (minimum forgot-password token leak)
- [ ] Hostinger .env: JWT_SECRET, DATABASE_URL, SMTP_*, DEEPSEEK_API_KEY
- [ ] Admin şifrəsi rotate olunub (`rotate-admin-password.ts`)
- [ ] `npm run build` PASS (lokal)

### Smoke Test (deploy sonrası)
- [ ] / → homepage yüklənir (4 dil)
- [ ] /auth/register → qeydiyyat → verification email gəlir
- [ ] Email link → /api/auth/confirm → welcome email gəlir → login redirect
- [ ] /auth/login → giriş → dashboard redirect
- [ ] /dashboard → admin panel yüklənir
- [ ] /kazan-ai → AI cavab verir
- [ ] /blog → məqalələr görsənir
- [ ] /ilanlar → elanlar görsənir
- [ ] /toolkit/food-cost → hesablama işləyir
- [ ] curl -X POST /api/admin/news/approve (token-sız) → 401
- [ ] Demo credentials login page-də görünmür

### Rollback Strategy
1. Hostinger panel → son uğurlu build-ə rollback
2. git revert son PR merge commit
3. Force rebuild

---

## CTO FİKRİ (dürüst qiymətləndirmə)

**Yaxşı tərəflər:**
- Stack düzgün seçilib (Next.js + Drizzle + Neon)
- 10 PR 2 gündə merge olunub — sürət yaxşıdır
- i18n 4 dil dəstəyi əla əsas qoyulub
- Auth sistemi (JWT+bcrypt) düzgün implementasiya
- Email sistem branded template ilə professional görünür

**Problem tərəflər:**
- PR #79 (security) **HƏLƏ AÇIQDIR** — bu production-da olan ən böyük risk
- Design system sənədlənib (CLAUDE-DESIGN.md) amma tutarlı tətbiq olunmayıb (6 radius, tanımsız class-lar)
- Rate limiting tamamilə yoxdur
- Monitoring sıfırdır — production-da nə baş verir bilmirsən
- 27 console.log əslində information leak-dir

**Realist timeline:** Bu həftə **Gün 1-2 blocker-ləri həll et**, Gün 3-5 polish. Cümə axşamı soft launch mümkündür. Full production-ready olmaq üçün hələ 1 həftə əlavə lazımdır (monitoring, rate limiting, design tutarlılığı).

---

*Audit tamamlandı. Heç bir kod dəyişdirilməyib. Yalnız oxuma.*
