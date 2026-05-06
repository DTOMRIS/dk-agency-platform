---
agent: scout
tarih: 2026-05-04
proje: DKagency / TQTA / AZHealth / OIC
gorev: Hostinger Next.js deploy sorunları araştırması — devDependencies, Node.js kısıtlamaları, platform karşılaştırması
---

## Ne Buldum

### Kök Sorun
Hostinger, `npm install`'ı `NODE_ENV=production` ortamında çalıştırır. Bu npm'in resmi davranışına göre `devDependencies`'i tamamen atlar. Next.js build süreci (`next build`) bu paketlere ihtiyaç duyduğundan build başarısız olur.

### Proje Etkisi
- `fix(deps): move @types/jsonwebtoken to dependencies` commiti bu sorunun doğrudan sonucudur
- `fix(build): ignore TS and ESLint errors on production build` commiti Hostinger ortamında hataların çözülememesi üzerine alınan uzlaşma kararıdır
- Bu iki commit Hostinger'ın zorlattığı mimari uzlaşmalardır

### Hostinger Kısıtlamaları
- Edge Runtime desteklemez
- Build log'ları yetersiz
- Memory limit (512MB-1GB) büyük Next.js build'lerini zorlar
- nginx statik dosya konfigürasyonu sorunlu (standalone mode'da)
- hPanel PHP/WordPress mentalitesiyle tasarlanmış, Node.js ikincil vatandaş

### Platform Karşılaştırması (Next.js için skor)
1. Vercel — Tam (Next.js yapımcısı)
2. Railway — Çok iyi (Neon entegrasyonu mevcut)
3. Render — İyi
4. Fly.io — İyi
5. Hostinger — Yetersiz

## Hangi Kaynaklar İşe Yaradı
- Bilgi kesim tarihine kadar birikimli teknik bilgi
- Projenin git geçmişi (commit mesajları doğrudan kanıt sağladı)
- npm resmi davranış dokümantasyonu (bilinen gerçek)

## Hangi Aramalar Sonuçsuz Kaldı
- WebSearch aracına erişim engellendi — canlı kaynak doğrulaması yapılamadı
- Boris Cherny / Hostinger bağlantısı: Bu bağlantı mevcut değil, Boris Cherny TypeScript kitabı yazarıdır, deployment alanında yazısı yoktur
- 2026 güncel forum şikayetleri kontrol edilemedi

## Tekrar Eden Pattern
Evet — Hostinger'da Node.js projeleri için `devDependencies` sorunu yaygın bilinen pattern'dir.
Her yeni `@types/*` paketi eklendiğinde aynı sorun tekrar edecektir.

## Skill Güncelleme Önerisi
- Hostinger'da deploy edilen Next.js projeleri için standart checklist oluşturulmalı:
  1. Tüm build-time `@types/*` → `dependencies`'e taşı
  2. `prebuild` script ekle: `npm install --include=dev`
  3. Edge Runtime kullanma
  4. Build komutunu Hostinger panel'inde manuel ayarla
- Uzun vadede Railway.app geçiş planı yapılmalı (Neon PostgreSQL uyumlu)
