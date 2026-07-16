/**
 * @file priorities.ts
 * @purpose SSOT for user priority taxonomy (adoption loop onboarding).
 * User picks 1-3 priorities → platform suggests relevant tools.
 *
 * Pattern mirrors listingSectors.ts: const keys + labels + helpers.
 * Tool mapping uses slugs from marketing-tools-config.ts (verified via discovery).
 */

export const PRIORITY_KEYS = [
  'profit',
  'inventory',
  'staffing',
  'retention',
  'marketing',
  'menu',
  'cashflow',
  'expansion',
  'compliance',
] as const;

export type PriorityKey = (typeof PRIORITY_KEYS)[number];

export const PRIORITY_LABELS: Record<
  PriorityKey,
  { az: string; en: string; ru: string; tr: string }
> = {
  profit: {
    az: 'Mənfəət/marja artırmaq',
    en: 'Increase profit/margin',
    ru: 'Увеличение прибыли/маржи',
    tr: 'Kâr/marj artırmak',
  },
  inventory: {
    az: 'İnventar/israf azaltmaq',
    en: 'Reduce inventory/waste',
    ru: 'Сокращение запасов/отходов',
    tr: 'Envanter/israf azaltmak',
  },
  staffing: {
    az: 'Personel/növbə planlaması',
    en: 'Staff/shift planning',
    ru: 'Управление персоналом/сменами',
    tr: 'Personel/vardiya planlaması',
  },
  retention: {
    az: 'Müştəri saxlama/loyallıq',
    en: 'Customer retention/loyalty',
    ru: 'Удержание клиентов/лояльность',
    tr: 'Müşteri tutma/sadakat',
  },
  marketing: {
    az: 'Marketinq/sosial media',
    en: 'Marketing/social media',
    ru: 'Маркетинг/соцсети',
    tr: 'Pazarlama/sosyal medya',
  },
  menu: {
    az: 'Menyu/qiymət optimallaşdırma',
    en: 'Menu/pricing optimization',
    ru: 'Оптимизация меню/ценообразования',
    tr: 'Menü/fiyat optimizasyonu',
  },
  cashflow: {
    az: 'Maliyyə/cash flow nəzarəti',
    en: 'Finance/cash flow control',
    ru: 'Финансы/контроль денежного потока',
    tr: 'Finans/nakit akış kontrolü',
  },
  expansion: {
    az: 'Yeni filial/genişlənmə',
    en: 'New branch/expansion',
    ru: 'Новый филиал/расширение',
    tr: 'Yeni şube/genişleme',
  },
  compliance: {
    az: 'HACCP/standart audit hazırlığı',
    en: 'HACCP/standards audit prep',
    ru: 'Подготовка к аудиту HACCP',
    tr: 'HACCP/standart denetim hazırlığı',
  },
};

/**
 * Maps each priority to marketing tool slugs that have a LIVE page route.
 * Only slugs whose route directory exists are listed — config-only slugs with
 * no page (yemek-xerci, sikayet-cavablandirici, reklam-yazicisi, kst-yoxlayici)
 * were removed so recommendations never link to a 404.
 * `sikayet-analitigi` is served by the `sikayat-analizi` route — see getToolRoute().
 * GAP: a 0-tool priority (inventory) shows a "coming soon" card; hasGap() (<2 tools)
 * also flags the thinly-served staffing and compliance.
 */
export const PRIORITY_TOOL_MAP: Record<PriorityKey, string[]> = {
  profit: ['pl-simulyatoru', 'roi-kalkulator'],
  inventory: [],
  staffing: ['restoran-audit'],
  retention: ['sikayet-analitigi', 'musteri-persona'],
  marketing: ['sosial-metrik', 'reklam-roi'],
  menu: ['menyu-analitik', 'sezon-analitikasi'],
  cashflow: ['pl-simulyatoru', 'sezon-analitikasi'],
  expansion: ['lokasyon-analiz', 'trend-analiz'],
  compliance: ['restoran-audit'],
};

/**
 * Route-directory overrides for slugs whose page folder name differs from the
 * marketing-tools-config slug. Keeps that PROTECTED config untouched while
 * making recommendation links resolve to a real page.
 */
const SLUG_ROUTE_OVERRIDES: Record<string, string> = {
  'sikayet-analitigi': 'sikayat-analizi',
};

/** Maps a tool slug to its actual `/marketinq/<segment>` route directory. */
export function getToolRoute(slug: string): string {
  return SLUG_ROUTE_OVERRIDES[slug] ?? slug;
}

export function getPriorityLabel(key: string, locale: 'az' | 'en' | 'ru' | 'tr' = 'az'): string {
  const entry = PRIORITY_LABELS[key as PriorityKey];
  return entry?.[locale] ?? key;
}

export function isValidPriorityKey(s: string): s is PriorityKey {
  return PRIORITY_KEYS.includes(s as PriorityKey);
}

export function hasGap(key: PriorityKey): boolean {
  return (PRIORITY_TOOL_MAP[key]?.length ?? 0) < 2;
}

/** Returns unique tool slugs for given priority keys, max 3, preserving order. */
export function getSuggestedToolSlugs(keys: PriorityKey[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const key of keys) {
    for (const slug of PRIORITY_TOOL_MAP[key] ?? []) {
      if (!seen.has(slug)) {
        seen.add(slug);
        result.push(slug);
        if (result.length >= 3) return result;
      }
    }
  }
  return result;
}
