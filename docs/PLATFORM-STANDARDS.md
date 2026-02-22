# Platform Standards (SEO + Security + Mobile + PWA)

Bu belge zorunlu standartlari sabitler.

## 1. SEO Standardi

- Her sayfada `title`, `description`, canonical.
- `openGraph` ve `twitter` metadata zorunlu.
- `robots.ts` ve `sitemap.ts` zorunlu.
- Haber sayfalarinda unique meta ve OG image.
- Kategori bazli ic linkleme zorunlu.

## 2. Guvenlik Standardi

- Security headers zorunlu:
  - `Content-Security-Policy`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`
- Auth role matrisi olmadan korumali route acilmaz.
- Gizli anahtarlar sadece environment variable ile.

## 3. Mobil UX Standardi (80% mobile varsayimi)

- Header: sagda hamburger zorunlu.
- Alt navigation: 4 item zorunlu (`Ana`, `Xeberler`, `Ilanlar`, `Hesab`).
- Ana CTA ve kritik aksiyonlar thumb-zone icinde.
- Min touch target: 44x44.
- Mobilde CLS ve LCP bozan buyuk medya kullanimi yasak.

## 4. PWA Standardi

- `manifest.webmanifest` zorunlu.
- `display: standalone`.
- Uygulama ana ekrana eklendiginde DK logo gorunmeli.
- `theme_color` ve `background_color` marka ile uyumlu.

## 5. Release Gate

- `npm run lint` errors = 0
- `npm run build` pass
- Mobil smoke test:
  - iPhone viewport
  - Android viewport
  - Alt menu + hamburger
  - Ana ekrana ekleme testi
