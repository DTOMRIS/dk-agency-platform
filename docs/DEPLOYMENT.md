# DK Agency Deployment Guide

## Hosting: Hostinger Web Apps

- Auto-deploy: GitHub push → Hostinger pull → build → restart
- Branch: `main`
- SCP / manual deploy QADAĞAN
- Config: hPanel → Web App → Git
- Build settings:
  - Install: `npm install --include=dev` (build script-də)
  - Build: `npm run build`
  - Start: `npm run start -- -p $PORT`
  - Node: 22.x

## Domain: dkagency.com.tr

- Registrar: Namecheap
- DNS: Hostinger (Cloudflare YOX)
- HOSTNAME env qoyma (port problem yaradır)
- Cookie domain: auto

## Environment Variables Strategy

- **Build-time** (`NEXT_PUBLIC_*`): `.env.production` (committed)
- **Runtime secrets**: Hostinger panel → Environment Variables
  - `JWT_SECRET`, `DATABASE_URL`, `SMTP_*`, `DEEPSEEK_API_KEY`
- `.env.local`: yalnız development

## Email: Hostinger SMTP

- Host: `smtp.hostinger.com`
- Port: 465 (SSL)
- From: `info@dkagency.com.tr`
- Resend QADAĞAN

## Database: Neon PostgreSQL

- Dev = Prod (eyni DB)
- Drizzle ORM
- Migration: `drizzle-kit push` (manual, schema dəyişdikdə)

## Auth

- Custom (`lib/member-access.ts`)
- bcrypt + JWT (httpOnly cookie, 7 gün)
- NextAuth QADAĞAN

## Common Pitfalls (DƏRSLƏR)

### 1. devDependencies build vaxtı görünmür

**HƏLL:** `package.json` build script-də `"npm install --include=dev && next build"`

### 2. NEXT_PUBLIC_* runtime-da boş

**HƏLL:** `.env.production`-də olmalı (build-time inject)

### 3. redirect() daxili IP göstərir (0.0.0.0:3000)

**HƏLL:** `next.config.ts` → `experimental.trustHostHeader = true`
+ Bütün `redirect()`-lər absolute URL (`getBaseUrl()` helper)

### 4. Mail link localhost göstərir

**HƏLL:** Hostinger panel-də `NEXT_PUBLIC_APP_URL=https://dkagency.com.tr`
+ rebuild (restart yox, çünki build-time variable)

### 5. Sarmal anti-pattern

2-3 dəfə eyni fix fail olarsa DUR. Web/Reddit araşdır.
Kök səbəbi tap, bir dəfəyə həll et.

## AI Provider Setup

### DeepSeek (Primary — text/chat AI)
1. https://platform.deepseek.com → API Keys → Create
2. Model: `deepseek-v4-flash` (lib/ai-models.ts SST)
3. Hostinger panel: `DEEPSEEK_API_KEY=sk-...`
4. Smoke: KAZAN AI-a sual ver, cavab gəlsin

### Gemini (Vision — OCR, photo/menu analysis)
1. https://aistudio.google.com/apikey → Create API Key
2. Model: `gemini-2.5-flash` (lib/ai-models.ts SST)
3. Hostinger panel: `GEMINI_API_KEY=AIza...`
4. Smoke: /dashboard/faturalar → fatura şəkli yüklə → OCR field-lər dolsun
5. Opsional: `GEMINI_MODEL` env ilə override (default: gemini-2.5-flash)

### Cloudinary (Image Upload — listings, blog, news)
1. https://console.cloudinary.com → Dashboard → Account Details
2. Hostinger panel: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
3. Upload API: `/api/upload` (POST: upload, DELETE: remove by publicId)
4. Auto WebP transform + 1400px limit
5. Folder structure: `dk-agency/listings/{id}`, `dk-agency/blog/`, `dk-agency/news/`
6. Smoke: dashboard → blog/news/elan → şəkil yüklə → Cloudinary URL qayıtsın

### Anthropic (Fallback — ai-router.ts)
1. https://console.anthropic.com → API Keys
2. Model: claude-sonnet-4-6 (default, lib/ai-router.ts)
3. Hostinger panel: `ANTHROPIC_API_KEY=sk-ant-...`
4. Smoke: DEEPSEEK_API_KEY sil, KAZAN yenə cavab versin (Claude fallback)

### Model ID Source of Truth
**Tək yer:** `lib/ai-models.ts` — provider yeni model çıxardıqda yalnız bu faylı dəyiş.
Scripts (.mjs) import edə bilmir — əl ilə dəyiş + SST comment qoy.

### Deprecation Deadlines
| Model | Deadline | Replacement |
|-------|----------|-------------|
| gemini-2.0-flash | 2026-06-01 | gemini-2.5-flash |
| deepseek-chat | 2026-07-24 | deepseek-v4-flash |
| claude-sonnet-4 | 2026-06-15 | claude-sonnet-4-6 |

## Smoke Test Checklist (post-deploy)

- [ ] dkagency.com.tr açılır
- [ ] /az, /ru, /en, /tr 4 dildə açılır
- [ ] /auth/register → mail gəlir → link doğrudur
- [ ] /auth/login → admin daxil olur
- [ ] /dashboard 4 dildə tərcümə düzgündür
- [ ] KAZAN AI cavab verir
- [ ] Mobile responsive

## Rollback Strategy

GitHub-da revert PR yarat, merge et. Hostinger avtomatik köhnə commit-ə qayıdır.
