import type { ListingCategory } from '@/lib/data/listingCategories';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'boolean' | 'select' | 'equipment-list';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  suffix?: string;
}

export interface EquipmentItem {
  name: string;
  condition: 'new' | 'used';
  count?: number;
}

export const TYPE_SPECIFIC_FIELDS: Record<ListingCategory, FieldConfig[]> = {
  devir: [
    { key: 'area', label: 'Sahə', type: 'number', required: true, suffix: 'm²' },
    { key: 'seatCount', label: 'Oturacaq sayı', type: 'number', required: true },
    { key: 'hasLicense', label: 'Lisenziya var?', type: 'boolean' },
    { key: 'monthlyRevenue', label: 'Aylıq gəlir', type: 'number', suffix: 'AZN' },
    { key: 'monthlyExpense', label: 'Aylıq xərc', type: 'number', suffix: 'AZN' },
    { key: 'rentAmount', label: 'İcarə haqqı', type: 'number', suffix: 'AZN/ay' },
    { key: 'staffCount', label: 'İşçi sayı', type: 'number' },
    { key: 'reason', label: 'Devir səbəbi', type: 'textarea' },
    { key: 'equipmentIncluded', label: 'Avadanlıq daxildir?', type: 'boolean' },
    { key: 'yearsOperating', label: 'Fəaliyyət müddəti', type: 'number', suffix: 'il' },
    { key: 'leaseTermMonths', label: 'İcarə müddəti', type: 'number', suffix: 'ay', placeholder: 'məs: 36' },
    { key: 'monthlyNetProfit', label: 'Aylıq xalis mənfəət', type: 'number', suffix: 'AZN', placeholder: 'məs: 5000' },
    {
      key: 'propertyType',
      label: 'Mülkiyyət tipi',
      type: 'select',
      required: true,
      options: ['İcarə (kirayə)', 'Mülkiyyət (satış)', 'İcarə + satınalma opsiyonu'],
    },
    { key: 'equipment', label: 'Avadanlıq siyahısı', type: 'equipment-list' },
  ],
  'franchise-vermek': [
    { key: 'brandName', label: 'Brend adı', type: 'text', required: true },
    { key: 'franchiseFee', label: 'Franchise haqqı', type: 'number', required: true, suffix: 'AZN' },
    { key: 'royaltyPercent', label: 'Royalty', type: 'number', suffix: '%' },
    { key: 'totalInvestment', label: 'Ümumi investisiya', type: 'number', suffix: 'AZN' },
    { key: 'supportPackage', label: 'Dəstək paketi', type: 'textarea' },
    { key: 'trainingIncluded', label: 'Təlim daxildir?', type: 'boolean' },
    { key: 'exclusiveTerritory', label: 'Eksklüziv ərazi', type: 'text' },
    { key: 'currentLocations', label: 'Mövcud filial sayı', type: 'number' },
    { key: 'contractYears', label: 'Müqavilə müddəti', type: 'number', suffix: 'il' },
    { key: 'minArea', label: 'Minimum sahə tələbi', type: 'number', suffix: 'm²', placeholder: 'məs: 120' },
  ],
  'franchise-almaq': [
    { key: 'desiredCategory', label: 'İstənilən kateqoriya', type: 'text', required: true },
    { key: 'budget', label: 'Büdcə', type: 'number', required: true, suffix: 'AZN' },
    { key: 'preferredCity', label: 'İstənilən şəhər', type: 'text' },
    { key: 'experience', label: 'HoReCa təcrübəsi', type: 'textarea' },
    { key: 'timeline', label: 'Başlama vaxtı', type: 'text' },
  ],
  'ortak-tapmaq': [
    { key: 'businessType', label: 'Biznes növü', type: 'text', required: true },
    { key: 'investmentNeeded', label: 'Lazım olan investisiya', type: 'number', required: true, suffix: 'AZN' },
    { key: 'partnerRole', label: 'Ortaqdan gözlənilən rol', type: 'textarea' },
    { key: 'currentStage', label: 'Hazırkı mərhələ', type: 'text' },
    { key: 'revenueShare', label: 'Gəlir bölgüsü', type: 'text' },
  ],
  'yeni-investisiya': [
    { key: 'concept', label: 'Konsept təsviri', type: 'textarea', required: true },
    { key: 'totalBudget', label: 'Ümumi büdcə', type: 'number', required: true, suffix: 'AZN' },
    { key: 'seekingAmount', label: 'Axtarılan məbləğ', type: 'number', suffix: 'AZN' },
    { key: 'projectedROI', label: 'Gözlənilən ROI', type: 'number', suffix: '%' },
    { key: 'timeline', label: 'Açılış vaxtı', type: 'text' },
    { key: 'businessPlan', label: 'Biznes plan var?', type: 'boolean' },
  ],
  'obyekt-icaresi': [
    { key: 'area', label: 'Sahə', type: 'number', required: true, suffix: 'm²' },
    { key: 'floor', label: 'Mərtəbə', type: 'text' },
    { key: 'ceilingHeight', label: 'Tavan hündürlüyü', type: 'number', suffix: 'm' },
    { key: 'hasKitchenInfra', label: 'Mətbəx infrastrukturu var?', type: 'boolean' },
    { key: 'hasVentilation', label: 'Ventilyasiya var?', type: 'boolean' },
    { key: 'parkingSpaces', label: 'Parking yeri', type: 'number' },
    { key: 'previousUse', label: 'Əvvəlki istifadə', type: 'text' },
    { key: 'availableFrom', label: 'Nə vaxtdan boşdur', type: 'text' },
    { key: 'leaseTermMonths', label: 'İcarə müddəti', type: 'number', suffix: 'ay', placeholder: 'məs: 60' },
  ],
  'horeca-ekipman': [
    { key: 'brand', label: 'Marka', type: 'text', required: true },
    { key: 'model', label: 'Model', type: 'text' },
    {
      key: 'condition',
      label: 'Vəziyyət',
      type: 'select',
      options: ['Yeni', 'İstifadə olunmuş - əla', 'İstifadə olunmuş - yaxşı', 'Təmirə ehtiyacı var'],
    },
    { key: 'warranty', label: 'Zəmanət', type: 'number', suffix: 'ay' },
    { key: 'quantity', label: 'Say', type: 'number' },
    { key: 'dimensions', label: 'Ölçülər', type: 'text', placeholder: 'en x uzunluq x hündürlük' },
    { key: 'powerRequirement', label: 'Enerji tələbi', type: 'text', placeholder: 'kW və ya V' },
  ],
};

