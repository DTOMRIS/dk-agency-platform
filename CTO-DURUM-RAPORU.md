# CTO DURUM RAPORU
Tarix: 26 Mart 2026
Hazırlayan: Codex

---

## 1. Cari Vəziyyət

- Public toolkit aktivdir və əsas discovery route `/toolkit` üzərindədir.
- `b2b-panel/toolkit` artıq əsas public giriş nöqtəsi deyil.
- `proxy.ts` istifadəyə keçirilib, `middleware.ts` deprecation bağlanıb.
- `app/layout.tsx` daxilində `metadataBase: new URL('https://dkagency.az')` əlavə olunub.

## 2. Bug Fix Paketi

- Public toolkit səhifələrində encoding təmizliyi aparıldı.
- `menu-matrix` və `basabas` public səhifələri təmiz UTF-8 mətnlə yenidən quruldu.
- `app/[locale]/haberler/[slug]/page.tsx` içində bozuk comment və görünən mətn qırıqları düzəldildi.
- `components/blog/BlogSidebars.tsx` içində bozuk comment və görünən mətn qırıqları düzəldildi.
- `Footer` və `MegaMenu` daxilində köhnə `/basla/*` keçidləri qalmır; yönləndirmə `/toolkit?stage=basla` üzərindədir.

## 3. Source Of Truth

- AQTA faktı bu layihə üçün belə sabitlənib:
- `AQTA qeydiyyatı üçün müraciət ASAN/KOBİA vasitəsilə verilir. Dövlət rüsumu yoxdur, müraciət pulsuzdur.`
- Bu cümlə app, knowledge base, blog source və agent qaydalarına yazılıb.

## 4. Açıq Texniki Borc

- `Footer.tsx` və `MegaMenu.tsx` daxilində əlavə ümumi mətn encoding təmizliyi faydalı olar.
- Blog content arxivində qalan köhnə mojibake parçaları ayrıca audit tələb edir.
- KAZAN AI üçün analytics, tool-injection və lead-scoring qatları hələ ayrıca məhsullaşdırılmalıdır.

## 5. Yoxlama

- `npm run build` uğurla keçir.
- Public route-lar build zamanı generasiya olunur.

---
