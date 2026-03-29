export type ListingCategory =
  | 'devir'
  | 'franchise-vermek'
  | 'franchise-almaq'
  | 'ortak-tapmaq'
  | 'yeni-investisiya'
  | 'obyekt-icaresi'
  | 'horeca-ekipman';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox' | 'file' | 'range' | 'radio';
  required: boolean;
  placeholder?: string;
  options?: FormFieldOption[];
  min?: number;
  max?: number;
  suffix?: string;
}

export interface CategoryConfig {
  id: ListingCategory;
  value: ListingCategory;
  title: string;
  titleAz: string;
  label: string;
  description: string;
  icon: string;
  color: string;
  badgeClass: string;
  fields: FormField[];
}

export interface PriceRangeOption {
  value: string;
  label: string;
  min: number;
  max: number | null;
}

export const CITY_OPTIONS = [
  { value: 'all', label: 'Bütün şəhərlər' },
  { value: 'baki', label: 'Bakı' },
  { value: 'sumqayit', label: 'Sumqayıt' },
  { value: 'gence', label: 'Gəncə' },
  { value: 'mingecevir', label: 'Mingəçevir' },
  { value: 'lenkeran', label: 'Lənkəran' },
  { value: 'seki', label: 'Şəki' },
  { value: 'qusar', label: 'Qusar' },
] as const;

export const PRICE_RANGE_OPTIONS: PriceRangeOption[] = [
  { value: 'all', label: 'Bütün qiymətlər', min: 0, max: null },
  { value: '0-10000', label: '0 - 10 000 AZN', min: 0, max: 10000 },
  { value: '10000-50000', label: '10 000 - 50 000 AZN', min: 10000, max: 50000 },
  { value: '50000-100000', label: '50 000 - 100 000 AZN', min: 50000, max: 100000 },
  { value: '100000+', label: '100 000+ AZN', min: 100000, max: null },
];

