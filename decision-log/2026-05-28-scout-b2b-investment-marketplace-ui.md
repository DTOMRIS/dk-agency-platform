---
agent: scout
tarih: 2026-05-28
proje: DKagency
görev: B2B HoReCa/restoran investment marketplace UI referans araştırması
---

## Ne Buldum

### Acquire.com
- Light tema, beyaz canvas + yeşil CTA accent
- Horizontal nav, kart bazlı listing
- Trust sinyalleri: $500M+ kapalı deal, 500+ verified review
- Lead: e-posta signup kapısı (anonim browsing yok)
- Detay: sol metrikler + sağ CTA formu

### Franchise Direct
- Mavi dominant (#2487B2, #2F587C) + turuncu CTA (#ff9f00)
- 3 sütun filtre: Industry / Investment level / Location
- Investment bracketing nav menüde ana kategori
- Lead: çoklu franchise seç → tek form gönder ("queue" sistemi)
- Premium his: 25+ yıl badge, BBB sertifikası

### Flippa
- Verified financials badge (Stripe/PayPal bağlantısı)
- Premium listing tier sistemi ($295/$450/$950)
- Filtre: asset type, revenue range, profit margin, growth rate
- AI valuation tool ve AI match özelliği
- Buyer membership: $49/mo (priority access)

### LoopNet
- Büyük kart header'ı (4 data point)
- Property type bazlı özelleştirilmiş card varyantları
- Filter bar yenilenmiş (refresh odaklı tasarım)
- Flexbox + CSS Grid hybrid kart layout
- Veri yoğun: 5'e kadar broker, sale+lease ayrımı

## Hangi Kaynaklar İşe Yaradı
- WebFetch: Acquire.com, FranchiseDirect (direkt HTML)
- WebSearch: LoopNet case study (Fallon Design portfolio), Flippa feature listesi

## Hangi Aramalar Sonuçsuz Kaldı
- BizBuySell, Daltons, TheRestaurantBrokers → 403/404 (bot koruması)
- Crexi → 403
- LoopNet direkt fetch → 403 (ama case study üzerinden bulundu)

## Tekrar Eden Pattern
Evet — premium B2B marketplace'lerde 3 ortak pattern:
1. Trust badge/verification sistemi (verified financials, certifications)
2. Investment bracket filtresi (ana navigasyonda görünür)
3. Gated lead capture (anonim browsing sınırlı, form kapısı)

## Skill Güncelleme Önerisi
BizBuySell, LoopNet, Crexi gibi büyük platformlar doğrudan WebFetch bloke ediyor.
Gelecekte Playwright browser screenshot ile araştır — daha güvenilir.
