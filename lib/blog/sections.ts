/**
 * @file lib/blog/sections.ts
 * @purpose TASK-0542: pick known `##` sections out of a post's markdown — the author's own «Yekun»
 *          (shown again at the top as «Qısaca») and «DK Agency necə kömək edir?» (rendered as a CTA card
 *          instead of plain text). Nothing is generated: the text is the author's.
 */

export type MdSection = { title: string; body: string; id: string };

function headingLines(lines: string[]): number[] {
  const heads: number[] = [];
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence && /^##\s+/.test(line)) heads.push(i);
  });
  return heads;
}

/** Returns the first `##` section whose title matches, and the markdown without it (when `remove`). */
export function findSection(
  md: string,
  title: RegExp,
  remove = false,
  slug: (text: string) => string = (x) => x,
): { section: MdSection | null; rest: string } {
  const lines = md.split('\n');
  const heads = headingLines(lines);
  for (let k = 0; k < heads.length; k += 1) {
    const i = heads[k];
    const text = lines[i].replace(/^##\s+/, '').trim();
    if (!title.test(text)) continue;
    const end = k + 1 < heads.length ? heads[k + 1] : lines.length;
    const body = lines.slice(i + 1, end).join('\n').trim();
    const rest = remove ? [...lines.slice(0, i), ...lines.slice(end)].join('\n') : md;
    return { section: { title: text, body, id: slug(text) }, rest };
  }
  return { section: null, rest: md };
}

/** First three bullet points, or else the first three sentences, of a section body (plain text). */
export function teaserLines(body: string, max = 3): string[] {
  const plain = (x: string) =>
    x
      .replace(/\*\*|__|`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .trim();
  const bullets = body
    .split('\n')
    .filter((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))
    .map((l) => plain(l.replace(/^\s*([-*•]|\d+[.)])\s+/, '')))
    .filter(Boolean);
  if (bullets.length >= 2) return bullets.slice(0, max);
  const text = plain(body.replace(/^>\s?/gm, '').replace(/^#+\s.*$/gm, '').replace(/\n+/g, ' '));
  return (text.match(/[^.!?]+[.!?]+/g) ?? [text]).map((x) => x.trim()).filter(Boolean).slice(0, max);
}
