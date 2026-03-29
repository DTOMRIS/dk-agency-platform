import { ListingCategory } from '@/lib/data/listingCategories';

export interface ListingImage {
  id: string;
  url: string;
  alt: string;
}

export interface MockListing {
  id: number;
  slug: string;
  trackingCode: string;
  type: ListingCategory;
  status: 'showcase_ready';
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
  isShowcase: true;
  isFeatured: boolean;
  typeSpecificData: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

const NOW = '2026-03-29T12:00:00.000Z';

export const MOCK_LISTINGS: MockListing[] = [
  {
    id: 1,
    slug: 'nerimanov-rayonunda-120m-restoran-devri',
    trackingCode: 'DK-2026-0001',
    type: 'devir',
    status: 'showcase_ready',
    title: 'Nərimanov Rayonunda 120m² Restoran Devri',
    description:
      'Hazır işlək restoran premium küçədə yerləşir. Tam mətbəx avadanlığı, oturmuş komanda və aktiv çatdırılma kanalı ilə birlikdə təhvil verilir. Mövcud dövriyyə və daimi müştəri bazası var.',
    price: 85000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Nərimanov',
    ownerName: 'Elvin Məmmədov',
    phone: '994501112233',
    email: 'devir1@dkagency.az',
    images: [
      { id: '1-1', url: '/images/listings/placeholder-1.svg', alt: 'Nərimanov restoranı - əsas görüntü' },
      { id: '1-2', url: '/images/listings/placeholder-2.svg', alt: 'Nərimanov restoranı - interyer görüntü' },
    ],
    isShowcase: true,
    isFeatured: true,
    typeSpecificData: {
      area: 120,
      seatCount: 64,
      hasLicense: true,
      monthlyRevenue: 28000,
    },
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 2,
    slug: 'pizza-brendi-franchise-teklifi',
    trackingCode: 'DK-2026-0002',
    type: 'franchise-vermek',
    status: 'showcase_ready',
    title: 'Pizza Brendi Franchise Təklifi',
    description:
      'Bakıda 3 nöqtə ilə işləyən pizza brendi yeni partnyorlar axtarır. Təlim, açılış paketi, menyu sistemi və marketinq dəstəyi təqdim olunur. Sürətli açılış üçün hazır SOP-lar mövcuddur.',
    price: 45000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Yasamal',
    ownerName: 'Nərgiz Əliyeva',
    phone: '994501112244',
    email: 'franchise@dkagency.az',
    images: [
      { id: '2-1', url: '/images/listings/placeholder-3.svg', alt: 'Pizza brendi franchise cover' },
      { id: '2-2', url: '/images/listings/placeholder-4.svg', alt: 'Pizza brendi franchise interyer' },
    ],
    isShowcase: true,
    isFeatured: true,
    typeSpecificData: {
      royaltyRate: '5%',
      initialInvestment: '120000 AZN',
      supportPackage: 'Açılış təlimi, marketinq kampaniyası, resept kitabı',
    },
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 3,
    slug: 'pesekar-metbex-avadanliqlari-desti',
    trackingCode: 'DK-2026-0003',
    type: 'horeca-ekipman',
    status: 'showcase_ready',
    title: 'Peşəkar Mətbəx Avadanlıqları Dəsti',
    description:
      'Tam işlək isti xətt, soyutma və hazırlıq avadanlıqlarından ibarət paketdir. Avadanlıqlar restoran bağlanışından çıxıb, servis tarixçəsi saxlanılıb. Qısa müddətdə montaja hazır vəziyyətdədir.',
    price: 12000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Binəqədi',
    ownerName: 'Rauf Həsənov',
    phone: '994501112255',
    email: 'ekipman@dkagency.az',
    images: [
      { id: '3-1', url: '/images/listings/placeholder-5.svg', alt: 'Mətbəx avadanlıqları cover' },
      { id: '3-2', url: '/images/listings/placeholder-6.svg', alt: 'Mətbəx avadanlıqları əlavə görüntü' },
    ],
    isShowcase: true,
    isFeatured: false,
    typeSpecificData: {
      brand: 'HORECA Mix',
      condition: 'Az işlənmiş',
      warranty: '3 ay servis dəstəyi',
    },
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 4,
    slug: 'seher-merkezinde-200m-restoran-obyekti',
    trackingCode: 'DK-2026-0004',
    type: 'obyekt-icaresi',
    status: 'showcase_ready',
    title: 'Şəhər Mərkəzində 200m² Restoran Obyekti',
    description:
      'Səbail rayonunda piyada axını güclü küçədə yerləşən obyekt icarəyə verilir. Davlumbaz çıxışı və qismən mətbəx infrastrukturu hazırdır. Terras potensialı ilə konsept restoran üçün uyğundur.',
    price: 3500,
    priceLabel: '3 500 AZN / ay',
    currency: 'AZN',
    city: 'Bakı',
    district: 'Səbail',
    ownerName: 'Leyla Quliyeva',
    phone: '994501112266',
    email: 'obyekt@dkagency.az',
    images: [
      { id: '4-1', url: '/images/listings/placeholder-2.svg', alt: 'Səbail obyekt cover' },
      { id: '4-2', url: '/images/listings/placeholder-1.svg', alt: 'Səbail obyekt interyer' },
    ],
    isShowcase: true,
    isFeatured: false,
    typeSpecificData: {
      area: 200,
      monthlyRent: '3500 AZN',
      hasKitchen: true,
      hasExhaust: true,
    },
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 5,
    slug: 'yeni-konsept-kafe-ucun-investor-axtarilir',
    trackingCode: 'DK-2026-0005',
    type: 'ortak-tapmaq',
    status: 'showcase_ready',
    title: 'Yeni Konsept Kafe üçün İnvestor Axtarılır',
    description:
      'Xətai ərazisində açılacaq üçüncü nəsil qəhvə konsepti üçün strateji ortağa ehtiyac var. Layihənin brend dili və ilkin maliyyə modeli hazırdır. Aktiv operator və investor kombinasiyası axtarılır.',
    price: 30000,
    currency: 'AZN',
    city: 'Bakı',
    district: 'Xətai',
    ownerName: 'Aysel Rzayeva',
    phone: '994501112277',
    email: 'ortaq@dkagency.az',
    images: [
      { id: '5-1', url: '/images/listings/placeholder-4.svg', alt: 'Yeni konsept kafe cover' },
      { id: '5-2', url: '/images/listings/placeholder-3.svg', alt: 'Yeni konsept kafe moodboard' },
    ],
    isShowcase: true,
    isFeatured: false,
    typeSpecificData: {
      capitalNeeded: '30000 AZN',
      shareOffered: '25%',
      partnerRole: 'Sərmayə və growth partnyoru',
    },
    createdAt: NOW,
    updatedAt: NOW,
  },
  {
    id: 6,
    slug: 'beynelxalq-fast-food-franchise-almaq-isteyirem',
    trackingCode: 'DK-2026-0006',
    type: 'franchise-almaq',
    status: 'showcase_ready',
    title: 'Beynəlxalq Fast-Food Franchise Almaq İstəyirəm',
    description:
      'Bakı daxilində yüksək trafik lokasiyada beynəlxalq fast-food brendi ilə işləmək istəyən investor profili. Əməliyyat təcrübəsi olan komanda və ilkin kapital hazırdır. Güclü marka və açılış dəstəyi prioritetdir.',
    price: 100000,
    currency: 'AZN',
    city: 'Bakı',
    ownerName: 'Kamran Səfərov',
    phone: '994501112288',
    email: 'franchisealmaq@dkagency.az',
    images: [
      { id: '6-1', url: '/images/listings/placeholder-6.svg', alt: 'Franchise almaq üçün investor cover' },
      { id: '6-2', url: '/images/listings/placeholder-5.svg', alt: 'Franchise almaq üçün lokasiya vizualı' },
    ],
    isShowcase: true,
    isFeatured: false,
    typeSpecificData: {
      budget: '100000 AZN',
      preferredSector: 'Fast-food',
      experience: '6 illik əməliyyat idarəçiliyi',
    },
    createdAt: NOW,
    updatedAt: NOW,
  },
];
