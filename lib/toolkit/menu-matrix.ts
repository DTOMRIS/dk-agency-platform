/**
 * TASK-0515 — menu engineering classification (Kasavana & Smith, 1982).
 *
 * - Popularity: an item is popular when its menu-mix share is ≥ 70% of the equal share 1/n,
 *   i.e. salesCount ≥ 0.7 × average sales count.
 * - Profitability: contribution margin ≥ the SALES-WEIGHTED average CM (Σ cm × sales / Σ sales).
 *   With no sales at all the weighted average is undefined → falls back to the simple average.
 */

export interface MenuMatrixItem {
  id: string;
  name: string;
  salesCount: number;
  contributionMargin: number;
}

export type MenuCategory = 'star' | 'plowHorse' | 'puzzle' | 'dog';

/** 70% rule of Kasavana & Smith. */
export const POPULARITY_FACTOR = 0.7;

export function menuThresholds(items: MenuMatrixItem[]): { popularity: number; margin: number; avgSales: number } {
  if (items.length === 0) return { popularity: 0, margin: 0, avgSales: 0 };
  const totalSales = items.reduce((s, i) => s + i.salesCount, 0);
  const avgSales = totalSales / items.length;
  const margin =
    totalSales > 0
      ? items.reduce((s, i) => s + i.contributionMargin * i.salesCount, 0) / totalSales
      : items.reduce((s, i) => s + i.contributionMargin, 0) / items.length;
  return { popularity: POPULARITY_FACTOR * avgSales, margin, avgSales };
}

export function classifyMenu(items: MenuMatrixItem[]): { item: MenuMatrixItem; category: MenuCategory }[] {
  if (items.length === 0) return [];
  const { popularity, margin } = menuThresholds(items);
  return items.map((item) => {
    const highSales = item.salesCount >= popularity;
    const highMargin = item.contributionMargin >= margin;
    const category: MenuCategory = highSales && highMargin ? 'star' : highSales ? 'plowHorse' : highMargin ? 'puzzle' : 'dog';
    return { item, category };
  });
}
