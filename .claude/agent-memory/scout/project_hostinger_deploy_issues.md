---
name: Hostinger Next.js Deploy Sorunları
description: Hostinger'da Next.js App Router projelerinin deploy edilmesinde yaşanan bilinen sorunlar ve geçici çözümler
type: project
---

Hostinger, Next.js projeleri için birincil sınıf destek sunmamaktadır. Proje bu nedenle iki mimari uzlaşma commit'i içermektedir.

**Why:** Hostinger `npm install`'ı `NODE_ENV=production` ile çalıştırır — devDependencies atlanır. Next.js build süreci bu paketlere ihtiyaç duyar. Sonuç: build başarısız.

**How to apply:** Yeni bir `@types/*` veya build-time paket eklendiğinde, Hostinger'da deploy edilecekse bu paketi `dependencies`'e taşı (devDependencies değil). Edge Runtime kullanma. `prebuild: npm install --include=dev` script'ini koru.

Etkilenen commitler:
- `59f1671` — @types/jsonwebtoken dependencies'e taşındı
- `099ddc0` — TS ve ESLint hataları build'de ignore edildi

Önerilen geçiş: Railway.app (Neon PostgreSQL uyumlu, $5/ay'dan).