export function getFieldsForType(type: string): FieldConfig[] {
  return TYPE_SPECIFIC_FIELDS[type as ListingCategory] || [];
}

// ── SECTOR-CONDITIONAL LOCATION FIELDS (Heb's methodology) ──────────

import type { ListingSector } from './listingSectors';

export const SECTOR_LOCATION_FIELDS: Record<string, FieldConfig[]> = {
  restoran: [
    { key: 'cepheMetres', label: 'Cephə (m)', type: 'number', suffix: 'm' },
    { key: 'metrekare', label: 'Sahə (m²)', type: 'number', suffix: 'm²' },
    { key: 'tavanYuksekligi', label: 'Tavan hündürlüyü', type: 'number', suffix: 'm' },
    { key: 'vitrinSeffaflik', label: 'Vitrin şəffaflığı', type: 'select', options: ['Tam', 'Qismən', 'Yoxdur'] },
    { key: 'avmKuche', label: 'Məkan növü', type: 'select', options: ['AVM', 'Küçə', 'Qarışıq'] },
    { key: 'kosheli', label: 'Köşə mövqe?', type: 'boolean' },
    { key: 'disarOtura', label: 'Açıq otura zonası?', type: 'boolean' },
  ],
  kafe: [
    { key: 'cepheMetres', label: 'Cephə (m)', type: 'number', suffix: 'm' },
    { key: 'metrekare', label: 'Sahə (m²)', type: 'number', suffix: 'm²' },
    { key: 'vitrinSeffaflik', label: 'Vitrin şəffaflığı', type: 'select', options: ['Tam', 'Qismən', 'Yoxdur'] },
    { key: 'avmKuche', label: 'Məkan növü', type: 'select', options: ['AVM', 'Küçə', 'Qarışıq'] },
    { key: 'kosheli', label: 'Köşə mövqe?', type: 'boolean' },
    { key: 'disarOtura', label: 'Açıq otura zonası?', type: 'boolean' },
  ],
  'bar-pub': [
    { key: 'cepheMetres', label: 'Cephə (m)', type: 'number', suffix: 'm' },
    { key: 'metrekare', label: 'Sahə (m²)', type: 'number', suffix: 'm²' },
    { key: 'tavanYuksekligi', label: 'Tavan hündürlüyü', type: 'number', suffix: 'm' },
    { key: 'avmKuche', label: 'Məkan növü', type: 'select', options: ['AVM', 'Küçə', 'Qarışıq'] },
    { key: 'disarOtura', label: 'Açıq otura zonası?', type: 'boolean' },
  ],
  'fast-food': [
    { key: 'cepheMetres', label: 'Cephə (m)', type: 'number', suffix: 'm' },
    { key: 'metrekare', label: 'Sahə (m²)', type: 'number', suffix: 'm²' },
    { key: 'avmKuche', label: 'Məkan növü', type: 'select', options: ['AVM', 'Küçə', 'Qarışıq'] },
    { key: 'kosheli', label: 'Köşə mövqe?', type: 'boolean' },
  ],
  'otel-pansiyon': [
    { key: 'otaqSayi', label: 'Otaq sayı', type: 'number', required: true },
    { key: 'metrekare', label: 'Ümumi sahə (m²)', type: 'number', suffix: 'm²' },
    { key: 'ulduzSeviyye', label: 'Ulduz səviyyəsi', type: 'select', options: ['1', '2', '3', '4', '5', 'Yoxdur'] },
    { key: 'disarOtura', label: 'Açıq zona / bağça?', type: 'boolean' },
  ],
  catering: [
    { key: 'metrekare', label: 'Mətbəx sahəsi (m²)', type: 'number', suffix: 'm²' },
    { key: 'eventTutum', label: 'Max. event tutumu', type: 'number', suffix: 'nəfər' },
    { key: 'aylikEventSayi', label: 'Aylıq event sayı', type: 'number' },
  ],
};

