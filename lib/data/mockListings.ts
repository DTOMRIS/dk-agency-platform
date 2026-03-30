import { ListingCategory } from '@/lib/data/listingCategories';
import { ListingWorkflowStatus } from '@/lib/utils/listingStatus';

export interface ListingImage {
  id: string;
  url: string;
  alt: string;
}

export interface MockListingReviewNote {
  reviewer: string;
  note: string;
  score: number;
  createdAt: string;
}

export interface MockListingLead {
  name: string;
  phone: string;
  email: string;
  message: string;
  status: 'new' | 'contacted';
  createdAt: string;
}

export interface MockListing {
  id: number;
  slug: string;
  trackingCode: string;
  type: ListingCategory;
  status: ListingWorkflowStatus;
  title: string;
  description: string;
  price: number;
  priceLabel?: string;
  currency: 'AZN';
  city: string;
  district?: string;
  ownerName: string;
  phone: string;
  email: string;
  images: ListingImage[];
  isShowcase: boolean;
  isFeatured: boolean;
  typeSpecificData: Record<string, string | number | boolean>;
  reviewNotes: MockListingReviewNote[];
  leads: MockListingLead[];
  createdAt: string;
  updatedAt: string;
}

const IMG = [
  '/images/listings/placeholder-1.svg',
  '/images/listings/placeholder-2.svg',
  '/images/listings/placeholder-3.svg',
  '/images/listings/placeholder-4.svg',
  '/images/listings/placeholder-5.svg',
  '/images/listings/placeholder-6.svg',
];

const note = (text: string, score: number, createdAt: string): MockListingReviewNote => ({
  reviewer: 'Admin',
  note: text,
  score,
  createdAt,
});

