// components/blog/MarkdownRenderer.tsx
// Professional markdown renderer with custom components for DK Agency blog
'use client';

import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import GuruQuoteBox from './GuruQuoteBox';

interface MarkdownRendererProps {
  content: string;
  className?: string;
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

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
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
        const imgs = urls.map((url: string) => `<div class="overflow-hidden rounded-2xl border border-slate-200"><img src="${url}" alt="" class="w-full h-full object-cover" loading="lazy" /></div>`).join('\n');
        return `<div class="dk-image-grid grid gap-3 my-8" style="grid-template-columns: repeat(${cols}, 1fr)">${imgs}</div>`;
      }
    );

    // Process :::gallery blocks → image gallery (masonry-like)
    processed = processed.replace(
      /:::gallery\n([\s\S]*?):::/g,
      (_match, inner) => {
        const urls = inner.trim().split('\n').map((line: string) => line.trim()).filter(Boolean);
        const imgs = urls.map((url: string) => `<div class="overflow-hidden rounded-2xl border border-slate-200"><img src="${url}" alt="" class="w-full object-cover" loading="lazy" /></div>`).join('\n');
        return `<div class="dk-gallery grid grid-cols-2 md:grid-cols-3 gap-3 my-8">${imgs}</div>`;
      }
    );

    // Process :::video{src=URL} → lazy YouTube/video embed
    processed = processed.replace(
      /:::video\{src="?([^"}\s]+)"?\}/g,
      (_match, src) => {
        const ytMatch = src.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
        if (ytMatch) {
          return `<div class="my-8 overflow-hidden rounded-2xl border border-slate-200 aspect-video"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" class="w-full h-full" loading="lazy" allowfullscreen title="Video"></iframe></div>`;
        }
        return `<div class="my-8 overflow-hidden rounded-2xl border border-slate-200 aspect-video"><video src="${src}" controls class="w-full h-full object-cover"></video></div>`;
      }
    );

    return { processed, guruBoxes };
  }, [content]);

  return (
    <div className={`blog-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-12 mb-6 text-3xl font-black leading-tight text-slate-950 md:text-4xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-12 mb-4 text-2xl font-bold leading-tight text-slate-950 md:text-[26px]">
              {children}
            </h2>
          ),
          h3: ({ children }) => {
            const text = React.Children.toArray(children).join('').toLowerCase();
            const calloutMap: Record<string, { icon: string; color: string; border: string }> = {
              'guru kutusu': { icon: '🎓', color: 'bg-[color:color-mix(in_srgb,var(--dk-gold)_13%,transparent)]', border: 'border-[color:color-mix(in_srgb,var(--dk-gold)_19%,transparent)]' },
              'faydalı məlumat': { icon: 'ℹ️', color: 'bg-blue-50', border: 'border-blue-200' },
              'praktik tətbiq': { icon: '🔧', color: 'bg-emerald-50', border: 'border-emerald-200' },
              'investor qutusu': { icon: '💼', color: 'bg-indigo-50', border: 'border-indigo-200' },
              'final investor': { icon: '🏁', color: 'bg-indigo-50', border: 'border-indigo-200' },
              'sadə nümunə': { icon: '📊', color: 'bg-slate-50', border: 'border-slate-200' },
              'sadə müqayisə': { icon: '⚖️', color: 'bg-slate-50', border: 'border-slate-200' },
              'hüquqi risk': { icon: '🚨', color: 'bg-red-50', border: 'border-red-200' },
              'qırmızı bayraq': { icon: '🚩', color: 'bg-red-50', border: 'border-red-200' },
              'favök yoxlama': { icon: '📋', color: 'bg-amber-50', border: 'border-amber-200' },
              'vacib qeyd': { icon: '⚠️', color: 'bg-amber-50', border: 'border-amber-200' },
              'franchise üçün qırmızı': { icon: '🚩', color: 'bg-red-50', border: 'border-red-200' },
              'faydalı alət': { icon: '🔗', color: 'bg-emerald-50', border: 'border-emerald-200' },
              'doğan notu': { icon: '📋', color: 'bg-red-50', border: 'border-red-200' },
            };
            for (const [key, style] of Object.entries(calloutMap)) {
              if (text.includes(key)) {
                return (
                  <div className={`mt-8 mb-1 flex items-center gap-2 rounded-t-xl ${style.color} border ${style.border} border-b-0 px-5 py-3`}>
                    <span className="text-lg">{style.icon}</span>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                      {children}
                    </h3>
                  </div>
                );
              }
            }
            return (
              <h3 className="mt-10 mb-3 text-xl font-semibold text-slate-900">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="mt-8 mb-2 text-lg font-semibold text-slate-900">
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
              <p className="mb-6 text-[17px] leading-[1.85] text-slate-600">
                {children}
              </p>
            );
          },
          strong: ({ children }) => (
            <strong className="font-bold text-slate-950">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-amber-700">{children}</em>
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
                <div className="my-8 rounded-xl border border-amber-200 border-l-4 border-l-amber-500 bg-amber-50 p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">⚠️</span>
                    <div className="text-slate-700 [&>p]:mb-0 [&_strong]:text-amber-700">
                      {children}
                    </div>
                  </div>
                </div>
              );
            }

            // Doğan Note
            if (blockType === 'dogan-note') {
              return (
                <div className="my-8 overflow-hidden rounded-2xl border border-red-200 bg-white">
                  <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-5 py-3">
                    <span className="text-lg">📋</span>
                    <span className="text-sm font-bold tracking-wider text-red-600">
                      DK AGENCY NOTU
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <div className="leading-relaxed text-slate-800 [&>p]:mb-0">
                      {children}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                        DT
                      </div>
                      <span className="text-[var(--dk-muted)] text-sm">— Doğan Tomris</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Tool Box
            if (blockType === 'tool') {
              return (
                <div className="my-8 rounded-xl border border-emerald-200 border-l-4 border-l-emerald-600 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">🔧</span>
                    <div className="text-slate-700 [&>p]:mb-0 [&_a]:font-semibold [&_a]:text-emerald-800 [&_a]:underline [&_a]:underline-offset-2">
                      {children}
                    </div>
                  </div>
                </div>
              );
            }

            // Tip Box
            if (blockType === 'tip') {
              return (
                <div className="my-8 rounded-xl border border-emerald-200 border-l-4 border-l-emerald-500 bg-emerald-50 p-5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">💡</span>
                    <div className="text-slate-700 [&>p]:mb-0 [&_strong]:text-emerald-700">
                      {children}
                    </div>
                  </div>
                </div>
              );
            }

            // Regular blockquote
            return (
              <blockquote className="my-8 rounded-r-xl border-l-4 border-red-500 bg-slate-50 px-6 py-4 italic text-slate-800">
                {children}
              </blockquote>
            );
          },
          ul: ({ children }) => (
            <ul className="mb-6 list-disc space-y-2 pl-6 text-[16px] text-slate-700 marker:text-red-500">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-6 list-decimal space-y-2 pl-6 text-[16px] text-slate-700 marker:text-red-500">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-[1.85]">{children}</li>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="rounded bg-slate-100 px-2 py-0.5 text-sm font-mono text-red-700">
                  {children}
                </code>
              );
            }
            return (
              <code className="font-mono text-sm leading-relaxed text-slate-100" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-6 overflow-x-auto rounded-xl border border-slate-200 bg-slate-900 p-5">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-red-600 underline underline-offset-2 transition-colors hover:text-red-800" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="my-10 border-slate-200" />
          ),
          img: ({ src, alt }) => (
            <figure className="my-8">
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
            <div className="my-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-red-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-slate-200 bg-red-50 px-4 py-3 text-left font-semibold text-red-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-slate-100 px-4 py-3 text-slate-700">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-slate-50">{children}</tr>
          ),
        }}
      >
        {processedContent.processed}
      </ReactMarkdown>
    </div>
  );
}
