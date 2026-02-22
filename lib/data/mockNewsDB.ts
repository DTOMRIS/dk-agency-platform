// lib/data/mockNewsDB.ts
// DK Agency Haber Veritabanı - Modüler yapı (ileride gerçek DB'ye geçilecek)

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: 'horeca' | 'yatirim' | 'egitim' | 'operasyon';
  author: string;
  publishDate: string;
  updatedAt: string;
  tags: string[];
  isPremium: boolean; // Paywall için
}

// Mock News Database - B2B HORECA sektörü haberleri
export const mockNewsDB: NewsArticle[] = [
  {
    id: 'news-001',
    title: 'Bakü HORECA Sektöründe 2026 Yatırım Trendleri: Due Diligence Raporu',
    slug: 'baku-horeca-2026-yatirim-trendleri',
    summary: 'Azerbaycan HORECA pazarında 2026 yılı için öngörülen büyüme oranları ve yatırımcılar için kritik due diligence bulguları.',
    content: `Azerbaycan'ın başkenti Bakü, 2026 yılında HORECA (Hotel, Restaurant, Café) sektöründe %18.5 büyüme öngörüsüyle yatırımcıların radarına girdi. DK Agency Pazar Analisti ekibimizin hazırladığı bu kapsamlı due diligence raporunda, sektörün dinamiklerini ve yatırım fırsatlarını analiz ediyoruz.

**Pazar Büyüklüğü ve Projeksiyon**

2025 yılı sonu itibarıyla Azerbaycan HORECA pazarı 2.3 milyar AZN hacme ulaştı. 2026 için yapılan projeksiyonlar, bu rakamın 2.7 milyar AZN'ye çıkacağını gösteriyor. Bu büyümenin ana sürücüleri:

1. Turizm sektöründeki %22'lik artış beklentisi
2. Orta sınıf tüketici segmentinin genişlemesi
3. Uluslararası franchise markalarının pazara girişi
4. Digital ordering ve delivery segmentinin olgunlaşması

**Risk Analizi ve Mənfəət-Zərər Optimizasyonu**

Yatırımcıların dikkat etmesi gereken kritik risk faktörleri:

- Kira maliyetlerindeki volatilite (özellikle Nizami ve Fountains Square bölgeleri)
- İşgücü maliyetlerinin yıllık %12-15 artış trendi
- Tedarik zinciri bağımlılığı (ithal ürün oranı %65)
- Regülasyon değişiklikleri riski

**Sonuç ve Öneriler**

DK Agency olarak, 2026 yılında Bakü HORECA pazarına giriş yapmayı planlayan yatırımcılara, özellikle fast-casual dining ve specialty coffee segmentlerini değerlendirmelerini öneriyoruz. ROI beklentisi 18-24 ay aralığında optimize edilebilir.`,
    category: 'yatirim',
    author: 'DK Agency Pazar Analisti',
    publishDate: '2026-02-20T09:00:00Z',
    updatedAt: '2026-02-20T09:00:00Z',
    tags: ['HORECA', 'Yatırım', 'Due Diligence', 'Bakü', 'Azerbaycan'],
    isPremium: true,
  },
  {
    id: 'news-002',
    title: 'TQTA Sertifikasyon Programı: HORECA Personel Yetkinlik Standartları Güncellendi',
    slug: 'tqta-sertifikasyon-programi-2026',
    summary: 'Türk Dünyası Turizm Akademisi, HORECA sektörü için yeni yetkinlik çerçevesini ve sertifikasyon süreçlerini duyurdu.',
    content: `Türk Dünyası Turizm Akademisi (TQTA), DK Agency işbirliğiyle geliştirilen yeni HORECA Personel Yetkinlik Standartları'nı açıkladı. Bu güncelleme, sektörde faaliyet gösteren işletmelerin insan kaynağı kalitesini artırmayı hedefliyor.

**Yeni Sertifikasyon Modülleri**

2026 yılından itibaren geçerli olacak yeni sertifikasyon programı şu modüllerden oluşuyor:

1. **Temel İşletme Operasyonları (40 saat)**
   - POS sistemleri ve dijital ödeme entegrasyonu
   - Stok yönetimi ve maliyet kontrolü
   - Hijyen ve gıda güvenliği protokolleri

2. **Misafir Deneyimi Yönetimi (32 saat)**
   - Şikayet yönetimi ve kriz çözümleme
   - Upselling ve cross-selling teknikleri
   - Kültürlerarası iletişim becerileri

3. **Liderlik ve Ekip Yönetimi (24 saat)**
   - Vardiya planlama ve verimlilik
   - Performans değerlendirme sistemleri
   - Motivasyon ve çalışan bağlılığı

**Kayıt ve Başvuru Süreci**

Online başvurular TQTA platformu üzerinden kabul edilmektedir. İlk 100 başvuru için %25 indirim uygulanacaktır.`,
    category: 'egitim',
    author: 'TQTA Eğitim Koordinatörü',
    publishDate: '2026-02-18T14:30:00Z',
    updatedAt: '2026-02-19T10:00:00Z',
    tags: ['TQTA', 'Sertifikasyon', 'Eğitim', 'HORECA', 'Personel'],
    isPremium: false,
  },
  {
    id: 'news-003',
    title: 'Azerbaycan Vergilər Nazirliyi: Restoran İşletmeleri İçin Yeni KDV Prosedürleri',
    slug: 'azerbaycan-restoran-kdv-prosedur-2026',
    summary: 'Vergi mevzuatındaki son değişiklikler ve HORECA işletmelerinin uyum süreçleri hakkında detaylı analiz.',
    content: `Azerbaycan Vergilər Nazirliyi, 1 Mart 2026 tarihinden itibaren geçerli olacak yeni KDV prosedürlerini açıkladı. Bu değişiklikler, özellikle restoran ve cafe işletmelerini doğrudan etkiliyor.

**Temel Değişiklikler**

1. **Elektronik Fatura Zorunluluğu**
   Günlük cirosu 500 AZN üzerinde olan tüm HORECA işletmeleri, e-fatura sistemine geçmek zorunda. Entegrasyon için son tarih: 1 Haziran 2026.

2. **KDV Oranı Revizyonu**
   - Alkollü içecekler: %18 → %20
   - Paket servis: %18 (değişiklik yok)
   - Yerinde tüketim: %18 (değişiklik yok)

3. **Aylık Beyanname Süreci**
   Beyanname teslim süresi ayın 20'sinden 25'ine uzatıldı. Online beyanname zorunluluğu tüm işletmeler için geçerli.

**DK Agency Uyum Danışmanlığı**

DK Operations ekibimiz, e-fatura entegrasyonu ve vergi uyumu konusunda tam kapsamlı danışmanlık hizmeti sunmaktadır. SİMA ve e-gov sistemleriyle entegrasyon süreçlerinizi 2 hafta içinde tamamlıyoruz.

**Önemli Tarihler**
- 1 Mart 2026: Yeni KDV oranları yürürlükte
- 1 Haziran 2026: E-fatura zorunluluk tarihi
- 25 Mart 2026: İlk aylık beyanname (yeni takvim)`,
    category: 'operasyon',
    author: 'DK Agency Hukuk Danışmanı',
    publishDate: '2026-02-15T11:00:00Z',
    updatedAt: '2026-02-15T11:00:00Z',
    tags: ['Vergi', 'KDV', 'Azerbaycan', 'Mevzuat', 'E-fatura'],
    isPremium: true,
  },
  {
    id: 'news-004',
    title: 'DK Franchise: Türk Mutfağı Konseptleri İçin Yeni Master Franchise Fırsatları',
    slug: 'dk-franchise-turk-mutfagi-2026',
    summary: 'DK Agency, Azerbaycan pazarında Türk mutfağı franchise konseptleri için stratejik ortaklık programını başlatıyor.',
    content: `DK Agency, Azerbaycan ve Türk Dünyası pazarlarında faaliyet göstermek isteyen Türk mutfağı markaları için kapsamlı bir Master Franchise programı başlattı.

**Program Kapsamı**

DK Franchise hizmetleri şunları içermektedir:

1. **Pazar Giriş Stratejisi**
   - Lokasyon analizi ve site selection
   - Rekabet haritalama
   - Fiyatlandırma stratejisi yerelleştirme

2. **Operasyonel Setup**
   - Tedarikçi network kurulumu
   - Personel temini ve eğitimi
   - POS ve teknoloji altyapısı

3. **Yasal ve İdari Süreçler**
   - Şirket kuruluşu (DOST Agentliyi prosedürleri)
   - Lisans ve izin süreçleri
   - Vergi kaydı ve muhasebe setup

**Yatırım Gereksinimleri**

- Minimum yatırım: 150.000 AZN
- Franchise fee: Brand değerine göre değişken
- Royalty: %4-6 (aylık ciro üzerinden)
- Pazarlama fonu: %2 (aylık ciro üzerinden)

**ROI Projeksiyonu**

DK Agency'nin due diligence analizlerine göre, doğru lokasyon ve operasyonel verimlilikle 18-24 ay içinde yatırım geri dönüşü mümkündür. Exit stratejisi opsiyonları için AlmilaCloser ekibimizle görüşebilirsiniz.

**Başvuru Süreci**

Franchise başvuruları için gerekli belgeler:
- Finansal yeterlilik belgesi
- İş planı özeti
- HORECA deneyim portfolyosu (varsa)`,
    category: 'horeca',
    author: 'AlmilaCloser - B2B Satış',
    publishDate: '2026-02-12T08:00:00Z',
    updatedAt: '2026-02-14T16:00:00Z',
    tags: ['Franchise', 'Türk Mutfağı', 'Yatırım', 'B2B', 'Ortaklık'],
    isPremium: false,
  },
  {
    id: 'news-005',
    title: 'Bakü Restoran Açılışı: Operasyonel Checklist ve Kritik Kilometre Taşları',
    slug: 'baku-restoran-acilisi-checklist',
    summary: 'DK Operations ekibinin hazırladığı, Bakü\'de restoran açılışı için kapsamlı operasyonel rehber ve PM checklist\'i.',
    content: `DK Agency Proje Yönetimi ekibi olarak, Bakü'de restoran açılışı planlayan yatırımcılar için kritik operasyonel checklist'i paylaşıyoruz. Bu rehber, açılış öncesi 90 günlük süreçte tamamlanması gereken tüm adımları içermektedir.

**Faz 1: Yasal Kurulum (Gün 1-30)**

☐ DOST Agentliyi'nde şirket tescili
☐ Vergilər Nazirliyi kaydı
☐ ASAN Xidmət üzerinden aktivite kodu alımı
☐ Belediye izinleri ve ruhsatlar
☐ Sağlık bakanlığı onayı

**Faz 2: Fiziksel Hazırlık (Gün 31-60)**

☐ İç mimari ve dekorasyon tamamlama
☐ Mutfak ekipmanları kurulumu ve test
☐ POS sistemi entegrasyonu
☐ Güvenlik ve yangın sistemleri
☐ Havalandırma ve iklimlendirme

**Faz 3: Operasyonel Hazırlık (Gün 61-90)**

☐ Personel alımı ve işe başlatma
☐ Menü finalizasyonu ve fiyatlandırma
☐ Tedarikçi anlaşmaları
☐ İşbaşı eğitimleri (front-of-house + back-of-house)
☐ Soft opening ve test servisi
☐ Grand opening pazarlama planı

**Kritik Darboğazlar ve Çözümler**

1. **Personel Temini**: Kalifiye personel kıtlığı yaşanıyor. TQTA sertifikalı personel havuzumuza erişim için DK Operations ile iletişime geçin.

2. **Tedarik Zinciri**: İthal ürün bağımlılığını azaltmak için yerel tedarikçi network'ümüzü kullanın.

3. **İzin Süreçleri**: Belediye izinleri 3-4 hafta sürebilir. Erken başvuru kritik.

**DK Operations Danışmanlık Paketi**

Tam kapsamlı açılış yönetimi: 25.000 AZN
Kısmi danışmanlık (sadece yasal süreçler): 8.000 AZN
Personel temini ve eğitim: 12.000 AZN`,
    category: 'operasyon',
    author: 'ProjeYoneticisi - DK Operations',
    publishDate: '2026-02-10T10:00:00Z',
    updatedAt: '2026-02-10T10:00:00Z',
    tags: ['Operasyon', 'Restoran Açılışı', 'Checklist', 'PM', 'Bakü'],
    isPremium: true,
  },
];

// Helper fonksiyonlar - İleride DB'ye geçişte bu interface korunacak
export function getAllNews(): NewsArticle[] {
  return mockNewsDB;
}

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return mockNewsDB.find((news) => news.slug === slug);
}

export function getNewsById(id: string): NewsArticle | undefined {
  return mockNewsDB.find((news) => news.id === id);
}

export function getNewsByCategory(category: NewsArticle['category']): NewsArticle[] {
  return mockNewsDB.filter((news) => news.category === category);
}

export function getPublicNews(): NewsArticle[] {
  return mockNewsDB.filter((news) => !news.isPremium);
}

// İleride Ajan 3 (İçerik Mimarı) tarafından kullanılacak
export function addNews(article: Omit<NewsArticle, 'id'>): NewsArticle {
  const newArticle: NewsArticle = {
    ...article,
    id: `news-${String(mockNewsDB.length + 1).padStart(3, '0')}`,
  };
  mockNewsDB.push(newArticle);
  return newArticle;
}
