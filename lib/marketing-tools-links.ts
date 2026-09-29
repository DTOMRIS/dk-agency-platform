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
};

export const MARKETINQ_HUB_HREF = '/b2b-panel/marketinq-ocagi';

export function toolHref(slug: string): string {
  return EXTERNAL_TOOL_HREF[slug] ?? `${MARKETINQ_HUB_HREF}/${slug}`;
}
