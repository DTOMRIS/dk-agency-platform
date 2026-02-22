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
function detectBlockquoteType(text: string): 'guru' | 'warning' | 'dogan-note' | 'tip' | 'normal' {
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

    return { processed, guruBoxes };
  }, [content]);

  return (
    <div className={`blog-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-3xl md:text-4xl font-black mt-12 mb-6 text-[#EAEAEA] leading-tight">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl md:text-[26px] font-bold mt-12 mb-4 text-[#EAEAEA] leading-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold mt-10 mb-3 text-[#EAEAEA]">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold mt-8 mb-2 text-[#EAEAEA]">
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
              <p className="text-[17px] leading-[1.85] text-[#B0B8C8] mb-6">
                {children}
              </p>
            );
          },
          strong: ({ children }) => (
            <strong className="text-[#EAEAEA] font-bold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-[#C5A022] italic">{children}</em>
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
                <div className="my-8 p-5 rounded-xl bg-[#16213E] border border-[#F39C1230] border-l-4 border-l-[#F39C12]">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">⚠️</span>
                    <div className="text-[#B0B8C8] [&>p]:mb-0 [&_strong]:text-[#F39C12]">
                      {children}
                    </div>
                  </div>
                </div>
              );
            }

            // Doğan Note
            if (blockType === 'dogan-note') {
              return (
                <div className="my-8 rounded-2xl overflow-hidden bg-[#16213E] border border-[#C5A02230]">
                  <div className="px-5 py-3 flex items-center gap-2 border-b border-[#C5A02215]">
                    <span className="text-lg">📋</span>
                    <span className="text-sm font-bold tracking-wider text-[#C5A022]">
                      DK AGENCY NOTU
                    </span>
                  </div>
                  <div className="px-5 py-4">
                    <div className="text-[#EAEAEA] leading-relaxed [&>p]:mb-0">
                      {children}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#C5A022] flex items-center justify-center text-[#0A0A1A] text-xs font-bold">
                        DT
                      </div>
                      <span className="text-[#8892B0] text-sm">— Doğan Tomris</span>
                    </div>
                  </div>
                </div>
              );
            }

            // Tip Box
            if (blockType === 'tip') {
              return (
                <div className="my-8 p-5 rounded-xl bg-[#16213E] border border-[#2ECC7130] border-l-4 border-l-[#2ECC71]">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl flex-shrink-0">💡</span>
                    <div className="text-[#B0B8C8] [&>p]:mb-0 [&_strong]:text-[#2ECC71]">
                      {children}
                    </div>
                  </div>
                </div>
              );
            }

            // Regular blockquote
            return (
              <blockquote className="border-l-4 border-[#C5A022] bg-[#16213E] rounded-r-xl px-6 py-4 my-8 italic text-[#EAEAEA]">
                {children}
              </blockquote>
            );
          },
          ul: ({ children }) => (
            <ul className="list-disc pl-6 space-y-2 mb-6 text-[#B0B8C8] text-[16px] marker:text-[#C5A022]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 space-y-2 mb-6 text-[#B0B8C8] text-[16px] marker:text-[#C5A022]">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-[1.7]">{children}</li>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-[#16213E] text-[#C5A022] px-2 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className="text-[#B0B8C8] text-sm font-mono leading-relaxed" {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-[#0A0A1A] border border-[#8892B015] rounded-xl p-5 my-6 overflow-x-auto">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a 
              href={href} 
              className="text-[#C5A022] underline underline-offset-2 hover:text-[#D4AF37] transition-colors" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          hr: () => (
            <hr className="border-[#8892B020] my-10" />
          ),
          img: ({ src, alt }) => (
            <figure className="my-8">
              <img 
                src={src} 
                alt={alt || ''} 
                className="w-full rounded-2xl" 
              />
              {alt && (
                <figcaption className="text-center text-sm text-[#8892B0] mt-3">
                  {alt}
                </figcaption>
              )}
            </figure>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-xl border border-[#8892B015]">
              <table className="w-full text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#16213E]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="bg-[#16213E] text-[#C5A022] px-4 py-3 text-left font-semibold border-b border-[#8892B015]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 border-b border-[#8892B010] text-[#B0B8C8]">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[#C5A02208] transition-colors">{children}</tr>
          ),
        }}
      >
        {processedContent.processed}
      </ReactMarkdown>
    </div>
  );
}
