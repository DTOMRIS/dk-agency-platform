/**
 * @file marketing-tools-config.ts
 * @purpose Marketinq Ocagi 13 aletinin single source of truth konfiqurasiyasi
 * @critical Ozbahceci dersi — butun sehifeler, API, gating buradan oxuyur
 * @lastModified 2026-05-11 (Sprint 4 — 12→13 alet yenilenmesi)
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

// ── 13 ALET KONFIQURASIYASI ─────────────────────────────────────────

export const MARKETING_TOOLS: MarketingToolConfig[] = [
  // ── SAGIRD PILLESI (3 alet, pulsuz) ──────────────────────────────

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
    slug: 'menyu-analitigi',
    category: 'analitika',
    tier: 'sagird',
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
    monthlyRunLimit: { sagird: 3, kalfa: 10, usta: null },
    estimatedCostAznPerRun: 0.0003,
  },

  // ── KALFA PILLESI (6 alet, 89 AZN/ay) ────────────────────────────

  {
    slug: 'promosyon-roi',
    category: 'maliyye',
    tier: 'kalfa',
    iconName: 'TrendingUp',
    status: 'live',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'promoName', type: 'text', required: true },
        { name: 'promoDurationDays', type: 'number', required: true },
        { name: 'baselineTotalSales', type: 'number', required: true },
        { name: 'baselineTC', type: 'number', required: true },
        { name: 'baselineGrossMargin', type: 'number', required: true },
        { name: 'promoTotalSales', type: 'number', required: true },
        { name: 'promoTC', type: 'number', required: true },
        { name: 'promoGrossMargin', type: 'number', required: true },
        { name: 'promoCost', type: 'number', required: true },
        { name: 'marketingSpend', type: 'number', required: true },
        { name: 'rentPercent', type: 'number', required: false },
        { name: 'royaltyPercent', type: 'number', required: false },
        { name: 'adPoolPercent', type: 'number', required: false },
        { name: 'serviceFeePercent', type: 'number', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: null, usta: null },
    estimatedCostAznPerRun: 0.0003,
  },

  {
    slug: 'pnl-simulator',
    category: 'maliyye',
    tier: 'kalfa',
    iconName: 'Calculator',
    status: 'planned',
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
    monthlyRunLimit: { sagird: 0, kalfa: null, usta: null },
    estimatedCostAznPerRun: 0.0003,
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
    slug: 'musteri-persona',
    category: 'musteri',
    tier: 'kalfa',
    iconName: 'UserCircle',
    status: 'live',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'restaurantContext', type: 'hidden', required: false, source: 'auto-from-tool', sourceToolSlug: 'marka-kompasi' },
        { name: 'targetSegment', type: 'select', required: true, options: [] },
        { name: 'observations', type: 'textarea', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 5, usta: null },
    estimatedCostAznPerRun: 0.0003,
  },

  {
    slug: 'sezon-planlama',
    category: 'emeliyyat',
    tier: 'kalfa',
    iconName: 'CalendarDays',
    status: 'planned',
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
    status: 'planned',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'subject', type: 'text', required: true },
        { name: 'goal', type: 'select', required: true, options: [] },
        { name: 'tone', type: 'select', required: true, options: [] },
        { name: 'length', type: 'select', required: true, options: [] },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 20, usta: null },
    estimatedCostAznPerRun: 0.0002,
  },

  // ── USTA PILLESI (4 alet, 149 AZN/ay) ────────────────────────────

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
