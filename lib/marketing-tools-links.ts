/**
 * Marketinq Ocağı alətlərinin ünvanı (TASK-0459).
 *
 * Bu alətlərin öz səhifəsi Marketinq Ocağından kənardadır; hub kartı ora aparır,
 * `/b2b-panel/marketinq-ocagi/<slug>` də ora yönləndirir. Əvvəl həmin ünvan boş
 * səhifə açırdı — yalnız başlıq, alətin özü yox.
 */
export const EXTERNAL_TOOL_HREF: Readonly<Record<string, string>> = {
  'personel-planlayici': '/toolkit/personel-planlayici',
  'metbex-istasyon': '/toolkit/metbex-istasyon',
  'franchbook-generator': '/franchise/francbuk-generatoru',
  // TASK-0523 (owner 2026-10-09): one P&L engine — the free table + break-even/what-if + USTA AI comment.
  'pl-simulyatoru': '/toolkit/pnl',
  // TASK-0523: the Marketinq copy counted trim as ×(1+t); the toolkit engine (/(1−t)) is the one food cost.
  'yemek-xerci': '/toolkit/food-cost',
};

export const MARKETINQ_HUB_HREF = '/b2b-panel/marketinq-ocagi';

export function toolHref(slug: string): string {
  return EXTERNAL_TOOL_HREF[slug] ?? `${MARKETINQ_HUB_HREF}/${slug}`;
}
