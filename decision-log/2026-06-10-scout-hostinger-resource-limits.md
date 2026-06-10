---
agent: scout
tarih: 2026-06-10
proje: DKagency
görev: Hostinger Cloud Startup plan kaynak limitleri, Next.js 16 uyumu, alternatif platform karşılaştırması
---

## Ne Buldum

### 1. Cloud Startup Plan Spesifikasyonları (Doğrulandı)
- RAM: 4 GB (dedicated, paylaşımlı değil)
- CPU: 2 core (dedicated)
- Disk: 100 GB NVMe SSD
- Bandwidth: Unlimited (resmi iddia)
- Fiyat: ~$7.99/ay (48 aylık) / $27.99/ay (aylık)
- Max website: 300

### 2. Cloud Professional Plan
- RAM: 6 GB
- CPU: 4 core
- Disk: 200 GB NVMe
- Bandwidth: Unlimited
- Fiyat: ~$15.99/ay

### 3. Cloud Enterprise Plan
- RAM: 12 GB
- CPU: 6 core
- Disk: 300 GB NVMe

### 4. Boost Feature
- 24 saatlik geçici kaynak artışı (bir üst planın kaynakları)
- Ayda 1 kez ücretsiz
- Kalıcı değil — traffic spike, veri import, test için
- Ek boost için ücret yapısı resmi dok'ta net değil

### 5. 503 Davranışı
- %100 RAM veya process limit → CloudLinux anında 503 döner
- Auto-scale YOK — Hostinger Web Apps'ta yatay/dikey ölçekleme otomatik değil
- Ay içinde 10-20 kez limit aşımı = plan upgrade zorunluluğu sinyali
- Next.js için özel not: "platform optimization" mevcuttur, yeni deploylar otomatik alır, process sayısını düşürür

### 6. Next.js Bellek Tüketim Gerçeği
- App Router production sunucu başlatmada TÜM page JS modüllerini preload eder
- 243 route × ortalama 0.3–0.5 MB = ~73–122 MB sadece route preload
- 89 API endpoint + middleware katmanı = ek ~50–80 MB
- 4 dil i18n (next-intl) locale dosya yükleme = ~20–40 MB
- Drizzle ORM bağlantı havuzu = ~30–50 MB
- DeepSeek/Anthropic SDK yüklü = ~20–30 MB
- Node.js process overhead = ~100–150 MB
- TOPLAM TAHMİN: 293–472 MB idle, peak (aktif istek altında) 600–900 MB+
- 4 GB RAM içinde: teorik olarak sığıyor ancak headroom dar

### 7. Ne Zaman Sorun Çıkar
- Eş zamanlı 5+ kullanıcı + AI API çağrısı (DeepSeek timeout / uzun yanıt)
- Blog CMS + News RSS pipeline eş zamanlı çalışırken
- Build sırasında (next build 300–600 MB ek RAM) — canlı site ile çakışma riski
- Memory leak varsa (Next.js 15/16'da bilinen issue #79588)

## Hangi Kaynaklar İşe Yaradı
- WebSearch: Hostinger resmi support doc, blog, community karşılaştırma siteleri
- Next.js GitHub issue #79588 (memory leak kanıtı)
- Vercel/Railway/Coolify karşılaştırma siteleri (2026 güncel)

## Hangi Aramalar Sonuçsuz Kaldı
- WebFetch engellendi — resmi hostinger.com sayfaları doğrudan okunamadı
- Boost özelliğinin ek ücret detayları netleştirilemedi
- Hostinger Web Apps (dkagency.com.tr'nin kullandığı) ile Cloud Hosting arasındaki tam fark belgelenemedi

## Tekrar Eden Pattern
Evet — Hostinger + Node.js/Next.js kombinasyonu kaynak sıkışması için bilinen risk bölgesidir.
2026-05-04 araştırması da aynı sonuca ulaşmıştı (decision-log/2026-05-04-scout-hostinger-nextjs-deploy.md).

## Skill Güncelleme Önerisi
- Railway geçiş kararı için eşik belirle: aylık 3+ 503 hatası = geçiş tetikleyicisi
- next.config.ts'e şu optimizasyonları ekle:
  - experimental.preloadEntriesOnStart: false (bellek düşürür, cold start artar)
  - productionBrowserSourceMaps: false
  - experimental.webpackMemoryOptimizations: true
  - isrMemoryCacheSize: 0 (ISR bellekten temizle)
