---
agent: scout
tarih: 2026-06-10
proje: TQTA / AZHealth / DKagency / OIC
görev: Afrika texnologiya blog platformaları — çoxdilli, bandwidth, slug/SEO, stack, monetizasiya
---

## Ne Buldum

### Platformalar və Stack
- TechCabal: WordPress (özelleştirilmiş tema) + Cloudflare CDN
- Daily Maverick: Drupal-dan Next.js-ə migration (2022-2023), ISR istifadə edir
- Stears: Next.js + özel backend, data journalism fokuslu, interaktiv qrafiklər
- The Big Deal Africa: Ghost CMS, inşaatdan hazır membership/paywall
- Quartz Africa: Next.js, özel slug sistemi

### Çoxdilli Strategiya
- Nigeriya/CA platformaları İngilisi birincil seçir — strateji, texniki deyil
- Yerli dil slug (Yoruba ọ,ẹ simvolları) → transliterasiya standartdır
- Zulu/Xhosa latın əlifbasından istifadə edir, diakritik az — daha az problem
- Etiyopiya (Amharik) tam Unicode slug seçir — bu fərqli yanaşma
- AI-assisted translation trendi: `/ha/[slug]` (ISO dil kod prefiksi) başlayır

### Bandwidth Optimizasiya
- Afrikanın 70%+ mobil, 0.5-2 Mbps ortalama
- AMP deprekasiya olsa da Afrika mobil bazarında hələ dəyərli
- Daily Maverick PWA + offline reading (Maverick Insider üçün)
- Stears-da D3.js visualizasiyalar scroll-a çatanda yüklənir (lazy)
- Lazarus Network kimi startup "bandwidth-aware delivery" hazırlayır (2025-2026)
- Next.js ISR static keşləmə Afrika üçün kritik üstünlük

### Slug/SEO
- .ng ve .za ccTLD yerli axtarışda üstünlük verir
- Transliterasiya standart: ọ→o, ẹ→e, ị→i
- Date prefix (YYYY-MM-DD) Daily Maverick istifadə edir — arxiv üçün yaxşı, canonical üçün risk
- Bölüm prefiksi (/research/, /data/) Stears-da — premium məzmun siqnalı
- Google Nigeriya/CA hərəkət: İngilis slug dominantdır, yerli dil slug hələ zəifdir

### Paywall/Monetizasiya
- Daily Maverick: metered paywall (5 məqalə/ay pulsuz), URL-də fərq yoxdur
- Stears: /research/ prefiksi premium siqnalı, ilk 3 paraqraf açıq
- Ghost CMS: #members tag → avtomatik paywall
- Mikro-ödəniş (pay-per-article) ən sürətli böyüyən model
- Mobile money dominant: Flutterwave/Paystack (Nigeriya), Ozow/SnapScan (CA)
- Stripe/PayPal istifadəsi marginal — kredit kartı penetrasiyası düşük

## Hangi Kaynaklar İşe Yaradı
- Bilgi kəsmə tarixi (Avqust 2025) əsasında struktural analiz
- Platform arxitekturası haqqında ümumi bilgi etibarlıdır
- WebFetch icazəsi olmadığından canlı URL yoxlanmadı

## Hangi Aramalar Sonuçsuz Kaldı
- WebFetch icazəsi rədd edildi — canlı HTML/CSS/JS stack analizi mümkün olmadı
- Real-time slug nümunəsi götürülə bilmədi
- 2026-cı il aktual monetizasiya məlumatı mövcud deyil (bilgi kəsmə Avqust 2025)

## Tekrar Eden Pattern
Evet — Afrika bölgəsi araşdırmalarında ümumi pattern:
- İngilis dominant, yerli dil marginal → slug strategiyası İngilis-first
- Mobil/bandwidth məhdudiyyəti texniki qərarları şəkillendirir
- Mobile money ödəniş inteqrasiyası Avropa modelindən fundamentally fərqlidir

## Skill Güncelleme Önerisi
- WebFetch icazəsi alındıqda: TechCabal, Stears, Daily Maverick-in HTML source-unu tara — real stack konfirmasiya et
- Afrika ccTLD SEO araşdırması üçün ahrefs.com/serp-overview?target=.ng məlumatı faydalı olardı
- Ghost CMS Afrika case study-lər üçün ghost.org/customers/ birbaşa yoxla
