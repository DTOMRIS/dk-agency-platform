export type AdminBlogStatus = 'draft' | 'published' | 'archived';
export type AdminNewsStatus = 'fetched' | 'approved' | 'rejected';

export const defaultHeroContent = {
  badgeAz: 'Azərbaycanın İlk HoReCa Platforması',
  badgeTr: "Azerbaycan'ın İlk HoReCa Platformu",
  badgeEn: "Azerbaijan's First HoReCa Platform",
  titleLine1Az: 'Restoranın niyə pul itirdiyini',
  titleHighlightAz: 'gör',
  titleLine2Az: 'və nəzarəti geri al',
  subtitleAz:
    'Food cost, P&L, AQTA və böyümə qərarlarını bir platformada idarə et. DK Agency restoran sahibinə rəqəmlə düşünməyi öyrədir.',
  ahilikAz:
    'Ahilikdən gələn ustalıq, bugünün dataya dayanan qərarları ilə birləşir. OCAQ paneli bu fəlsəfənin rəqəmsal idarəetmə mərkəzidir.',
  stat1Value: '150+',
  stat1Label: 'Aktiv restoran',
  stat2Value: '10',
  stat2Label: 'Pulsuz alət',
  stat3Value: '32%',
  stat3Label: 'Xərc azalması',
  ctaText: 'Pulsuz Alətlərə Başla',
  ctaLink: '/toolkit',
};

export const adminBlogPosts = [
  {
    slug: '1-porsiya-food-cost-hesablama',
    titleAz: '1 Porsiya Food Cost Necə Hesablanır?',
    titleTr: '1 Porsiyon Food Cost Nasıl Hesaplanır?',
    titleEn: 'How to Calculate Food Cost Per Portion',
    category: 'Maliyyə',
    author: 'Doğan Tomris',
    readTime: 12,
    status: 'published' as AdminBlogStatus,
    paywall: true,
    publishDate: '2026-03-12',
    seoTitle: '1 Porsiya Food Cost Necə Hesablanır?',
    seoDescription: 'Food cost, porsiya maya dəyəri və satış qiyməti arasında düzgün balansı hesabla.',
    doganNote: 'Ən çox pul buradan itir.',
    contentAz: 'Food cost məzmunu üçün uzun form yazı placeholder.',
    contentTr: 'Food cost içeriği için placeholder.',
    contentEn: 'Placeholder content for food cost article.',
    guruBoxes: [
      { guru: 'David Scott Peters', quote: 'Food cost-u bilməmək təhlükəlidir.', book: 'Restaurant Prosperity Formula' },
    ],
  },
  {
    slug: 'pnl-oxuya-bilmirsen',
    titleAz: 'P&L Oxuya Bilmirsən?',
    titleTr: 'P&L Okuyamıyor musun?',
    titleEn: 'Can’t Read Your P&L?',
    category: 'Maliyyə',
    author: 'DK Agency',
    readTime: 10,
    status: 'draft' as AdminBlogStatus,
    paywall: false,
    publishDate: '2026-03-18',
    seoTitle: 'P&L Oxumaq üçün 5 Dəqiqəlik Çərçivə',
    seoDescription: 'Prime cost, icarə və xalis mənfəəti sürətli yoxlama çərçivəsi.',
    doganNote: 'P&L qorxulu sənəd deyil.',
    contentAz: 'P&L məqaləsi placeholder.',
    contentTr: '',
    contentEn: '',
    guruBoxes: [],
  },
  {
    slug: 'aqta-cerime-checklist',
    titleAz: 'AQTA Hazırlıq Checklisti',
    titleTr: 'AQTA Hazırlık Checklisti',
    titleEn: 'AQTA Inspection Checklist',
    category: 'Hüquqi',
    author: 'DK Agency',
    readTime: 8,
    status: 'archived' as AdminBlogStatus,
    paywall: false,
    publishDate: '2026-03-03',
    seoTitle: 'AQTA Hazırlıq Checklisti',
    seoDescription: 'AQTA yoxlaması üçün əsas sənəd və gigiyena siyahısı.',
    doganNote: '',
    contentAz: 'AQTA məqaləsi placeholder.',
    contentTr: '',
    contentEn: '',
    guruBoxes: [],
  },
];

