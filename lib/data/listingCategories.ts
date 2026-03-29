import { getFieldsForType, type FieldConfig } from '@/lib/data/listingFieldConfig';

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
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'range' | 'file';
  required?: boolean;
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
  fieldConfig: FieldConfig[];
}

export interface PriceRangeOption {
  value: string;
  label: string;
  min: number;
  max: number | null;
}

function toLegacyField(field: FieldConfig): FormField {
  return {
    name: field.key,
    label: field.label,
    type: field.type === 'boolean' ? 'checkbox' : field.type,
    required: field.required,
    placeholder: field.label,
    options: field.options?.map((option) => ({ value: option, label: option })),
  };
}

function buildCategory(id: ListingCategory, config: Omit<CategoryConfig, 'id' | 'value' | 'fields' | 'fieldConfig'>) {
  const fieldConfig = getFieldsForType(id);
  return {
    ...config,
    id,
    value: id,
    fieldConfig,
    fields: fieldConfig.map(toLegacyField),
  } satisfies CategoryConfig;
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
  { value: 'samaxi', label: 'Şamaxı' },
  { value: 'zaqatala', label: 'Zaqatala' },
  { value: 'qebele', label: 'Qəbələ' },
  { value: 'diger', label: 'Digər' },
] as const;

export const DISTRICT_OPTIONS = [
  { city: 'Bakı', value: 'Nərimanov', label: 'Nərimanov' },
  { city: 'Bakı', value: 'Yasamal', label: 'Yasamal' },
  { city: 'Bakı', value: 'Səbail', label: 'Səbail' },
  { city: 'Bakı', value: 'Nəsimi', label: 'Nəsimi' },
  { city: 'Bakı', value: 'Xətai', label: 'Xətai' },
  { city: 'Bakı', value: 'Binəqədi', label: 'Binəqədi' },
  { city: 'Bakı', value: 'Nizami', label: 'Nizami' },
  { city: 'Bakı', value: 'Xəzər', label: 'Xəzər' },
  { city: 'Bakı', value: 'Suraxanı', label: 'Suraxanı' },
  { city: 'Bakı', value: 'Qaradağ', label: 'Qaradağ' },
  { city: 'Bakı', value: 'Sabunçu', label: 'Sabunçu' },
  { city: 'Bakı', value: 'Pirallahı', label: 'Pirallahı' },
  { city: 'Bakı', value: 'Abşeron', label: 'Abşeron' },
] as const;

export const PRICE_RANGE_OPTIONS: PriceRangeOption[] = [
  { value: 'all', label: 'Bütün qiymətlər', min: 0, max: null },
  { value: '0-10000', label: '0 - 10 000 AZN', min: 0, max: 10000 },
  { value: '10000-50000', label: '10 000 - 50 000 AZN', min: 10000, max: 50000 },
  { value: '50000-100000', label: '50 000 - 100 000 AZN', min: 50000, max: 100000 },
  { value: '100000+', label: '100 000+ AZN', min: 100000, max: null },
];

export const LISTING_CATEGORIES: CategoryConfig[] = [
  buildCategory('devir', {
    title: 'Devir',
    titleAz: 'Devir',
    label: 'Devir',
    description: 'Hazır restoran, kafe və ya filial nöqtələrinin devri üçün vitrin.',
    icon: 'ArrowLeftRight',
    color: 'bg-[var(--dk-red)]',
    badgeClass: 'border border-rose-200 bg-rose-50 text-rose-700',
  }),
  buildCategory('franchise-vermek', {
    title: 'Franchise Vermək',
    titleAz: 'Franchise Vermək',
    label: 'Franchise Vermək',
    description: 'Markasını böyütmək istəyən brendlər üçün franchise vitrini.',
    icon: 'Crown',
    color: 'bg-[var(--dk-gold)]',
    badgeClass: 'border border-amber-200 bg-amber-50 text-amber-700',
  }),
  buildCategory('franchise-almaq', {
    title: 'Franchise Almaq',
    titleAz: 'Franchise Almaq',
    label: 'Franchise Almaq',
    description: 'Hazır brendlə bazara girmək istəyən investor və operatorlar üçün.',
    icon: 'ShoppingBag',
    color: 'bg-[var(--dk-navy)]',
    badgeClass: 'border border-slate-200 bg-slate-100 text-slate-700',
  }),
  buildCategory('ortak-tapmaq', {
    title: 'Ortaq Tapmaq',
    titleAz: 'Ortaq Tapmaq',
    label: 'Ortaq Tapmaq',
    description: 'Sərmayə və ya əməliyyat ortağı axtaran layihələr üçün elan axınıdır.',
    icon: 'Users',
    color: 'bg-teal-600',
    badgeClass: 'border border-teal-200 bg-teal-50 text-teal-700',
  }),
  buildCategory('yeni-investisiya', {
    title: 'Yeni İnvestisiya',
    titleAz: 'Yeni İnvestisiya',
    label: 'Yeni İnvestisiya',
    description: 'Yeni konsept və ya açılış öncəsi layihələr üçün investor vitrini.',
    icon: 'TrendingUp',
    color: 'bg-orange-500',
    badgeClass: 'border border-orange-200 bg-orange-50 text-orange-700',
  }),
  buildCategory('obyekt-icaresi', {
    title: 'Obyekt İcarəsi',
    titleAz: 'Obyekt İcarəsi',
    label: 'Obyekt İcarəsi',
    description: 'HoReCa uyğun obyektlərin icarəsi və lokasiya axtarışı üçün.',
    icon: 'Building',
    color: 'bg-indigo-600',
    badgeClass: 'border border-indigo-200 bg-indigo-50 text-indigo-700',
  }),
  buildCategory('horeca-ekipman', {
    title: 'HORECA Ekipman',
    titleAz: 'HORECA Ekipman',
    label: 'HORECA Ekipman',
    description: 'Peşəkar mətbəx avadanlıqları və servis xətləri üçün.',
    icon: 'Package',
    color: 'bg-emerald-600',
    badgeClass: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
  }),
];

export function getCategoryById(id: ListingCategory): CategoryConfig | undefined {
  return LISTING_CATEGORIES.find((category) => category.id === id);
}

export function getCategoryColor(id: ListingCategory): string {
  return getCategoryById(id)?.color ?? 'bg-slate-200';
}
