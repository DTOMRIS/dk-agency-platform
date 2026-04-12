import type { ListingCategory } from '@/lib/data/listingCategories';

export interface FieldConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'textarea' | 'boolean' | 'select';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  suffix?: string;
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
