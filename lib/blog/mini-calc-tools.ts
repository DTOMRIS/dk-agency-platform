/** TASK-0542: tools that have a mini calculator inside their blog post (components/blog/MiniCalc). Server-safe. */
export const MINI_CALC_TOOLS = ['food-cost', 'basabas', 'delivery-calc', 'pnl'] as const;
export type MiniCalcTool = (typeof MINI_CALC_TOOLS)[number];

export function isMiniCalcTool(slug: string | undefined): slug is MiniCalcTool {
  return !!slug && (MINI_CALC_TOOLS as readonly string[]).includes(slug);
}