const lead = (
  name: string,
  phone: string,
  createdAt: string,
  status: 'new' | 'contacted' = 'new'
): MockListingLead => ({
  name,
  phone,
  email: 'lead@dkagency.az',
  message: 'Maraqlanıram',
  status,
  createdAt,
});

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: 1,
    slug: 'nerimanov-rayonunda-120m-restoran-devri',
    trackingCode: 'DK-2026-0001',
    type: 'devir',
    status: 'showcase_ready',
    title: 'Nərimanov Rayonunda 120m² Restoran Devri',
    description: 'Hazır işlək restoran premium küçədə yerləşir. Tam mətbəx avadanlığı, oturmuş komanda və aktiv çatdırılma kanalı ilə birlikdə təhvil verilir. Mövcud dövriyyə və daimi müştəri bazası var.',
    price: 85000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Nərimanov',
    ownerName: 'Elvin Məmmədov',
    phone: '994501112233',
    email: 'devir1@dkagency.az',
    images: [
      { id: '1-1', url: IMG[0], alt: 'Nərimanov restoranı - əsas görüntü' },
      { id: '1-2', url: IMG[1], alt: 'Nərimanov restoranı - interyer görüntü' },
    ],
    isShowcase: true,
    isFeatured: true,
    typeSpecificData: { area: 120, seatCount: 64, hasLicense: true, monthlyRevenue: 28000, monthlyExpense: 17000, rentAmount: 4200, staffCount: 11, reason: 'Fokus başqa layihəyə keçir.', equipmentIncluded: true, yearsOperating: 4 },
    reviewNotes: [note('Vitrin üçün hazır vəziyyətdədir.', 5, '2026-03-22T10:00:00.000Z')],
    leads: [lead('Əli Məmmədov', '+994501234567', '2026-03-23T12:10:00.000Z')],
    createdAt: '2026-03-20T09:00:00.000Z',
    updatedAt: '2026-03-25T14:20:00.000Z',
  },
  {
    id: 2,
    slug: 'pizza-brendi-franchise-teklifi',
    trackingCode: 'DK-2026-0002',
    type: 'franchise-vermek',
    status: 'showcase_ready',
    title: 'Pizza Brendi Franchise Təklifi',
    description: 'Bakıda 3 nöqtə ilə işləyən pizza brendi yeni partnyorlar axtarır. Təlim, açılış paketi, menyu sistemi və marketinq dəstəyi təqdim olunur. Sürətli açılış üçün hazır SOP-lar mövcuddur.',
    price: 45000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Yasamal',
    ownerName: 'Nərgiz Əliyeva',
    phone: '994501112244',
    email: 'franchise@dkagency.az',
    images: [
      { id: '2-1', url: IMG[2], alt: 'Pizza franchise cover' },
      { id: '2-2', url: IMG[3], alt: 'Pizza franchise interyer' },
    ],
    isShowcase: true,
    isFeatured: true,
    typeSpecificData: { brandName: 'Pizza Art', franchiseFee: 45000, royaltyPercent: 5, totalInvestment: 120000, supportPackage: 'Açılış təlimi, marketinq, resept kitabı', trainingIncluded: true, exclusiveTerritory: 'Yasamal', currentLocations: 3, contractYears: 5 },
    reviewNotes: [note('Brend sənədləri tamdır, vitrin üçün uyğundur.', 5, '2026-03-23T16:00:00.000Z')],
    leads: [lead('Murad Qasımov', '+994551112233', '2026-03-24T09:40:00.000Z', 'contacted')],
    createdAt: '2026-03-20T11:00:00.000Z',
    updatedAt: '2026-03-26T08:20:00.000Z',
  },
  {
    id: 3,
    slug: 'pesekar-metbex-avadanliqlari-desti',
    trackingCode: 'DK-2026-0003',
    type: 'horeca-ekipman',
    status: 'showcase_ready',
    title: 'Peşəkar Mətbəx Avadanlıqları Dəsti',
    description: 'Tam işlək isti xətt, soyutma və hazırlıq avadanlıqlarından ibarət paketdir. Avadanlıqlar restoran bağlanışından çıxıb, servis tarixçəsi saxlanılıb. Qısa müddətdə montaja hazır vəziyyətdədir.',
    price: 12000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Binəqədi',
    ownerName: 'Rauf Həsənov',
    phone: '994501112255',
    email: 'ekipman@dkagency.az',
    images: [
      { id: '3-1', url: IMG[4], alt: 'Mətbəx avadanlıqları cover' },
      { id: '3-2', url: IMG[5], alt: 'Mətbəx avadanlıqları əlavə görüntü' },
    ],
    isShowcase: true,
    isFeatured: false,
    typeSpecificData: { brand: 'HORECA Mix', model: 'Pro Set 2024', condition: 'İstifadə olunmuş - əla', warranty: 3, quantity: 8, dimensions: 'Paket satış', powerRequirement: '380V' },
    reviewNotes: [note('Avadanlıq siyahısı dəqiqdir.', 4, '2026-03-24T13:30:00.000Z')],
    leads: [lead('Tural Kərimov', '+994701010101', '2026-03-25T11:30:00.000Z')],
    createdAt: '2026-03-21T10:30:00.000Z',
    updatedAt: '2026-03-25T18:10:00.000Z',
  },
  {
    id: 4,
    slug: 'seher-merkezinde-200m-restoran-obyekti',
    trackingCode: 'DK-2026-0004',
    type: 'obyekt-icaresi',
    status: 'showcase_ready',
    title: 'Şəhər Mərkəzində 200m² Restoran Obyekti',
    description: 'Səbail rayonunda piyada axını güclü küçədə yerləşən obyekt icarəyə verilir. Davlumbaz çıxışı və qismən mətbəx infrastrukturu hazırdır. Terras potensialı ilə konsept restoran üçün uyğundur.',
    price: 3500,
    priceLabel: '3 500 AZN / ay',
    currency: 'AZN',
    city: 'Bakı',
    district: 'Səbail',
    ownerName: 'Leyla Quliyeva',
    phone: '994501112266',
    email: 'obyekt@dkagency.az',
    images: [
      { id: '4-1', url: IMG[1], alt: 'Səbail obyekt cover' },
      { id: '4-2', url: IMG[0], alt: 'Səbail obyekt interyer' },
    ],
    isShowcase: true,
    isFeatured: false,
    typeSpecificData: { area: 200, floor: '1', ceilingHeight: 4.2, hasKitchenInfra: true, hasVentilation: true, parkingSpaces: 6, previousUse: 'Restoran', availableFrom: 'Dərhal' },
    reviewNotes: [note('Lokasiya premiumdur, showcase qalmalıdır.', 4, '2026-03-24T18:00:00.000Z')],
    leads: [lead('Fərid Abbasov', '+994501414141', '2026-03-26T08:50:00.000Z')],
    createdAt: '2026-03-19T09:40:00.000Z',
    updatedAt: '2026-03-26T14:15:00.000Z',
  },
  {
    id: 5,
    slug: 'yeni-konsept-kafe-ucun-investor-axtarilir',
    trackingCode: 'DK-2026-0005',
    type: 'ortak-tapmaq',
    status: 'showcase_ready',
    title: 'Yeni Konsept Kafe üçün İnvestor Axtarılır',
    description: 'Xətai ərazisində açılacaq üçüncü nəsil qəhvə konsepti üçün strateji ortağa ehtiyac var. Layihənin brend dili və ilkin maliyyə modeli hazırdır. Aktiv operator və investor kombinasiyası axtarılır.',
    price: 30000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Xətai',
    ownerName: 'Aysel Rzayeva',
    phone: '994501112277',
    email: 'ortaq@dkagency.az',
    images: [
      { id: '5-1', url: IMG[3], alt: 'Yeni konsept kafe cover' },
      { id: '5-2', url: IMG[2], alt: 'Yeni konsept kafe moodboard' },
    ],
    isShowcase: true,
    isFeatured: false,
    typeSpecificData: { businessType: 'Üçüncü nəsil qəhvə', investmentNeeded: 30000, partnerRole: 'Sərmayə və growth partnyoru', currentStage: 'Konsept hazır', revenueShare: '25% pay' },
    reviewNotes: [note('Pitch güclüdür, investor marağı yüksəkdir.', 5, '2026-03-25T09:15:00.000Z')],
    leads: [lead('Rəşad Əliyev', '+994502222222', '2026-03-26T16:05:00.000Z')],
    createdAt: '2026-03-18T12:00:00.000Z',
    updatedAt: '2026-03-26T17:20:00.000Z',
  },
  {
    id: 6,
    slug: 'beynelxalq-fast-food-franchise-almaq-isteyirem',
    trackingCode: 'DK-2026-0006',
    type: 'franchise-almaq',
    status: 'showcase_ready',
    title: 'Beynəlxalq Fast-Food Franchise Almaq İstəyirəm',
    description: 'Bakı daxilində yüksək trafik lokasiyada beynəlxalq fast-food brendi ilə işləmək istəyən investor profili. Əməliyyat təcrübəsi olan komanda və ilkin kapital hazırdır. Güclü marka və açılış dəstəyi prioritetdir.',
    price: 100000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Nəsimi',
    ownerName: 'Kamran Səfərov',
    phone: '994501112288',
    email: 'franchisealmaq@dkagency.az',
    images: [
      { id: '6-1', url: IMG[5], alt: 'Franchise almaq üçün investor cover' },
      { id: '6-2', url: IMG[4], alt: 'Franchise almaq üçün lokasiya vizualı' },
    ],
    isShowcase: true,
    isFeatured: false,
    typeSpecificData: { desiredCategory: 'Fast food', budget: 100000, preferredCity: 'Bakı', experience: '6 illik əməliyyat idarəçiliyi', timeline: '3 ay içində başlamaq istəyir' },
    reviewNotes: [note('Profil aydındır, showcase üçün uyğundur.', 4, '2026-03-25T14:30:00.000Z')],
    leads: [lead('Səbinə İsmayılova', '+994503333333', '2026-03-27T10:00:00.000Z', 'contacted')],
    createdAt: '2026-03-18T14:30:00.000Z',
    updatedAt: '2026-03-27T09:40:00.000Z',
  },
  {
    id: 7,
    slug: 'franchise-almaq-submitted',
    trackingCode: 'DK-2026-0007',
    type: 'franchise-almaq',
    status: 'submitted',
    title: 'Regional Burger Franchise Almaq İstəyən Operator',
    description: 'Yeni daxil olmuş investor sorğusudur. Büdcə və lokasiya tələbi göndərilib, ilkin baxış gözləyir.',
    price: 65000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Yasamal',
    ownerName: 'Orxan Məlikli',
    phone: '994507770001',
    email: 'operator7@dkagency.az',
    images: [{ id: '7-1', url: IMG[2], alt: 'Franchise almaq cover' }],
    isShowcase: false,
    isFeatured: false,
    typeSpecificData: { desiredCategory: 'Burger', budget: 65000, preferredCity: 'Bakı', experience: '2 il kafe idarəçiliyi', timeline: 'Yay mövsümündə' },
    reviewNotes: [note('Yeni göndərilib, ilkin baxış gözləyir.', 3, '2026-03-29T09:00:00.000Z')],
    leads: [],
    createdAt: '2026-03-29T08:30:00.000Z',
    updatedAt: '2026-03-29T08:30:00.000Z',
  },
  {
    id: 8,
    slug: 'devir-committee-review',
    trackingCode: 'DK-2026-0008',
    type: 'devir',
    status: 'committee_review',
    title: 'Nizami Rayonunda Ailə Restoranı İncelənir',
    description: 'Əməliyyat göstəriciləri güclüdür, amma komitə maliyyə sənədlərini dərinləşdirilmiş şəkildə yoxlayır.',
    price: 72000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Nizami',
    ownerName: 'Rəşad Hümbətov',
    phone: '994507770002',
    email: 'devir8@dkagency.az',
    images: [{ id: '8-1', url: IMG[0], alt: 'Devir elan cover' }],
    isShowcase: false,
    isFeatured: false,
    typeSpecificData: { area: 135, seatCount: 58, hasLicense: true, monthlyRevenue: 26000, monthlyExpense: 18000, rentAmount: 3500, staffCount: 9, reason: 'Partnyor ayrılır', equipmentIncluded: true, yearsOperating: 3 },
    reviewNotes: [note('Komitə mərhələsindədir.', 4, '2026-03-29T10:45:00.000Z')],
    leads: [lead('Nihad Ələkbərov', '+994504444111', '2026-03-29T11:10:00.000Z')],
    createdAt: '2026-03-28T15:00:00.000Z',
    updatedAt: '2026-03-29T10:45:00.000Z',
  },
  {
    id: 9,
    slug: 'horeca-ekipman-docs-requested',
    trackingCode: 'DK-2026-0009',
    type: 'horeca-ekipman',
    status: 'docs_requested',
    title: 'Soyuducu və İsti Xətt Paketi üçün Sənəd Gözlənilir',
    description: 'Avadanlıq siyahısı göndərilib, lakin alış sənədi və servis tarixçəsi əlavə tələb olunub.',
    price: 18500,
    currency: 'AZN',
    city: 'Gəncə',
    district: 'Mərkəz',
    ownerName: 'Aqil Hacıyev',
    phone: '994507770003',
    email: 'ekipman9@dkagency.az',
    images: [{ id: '9-1', url: IMG[4], alt: 'Ekipman elan cover' }],
    isShowcase: false,
    isFeatured: false,
    typeSpecificData: { brand: 'CoolTech', model: 'Line 900', condition: 'İstifadə olunmuş - yaxşı', warranty: 0, quantity: 5, dimensions: 'Müxtəlif', powerRequirement: '220V / 380V' },
    reviewNotes: [note('Qaimə və servis sənədi istənilib.', 3, '2026-03-29T12:20:00.000Z')],
    leads: [],
    createdAt: '2026-03-28T16:10:00.000Z',
    updatedAt: '2026-03-29T12:20:00.000Z',
  },
  {
    id: 10,
    slug: 'obyekt-icaresi-rejected',
    trackingCode: 'DK-2026-0010',
    type: 'obyekt-icaresi',
    status: 'rejected',
    title: 'Binəqədidə Obyekt İcarəsi Rədd Edildi',
    description: 'HoReCa üçün uyğun olmayan obyekt xüsusiyyətlərinə görə vitrinə buraxılmayıb.',
    price: 1600,
    priceLabel: '1 600 AZN / ay',
    currency: 'AZN',
    city: 'Bakı',
    district: 'Binəqədi',
    ownerName: 'Tural Qasımov',
    phone: '994507770004',
    email: 'obyekt10@dkagency.az',
    images: [{ id: '10-1', url: IMG[5], alt: 'Obyekt icarəsi cover' }],
    isShowcase: false,
    isFeatured: false,
    typeSpecificData: { area: 70, floor: 'Zirzəmi', ceilingHeight: 2.4, hasKitchenInfra: false, hasVentilation: false, parkingSpaces: 0, previousUse: 'Anbar', availableFrom: 'Dərhal' },
    reviewNotes: [note('Ventilyasiya və tavan hündürlüyü səbəbilə rədd edildi.', 2, '2026-03-29T14:00:00.000Z')],
    leads: [],
    createdAt: '2026-03-28T18:00:00.000Z',
    updatedAt: '2026-03-29T14:00:00.000Z',
  },
  {
    id: 11,
    slug: 'ortak-tapmaq-submitted',
    trackingCode: 'DK-2026-0011',
    type: 'ortak-tapmaq',
    status: 'submitted',
    title: 'Cloud Kitchen Konsepti üçün Ortaq Axtarılır',
    description: 'Cloud kitchen modelində böyümək istəyən layihə ilkin mərhələdə ortaqlıq sorğusu yaradıb.',
    price: 40000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Xətai',
    ownerName: 'Nicat Hüseynov',
    phone: '994507770005',
    email: 'ortaq11@dkagency.az',
    images: [{ id: '11-1', url: IMG[3], alt: 'Ortaq tapmaq cover' }],
    isShowcase: false,
    isFeatured: false,
    typeSpecificData: { businessType: 'Cloud kitchen', investmentNeeded: 40000, partnerRole: 'Operativ partnyor', currentStage: 'MVP hazırlanır', revenueShare: '30% pay' },
    reviewNotes: [note('Yeni sorğudur, ilkin call planlanır.', 3, '2026-03-29T15:30:00.000Z')],
    leads: [lead('Nərmin Zeynalova', '+994505556666', '2026-03-29T16:05:00.000Z')],
    createdAt: '2026-03-29T15:00:00.000Z',
    updatedAt: '2026-03-29T15:30:00.000Z',
  },
  {
    id: 12,
    slug: 'yeni-investisiya-committee-review',
    trackingCode: 'DK-2026-0012',
    type: 'yeni-investisiya',
    status: 'committee_review',
    title: 'Premium Seafood Restoran Layihəsi İncelənir',
    description: 'Yeni investisiya layihəsi olaraq komitəyə çıxarılıb. Biznes plan və ROI göstəriciləri baxılır.',
    price: 150000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Səbail',
    ownerName: 'Fəridə Vəliyeva',
    phone: '994507770006',
    email: 'invest12@dkagency.az',
    images: [{ id: '12-1', url: IMG[1], alt: 'Yeni investisiya cover' }],
    isShowcase: false,
    isFeatured: false,
    typeSpecificData: { concept: 'Premium seafood restoran', totalBudget: 240000, seekingAmount: 150000, projectedROI: 28, timeline: '6 ay', businessPlan: true },
    reviewNotes: [note('Komitə ROI hesablamasını yenidən yoxlayır.', 4, '2026-03-29T17:20:00.000Z')],
    leads: [],
    createdAt: '2026-03-29T16:50:00.000Z',
    updatedAt: '2026-03-29T17:20:00.000Z',
  },
];
