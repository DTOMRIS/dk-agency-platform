# Hostinger Deployment Runbook

## Goal

Move `dkagency.com.tr` from Vercel to Hostinger Business without cutting over production until temp-domain smoke tests pass.

## Repo-Side Requirements

- `next.config.ts`
  - `output: 'standalone'`
  - `images.unoptimized: true`
  - preserve existing `remotePatterns`
- `middleware.ts`
  - `export const runtime = 'nodejs'`
- `package.json`
  - `start: next start -p $PORT`
  - `build:standalone` copies `public/` and `.next/static/` into `.next/standalone/`

## Local Verification

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build:standalone
ls .next/standalone/
```

Expected:

- `.next/standalone/server.js` exists
- `.next/standalone/public` exists
- `.next/standalone/.next/static` exists

## Hostinger hPanel Setup

1. hPanel -> Advanced -> Node.js
2. Create app with Node.js 20 LTS
3. Set application root to repo folder
4. Set startup file to `.next/standalone/server.js`
5. Add env vars in hPanel:
   - `NODE_ENV=production`
   - `HOSTNAME=0.0.0.0`
   - `NEXT_PUBLIC_SITE_URL=https://<hostinger-temp-domain>`
   - `DATABASE_URL`
   - `DEEPSEEK_API_KEY`
   - `NEWS_API_SECRET`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - optional future vars: `CLOUDINARY_*`, `RESEND_API_KEY`

## Apache Reverse Proxy Pattern

Use the same Apache reverse proxy pattern used in prior migrations:

```apache
<VirtualHost *:80>
    ServerName dkagency.com.tr
    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:PORT/
    ProxyPassReverse / http://127.0.0.1:PORT/
    ProxyTimeout 300
</VirtualHost>
```

`ProxyTimeout 300` is required for KAZAN AI streaming tolerance.

## Cloudflare DNS Rule

During initial cutover use `DNS only` records, not proxied records, to avoid SSL handshake failures while Hostinger SSL settles.

## GitHub Actions Deployment

Workflow file: `.github/workflows/deploy-hostinger.yml`

Required secrets:

- `HOSTINGER_HOST`
- `HOSTINGER_USER`
- `HOSTINGER_SSH_KEY`
- `HOSTINGER_PORT`

Remote deploy flow:

1. `git pull origin main`
2. `npm ci --include=dev`
3. `npm run build`
4. `cp -r public .next/standalone/`
5. `cp -r .next/static .next/standalone/.next/`
6. `touch tmp/restart.txt`

## Safety Pattern

1. Build and validate on Hostinger temp domain
2. Smoke test homepage, KAZAN AI, admin, listings, news, toolkit
3. Flip DNS in Cloudflare
4. Keep Vercel as rollback for 24-48 hours
5. Disable Vercel auto-deploy only after stable production window
