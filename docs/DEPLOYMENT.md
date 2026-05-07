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
