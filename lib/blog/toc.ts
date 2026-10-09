/**
 * @file toc.ts
 * @purpose Table of contents for blog posts (TASK-0514): `## ` headings → { id, text }. The same
 *          `headingSlug` is used by MarkdownRenderer (headingIds) so TOC links hit the h2 ids.
 */

export interface TocItem {
  id: string;
  text: string;
}

export function headingSlug(text: string): string {
  const slug = text
    .toLocaleLowerCase('az')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return `s-${slug || 'section'}`;
}

function plain(md: string): string {
  return md
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/** `## ` headings outside fenced code blocks, in order, unique ids. */
export function extractToc(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const seen = new Set<string>();
  let inFence = false;
  for (const line of markdown.split('\n')) {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (inFence) continue;
    const m = /^##\s+(.+?)\s*#*\s*$/.exec(line);
    if (!m) continue;
    const text = plain(m[1]);
    if (!text) continue;
    const id = headingSlug(text);
    if (seen.has(id)) continue;
    seen.add(id);
    items.push({ id, text });
  }
  return items;
}