export const LISTING_CATEGORIES: CategoryConfig[] = [
  {
    id: 'devir',
    value: 'devir',
    title: 'Devir',
    titleAz: 'Devir',
    label: 'Devir',
    description: 'Hazır restoran, kafe və ya şəbəkə nöqtələrinin devri üçün vitrindir.',
    icon: 'ArrowLeftRight',
    color: 'bg-[var(--dk-red)]',
    badgeClass: 'bg-rose-50 text-rose-700 border border-rose-200',
    fields: [
      { name: 'title', label: 'Elan başlığı', type: 'text', required: true, placeholder: 'Nərimanovda restoran devri' },
      { name: 'district', label: 'Rayon', type: 'text', required: true, placeholder: 'Nərimanov' },
      { name: 'area', label: 'Sahə', type: 'number', required: true, suffix: 'm²' },
      { name: 'seatCount', label: 'Oturacaq sayı', type: 'number', required: true },
      { name: 'monthlyRevenue', label: 'Aylıq dövriyyə', type: 'number', required: false, suffix: 'AZN' },
      { name: 'hasLicense', label: 'Lisenziya var', type: 'checkbox', required: false },
      { name: 'description', label: 'Təsvir', type: 'textarea', required: true, placeholder: 'Məkan, mətbəx və komanda haqqında qısa məlumat verin.' },
    ],
  },
  {
    id: 'franchise-vermek',
    value: 'franchise-vermek',
    title: 'Franchise Vermək',
    titleAz: 'Franchise Vermək',
    label: 'Franchise Vermək',
    description: 'Markasını genişləndirmək istəyən brendlər üçün franchise vitrini.',
    icon: 'Crown',
    color: 'bg-[var(--dk-gold)]',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200',
    fields: [
      { name: 'brandName', label: 'Brend adı', type: 'text', required: true },
      { name: 'franchiseFee', label: 'Franchise haqqı', type: 'number', required: true, suffix: 'AZN' },
      { name: 'royaltyRate', label: 'Royalty faizi', type: 'number', required: true, suffix: '%' },
      { name: 'initialInvestment', label: 'Başlanğıc investisiya', type: 'number', required: true, suffix: 'AZN' },
      { name: 'supportPackage', label: 'Dəstək paketi', type: 'textarea', required: true },
      { name: 'description', label: 'Təsvir', type: 'textarea', required: true },
    ],
  },
  {
    id: 'franchise-almaq',
    value: 'franchise-almaq',
    title: 'Franchise Almaq',
    titleAz: 'Franchise Almaq',
    label: 'Franchise Almaq',
    description: 'Hazır brendlə bazara girmək istəyən investor və operatorlar üçün.',
    icon: 'ShoppingBag',
    color: 'bg-[var(--dk-navy)]',
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-200',
    fields: [
      { name: 'budget', label: 'Büdcə', type: 'number', required: true, suffix: 'AZN' },
      { name: 'preferredSector', label: 'İstiqamət', type: 'text', required: true, placeholder: 'Fast food, pizza, qəhvə' },
      { name: 'preferredCity', label: 'Şəhər', type: 'text', required: true, placeholder: 'Bakı' },
      { name: 'experience', label: 'Təcrübə', type: 'text', required: false, placeholder: 'Əməliyyat və ya investor təcrübəsi' },
      { name: 'description', label: 'Təsvir', type: 'textarea', required: true },
    ],
  },
  {
    id: 'ortak-tapmaq',
    value: 'ortak-tapmaq',
    title: 'Ortaq Tapmaq',
    titleAz: 'Ortaq Tapmaq',
    label: 'Ortaq Tapmaq',
    description: 'Sərmayə və ya əməliyyat ortağı axtaran layihələr üçün elan axınıdır.',
    icon: 'Users',
    color: 'bg-teal-600',
    badgeClass: 'bg-teal-50 text-teal-700 border border-teal-200',
    fields: [
      { name: 'capitalNeeded', label: 'Axtarılan sərmayə', type: 'number', required: true, suffix: 'AZN' },
      { name: 'shareOffered', label: 'Təklif edilən pay', type: 'number', required: true, suffix: '%' },
      { name: 'partnerRole', label: 'Ortağın rolu', type: 'text', required: true, placeholder: 'Sərmayədar, operator, partnyor' },
      { name: 'location', label: 'Lokasiya', type: 'text', required: true },
      { name: 'description', label: 'Təsvir', type: 'textarea', required: true },
    ],
  },
  {
    id: 'yeni-investisiya',
    value: 'yeni-investisiya',
    title: 'Yeni İnvestisiya',
    titleAz: 'Yeni İnvestisiya',
    label: 'Yeni İnvestisiya',
    description: 'Yeni konsept və ya açılış öncəsi layihələr üçün investor vitrini.',
    icon: 'TrendingUp',
    color: 'bg-orange-500',
    badgeClass: 'bg-orange-50 text-orange-700 border border-orange-200',
    fields: [
      { name: 'investmentAmount', label: 'Axtarılan investisiya', type: 'number', required: true, suffix: 'AZN' },
      { name: 'projectStage', label: 'Layihə mərhələsi', type: 'text', required: true, placeholder: 'Konsept, tikinti, açılış öncəsi' },
      { name: 'expectedReturn', label: 'Gözlənilən geri dönüş', type: 'text', required: false, placeholder: '18-24 ay' },
      { name: 'location', label: 'Lokasiya', type: 'text', required: true },
      { name: 'description', label: 'Təsvir', type: 'textarea', required: true },
    ],
  },
  {
    id: 'obyekt-icaresi',
    value: 'obyekt-icaresi',
    title: 'Obyekt İcarəsi',
    titleAz: 'Obyekt İcarəsi',
    label: 'Obyekt İcarəsi',
    description: 'HoReCa uyğun obyektlərin icarəsi və lokasiya axtarışı üçün.',
    icon: 'Building',
    color: 'bg-indigo-600',
    badgeClass: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    fields: [
      { name: 'address', label: 'Ünvan', type: 'text', required: true },
      { name: 'area', label: 'Sahə', type: 'number', required: true, suffix: 'm²' },
      { name: 'monthlyRent', label: 'Aylıq icarə', type: 'number', required: true, suffix: 'AZN' },
      { name: 'hasKitchen', label: 'Mətbəx çıxışı var', type: 'checkbox', required: false },
      { name: 'hasExhaust', label: 'Havalandırma var', type: 'checkbox', required: false },
      { name: 'description', label: 'Təsvir', type: 'textarea', required: true },
    ],
  },
  {
    id: 'horeca-ekipman',
    value: 'horeca-ekipman',
    title: 'HORECA Ekipman',
    titleAz: 'HORECA Ekipman',
    label: 'HORECA Ekipman',
    description: 'Peşəkar mətbəx avadanlıqları, servis və istehsal xəttləri üçün.',
    icon: 'Package',
    color: 'bg-emerald-600',
    badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    fields: [
      { name: 'equipmentName', label: 'Avadanlıq adı', type: 'text', required: true },
      { name: 'brand', label: 'Brend', type: 'text', required: false },
      { name: 'condition', label: 'Vəziyyət', type: 'text', required: true, placeholder: 'Yeni, az işlənmiş, ikinci əl' },
      { name: 'warranty', label: 'Zəmanət', type: 'text', required: false },
      { name: 'price', label: 'Qiymət', type: 'number', required: true, suffix: 'AZN' },
      { name: 'description', label: 'Təsvir', type: 'textarea', required: true },
    ],
  },
];

export function getCategoryById(id: ListingCategory): CategoryConfig | undefined {
  return LISTING_CATEGORIES.find((category) => category.id === id);
}

export function getCategoryColor(id: ListingCategory): string {
  return getCategoryById(id)?.color ?? 'bg-slate-200';
}
