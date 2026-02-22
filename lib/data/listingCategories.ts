// lib/data/listingCategories.ts
// DK Agency - 7 Kategori İlan Sistemi
// HORECA B2B Yatırım Kategorileri

export type ListingCategory =
  | 'devir'
  | 'franchise-vermek'
  | 'franchise-almak'
  | 'ortak-tapmaq'
  | 'yeni-investisiya'
  | 'obyekt-icaresi'
  | 'horeca-ekipman';

export interface CategoryConfig {
  id: ListingCategory;
  title: string;
  titleAz: string;
  description: string;
  icon: string;
  color: string;
  fields: FormField[];
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'file' | 'range' | 'radio';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  suffix?: string;
}

export const LISTING_CATEGORIES: CategoryConfig[] = [
  {
    id: 'devir',
    title: 'İşletme Devri',
    titleAz: 'Devir',
    description: 'Mevcut işletmenizi devretmek için ilan verin',
    icon: 'ArrowLeftRight',
    color: 'bg-blue-500',
    fields: [
      { name: 'businessName', label: 'İşletme Adı', type: 'text', required: true, placeholder: 'Örn: Merkez Cafe' },
      { name: 'businessType', label: 'İşletme Tipi', type: 'select', required: true, options: [
        { value: 'restoran', label: 'Restoran' },
        { value: 'cafe', label: 'Cafe' },
        { value: 'bar', label: 'Bar' },
        { value: 'otel', label: 'Otel' },
        { value: 'fastfood', label: 'Fast Food' },
        { value: 'pastane', label: 'Pastane' },
        { value: 'diger', label: 'Diğer' },
      ]},
      { name: 'city', label: 'Şehir', type: 'text', required: true, placeholder: 'İstanbul' },
      { name: 'district', label: 'İlçe', type: 'text', required: true, placeholder: 'Kadıköy' },
      { name: 'sqm', label: 'Alan (m²)', type: 'number', required: true, min: 10, max: 10000, suffix: 'm²' },
      { name: 'askingPrice', label: 'Talep Edilen Fiyat', type: 'number', required: true, suffix: '₺' },
      { name: 'monthlyRevenue', label: 'Aylık Ciro', type: 'number', required: false, suffix: '₺' },
      { name: 'employeeCount', label: 'Çalışan Sayısı', type: 'number', required: false },
      { name: 'reason', label: 'Devir Sebebi', type: 'textarea', required: false, placeholder: 'Devir sebepinizi açıklayın...' },
      { name: 'description', label: 'Detaylı Açıklama', type: 'textarea', required: true, placeholder: 'İşletme hakkında detaylı bilgi...' },
    ],
  },
  {
    id: 'franchise-vermek',
    title: 'Franchise Vermek',
    titleAz: 'Franchise Vermək',
    description: 'Markanızı franchise olarak verin',
    icon: 'Crown',
    color: 'bg-purple-500',
    fields: [
      { name: 'brandName', label: 'Marka Adı', type: 'text', required: true, placeholder: 'Marka adınız' },
      { name: 'sector', label: 'Sektör', type: 'select', required: true, options: [
        { value: 'yemek', label: 'Yemek & Restoran' },
        { value: 'cafe', label: 'Cafe & Kahve' },
        { value: 'fastfood', label: 'Fast Food' },
        { value: 'tatli', label: 'Tatlı & Pastane' },
        { value: 'icecek', label: 'İçecek' },
        { value: 'diger', label: 'Diğer' },
      ]},
      { name: 'totalBranches', label: 'Mevcut Şube Sayısı', type: 'number', required: true },
      { name: 'franchiseFee', label: 'Franchise Bedeli', type: 'number', required: true, suffix: '₺' },
      { name: 'royaltyRate', label: 'Royalty Oranı', type: 'number', required: true, suffix: '%' },
      { name: 'totalInvestment', label: 'Toplam Yatırım Maliyeti', type: 'range', required: true, min: 100000, max: 5000000, suffix: '₺' },
      { name: 'supportServices', label: 'Sunulan Destekler', type: 'textarea', required: true, placeholder: 'Eğitim, pazarlama, IT desteği vb.' },
      { name: 'requirements', label: 'Franchise Alan Gereksinimleri', type: 'textarea', required: true, placeholder: 'Minimum sermaye, deneyim, lokasyon vb.' },
      { name: 'description', label: 'Marka Tanıtımı', type: 'textarea', required: true, placeholder: 'Markanız hakkında detaylı bilgi...' },
    ],
  },
  {
    id: 'franchise-almak',
    title: 'Franchise Almak',
    titleAz: 'Franchise Almaq',
    description: 'Franchise almak istediğinizi duyurun',
    icon: 'ShoppingBag',
    color: 'bg-green-500',
    fields: [
      { name: 'investorName', label: 'Yatırımcı / Şirket Adı', type: 'text', required: true },
      { name: 'preferredSector', label: 'Tercih Edilen Sektör', type: 'select', required: true, options: [
        { value: 'yemek', label: 'Yemek & Restoran' },
        { value: 'cafe', label: 'Cafe & Kahve' },
        { value: 'fastfood', label: 'Fast Food' },
        { value: 'tatli', label: 'Tatlı & Pastane' },
        { value: 'farketmez', label: 'Farketmez' },
      ]},
      { name: 'preferredCity', label: 'Tercih Edilen Şehir', type: 'text', required: true, placeholder: 'Birden fazla varsa virgülle ayırın' },
      { name: 'budget', label: 'Bütçe', type: 'range', required: true, min: 100000, max: 10000000, suffix: '₺' },
      { name: 'experience', label: 'Sektör Deneyimi', type: 'select', required: true, options: [
        { value: 'yok', label: 'Deneyim yok' },
        { value: '1-3', label: '1-3 yıl' },
        { value: '3-5', label: '3-5 yıl' },
        { value: '5+', label: '5 yıl üzeri' },
      ]},
      { name: 'preferredBrands', label: 'Tercih Edilen Markalar', type: 'textarea', required: false, placeholder: 'Varsa belirli markalar...' },
      { name: 'notes', label: 'Ek Notlar', type: 'textarea', required: false },
    ],
  },
  {
    id: 'ortak-tapmaq',
    title: 'Ortak Bulmak',
    titleAz: 'Ortaq Tapmaq',
    description: 'Projeleriniz için ortak arayın',
    icon: 'Users',
    color: 'bg-amber-500',
    fields: [
      { name: 'projectName', label: 'Proje / İşletme Adı', type: 'text', required: true },
      { name: 'projectType', label: 'Proje Tipi', type: 'select', required: true, options: [
        { value: 'yeni', label: 'Yeni Girişim' },
        { value: 'mevcut', label: 'Mevcut İşletme' },
        { value: 'genisleme', label: 'Genişleme Projesi' },
      ]},
      { name: 'partnershipType', label: 'Ortaklık Tipi', type: 'select', required: true, options: [
        { value: 'sermaye', label: 'Sermaye Ortağı' },
        { value: 'isletme', label: 'İşletme Ortağı' },
        { value: 'karma', label: 'Karma (Sermaye + İşletme)' },
      ]},
      { name: 'requiredCapital', label: 'Aranan Sermaye', type: 'number', required: true, suffix: '₺' },
      { name: 'shareOffered', label: 'Teklif Edilen Hisse', type: 'number', required: true, min: 1, max: 100, suffix: '%' },
      { name: 'location', label: 'Lokasyon', type: 'text', required: true },
      { name: 'partnerRequirements', label: 'Ortaktan Beklentiler', type: 'textarea', required: true, placeholder: 'Deneyim, beceriler, zaman taahhüdü vb.' },
      { name: 'businessPlan', label: 'İş Planı Özeti', type: 'textarea', required: true },
    ],
  },
  {
    id: 'yeni-investisiya',
    title: 'Yeni Yatırım',
    titleAz: 'Yeni İnvestisiya',
    description: 'Yeni yatırım fırsatlarını paylaşın',
    icon: 'TrendingUp',
    color: 'bg-[#E94560]',
    fields: [
      { name: 'projectTitle', label: 'Proje Başlığı', type: 'text', required: true },
      { name: 'category', label: 'Kategori', type: 'select', required: true, options: [
        { value: 'restoran', label: 'Restoran' },
        { value: 'otel', label: 'Otel' },
        { value: 'cafe', label: 'Cafe' },
        { value: 'bar', label: 'Bar & Gece Hayatı' },
        { value: 'catering', label: 'Catering' },
        { value: 'uretim', label: 'Gıda Üretim' },
        { value: 'teknoloji', label: 'HORECA Teknoloji' },
      ]},
      { name: 'investmentAmount', label: 'Toplam Yatırım Bedeli', type: 'number', required: true, suffix: '₺' },
      { name: 'seekingAmount', label: 'Aranan Yatırım', type: 'number', required: true, suffix: '₺' },
      { name: 'expectedROI', label: 'Beklenen ROI', type: 'number', required: false, suffix: '%' },
      { name: 'paybackPeriod', label: 'Geri Dönüş Süresi', type: 'select', required: false, options: [
        { value: '1', label: '1 yıl' },
        { value: '2', label: '2 yıl' },
        { value: '3', label: '3 yıl' },
        { value: '5', label: '5 yıl' },
        { value: '5+', label: '5 yıl üzeri' },
      ]},
      { name: 'location', label: 'Lokasyon', type: 'text', required: true },
      { name: 'projectPhase', label: 'Proje Aşaması', type: 'select', required: true, options: [
        { value: 'fikir', label: 'Fikir Aşaması' },
        { value: 'planlama', label: 'Planlama' },
        { value: 'gelistirme', label: 'Geliştirme' },
        { value: 'hazir', label: 'Yatırıma Hazır' },
      ]},
      { name: 'description', label: 'Proje Detayları', type: 'textarea', required: true },
    ],
  },
  {
    id: 'obyekt-icaresi',
    title: 'Mekan Kiralama',
    titleAz: 'Obyekt İcarəsi',
    description: 'HORECA uygun mekanları kiralayın/kiraya verin',
    icon: 'Building',
    color: 'bg-teal-500',
    fields: [
      { name: 'listingType', label: 'İlan Tipi', type: 'radio', required: true, options: [
        { value: 'kiralik', label: 'Kiralık' },
        { value: 'devir', label: 'Devir' },
      ]},
      { name: 'propertyType', label: 'Mekan Tipi', type: 'select', required: true, options: [
        { value: 'restoran', label: 'Restoran Uygun' },
        { value: 'cafe', label: 'Cafe Uygun' },
        { value: 'bar', label: 'Bar Uygun' },
        { value: 'mutfak', label: 'Üretim Mutfağı' },
        { value: 'depo', label: 'Depo / Soğuk Hava' },
        { value: 'coklu', label: 'Çoklu Kullanım' },
      ]},
      { name: 'address', label: 'Adres', type: 'text', required: true },
      { name: 'city', label: 'Şehir', type: 'text', required: true },
      { name: 'sqm', label: 'Alan (m²)', type: 'number', required: true, suffix: 'm²' },
      { name: 'monthlyRent', label: 'Aylık Kira', type: 'number', required: true, suffix: '₺' },
      { name: 'deposit', label: 'Depozito', type: 'number', required: false, suffix: '₺' },
      { name: 'hasKitchen', label: 'Mutfak Altyapısı', type: 'checkbox', required: false },
      { name: 'hasExhaust', label: 'Havalandırma / Davlumbaz', type: 'checkbox', required: false },
      { name: 'hasParking', label: 'Otopark', type: 'checkbox', required: false },
      { name: 'features', label: 'Özellikler', type: 'textarea', required: false, placeholder: 'Ek özellikler ve detaylar...' },
    ],
  },
  {
    id: 'horeca-ekipman',
    title: 'HORECA Ekipman',
    titleAz: 'HORECA Ekipman Satışı',
    description: 'Profesyonel ekipman alın veya satın',
    icon: 'Package',
    color: 'bg-indigo-500',
    fields: [
      { name: 'listingType', label: 'İlan Tipi', type: 'radio', required: true, options: [
        { value: 'satilik', label: 'Satılık' },
        { value: 'kiralik', label: 'Kiralık' },
      ]},
      { name: 'equipmentCategory', label: 'Ekipman Kategorisi', type: 'select', required: true, options: [
        { value: 'pisirme', label: 'Pişirme Ekipmanları' },
        { value: 'sogutma', label: 'Soğutma Ekipmanları' },
        { value: 'hazirlama', label: 'Hazırlama Ekipmanları' },
        { value: 'servis', label: 'Servis Ekipmanları' },
        { value: 'temizlik', label: 'Temizlik Ekipmanları' },
        { value: 'mobilya', label: 'Mobilya' },
        { value: 'yazilim', label: 'POS / Yazılım' },
        { value: 'diger', label: 'Diğer' },
      ]},
      { name: 'equipmentName', label: 'Ekipman Adı', type: 'text', required: true, placeholder: 'Örn: Endüstriyel Bulaşık Makinesi' },
      { name: 'brand', label: 'Marka', type: 'text', required: false },
      { name: 'condition', label: 'Durum', type: 'select', required: true, options: [
        { value: 'sifir', label: 'Sıfır' },
        { value: 'az-kullanilmis', label: 'Az Kullanılmış' },
        { value: 'kullanilmis', label: 'Kullanılmış' },
        { value: 'yenilenmiş', label: 'Yenilenmiş' },
      ]},
      { name: 'price', label: 'Fiyat', type: 'number', required: true, suffix: '₺' },
      { name: 'warranty', label: 'Garanti', type: 'select', required: false, options: [
        { value: 'yok', label: 'Garanti Yok' },
        { value: '6ay', label: '6 Ay' },
        { value: '1yil', label: '1 Yıl' },
        { value: '2yil', label: '2 Yıl' },
      ]},
      { name: 'location', label: 'Konum', type: 'text', required: true },
      { name: 'description', label: 'Açıklama', type: 'textarea', required: true, placeholder: 'Ekipman detayları, özellikler, boyutlar vb.' },
    ],
  },
];

export function getCategoryById(id: ListingCategory): CategoryConfig | undefined {
  return LISTING_CATEGORIES.find(cat => cat.id === id);
}

export function getCategoryColor(id: ListingCategory): string {
  const cat = getCategoryById(id);
  return cat?.color || 'bg-[#8892B0]';
}
