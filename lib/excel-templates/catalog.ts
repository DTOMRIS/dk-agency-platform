/**
 * @file catalog.ts
 * @purpose TASK-0532 — DK Excel templates for members (owner 10.10: «üye olanlara excel verelim»). Files are
 *          built by scripts/excel-templates/build.mjs into lib/excel-templates/files.generated.ts (base64; NOT
 *          public/ — downloads go through /api/member/excel-templates/[slug], which checks the member session). Texts: messages →
 *          excelTemplates.items.<slug>.
 */
export interface ExcelTemplate {
  slug: string;
  file: string;
  /** public/images/excel-templates/<slug>.jpg — a page of the file with its sample numbers. TASK-0538: templates
   *  without a real screenshot have none; the page then shows their column headers (no mock-up image). */
  preview?: string;
}

export const EXCEL_TEMPLATES: readonly ExcelTemplate[] = [
  { slug: 'menfeet-zerer-12-ay', file: 'dk-menfeet-zerer-12-ay.xlsx', preview: '/images/excel-templates/menfeet-zerer-12-ay.jpg' },
  { slug: 'anbar-ve-maya-deyeri', file: 'dk-anbar-ve-maya-deyeri.xlsx', preview: '/images/excel-templates/anbar-ve-maya-deyeri.jpg' },
  { slug: 'isci-xerci', file: 'dk-isci-xerci.xlsx', preview: '/images/excel-templates/isci-xerci.jpg' },
  { slug: 'budce-ve-faktiki', file: 'dk-budce-ve-faktiki.xlsx', preview: '/images/excel-templates/budce-ve-faktiki.jpg' },
  { slug: 'balans', file: 'dk-balans.xlsx', preview: '/images/excel-templates/balans.jpg' },
  // TASK-0538 — MarginEdge-style ideas (own design): recipe vs stock usage, invoice prices, count by storage place.
  { slug: 'nezeri-ve-faktiki', file: 'dk-nezeri-ve-faktiki.xlsx' },
  { slug: 'qaime-qiymet-izleyicisi', file: 'dk-qaime-qiymet-izleyicisi.xlsx' },
  { slug: 'saxlama-yerine-gore-sayim', file: 'dk-saxlama-yerine-gore-sayim.xlsx' },
];

export function getExcelTemplate(slug: string): ExcelTemplate | undefined {
  return EXCEL_TEMPLATES.find((t) => t.slug === slug);
}