export const adminToolkitCards = [
  { id: 'checklist', titleAz: 'Açılış Checklist', titleTr: 'Açılış Checklist', titleEn: 'Opening Checklist', descriptionAz: 'Restoran açılışına hazırlıq planı.', category: 'Başla', icon: 'ClipboardList', href: '/toolkit/checklist', active: true },
  { id: 'insaat', titleAz: 'İnşaat Checklist', titleTr: 'İnşaat Checklist', titleEn: 'Construction Checklist', descriptionAz: 'İnşaatdan açılışa 52 maddəlik plan.', category: 'Başla', icon: 'Hammer', href: '/toolkit/insaat-checklist', active: true },
  { id: 'aqta', titleAz: 'AQTA Hazırlıq', titleTr: 'AQTA Hazırlık', titleEn: 'AQTA Prep', descriptionAz: 'AQTA yoxlaması üçün hazırlıq.', category: 'Başla', icon: 'Shield', href: '/toolkit/aqta-checklist', active: true },
  { id: 'branding', titleAz: 'Markalaşma Guide', titleTr: 'Markalaşma Guide', titleEn: 'Branding Guide', descriptionAz: 'Brend kimliyi workbook formatında.', category: 'Başla', icon: 'Palette', href: '/toolkit/branding-guide', active: true },
  { id: 'basabas', titleAz: 'Başabaş Nöqtəsi', titleTr: 'Başabaş Noktası', titleEn: 'Break-even', descriptionAz: 'Aylıq minimum satış həddi.', category: 'Başla', icon: 'Target', href: '/toolkit/basabas', active: true },
  { id: 'food-cost', titleAz: 'Food Cost Kalkulyator', titleTr: 'Food Cost Kalkülatörü', titleEn: 'Food Cost Calculator', descriptionAz: 'Porsiya maya dəyərini hesabla.', category: 'Böyüt', icon: 'Calculator', href: '/toolkit/food-cost', active: true },
  { id: 'pnl', titleAz: 'P&L Simulyator', titleTr: 'P&L Simülatörü', titleEn: 'P&L Simulator', descriptionAz: 'Prime cost və mənfəəti izləyin.', category: 'Böyüt', icon: 'LineChart', href: '/toolkit/pnl', active: true },
  { id: 'menu-matrix', titleAz: 'Menyu Matrisi', titleTr: 'Menü Matrisi', titleEn: 'Menu Matrix', descriptionAz: 'Ulduz, At, Puzzle və İt kateqoriyası.', category: 'Böyüt', icon: 'Grid2X2', href: '/toolkit/menu-matrix', active: true },
  { id: 'staff', titleAz: 'İşçi Saxlama', titleTr: 'Çalışan Tutma', titleEn: 'Staff Retention', descriptionAz: 'Turnover və itki hesabı.', category: 'Böyüt', icon: 'Users', href: '/toolkit/staff-retention', active: true },
  { id: 'delivery', titleAz: 'Delivery Kalkulyator', titleTr: 'Delivery Hesaplayıcı', titleEn: 'Delivery Calculator', descriptionAz: 'Komissiya və marja müqayisəsi.', category: 'Böyüt', icon: 'Truck', href: '/toolkit/delivery-calc', active: true },
];

export const adminPartners = [
  { id: 'p1', name: 'Wolt', logo: '/images/listings/placeholder-1.svg', link: 'https://wolt.com' },
  { id: 'p2', name: 'Bolt Food', logo: '/images/listings/placeholder-2.svg', link: 'https://food.bolt.eu' },
  { id: 'p3', name: 'iLoyal POS', logo: '/images/listings/placeholder-3.svg', link: 'https://iloyal.az' },
];

