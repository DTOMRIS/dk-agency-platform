/**
 * @file feed-image.ts
 * @purpose Pick a cover image from an RSS item — TASK-0491.
 *
 * Feeds put the picture in different places: `<enclosure>` (Musavat, Trend), `<media:content>`
 * (Turizm Gazetesi, Skift), `<media:thumbnail>`, or only as an `<img>` inside the HTML body.
 * Order: enclosure (image type) → media:content → media:thumbnail → first <img> in
 * content:encoded / content / description. Only absolute http(s) URLs are returned.
 */

import type Parser from 'rss-parser';

type MediaNode = { $?: { url?: string; medium?: string; type?: string } };

export type FeedImageFields = {
  enclosure?: { url?: string; type?: string };
  mediaContent?: MediaNode[] | MediaNode;
  mediaThumbnail?: MediaNode[] | MediaNode;
  contentEncoded?: string;
  content?: string;
  description?: string;
  summary?: string;
};

/** rss-parser `customFields.item` entries that populate {@link FeedImageFields}. */
export const FEED_IMAGE_CUSTOM_FIELDS: Parser.CustomFieldItem<FeedImageFields>[] = [
  ['media:content', 'mediaContent', { keepArray: true }],
  ['media:thumbnail', 'mediaThumbnail', { keepArray: true }],
  ['content:encoded', 'contentEncoded'],
  ['description', 'description'],
];

/** Absolute http(s) URL, or null. Relative paths ("/images/x.jpg", Turizm Ajansı) resolve against `base`. */
function cleanUrl(raw: string | undefined | null, base?: string): string | null {
  if (!raw) return null;
  let url = raw.trim().replace(/&amp;/g, '&');
  if (url.startsWith('//')) url = `https:${url}`;
  else if (!/^[a-z][a-z0-9+.-]*:/i.test(url) && base) {
    try {
      url = new URL(url, base).toString();
    } catch {
      return null;
    }
  }
  return /^https?:\/\/[^\s"'<>]+$/i.test(url) ? url : null;
}

function asArray(value: MediaNode[] | MediaNode | undefined): MediaNode[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function firstMedia(nodes: MediaNode[], base?: string): string | null {
  for (const node of nodes) {
    const attrs = node?.$;
    if (!attrs) continue;
    const isOtherMedium =
      (attrs.medium && attrs.medium !== 'image') ||
      (attrs.type && !attrs.type.startsWith('image/'));
    if (isOtherMedium) continue;
    const url = cleanUrl(attrs.url, base);
    if (url) return url;
  }
  return null;
}

function firstImgTag(html: string | undefined, base?: string): string | null {
  if (!html) return null;
  const re = /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi;
  for (const match of html.matchAll(re)) {
    const url = cleanUrl(match[1], base);
    // Skip tracking pixels / feed icons.
    if (url && !/(feedburner|pixel|1x1|gravatar|\.gif(\?|$))/i.test(url)) return url;
  }
  return null;
}

/** @param base the item's own link — used to resolve relative image paths. */
export function pickFeedImage(item: FeedImageFields, base?: string): string | null {
  const enclosureType = item.enclosure?.type;
  if (!enclosureType || enclosureType.startsWith('image/')) {
    const url = cleanUrl(item.enclosure?.url, base);
    if (url) return url;
  }
  return (
    firstMedia(asArray(item.mediaContent), base) ??
    firstMedia(asArray(item.mediaThumbnail), base) ??
    firstImgTag(item.contentEncoded, base) ??
    firstImgTag(item.content, base) ??
    firstImgTag(item.description, base) ??
    firstImgTag(item.summary, base)
  );
}
