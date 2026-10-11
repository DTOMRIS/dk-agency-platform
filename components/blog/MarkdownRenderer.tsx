// components/blog/MarkdownRenderer.tsx
// Professional markdown renderer with custom components for DK Agency blog
'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import GuruQuoteBox from './GuruQuoteBox';
import { FounderAvatar } from '@/components/ui/FounderAvatar';
import { headingSlug } from '@/lib/blog/toc';

/** All text of a hast node (heading ids for the blog TOC, TASK-0514). */
function nodeText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as { type?: string; value?: unknown; children?: unknown[] };
  if (n.type === 'text' && typeof n.value === 'string') return n.value;
  return (n.children ?? []).map(nodeText).join('');
}

/** Siyahı elementinin ilk mətni — ☐/☑ checklist maddəsini adi maddədən ayırmaq üçün */
function firstText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const n = node as { type?: string; value?: unknown; children?: unknown[] };
  if (n.type === 'text' && typeof n.value === 'string' && n.value.trim()) return n.value;
  for (const child of n.children ?? []) {
    const t = firstText(child);
    if (t) return t;
  }
  return '';
}

const CHECKBOX_ITEM = /^\s*[☐☑✅✔]/;

/** ☐/☑ ilə başlayan və ya GFM `- [ ]` (input checkbox) maddəsi — işarəsiz qalır */
function isCheckboxItem(node: unknown): boolean {
  const n = node as { children?: Array<{ type?: string; tagName?: string }> } | undefined;
  const firstEl = n?.children?.find((c) => c.type === 'element');
  if (firstEl?.tagName === 'input') return true;
  return CHECKBOX_ITEM.test(firstText(node));
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** Give every h2 an id (lib/blog/toc headingSlug) so a table of contents can link to it. */
  headingIds?: boolean;
}

