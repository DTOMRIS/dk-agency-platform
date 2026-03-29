import { ListingCategory } from '@/lib/data/listingCategories';

export type ListingFieldType = 'text' | 'number' | 'textarea' | 'boolean' | 'select';

export interface FieldConfig {
  key: string;
  label: string;
  type: ListingFieldType;
  required?: boolean;
  options?: string[];
}

export const TYPE_SPECIFIC_FIELDS: Record<ListingCategory, FieldConfig[]> = {
  devir: [
    { key: 'area', label: 'Sahə (m²)', type: 'number', required: true },
    { key: 'seatCount', label: 'Oturacaq sayı', type: 'number', required: true },
    { key: 'hasLicense', label: 'Lisenziya var?', type: 'boolean' },
    { key: 'monthlyRevenue', label: 'Aylıq gəlir (AZN)', type: 'number' },
    { key: 'monthlyExpense', label: 'Aylıq xərc (AZN)', type: 'number' },
    { key: 'rentAmount', label: 'İcarə haqqı (AZN/ay)', type: 'number' },
    { key: 'staffCount', label: 'İşçi sayı', type: 'number' },
    { key: 'reason', label: 'Devir səbəbi', type: 'textarea' },
    { key: 'equipmentIncluded', label: 'Avadanlıq daxildir?', type: 'boolean' },
    { key: 'yearsOperating', label: 'Neçə ildir fəaliyyətdədir', type: 'number' },
  ],
  'franchise-vermek': [
    { key: 'brandName', label: 'Brend adı', type: 'text', required: true },
    { key: 'franchiseFee', label: 'Franchise haqqı (AZN)', type: 'number', required: true },
    { key: 'royaltyPercent', label: 'Royalty (%)', type: 'number' },
    { key: 'totalInvestment', label: 'Ümumi investisiya (AZN)', type: 'number' },
    { key: 'supportPackage', label: 'Dəstək paketi', type: 'textarea' },
    { key: 'trainingIncluded', label: 'Təlim daxildir?', type: 'boolean' },
    { key: 'exclusiveTerritory', label: 'Eksklüziv ərazi', type: 'text' },
    { key: 'currentLocations', label: 'Mövcud filial sayı', type: 'number' },
    { key: 'contractYears', label: 'Müqavilə müddəti (il)', type: 'number' },
  ],
  'franchise-almaq': [
    { key: 'desiredCategory', label: 'İstənilən kateqoriya', type: 'text', required: true },
    { key: 'budget', label: 'Büdcə (AZN)', type: 'number', required: true },
    { key: 'preferredCity', label: 'İstənilən şəhər', type: 'text' },
    { key: 'experience', label: 'HoReCa təcrübəsi', type: 'textarea' },
    { key: 'timeline', label: 'Nə vaxt başlamaq istəyir', type: 'text' },
  ],
  'ortak-tapmaq': [
    { key: 'businessType', label: 'Biznes növü', type: 'text', required: true },
    { key: 'investmentNeeded', label: 'Lazım olan investisiya (AZN)', type: 'number', required: true },
    { key: 'partnerRole', label: 'Ortaqdan gözlənilən rol', type: 'textarea' },
    { key: 'currentStage', label: 'Hazırkı mərhələ', type: 'text' },
    { key: 'revenueShare', label: 'Gəlir bölgüsü', type: 'text' },
  ],
  'yeni-investisiya': [
    { key: 'concept', label: 'Konsept təsviri', type: 'textarea', required: true },
    { key: 'totalBudget', label: 'Ümumi büdcə (AZN)', type: 'number', required: true },
    { key: 'seekingAmount', label: 'Axtarılan məbləğ (AZN)', type: 'number' },
    { key: 'projectedROI', label: 'Gözlənilən ROI (%)', type: 'number' },
    { key: 'timeline', label: 'Açılış vaxtı', type: 'text' },
    { key: 'businessPlan', label: 'Biznes plan var?', type: 'boolean' },
  ],
  'obyekt-icaresi': [
    { key: 'area', label: 'Sahə (m²)', type: 'number', required: true },
    { key: 'floor', label: 'Mərtəbə', type: 'text' },
    { key: 'ceilingHeight', label: 'Tavan hündürlüyü (m)', type: 'number' },
    { key: 'hasKitchenInfra', label: 'Mətbəx infrastrukturu var?', type: 'boolean' },
    { key: 'hasVentilation', label: 'Ventilyasiya var?', type: 'boolean' },
    { key: 'parkingSpaces', label: 'Parking yeri sayı', type: 'number' },
    { key: 'previousUse', label: 'Əvvəlki istifadə', type: 'text' },
    { key: 'availableFrom', label: 'Nə vaxtdan boşdur', type: 'text' },
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
    { key: 'warranty', label: 'Zəmanət (ay)', type: 'number' },
    { key: 'quantity', label: 'Say', type: 'number' },
    { key: 'dimensions', label: 'Ölçülər', type: 'text' },
    { key: 'powerRequirement', label: 'Enerji tələbi', type: 'text' },
  ],
};

export function getFieldsForType(type: ListingCategory) {
  return TYPE_SPECIFIC_FIELDS[type] ?? [];
}