export const adminSiteSettings = {
  logoText: 'DK Agency',
  footerDescription: 'HoReCa üçün alətlər, bilik bazası və B2B elan ekosistemi.',
  instagram: 'https://instagram.com/dkagency',
  facebook: 'https://facebook.com/dkagency',
  linkedin: 'https://linkedin.com/company/dkagency',
  twitter: 'https://x.com/dkagency',
  youtube: 'https://youtube.com/@dkagency',
  phone: '+994 50 123 45 67',
  email: 'info@dkagency.az',
  address: 'Bakı, Azərbaycan',
  copyright: '© 2026 DK Agency',
  siteName: 'DK Agency',
  seoTitle: 'DK Agency — HoReCa üçün rəqəmsal idarəetmə platforması',
  seoDescription: 'Toolkits, blog, xəbərlər və OCAQ idarə paneli ilə restoranı optimallaşdır.',
  favicon: '/favicon.ico',
  ogImage: '/opengraph-image.png',
  gaId: 'G-XXXXXXX',
};

export const adminNewsQueue = [
  { id: 'n1', title: 'Hospitality Net restoran əməliyyat xərclərini analiz edir', source: 'Hospitality Net', category: 'operations', status: 'fetched' as AdminNewsStatus, date: '2026-03-30' },
  { id: 'n2', title: 'Restaurant Business delivery marjalarını dəyərləndirir', source: 'Restaurant Business', category: 'finance', status: 'approved' as AdminNewsStatus, date: '2026-03-29' },
  { id: 'n3', title: 'Nation’s Restaurant News franchise böyüməsini araşdırır', source: "Nation's Restaurant News", category: 'growth', status: 'fetched' as AdminNewsStatus, date: '2026-03-29' },
  { id: 'n4', title: 'The Caterer işçi planlaması haqqında yazır', source: 'The Caterer', category: 'operations', status: 'rejected' as AdminNewsStatus, date: '2026-03-28' },
  { id: 'n5', title: 'HotelNewsNow bazar trendlərini paylaşır', source: 'HotelNewsNow', category: 'market', status: 'approved' as AdminNewsStatus, date: '2026-03-27' },
  { id: 'n6', title: 'QSR Magazine texnologiya investisiyalarını dəyərləndirir', source: 'QSR Magazine', category: 'technology', status: 'fetched' as AdminNewsStatus, date: '2026-03-26' },
];

export const adminUsers = [
  { id: 1, name: 'Doğan Tomris', email: 'dotomris@gmail.com', phone: '+994501234567', createdAt: '2026-03-01', emailVerified: true, listingCount: 3, lastLogin: '2026-03-30 14:25', leads: 5 },
  { id: 2, name: 'Nərgiz Əliyeva', email: 'nergiz@dkagency.az', phone: '+994501112244', createdAt: '2026-03-04', emailVerified: true, listingCount: 1, lastLogin: '2026-03-29 18:10', leads: 3 },
  { id: 3, name: 'Rauf Həsənov', email: 'rauf@dkagency.az', phone: '+994501112255', createdAt: '2026-03-06', emailVerified: false, listingCount: 2, lastLogin: '2026-03-29 13:44', leads: 2 },
  { id: 4, name: 'Leyla Quliyeva', email: 'leyla@dkagency.az', phone: '+994501112266', createdAt: '2026-03-08', emailVerified: true, listingCount: 1, lastLogin: '2026-03-28 10:30', leads: 1 },
  { id: 5, name: 'Aysel Rzayeva', email: 'aysel@dkagency.az', phone: '+994501112277', createdAt: '2026-03-09', emailVerified: true, listingCount: 1, lastLogin: '2026-03-27 20:11', leads: 4 },
  { id: 6, name: 'Murad Qasımov', email: 'murad@dkagency.az', phone: '+994551112233', createdAt: '2026-03-10', emailVerified: false, listingCount: 0, lastLogin: '2026-03-26 15:09', leads: 0 },
  { id: 7, name: 'Əli Məmmədov', email: 'eli@dkagency.az', phone: '+994501234568', createdAt: '2026-03-11', emailVerified: true, listingCount: 0, lastLogin: '2026-03-25 09:20', leads: 0 },
  { id: 8, name: 'Fərid Abbasov', email: 'ferid@dkagency.az', phone: '+994501414141', createdAt: '2026-03-12', emailVerified: true, listingCount: 2, lastLogin: '2026-03-24 08:15', leads: 2 },
];
