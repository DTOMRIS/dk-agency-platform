/**
 * Bloq redaktoru üçün Markdown faylı idxalı — təmiz parser (TASK-0454).
 *
 * Gözlənilən forma (hamısı istəyə bağlıdır):
 *   ```                         ← meta bloku (yalnız faylın əvvəlində)
 *   Başlıq: ...
 *   Slug: ...
 *   Kateqoriya: ⚙️ Əməliyyat
 *   Oxu müddəti: 9–11 dəq
 *   Müəllif: ...
 *   Açar sözlər: ...
 *   Meta təsvir: ...
 *   ```
 *   # Başlıq                    ← ilk H1 (səhifə başlığı ayrıca göstərir, mətndən çıxır)
 *   *Kateqoriya: ... | Oxu müddəti: ...*
 *   ---
 *   ...mətn...
 *
 * Mətnin özünə (##, cədvəllər, sitatlar, ::: blokları) toxunulmur.
 */

export interface MarkdownImportFields {
  titleAz?: string;
  slug?: string;
  category?: string;
  readTime?: number;
  author?: string;
  seoTitle?: string;
  seoDescription?: string;
  contentAz: string;
}

export interface MarkdownImportResult {
  fields: MarkdownImportFields;
  warnings: string[];
}

const META_KEYS: Record<string, keyof MarkdownImportMeta> = {
  başlıq: 'title',
  slug: 'slug',
  kateqoriya: 'category',
  'oxu müddəti': 'readTime',
  müəllif: 'author',
  'meta təsvir': 'description',
  'seo başlıq': 'seoTitle',
};

interface MarkdownImportMeta {
  title?: string;
  slug?: string;
  category?: string;
  readTime?: string;
  author?: string;
  description?: string;
  seoTitle?: string;
}

/** Emoji və simvolları at, yalnız hərf/rəqəm/boşluq saxla — kateqoriya müqayisəsi üçün */
function normalizeLabel(value: string): string {
  return value
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('az');
}

/** «9–11 dəq» → 10, «8 dəq» → 8 */
function parseReadTime(value: string): number | undefined {
  const nums = (value.match(/\d+/g) ?? []).map(Number).filter((n) => n > 0 && n < 120);
  if (nums.length === 0) return undefined;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

function parseMetaBlock(text: string): { meta: MarkdownImportMeta; rest: string } {
  const match = text.match(/^\s*```[^\n]*\n([\s\S]*?)\n```[ \t]*(?:\n|$)/);
  if (!match) return { meta: {}, rest: text };

  const meta: MarkdownImportMeta = {};
  let recognized = 0;
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    const key = META_KEYS[line.slice(0, idx).trim().toLocaleLowerCase('az')];
    const value = line.slice(idx + 1).trim();
    if (!key || !value) continue;
    meta[key] = value;
    recognized += 1;
  }
  // Tanınan açar yoxdursa — bu meta deyil, mətnin kod blokudur, toxunma
  if (recognized === 0) return { meta: {}, rest: text };
  return { meta, rest: text.slice(match[0].length) };
}

export interface MarkdownImportOptions {
  categories: readonly string[];
  authors: readonly string[];
  /** Redaktordakı SEO sahələrinin limiti */
  seoTitleMax: number;
  seoDescriptionMax: number;
}

export function parseMarkdownImport(
  raw: string,
  options: MarkdownImportOptions
): MarkdownImportResult {
  const warnings: string[] = [];
  const text = raw.replace(/^﻿/, '').replace(/\r\n?/g, '\n');

  const { meta, rest } = parseMetaBlock(text);
  let body = rest;

  // İlk H1 — başlıq; səhifə başlığı ayrıca göstərir, ona görə mətndən çıxır
  let h1: string | undefined;
  const h1Match = body.match(/^\s*#[ \t]+(.+?)[ \t]*(?:\n|$)/);
  if (h1Match) {
    h1 = h1Match[1].trim();
    body = body.slice(h1Match[0].length);
  }

  // «*Kateqoriya: ... | Oxu müddəti: ...*» sətri və ardınca gələn ayırıcı xətt
  body = body.replace(/^\s*[*_]{1,2}Kateqoriya:[^\n]*[*_]{1,2}[ \t]*(?:\n|$)/, '');
  body = body.replace(/^\s*---[ \t]*(?:\n|$)/, '');
  // Sondakı ayırıcılar (fayllar arası «---»)
  body = body.replace(/(?:\n\s*---[ \t]*)+\s*$/, '');
  const contentAz = body.trim();

  const fields: MarkdownImportFields = { contentAz };
  if (!contentAz) warnings.push('Mətn boşdur');

  const title = meta.title || h1;
  if (title) fields.titleAz = title;
  else warnings.push('Başlıq tapılmadı');

  if (meta.slug) fields.slug = meta.slug;

  if (meta.category) {
    const wanted = normalizeLabel(meta.category);
    const found = options.categories.find((opt) => normalizeLabel(opt) === wanted);
    if (found) fields.category = found;
    else warnings.push(`Kateqoriya «${meta.category}» siyahıda yoxdur — əl ilə seç`);
  }

  if (meta.readTime) {
    const minutes = parseReadTime(meta.readTime);
    if (minutes) fields.readTime = minutes;
  }

  if (meta.author) {
    const found = options.authors.find(
      (opt) => normalizeLabel(opt) === normalizeLabel(meta.author ?? '')
    );
    if (found) fields.author = found;
    else warnings.push(`Müəllif «${meta.author}» siyahıda yoxdur — əl ilə seç`);
  }

  // Limiti aşan dəyəri kəsmirik (söz ortasında qırılar) — sahibkar özü qısaldır
  const seoTitle = meta.seoTitle || title;
  if (seoTitle && seoTitle.length <= options.seoTitleMax) fields.seoTitle = seoTitle;
  else if (seoTitle)
    warnings.push(`SEO title ${seoTitle.length} simvoldur (limit ${options.seoTitleMax}) — qısa variant yaz`);

  if (meta.description && meta.description.length <= options.seoDescriptionMax)
    fields.seoDescription = meta.description;
  else if (meta.description)
    warnings.push(
      `Meta təsvir ${meta.description.length} simvoldur (limit ${options.seoDescriptionMax}) — qısalt`
    );

  return { fields, warnings };
}
