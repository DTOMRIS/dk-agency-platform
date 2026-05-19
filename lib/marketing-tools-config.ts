/**
 * @file marketing-tools-config.ts
 * @purpose Marketinq Ocagi 21 aletinin single source of truth konfiqurasiyasi
 * @critical Ozbahceci dersi — butun sehifeler, API, gating buradan oxuyur
 * @lastModified 2026-05-18 (TASK-0153 — status audit, 17 live + 4 planned)
 *
 * TIER BÖLGÜSÜ (tier field-ə görə, fiziki sıra deyil):
 *   ŞAGIRD: 3 alət (marka-kompasi, kst-yoxlayici, yemek-xerci)
 *   KALFA:  12 alət (menyu-analitigi, promosyon-roi, sezon-analitikasi,
 *           reklam-roi, sikayet-analitigi, sikayet-cavablandirici,
 *           sosial-metrik, restoran-audit, trend-analiz, lokasyon-analiz,
 *           sezon-planlama, reklam-yazicisi)
 *   USTA:   6 alət (pnl-simulator, musteri-persona — live;
 *           sosial-medya-plan, audit-robotu, trend-analitigi,
 *           lokasyon-secme — planned)
 */

// ── TIP TEYINLERI ──────────────────────────────────────────────────

export type MarketingToolTier = 'sagird' | 'kalfa' | 'usta';

export type MarketingToolCategory =
  | 'analitika'
  | 'maliyye'
  | 'musteri'
  | 'kontent'
  | 'emeliyyat';

export type AIProvider = 'deepseek' | 'claude' | 'none';

export interface MarketingToolField {
  name: string;
  type:
    | 'text'
    | 'textarea'
    | 'number'
    | 'select'
    | 'multi-select'
    | 'file'
    | 'date'
    | 'hidden'
    | 'likert';
  required: boolean;
  source?: 'manual' | 'auto-from-tool' | 'auto-from-api';
  sourceToolSlug?: string;
  options?: { value: string; labelKey: string }[];
}

export interface MarketingToolConfig {
  slug: string;
  category: MarketingToolCategory;
  tier: MarketingToolTier;
  iconName: string;
  status: 'planned' | 'beta' | 'live';
  aiProvider: AIProvider;
  aiFallback?: AIProvider;
  externalApis: string[];
  inputSchema: { fields: MarketingToolField[] };
  monthlyRunLimit: Record<MarketingToolTier, number | null>;
  estimatedCostAznPerRun: number;
}

// ── 21 ALET KONFIQURASIYASI (17 live + 4 planned) ──────────────────