export function getLocationFieldsForSector(sector: string): FieldConfig[] {
  return SECTOR_LOCATION_FIELDS[sector] ?? [];
}

// ── CONCEPT WARNINGS (Heb's recommendations) ────────────────────────

export interface ConceptWarning {
  conceptKeys: string[];
  field: string;
  condition: (value: unknown) => boolean;
  message: { az: string; en: string; ru: string; tr: string };
}

export const CONCEPT_WARNINGS: ConceptWarning[] = [
  {
    conceptKeys: ['doner', 'fast-food-konsept', 'lahmacun-pide'],
    field: 'cepheMetres',
    condition: (v) => typeof v === 'number' && v > 0 && v < 4,
    message: {
      az: 'Döner/fast-food üçün cephə min 4m tövsiyə olunur',
      en: 'Min 4m frontage recommended for döner/fast-food',
      ru: 'Для дёнера/фастфуда рекомендуется фасад мин. 4м',
      tr: 'Döner/fast-food için cephe min 4m önerilir',
    },
  },
  {
    conceptKeys: ['kebab-mangal'],
    field: 'disarOtura',
    condition: (v) => v === false,
    message: {
      az: 'Kebab/manqal üçün açıq otura zonası tövsiyə olunur',
      en: 'Outdoor seating recommended for kebab/BBQ',
      ru: 'Для кебаба/мангала рекомендуется открытая зона',
      tr: 'Kebap/mangal için açık oturma alanı önerilir',
    },
  },
  {
    conceptKeys: ['specialty-coffee', 'brunch-breakfast', 'sirniyyat'],
    field: 'cepheMetres',
    condition: (v) => typeof v === 'number' && v > 0 && v < 3,
    message: {
      az: 'Kafe konseptləri üçün cephə min 3m tövsiyə olunur',
      en: 'Min 3m frontage recommended for café concepts',
      ru: 'Для кафе-концептов рекомендуется фасад мин. 3м',
      tr: 'Kafe konseptleri için cephe min 3m önerilir',
    },
  },
  {
    conceptKeys: ['fine-dining'],
    field: 'avmKuche',
    condition: (v) => v === 'Küçə',
    message: {
      az: 'Fine dining üçün parking imkanı vacibdir (AVM/Qarışıq tövsiyə olunur)',
      en: 'Parking is important for fine dining (mall/mixed recommended)',
      ru: 'Для файн дайнинга важна парковка (ТЦ/смешанный рекомендуется)',
      tr: 'Fine dining için otopark önemlidir (AVM/Karma önerilir)',
    },
  },
];

export function getWarningsForConcepts(
  concepts: string[],
  locationData: Record<string, unknown>,
  locale: 'az' | 'en' | 'ru' | 'tr' = 'az',
): string[] {
  const warnings: string[] = [];
  for (const w of CONCEPT_WARNINGS) {
    if (concepts.some((c) => w.conceptKeys.includes(c))) {
      const value = locationData[w.field];
      if (value !== undefined && w.condition(value)) {
        warnings.push(w.message[locale]);
      }
    }
  }
  return warnings;
}