// Parse guru box from ASCII art format
function parseGuruBox(text: string): {
  name: string;
  title: string;
  quote: string;
  source: string;
  context: string;
} | null {
  // Check if this looks like a guru box
  if (!text.includes('╔') && !text.includes('║') && !text.includes('🎤')) {
    return null;
  }

  const lines = text.split('\n').map(line => 
    line.replace(/^>\s*/, '').replace(/[╔╗╚╝║═]/g, '').trim()
  ).filter(Boolean);

  let name = '';
  let title = '';
  let quote = '';
  let source = '';
  let context = '';

  for (const line of lines) {
    // Name line (has emoji and bold)
    if (line.includes('🎤') || (line.startsWith('**') && !quote)) {
      name = line.replace(/🎤\s*/, '').replace(/\*\*/g, '').trim();
    }
    // Title line (usually comes after name, no emoji, not a quote)
    else if (!title && name && !line.startsWith('*"') && !line.startsWith('"') && !line.includes('📖') && !line.includes('🔗')) {
      title = line;
    }
    // Quote line (starts with * or ")
    else if (line.startsWith('*"') || line.startsWith('"') || (line.startsWith('*') && line.endsWith('*'))) {
      quote += ' ' + line.replace(/^\*["']?|["']?\*$/g, '').replace(/^["']|["']$/g, '');
    }
    // Source line
    else if (line.includes('📖')) {
      source = line.replace('📖', '').replace('Mənbə:', '').trim();
    }
    // Context line
    else if (line.includes('🔗')) {
      context = line.replace('🔗', '').replace('Kontekst:', '').trim();
    }
  }

  if (name && quote.trim()) {
    return { 
      name, 
      title: title || 'HoReCa Expert', 
      quote: quote.trim(), 
      source: source || 'Professional Source', 
      context: context || 'HoReCa kontekstində təqdim olunur.' 
    };
  }

  return null;
}

// Detect special blockquote types
function detectBlockquoteType(text: string): 'guru' | 'warning' | 'dogan-note' | 'tool' | 'tip' | 'normal' {
  const normalizedText = text.toLowerCase();
  
  if (text.includes('╔') || text.includes('║') || text.includes('🎤')) {
    return 'guru';
  }
  if (normalizedText.includes('⚠️') || normalizedText.includes('xəbərdarlıq') || normalizedText.includes('warning')) {
    return 'warning';
  }
  if (normalizedText.includes('📝') && (normalizedText.includes('doğan') || normalizedText.includes('notu'))) {
    return 'dogan-note';
  }
  if (normalizedText.includes('faydalı alət')) {
    return 'tool';
  }
  if (normalizedText.includes('💡') || normalizedText.includes('tip')) {
    return 'tip';
  }
  
  return 'normal';
}

// Check if a blockquote contains special content
function getBlockquoteContent(children: React.ReactNode): string {
  const text = React.Children.toArray(children)
    .map(child => {
      if (typeof child === 'string') return child;
      if (React.isValidElement(child)) {
        const props = child.props as { children?: React.ReactNode };
        if (props.children && typeof props.children === 'string') {
          return props.children;
        }
        // Recursively get text from nested children
        if (props.children) {
          return getBlockquoteContent(props.children);
        }
      }
      return '';
    })
    .join('\n');

  return text;
}

/**
 * TASK-0543 (owner 2026-10-11: «kutular ayrı kafadan çalışıyor, satır aralıkları»): one rhythm for every
 * post. Body 17px/1.75 in one colour, every box the same shape (18px radius, 20px padding, 28px gap,
 * 16px/1.65 text) and only three tones (amber = warning, green = tip/tool, red = DK note/quote).
 * `---` before a heading no longer stacks 40 + 24 + 48 px of empty space.
 */
const BOX = 'my-7 rounded-[18px] border border-l-4 p-5 text-[16px] leading-[1.65] text-[#334155] [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:text-[16px] [&_p]:leading-[1.65] [&_p]:text-[#334155]';
const TONE = {
  amber: 'border-[#F6D9A8] border-l-[#B45309] bg-[#FEF3E2]',
  green: 'border-[#A7F3D0] border-l-[#047857] bg-[#E7F6EF]',
  red: 'border-[#E4DCCD] border-l-[#D63B54] bg-white',
  neutral: 'border-[#E4DCCD] border-l-[#0F172A] bg-white',
} as const;
const LABEL_TONE = {
  amber: 'bg-[#FEF3E2] text-[#B45309]',
  green: 'bg-[#E7F6EF] text-[#047857]',
  red: 'bg-[#FDECEF] text-[#BE2F47]',
  neutral: 'bg-[#F6F1E9] text-[#0F172A]',
} as const;
const CALLOUT_MAP: Record<string, { icon: string; tone: keyof typeof LABEL_TONE }> = {
  'guru kutusu': { icon: '🎓', tone: 'amber' },
  'faydalı məlumat': { icon: 'ℹ️', tone: 'neutral' },
  'praktik tətbiq': { icon: '🔧', tone: 'green' },
  'investor qutusu': { icon: '💼', tone: 'neutral' },
  'final investor': { icon: '🏁', tone: 'neutral' },
  'sadə nümunə': { icon: '📊', tone: 'neutral' },
  'sadə müqayisə': { icon: '⚖️', tone: 'neutral' },
  'hüquqi risk': { icon: '🚨', tone: 'red' },
  'qırmızı bayraq': { icon: '🚩', tone: 'red' },
  'favök yoxlama': { icon: '📋', tone: 'amber' },
  'vacib qeyd': { icon: '⚠️', tone: 'amber' },
  'franchise üçün qırmızı': { icon: '🚩', tone: 'red' },
  'faydalı alət': { icon: '🔗', tone: 'green' },
  'doğan notu': { icon: '📋', tone: 'red' },
};

/**
 * TASK-0543: a «### Faydalı məlumat qutusu» / «### Doğan notu» heading used to draw only the top of a box —
 * the text under it sat outside, on the page. This rehype step wraps the heading and everything after it
 * (up to the next heading or `---`) in one element, rendered as a real box by the `div` component below.
 */
type HNode = { type: string; tagName?: string; value?: string; properties?: Record<string, unknown>; children?: HNode[] };
function hText(n: HNode): string {
  return n.type === 'text' ? n.value ?? '' : (n.children ?? []).map(hText).join('');
}
function calloutFor(text: string) {
  const t = text.toLowerCase();
  return Object.entries(CALLOUT_MAP).find(([key]) => t.includes(key))?.[1];
}
function rehypeCalloutBoxes() {
  return (tree: HNode) => {
    const kids = tree.children ?? [];
    const out: HNode[] = [];
    for (let i = 0; i < kids.length; i += 1) {
      const k = kids[i];
      const hit = k.type === 'element' && k.tagName === 'h3' ? calloutFor(hText(k)) : undefined;
      if (!hit) {
        out.push(k);
        continue;
      }
      const body: HNode[] = [];
      let j = i + 1;
      while (j < kids.length && !(kids[j].type === 'element' && /^(h[1-4]|hr)$/.test(kids[j].tagName ?? ''))) {
        body.push(kids[j]);
        j += 1;
      }
      out.push({ type: 'element', tagName: 'div', properties: { dataCallout: hit.tone }, children: [k, ...body] });
      i = j - 1;
    }
    tree.children = out;
  };
}

/** The text already opens with an emoji (e.g. «⚠️ Xəbərdarlıq») — do not add a second icon. */
function startsWithEmoji(text: string): boolean {
  return /^\s*\p{Extended_Pictographic}/u.test(text);
}
function isInternalHref(href?: string): boolean {
  return !!href && (href.startsWith('/') || href.startsWith('#') || /^https?:\/\/(www\.)?dkagency\.com\.tr/i.test(href));
}

export default function MarkdownRenderer({ content, className = '', headingIds = false }: MarkdownRendererProps) {
  // Pre-process content to handle guru boxes
  const processedContent = useMemo(() => {
    // Find guru boxes in blockquote format and replace with markers
    let processed = content;
    
    // Pattern for guru boxes with ASCII art
    const guruBoxPattern = />\s*╔[═╗\n>║\s\S]*?╚[═╝]+/g;
    
    const guruMatches = processed.match(guruBoxPattern);
    const guruBoxes: Array<{
      name: string;
      title: string;
      quote: string;
      source: string;
      context: string;
    }> = [];

    if (guruMatches) {
      guruMatches.forEach((match, index) => {
        const parsed = parseGuruBox(match);
        if (parsed) {
          guruBoxes.push(parsed);
          processed = processed.replace(match, `<!--GURU_BOX_${index}-->`);
        }
      });
    }

    // Process :::images{cols=N} blocks → HTML grid
    processed = processed.replace(
      /:::images\{cols=(\d)\}\n([\s\S]*?):::/g,
      (_match, cols, inner) => {
        const urls = inner.trim().split('\n').map((line: string) => line.trim()).filter(Boolean);
        const imgs = urls.map((url: string) => `<div class="overflow-hidden rounded-[18px] border border-[#E4DCCD]"><img src="${url}" alt="" class="w-full h-full object-cover" loading="lazy" /></div>`).join('\n');
        return `<div class="dk-image-grid grid gap-3 my-7" style="grid-template-columns: repeat(${cols}, 1fr)">${imgs}</div>`;
      }
    );

    // Process :::gallery blocks → image gallery (masonry-like)
    processed = processed.replace(
      /:::gallery\n([\s\S]*?):::/g,
      (_match, inner) => {
        const urls = inner.trim().split('\n').map((line: string) => line.trim()).filter(Boolean);
        const imgs = urls.map((url: string) => `<div class="overflow-hidden rounded-[18px] border border-[#E4DCCD]"><img src="${url}" alt="" class="w-full object-cover" loading="lazy" /></div>`).join('\n');
        return `<div class="dk-gallery grid grid-cols-2 md:grid-cols-3 gap-3 my-7">${imgs}</div>`;
      }
    );

    // Process :::video{src=URL} → lazy YouTube/video embed
    processed = processed.replace(
      /:::video\{src="?([^"}\s]+)"?\}/g,
      (_match, src) => {
        const ytMatch = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
        if (ytMatch) {
          return `<div class="my-7 overflow-hidden rounded-[18px] border border-[#E4DCCD] aspect-video"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" class="w-full h-full" loading="lazy" allowfullscreen title="Video"></iframe></div>`;
        }
        return `<div class="my-7 overflow-hidden rounded-[18px] border border-[#E4DCCD] aspect-video"><video src="${src}" controls class="w-full h-full object-cover"></video></div>`;
      }
    );

    return { processed, guruBoxes };
  }, [content]);

  return (
    // TASK-0543: `dk-prose`, not `blog-content` — the unlayered `.blog-content` rules in globals.css (PROTECTED)
    // beat every Tailwind class here: each split chunk's first paragraph grew to 1.2rem, italics turned gold,
    // code red, `hr` kept 2.5rem. The two useful bits (word wrapping, no marker on ☐ items) live here now.
    <div className={`dk-prose [overflow-wrap:anywhere] text-[#334155] [&_hr+h2]:mt-0 [&_hr+h3]:mt-0 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeCalloutBoxes]}
        components={{
          div: ({ node, children, ...rest }) => {
            const tone = (node as HNode | undefined)?.properties?.dataCallout as keyof typeof TONE | undefined;
            if (tone && tone in TONE) {
              return <div className={`${BOX} ${TONE[tone]} [&>h3:first-child]:mt-0 [&_ul]:mb-0 [&_ol]:mb-0 [&_li]:text-[16px]`}>{children}</div>;
            }
            return <div {...rest}>{children}</div>;
          },
          h1: ({ children }) => (
            <h1 className="mt-12 mb-6 text-3xl font-black leading-tight text-slate-950 md:text-4xl">
              {children}
            </h1>
          ),
          h2: ({ node, children }) => (
            <h2
              id={headingIds ? headingSlug(nodeText(node).trim()) : undefined}
              className="mt-10 mb-3 scroll-mt-28 text-2xl font-bold leading-tight tracking-tight text-[#0F172A] md:text-[26px]"
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => {
            const text = React.Children.toArray(children).join('').toLowerCase();
            for (const [key, style] of Object.entries(CALLOUT_MAP)) {
              if (text.includes(key)) {
                // A label, not half a box: the old header strip had no box under it.
                return (
                  <h3 className={`mt-8 mb-3 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12.5px] font-bold uppercase tracking-wider ${LABEL_TONE[style.tone]}`}>
                    {startsWithEmoji(text) ? null : <span aria-hidden="true">{style.icon}</span>}
                    {children}
                  </h3>
                );
              }
            }
            return (
              <h3 className="mt-8 mb-2 text-xl font-semibold text-[#0F172A]">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="mt-6 mb-2 text-lg font-semibold text-[#0F172A]">
              {children}
            </h4>
          ),
          p: ({ children, node }) => {
            // Check if this is a guru box marker
            const text = React.Children.toArray(children).join('');
            const markerMatch = text.match(/<!--GURU_BOX_(\d+)-->/);
            
            if (markerMatch) {
              const index = parseInt(markerMatch[1]);
              const guru = processedContent.guruBoxes[index];
              if (guru) {
                return (
                  <GuruQuoteBox
                    name={guru.name}
                    title={guru.title}
                    quote={guru.quote}
                    source={guru.source}
                    tqtaContext={guru.context}
                  />
                );
              }
            }

            return (
              <p className="mb-5 break-words text-[17px] leading-[1.75] text-[#334155]">
                {children}
              </p>
            );
          },
          strong: ({ children }) => (
            <strong className="font-bold text-[#0F172A]">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic">{children}</em>
          ),
          blockquote: ({ children }) => {
            const rawText = getBlockquoteContent(children);
            const blockType = detectBlockquoteType(rawText);
            
            // Guru Quote Box
            if (blockType === 'guru') {
              const parsed = parseGuruBox(rawText);
              if (parsed) {
                return (
                  <GuruQuoteBox
                    name={parsed.name}
                    title={parsed.title}
                    quote={parsed.quote}
                    source={parsed.source}
                    tqtaContext={parsed.context}
                  />
                );
              }
            }

            // Warning Box
            if (blockType === 'warning') {
              return (
                <div className={`${BOX} ${TONE.amber}`}>
                  <div className="flex items-start gap-3">
                    {startsWithEmoji(rawText) ? null : <span className="text-xl leading-[1.4] flex-shrink-0" aria-hidden="true">⚠️</span>}
                    <div className="min-w-0">{children}</div>
                  </div>
                </div>
              );
            }

            // Doğan Note
            if (blockType === 'dogan-note') {
              return (
                <div className={`${BOX} ${TONE.red}`}>
                  <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[#BE2F47]">DK Agency notu</span>
                  <div>{children}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <FounderAvatar size={28} className="h-7 w-7" />
                    <span className="text-sm text-[#5B6474]">— Doğan Tomris</span>
                  </div>
                </div>
              );
            }

            // Tool Box
            if (blockType === 'tool') {
              return (
                <div className={`${BOX} ${TONE.green}`}>
                  <div className="flex items-start gap-3">
                    {startsWithEmoji(rawText) ? null : <span className="text-xl leading-[1.4] flex-shrink-0" aria-hidden="true">🔧</span>}
                    <div className="min-w-0 [&_a]:font-semibold [&_a]:text-[#047857]">{children}</div>
                  </div>
                </div>
              );
            }

            // Tip Box
            if (blockType === 'tip') {
              return (
                <div className={`${BOX} ${TONE.green}`}>
                  <div className="flex items-start gap-3">
                    {startsWithEmoji(rawText) ? null : <span className="text-xl leading-[1.4] flex-shrink-0" aria-hidden="true">💡</span>}
                    <div className="min-w-0">{children}</div>
                  </div>
                </div>
              );
            }

            // Regular blockquote
            return (
              <blockquote className={`${BOX} ${TONE.red}`}>
                {children}
              </blockquote>
            );
          },
          ul: ({ children }) => (
            <ul className="mb-5 list-disc space-y-2 pl-6 text-[17px] text-[#334155] marker:text-[#D63B54]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 list-decimal space-y-2 pl-6 text-[17px] text-[#334155] marker:font-bold marker:text-[#D63B54]">
              {children}
            </ol>
          ),
          // ☐ / ☑ checklist items carry their own mark — no bullet; every other item keeps the ul/ol marker.
          li: ({ children, node }) => (
            <li
              className="leading-[1.75]"
              style={isCheckboxItem(node) ? { listStyleType: 'none' } : { listStyleType: 'inherit' }}
            >
              {children}
            </li>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="rounded-md bg-[#F6F1E9] px-1.5 py-0.5 font-mono text-[0.9em] text-[#0F172A]">
                  {children}
                </code>
              );
            }
            return (
              <code className="font-mono text-[15px] font-semibold leading-relaxed text-[#0F172A]" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            // Posts use code blocks for formulas («Satış qiyməti = …»): a cream formula card, not a terminal.
            <pre className="my-7 overflow-x-auto whitespace-pre-wrap rounded-[18px] border border-[#E4DCCD] bg-[#F6F1E9] p-5">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="break-words font-medium text-[#BE2F47] underline underline-offset-2 transition-colors hover:text-[#0F172A]"
              {...(isInternalHref(href) ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            >
              {children}
            </a>
          ),
          hr: () => (
            // globals.css (PROTECTED) styles every `hr` with 2.5rem margins (unlayered, beats classes) — inline wins.
            <hr style={{ margin: '28px 0', border: 0, borderTop: '1px solid #E4DCCD' }} />
          ),
          img: ({ src, alt }) => (
            <figure className="my-7">
              <img 
                src={src} 
                alt={alt || ''} 
                className="w-full rounded-2xl" 
              />
              {alt && (
                <figcaption className="mt-3 text-center text-sm text-slate-500">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          table: ({ children }) => (
            <div className="my-7 overflow-x-auto rounded-[18px] border border-[#E4DCCD] bg-white">
              <table className="w-full border-collapse text-[15px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#F6F1E9]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="whitespace-nowrap border-b border-[#E4DCCD] bg-[#F6F1E9] px-4 py-3 text-left font-semibold text-[#0F172A]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-[#EFE9DE] px-4 py-3 align-top leading-[1.55] text-[#334155]">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-[#FBF8F3]">{children}</tr>
          ),
        }}
      >
        {processedContent.processed}
      </ReactMarkdown>
    </div>
  );
}