export const MARKETING_TOOLS: MarketingToolConfig[] = [
  // ── SAGIRD PILLESI (3 alət, pulsuz) ──────────────────────────────

  {
    slug: 'marka-kompasi',
    category: 'analitika',
    tier: 'sagird',
    iconName: 'Compass',
    status: 'live',
    aiProvider: 'deepseek',
    aiFallback: 'claude',
    externalApis: [],
    inputSchema: {
      fields: [
        {
          name: 'customerTime',
          type: 'select',
          required: true,
          options: [
            { value: 'morning', labelKey: 'customerTime.morning' },
            { value: 'lunch', labelKey: 'customerTime.lunch' },
            { value: 'evening', labelKey: 'customerTime.evening' },
            { value: 'late-night', labelKey: 'customerTime.lateNight' },
            { value: 'all', labelKey: 'customerTime.all' },
          ],
        },
        {
          name: 'customerActivity',
          type: 'select',
          required: true,
          options: [
            { value: 'fill-belly', labelKey: 'customerActivity.fillBelly' },
            { value: 'work', labelKey: 'customerActivity.work' },
            { value: 'celebration', labelKey: 'customerActivity.celebration' },
            { value: 'relax', labelKey: 'customerActivity.relax' },
            { value: 'third-place', labelKey: 'customerActivity.thirdPlace' },
          ],
        },
        {
          name: 'foodStory',
          type: 'select',
          required: true,
          options: [
            { value: 'tradition', labelKey: 'foodStory.tradition' },
            { value: 'speed', labelKey: 'foodStory.speed' },
            { value: 'health', labelKey: 'foodStory.health' },
            { value: 'exotic', labelKey: 'foodStory.exotic' },
            { value: 'handcrafted', labelKey: 'foodStory.handcrafted' },
          ],
        },
        { name: 'competitorGap', type: 'textarea', required: true },
        { name: 'recommendReason', type: 'text', required: true },
      ],
    },
    monthlyRunLimit: { sagird: 3, kalfa: 10, usta: null },
    estimatedCostAznPerRun: 0.0003,
  },

  {
    slug: 'kst-yoxlayici',
    category: 'emeliyyat',
    tier: 'sagird',
    iconName: 'ClipboardCheck',
    status: 'live',
    aiProvider: 'deepseek',
    aiFallback: 'claude',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'quality', type: 'likert', required: true },
        { name: 'service', type: 'likert', required: true },
        { name: 'cleanliness', type: 'likert', required: true },
        { name: 'notes', type: 'textarea', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 3, kalfa: 10, usta: null },
    estimatedCostAznPerRun: 0.0003,
  },

  {
    slug: 'yemek-xerci',
    category: 'maliyye',
    tier: 'sagird',
    iconName: 'Calculator',
    status: 'live',
    aiProvider: 'none',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'recipeName', type: 'text', required: true },
        { name: 'menuPrice', type: 'number', required: true },
        { name: 'portions', type: 'number', required: true },
        { name: 'targetFoodCost', type: 'number', required: true },
        { name: 'ingredients', type: 'textarea', required: true },
      ],
    },
    monthlyRunLimit: { sagird: null, kalfa: null, usta: null },
    estimatedCostAznPerRun: 0,
  },

  // ── KALFA PILLESI (12 alət, 89 AZN/ay) ───────────────────────────

  {
    slug: 'menyu-analitik',
    category: 'analitika',
    tier: 'kalfa',
    iconName: 'UtensilsCrossed',
    status: 'live',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'menuItems', type: 'textarea', required: true },
        { name: 'category', type: 'select', required: true, options: [] },
        { name: 'avgFoodCostPercent', type: 'number', required: true },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 10, usta: null },
    estimatedCostAznPerRun: 0.0003,
  },

  {
    slug: 'roi-kalkulator',
    category: 'maliyye',
    tier: 'kalfa',
    iconName: 'TrendingUp',
    status: 'live',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'campaignName', type: 'text', required: true },
        { name: 'startDate', type: 'date', required: false },
        { name: 'endDate', type: 'date', required: false },
        { name: 'avgCheck', type: 'number', required: true },
        { name: 'monthlyVisits', type: 'number', required: true },
        { name: 'loyaltyMonths', type: 'number', required: true },
        { name: 'channels', type: 'textarea', required: true },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: null, usta: null },
    estimatedCostAznPerRun: 0.0003,
  },

  {
    slug: 'sezon-analitikasi',
    category: 'analitika',
    tier: 'kalfa',
    iconName: 'BarChart3',
    status: 'live',
    aiProvider: 'none',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'monthlyRevenue', type: 'number', required: true },
        { name: 'restaurantType', type: 'select', required: true },
        { name: 'laborPercent', type: 'number', required: true },
        { name: 'foodCostPercent', type: 'number', required: true },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: null, usta: null },
    estimatedCostAznPerRun: 0,
  },

  {
    slug: 'reklam-roi',
    category: 'maliyye',
    tier: 'kalfa',
    iconName: 'TrendingUp',
    status: 'live',
    aiProvider: 'none',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'campaignType', type: 'select', required: true },
        { name: 'channels', type: 'textarea', required: true },
        { name: 'averageOrderValue', type: 'number', required: false },
        { name: 'repeatPurchasePercent', type: 'number', required: false },
        { name: 'organicValuePerReach', type: 'number', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: null, usta: null },
    estimatedCostAznPerRun: 0,
  },

  {
    slug: 'sikayet-analitigi',
    category: 'musteri',
    tier: 'kalfa',
    iconName: 'MessageSquareWarning',
    status: 'live',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'complaints', type: 'textarea', required: true },
        { name: 'source', type: 'select', required: true, options: [] },
        { name: 'period', type: 'select', required: true, options: [] },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 10, usta: null },
    estimatedCostAznPerRun: 0.0003,
  },

  {
    slug: 'sikayet-cavablandirici',
    category: 'musteri',
    tier: 'kalfa',
    iconName: 'MessageSquareWarning',
    status: 'live',
    aiProvider: 'deepseek',
    aiFallback: 'claude',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'complaintText', type: 'textarea', required: true },
        { name: 'complaintType', type: 'select', required: true, options: [
          { value: 'food', labelKey: 'complaintType.food' },
          { value: 'service', labelKey: 'complaintType.service' },
          { value: 'price', labelKey: 'complaintType.price' },
          { value: 'cleanliness', labelKey: 'complaintType.cleanliness' },
          { value: 'other', labelKey: 'complaintType.other' },
        ] },
        { name: 'complaintLang', type: 'select', required: true, options: [
          { value: 'az', labelKey: 'lang.az' },
          { value: 'en', labelKey: 'lang.en' },
          { value: 'tr', labelKey: 'lang.tr' },
          { value: 'ru', labelKey: 'lang.ru' },
        ] },
        { name: 'responseLang', type: 'select', required: true, options: [
          { value: 'az', labelKey: 'lang.az' },
          { value: 'en', labelKey: 'lang.en' },
          { value: 'tr', labelKey: 'lang.tr' },
          { value: 'ru', labelKey: 'lang.ru' },
        ] },
        { name: 'restaurantName', type: 'text', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 20, usta: null },
    estimatedCostAznPerRun: 0.0005,
  },

  {
    slug: 'sosial-metrik',
    category: 'analitika',
    tier: 'kalfa',
    iconName: 'BarChart3',
    status: 'live',
    aiProvider: 'none',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'platform', type: 'select', required: true, options: [
          { value: 'instagram', labelKey: 'platforms.instagram' },
          { value: 'tiktok', labelKey: 'platforms.tiktok' },
        ] },
        { name: 'followers', type: 'number', required: true },
        { name: 'totalLikes', type: 'number', required: true },
        { name: 'totalComments', type: 'number', required: true },
        { name: 'totalSaves', type: 'number', required: true },
        { name: 'totalShares', type: 'number', required: true },
        { name: 'postCount', type: 'number', required: true },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: null, usta: null },
    estimatedCostAznPerRun: 0,
  },

  {
    slug: 'restoran-audit',
    category: 'emeliyyat',
    tier: 'kalfa',
    iconName: 'ClipboardCheck',
    status: 'live',
    aiProvider: 'none',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'financeCash', type: 'likert', required: true },
        { name: 'operationsKitchen', type: 'likert', required: true },
        { name: 'staffService', type: 'likert', required: true },
        { name: 'customerExperience', type: 'likert', required: true },
        { name: 'digitalPresence', type: 'likert', required: true },
        { name: 'complianceRisk', type: 'likert', required: true },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: null, usta: null },
    estimatedCostAznPerRun: 0,
  },

  {
    slug: 'trend-analiz',
    category: 'analitika',
    tier: 'kalfa',
    iconName: 'LineChart',
    status: 'live',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'restaurantType', type: 'select', required: true },
        { name: 'audience', type: 'select', required: true },
        { name: 'strength', type: 'select', required: true },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: null, usta: null },
    estimatedCostAznPerRun: 0.0003,
  },

  {
    slug: 'lokasyon-analiz',
    category: 'analitika',
    tier: 'kalfa',
    iconName: 'MapPin',
    status: 'live',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'mode', type: 'select', required: true },
        { name: 'locationType', type: 'select', required: true },
        { name: 'criteria', type: 'likert', required: true },
        { name: 'breakeven', type: 'number', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: null, usta: null },
    estimatedCostAznPerRun: 0.0003,
  },

  {
    slug: 'sezon-planlama',
    category: 'emeliyyat',
    tier: 'kalfa',
    iconName: 'CalendarDays',
    status: 'live',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'restaurantContext', type: 'hidden', required: false, source: 'auto-from-tool', sourceToolSlug: 'marka-kompasi' },
        { name: 'targetMonths', type: 'multi-select', required: true, options: [] },
        { name: 'budget', type: 'number', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 2, usta: null },
    estimatedCostAznPerRun: 0.0005,
  },

  {
    slug: 'reklam-yazicisi',
    category: 'kontent',
    tier: 'kalfa',
    iconName: 'PenLine',
    status: 'live',
    aiProvider: 'deepseek',
    aiFallback: 'claude',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'platform', type: 'select', required: true, options: [
          { value: 'instagram', labelKey: 'platform.instagram' },
          { value: 'facebook', labelKey: 'platform.facebook' },
          { value: 'tiktok', labelKey: 'platform.tiktok' },
          { value: 'google_ads', labelKey: 'platform.google_ads' },
        ] },
        { name: 'campaignDescription', type: 'textarea', required: true },
        { name: 'targetAudience', type: 'select', required: true, options: [
          { value: 'youth_18_30', labelKey: 'audience.youth' },
          { value: 'family', labelKey: 'audience.family' },
          { value: 'corporate', labelKey: 'audience.corporate' },
          { value: 'all', labelKey: 'audience.all' },
        ] },
        { name: 'callStyle', type: 'select', required: true, options: [
          { value: 'discount', labelKey: 'style.discount' },
          { value: 'new_product', labelKey: 'style.newProduct' },
          { value: 'brand_awareness', labelKey: 'style.brandAwareness' },
          { value: 'event', labelKey: 'style.event' },
        ] },
        { name: 'language', type: 'select', required: true, options: [
          { value: 'az', labelKey: 'lang.az' },
          { value: 'en', labelKey: 'lang.en' },
          { value: 'tr', labelKey: 'lang.tr' },
          { value: 'ru', labelKey: 'lang.ru' },
        ] },
        { name: 'restaurantName', type: 'text', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 20, usta: null },
    estimatedCostAznPerRun: 0.0002,
  },

  // ── USTA PILLESI (6 alət: 2 live + 4 planned, 99 AZN/ay) ────────

  {
    slug: 'pl-simulyatoru',
    category: 'maliyye',
    tier: 'usta',
    iconName: 'Calculator',
    status: 'live',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'revenue', type: 'number', required: true },
        { name: 'foodCost', type: 'number', required: true },
        { name: 'laborCost', type: 'number', required: true },
        { name: 'rent', type: 'number', required: true },
        { name: 'otherExpenses', type: 'number', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 0, usta: null },
    estimatedCostAznPerRun: 0.0003,
  },

  {
    slug: 'musteri-persona',
    category: 'musteri',
    tier: 'usta',
    iconName: 'UserCircle',
    status: 'live',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'restaurantType', type: 'select', required: true },
        { name: 'city', type: 'select', required: true },
        { name: 'avgCheckRange', type: 'select', required: true },
        { name: 'serviceModels', type: 'multi-select', required: true },
        { name: 'ageRanges', type: 'multi-select', required: true },
        { name: 'genderFemalePercent', type: 'number', required: true },
        { name: 'visitTimes', type: 'multi-select', required: false },
        { name: 'visitFrequency', type: 'select', required: false },
        { name: 'tableSize', type: 'select', required: false },
        { name: 'paymentMethods', type: 'multi-select', required: false },
        { name: 'arrivalMethods', type: 'multi-select', required: false },
        { name: 'notes', type: 'textarea', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 0, usta: null },
    estimatedCostAznPerRun: 0.0005,
  },

  {
    slug: 'sosial-medya-plan',
    category: 'kontent',
    tier: 'usta',
    iconName: 'Share2',
    status: 'planned',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'restaurantContext', type: 'hidden', required: false, source: 'auto-from-tool', sourceToolSlug: 'marka-kompasi' },
        { name: 'platforms', type: 'multi-select', required: true, options: [] },
        { name: 'weekFocus', type: 'select', required: true, options: [] },
        { name: 'tone', type: 'select', required: true, options: [] },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 0, usta: null },
    estimatedCostAznPerRun: 0.0005,
  },

  {
    slug: 'audit-robotu',
    category: 'emeliyyat',
    tier: 'usta',
    iconName: 'ScanSearch',
    status: 'planned',
    aiProvider: 'deepseek',
    externalApis: ['cloudinary'],
    inputSchema: {
      fields: [
        { name: 'photos', type: 'file', required: true },
        { name: 'auditType', type: 'select', required: true, options: [] },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 0, usta: 10 },
    estimatedCostAznPerRun: 0.005,
  },

  {
    slug: 'trend-analitigi',
    category: 'analitika',
    tier: 'usta',
    iconName: 'LineChart',
    status: 'planned',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'city', type: 'select', required: true, options: [] },
        { name: 'category', type: 'select', required: true, options: [] },
        { name: 'period', type: 'select', required: true, options: [] },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 0, usta: 5 },
    estimatedCostAznPerRun: 0.001,
  },

  {
    slug: 'lokasyon-secme',
    category: 'analitika',
    tier: 'usta',
    iconName: 'MapPin',
    status: 'planned',
    aiProvider: 'deepseek',
    externalApis: ['google-maps'],
    inputSchema: {
      fields: [
        { name: 'address', type: 'text', required: true },
        { name: 'city', type: 'select', required: true, options: [] },
        { name: 'concept', type: 'select', required: true, options: [] },
        { name: 'sizeM2', type: 'number', required: true },
        { name: 'monthlyRent', type: 'number', required: true },
        { name: 'investment', type: 'number', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 0, usta: 10 },
    estimatedCostAznPerRun: 0.35,
  },
];

// ── AÇILIŞ KAMPANİYASI ─────────────────────────────────────────────
// Tarixi uzatmaq üçün yalnız endDateISO dəyişdir.
// active=false edildikdə normal qiymətlər göstərilir.
export const LAUNCH_CAMPAIGN = {
  active: true,
  endDateISO: '2026-09-01',
} as const;

export function isLaunchActive(): boolean {
  return LAUNCH_CAMPAIGN.active && new Date() < new Date(LAUNCH_CAMPAIGN.endDateISO);
}

// ── HELPER FUNKSIYALAR ──────────────────────────────────────────────

export function getToolConfig(slug: string): MarketingToolConfig | undefined {
  return MARKETING_TOOLS.find((t) => t.slug === slug);
}

export function getToolsByTier(tier: MarketingToolTier): MarketingToolConfig[] {
  return MARKETING_TOOLS.filter((t) => t.tier === tier);
}

export function getToolsByCategory(category: MarketingToolCategory): MarketingToolConfig[] {
  return MARKETING_TOOLS.filter((t) => t.category === category);
}

const TIER_ORDER: Record<MarketingToolTier, number> = {
  sagird: 0,
  kalfa: 1,
  usta: 2,
};

export function canAccessTool(
  userTier: MarketingToolTier,
  toolTier: MarketingToolTier,
): boolean {
  return TIER_ORDER[userTier] >= TIER_ORDER[toolTier];
}

export const TOOL_CATEGORIES: MarketingToolCategory[] = [
  'analitika',
  'maliyye',
  'musteri',
  'kontent',
  'emeliyyat',
];

export const TIER_COLORS: Record<MarketingToolTier, { bg: string; text: string; border: string }> = {
  sagird: { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  kalfa: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  usta: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export const STATUS_CONFIG: Record<
  MarketingToolConfig['status'],
  { labelKey: string; disabled: boolean }
> = {
  planned: { labelKey: 'marketing.status.planned', disabled: true },
  beta: { labelKey: 'marketing.status.beta', disabled: false },
  live: { labelKey: 'marketing.status.live', disabled: false },
};
