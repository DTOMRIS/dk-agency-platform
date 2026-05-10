/**
 * @file marketing-tools-config.ts
 * @purpose Marketinq Ocagi 12 aletinin single source of truth konfiqurasiyasi
 * @critical Ozbahceci dersi — butun sehifeler, API, gating buradan oxuyur
 * @lastModified 2026-05-09
 */

// ── TIP TEYINLERI ──────────────────────────────────────────────────

export type MarketingToolTier = 'sagird' | 'kalfa' | 'usta';

export type MarketingToolCategory =
  | 'gorunulurluk'
  | 'kontent'
  | 'strateji'
  | 'reputasiya';

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

// ── 12 ALET KONFIQURASIYASI ─────────────────────────────────────────

export const MARKETING_TOOLS: MarketingToolConfig[] = [
  // ── SAGIRD PILLESI (4 alet, pulsuz) ──────────────────────────────

  {
    slug: 'gorunurluk-testi',
    category: 'gorunulurluk',
    tier: 'sagird',
    iconName: 'Eye',
    status: 'planned',
    aiProvider: 'none',
    externalApis: ['google-maps', '2gis'],
    inputSchema: {
      fields: [
        { name: 'restaurantName', type: 'text', required: true },
        { name: 'address', type: 'text', required: true },
        {
          name: 'city',
          type: 'select',
          required: true,
          options: [
            { value: 'baku', labelKey: 'cities.baku' },
            { value: 'sumqayit', labelKey: 'cities.sumqayit' },
            { value: 'gence', labelKey: 'cities.gence' },
            { value: 'diger', labelKey: 'cities.diger' },
          ],
        },
        { name: 'coordinates', type: 'hidden', required: false, source: 'auto-from-api' },
        {
          name: 'category',
          type: 'select',
          required: true,
          options: [
            { value: 'fast-food', labelKey: 'categories.fastFood' },
            { value: 'fine-dining', labelKey: 'categories.fineDining' },
            { value: 'cafe', labelKey: 'categories.cafe' },
            { value: 'pub', labelKey: 'categories.pub' },
            { value: 'restoran', labelKey: 'categories.restoran' },
          ],
        },
      ],
    },
    monthlyRunLimit: { sagird: 3, kalfa: 10, usta: null },
    estimatedCostAznPerRun: 0,
  },

  {
    slug: 'kst-yoxlayici',
    category: 'gorunulurluk',
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
    slug: 'gbp-qurucu',
    category: 'gorunulurluk',
    tier: 'sagird',
    iconName: 'MapPin',
    status: 'planned',
    aiProvider: 'deepseek',
    aiFallback: 'claude',
    externalApis: ['cloudinary'],
    inputSchema: {
      fields: [
        { name: 'restaurantName', type: 'text', required: true },
        { name: 'address', type: 'text', required: true },
        { name: 'phone', type: 'text', required: true },
        { name: 'website', type: 'text', required: false },
        { name: 'primaryCategory', type: 'select', required: true, options: [] },
        { name: 'secondaryCategory', type: 'select', required: false, options: [] },
        { name: 'workingHours', type: 'text', required: true },
        { name: 'attributes', type: 'multi-select', required: false, options: [] },
        { name: 'photos', type: 'file', required: false },
        { name: 'deliveryRadius', type: 'number', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 1, kalfa: 3, usta: null },
    estimatedCostAznPerRun: 0.08,
  },

  {
    slug: 'marka-kompasi',
    category: 'gorunulurluk',
    tier: 'sagird',
    iconName: 'Compass',
    status: 'live',
    aiProvider: 'claude',
    aiFallback: 'deepseek',
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
    estimatedCostAznPerRun: 0.12,
  },

  // ── KALFA PILLESI (5 alet, 49 AZN/ay) ────────────────────────────

  {
    slug: 'smm-plan-ai',
    category: 'kontent',
    tier: 'kalfa',
    iconName: 'CalendarDays',
    status: 'planned',
    aiProvider: 'deepseek',
    aiFallback: 'claude',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'restaurantContext', type: 'hidden', required: false, source: 'auto-from-tool', sourceToolSlug: 'marka-kompasi' },
        {
          name: 'weekFocus',
          type: 'select',
          required: true,
          options: [
            { value: 'new-menu', labelKey: 'weekFocus.newMenu' },
            { value: 'campaign', labelKey: 'weekFocus.campaign' },
            { value: 'holiday', labelKey: 'weekFocus.holiday' },
            { value: 'quiet', labelKey: 'weekFocus.quiet' },
            { value: 'event', labelKey: 'weekFocus.event' },
          ],
        },
        { name: 'events', type: 'text', required: false },
        {
          name: 'targetAudience',
          type: 'select',
          required: true,
          options: [
            { value: 'local', labelKey: 'audience.local' },
            { value: 'tourist', labelKey: 'audience.tourist' },
            { value: 'business', labelKey: 'audience.business' },
            { value: 'families', labelKey: 'audience.families' },
            { value: 'youth', labelKey: 'audience.youth' },
          ],
        },
        {
          name: 'language',
          type: 'select',
          required: true,
          options: [
            { value: 'az', labelKey: 'lang.az' },
            { value: 'ru', labelKey: 'lang.ru' },
            { value: 'tr', labelKey: 'lang.tr' },
            { value: 'en', labelKey: 'lang.en' },
          ],
        },
        {
          name: 'tone',
          type: 'select',
          required: true,
          options: [
            { value: 'friendly', labelKey: 'tone.friendly' },
            { value: 'premium', labelKey: 'tone.premium' },
            { value: 'fun', labelKey: 'tone.fun' },
            { value: 'ahilik', labelKey: 'tone.ahilik' },
          ],
        },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 4, usta: null },
    estimatedCostAznPerRun: 0.25,
  },

  {
    slug: 'caption-yazici',
    category: 'kontent',
    tier: 'kalfa',
    iconName: 'PenLine',
    status: 'planned',
    aiProvider: 'deepseek',
    aiFallback: 'claude',
    externalApis: ['cloudinary'],
    inputSchema: {
      fields: [
        { name: 'subject', type: 'text', required: true },
        { name: 'imageUrl', type: 'file', required: false },
        {
          name: 'goal',
          type: 'select',
          required: true,
          options: [
            { value: 'reservation', labelKey: 'goal.reservation' },
            { value: 'order', labelKey: 'goal.order' },
            { value: 'awareness', labelKey: 'goal.awareness' },
            { value: 'engagement', labelKey: 'goal.engagement' },
          ],
        },
        {
          name: 'cta',
          type: 'select',
          required: true,
          options: [
            { value: 'reserve', labelKey: 'cta.reserve' },
            { value: 'order', labelKey: 'cta.order' },
            { value: 'comment', labelKey: 'cta.comment' },
            { value: 'share', labelKey: 'cta.share' },
            { value: 'custom', labelKey: 'cta.custom' },
          ],
        },
        {
          name: 'length',
          type: 'select',
          required: true,
          options: [
            { value: 'short', labelKey: 'length.short' },
            { value: 'medium', labelKey: 'length.medium' },
            { value: 'long', labelKey: 'length.long' },
          ],
        },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 20, usta: null },
    estimatedCostAznPerRun: 0.15,
  },

  {
    slug: 'promosyon-roi',
    category: 'strateji',
    tier: 'kalfa',
    iconName: 'TrendingUp',
    status: 'planned',
    aiProvider: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'campaignName', type: 'text', required: true },
        {
          name: 'promoType',
          type: 'select',
          required: true,
          options: [
            { value: 'percent-discount', labelKey: 'promo.percentDiscount' },
            { value: 'buy-x-get-1', labelKey: 'promo.buyXGet1' },
            { value: 'combo', labelKey: 'promo.combo' },
            { value: 'loyalty', labelKey: 'promo.loyalty' },
            { value: 'friend-1plus1', labelKey: 'promo.friend1plus1' },
          ],
        },
        { name: 'promoCost', type: 'number', required: true },
        { name: 'marketingSpend', type: 'number', required: true },
        { name: 'baselineSales', type: 'number', required: true },
        { name: 'actualSales', type: 'number', required: true },
        { name: 'avgMargin', type: 'number', required: true },
        { name: 'durationDays', type: 'number', required: true },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 10, usta: null },
    estimatedCostAznPerRun: 0.03,
  },

  {
    slug: 'kampaniya-takvimi',
    category: 'strateji',
    tier: 'kalfa',
    iconName: 'Calendar',
    status: 'planned',
    aiProvider: 'claude',
    aiFallback: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'restaurantContext', type: 'hidden', required: false, source: 'auto-from-tool', sourceToolSlug: 'marka-kompasi' },
        { name: 'targetMonths', type: 'multi-select', required: true, options: [] },
        { name: 'localEvents', type: 'textarea', required: false },
        { name: 'budget', type: 'number', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 2, usta: null },
    estimatedCostAznPerRun: 0.3,
  },

  {
    slug: 'rey-cavab-ai',
    category: 'reputasiya',
    tier: 'kalfa',
    iconName: 'MessageSquareReply',
    status: 'planned',
    aiProvider: 'claude',
    aiFallback: 'deepseek',
    externalApis: [],
    inputSchema: {
      fields: [
        { name: 'reviewText', type: 'textarea', required: true },
        { name: 'rating', type: 'number', required: true },
        { name: 'reviewerName', type: 'text', required: false },
        {
          name: 'responseGoal',
          type: 'select',
          required: true,
          options: [
            { value: 'thank', labelKey: 'responseGoal.thank' },
            { value: 'resolve', labelKey: 'responseGoal.resolve' },
            { value: 'reinvite', labelKey: 'responseGoal.reinvite' },
            { value: 'defuse', labelKey: 'responseGoal.defuse' },
          ],
        },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 30, usta: null },
    estimatedCostAznPerRun: 0.08,
  },

  // ── USTA PILLESI (3 alet, 149 AZN/ay) ────────────────────────────

  {
    slug: 'reqib-radari',
    category: 'strateji',
    tier: 'usta',
    iconName: 'Radar',
    status: 'planned',
    aiProvider: 'deepseek',
    aiFallback: 'claude',
    externalApis: ['google-maps', '2gis'],
    inputSchema: {
      fields: [
        { name: 'myRestaurantId', type: 'hidden', required: false, source: 'auto-from-api' },
        {
          name: 'competitorMode',
          type: 'select',
          required: true,
          options: [
            { value: 'auto', labelKey: 'competitorMode.auto' },
            { value: 'manual', labelKey: 'competitorMode.manual' },
          ],
        },
        { name: 'radius', type: 'number', required: true },
        {
          name: 'analysisFocus',
          type: 'multi-select',
          required: true,
          options: [
            { value: 'menu', labelKey: 'focus.menu' },
            { value: 'price', labelKey: 'focus.price' },
            { value: 'sentiment', labelKey: 'focus.sentiment' },
            { value: 'hours', labelKey: 'focus.hours' },
            { value: 'photos', labelKey: 'focus.photos' },
          ],
        },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 0, usta: 5 },
    estimatedCostAznPerRun: 0.4,
  },

  {
    slug: 'ai-vizyual-studyo',
    category: 'kontent',
    tier: 'usta',
    iconName: 'ImagePlus',
    status: 'planned',
    aiProvider: 'deepseek',
    externalApis: ['cloudinary', 'replicate'],
    inputSchema: {
      fields: [
        { name: 'sourceImage', type: 'file', required: true },
        { name: 'dishName', type: 'text', required: true },
        {
          name: 'style',
          type: 'select',
          required: true,
          options: [
            { value: 'minimalist', labelKey: 'style.minimalist' },
            { value: 'luxury', labelKey: 'style.luxury' },
            { value: 'rustic', labelKey: 'style.rustic' },
            { value: 'azerbaijani', labelKey: 'style.azerbaijani' },
            { value: 'instagram', labelKey: 'style.instagram' },
          ],
        },
        {
          name: 'targetPlatforms',
          type: 'multi-select',
          required: true,
          options: [
            { value: 'ig-post', labelKey: 'platform.igPost' },
            { value: 'ig-reel', labelKey: 'platform.igReel' },
            { value: 'tiktok', labelKey: 'platform.tiktok' },
            { value: 'gbp', labelKey: 'platform.gbp' },
            { value: 'menu-print', labelKey: 'platform.menuPrint' },
          ],
        },
        {
          name: 'enhancements',
          type: 'multi-select',
          required: false,
          options: [
            { value: 'lighting', labelKey: 'enhance.lighting' },
            { value: 'bg-remove', labelKey: 'enhance.bgRemove' },
            { value: 'steam', labelKey: 'enhance.steam' },
            { value: 'props', labelKey: 'enhance.props' },
          ],
        },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 0, usta: 20 },
    estimatedCostAznPerRun: 0.5,
  },

  {
    slug: 'aeo-skoru',
    category: 'reputasiya',
    tier: 'usta',
    iconName: 'BrainCircuit',
    status: 'planned',
    aiProvider: 'claude',
    aiFallback: 'deepseek',
    externalApis: ['openai'],
    inputSchema: {
      fields: [
        { name: 'restaurantId', type: 'hidden', required: false, source: 'auto-from-api' },
        { name: 'targetCity', type: 'hidden', required: false, source: 'auto-from-tool', sourceToolSlug: 'marka-kompasi' },
        { name: 'targetCategory', type: 'hidden', required: false, source: 'auto-from-tool', sourceToolSlug: 'marka-kompasi' },
        { name: 'customQuestions', type: 'textarea', required: false },
      ],
    },
    monthlyRunLimit: { sagird: 0, kalfa: 0, usta: 3 },
    estimatedCostAznPerRun: 1.2,
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
  'gorunulurluk',
  'kontent',
  'strateji',
  'reputasiya',
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
