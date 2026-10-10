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
  /** public/images/excel-templates/<slug>.jpg — a page of the file with its sample numbers */
  preview: string;
}

export const EXCEL_TEMPLATES: readonly ExcelTemplate[] = [
  { slug: 'menfeet-zerer-12-ay', file: 'dk-menfeet-zerer-12-ay.xlsx', preview: '/images/excel-templates/menfeet-zerer-12-ay.jpg' },
  { slug: 'anbar-ve-maya-deyeri', file: 'dk-anbar-ve-maya-deyeri.xlsx', preview: '/images/excel-templates/anbar-ve-maya-deyeri.jpg' },
  { slug: 'isci-xerci', file: 'dk-isci-xerci.xlsx', preview: '/images/excel-templates/isci-xerci.jpg' },
  { slug: 'budce-ve-faktiki', file: 'dk-budce-ve-faktiki.xlsx', preview: '/images/excel-templates/budce-ve-faktiki.jpg' },
  { slug: 'balans', file: 'dk-balans.xlsx', preview: '/images/excel-templates/balans.jpg' },
];

export function getExcelTemplate(slug: string): ExcelTemplate | undefined {
  return EXCEL_TEMPLATES.find((t) => t.slug === slug);
}
