# DK Agency - Hostinger Deployment

## Platform: Hostinger Web Apps (Cloud Startup plan)

Hostinger Web Apps GitHub-dan avtomatik build və deploy edir.
Manual SSH və ya GitHub Actions LAZIM DEYIL.

## Deployment workflow

1. Code `git push origin main` -> Hostinger avtomatik:
   - `npm install`
   - `npm run build`
   - restart application
2. Yeni version live olur (~2-3 deqiqe)

## Hostinger Web App Settings

- GitHub repo: `DTOMRIS/dk-agency-platform`
- Branch: `main`
- Framework: `Next.js`
- Node version: `22.x`
- Build command: `npm run build`
- Output directory: `.next`
- Package manager: `npm`

## Environment Variables (Hostinger panel)

Required:

- `DATABASE_URL`
- `DEEPSEEK_API_KEY`
- `NEWS_API_SECRET`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `NODE_ENV=production`
- `HOSTNAME=0.0.0.0`
- `NEXT_PUBLIC_SITE_URL=https://dkagency.com.tr`

Optional (sonradan elave olunur):

- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- `RESEND_API_KEY`

## Middleware Note

`middleware.ts` daxilinde `export const runtime = 'nodejs'` qalir. Bu Hostinger ucun REQUIRED-dir, cunki `next-intl` default olaraq edge runtime istifade edir, bu da Hostinger Node.js apps ile islemir.

## Image Handling

`next.config.ts` daxilinde `images.unoptimized: true` qalir, cunki Vercel image optimization Hostinger-de yoxdur. Cloudinary aktivlesende image loader Cloudinary ile evezlenecek.
