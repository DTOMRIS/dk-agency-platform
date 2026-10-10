'use client';

/**
 * @file KazanMarkdown.tsx
 * @purpose TASK-0531 (owner 10.10 «sayfa boyutu büyük, dengeye bak»): react-markdown + remark-gfm (~45 KB gz)
 *          used to ship on EVERY public page because the floating KAZAN widget imported them. They are only
 *          needed to draw an assistant reply, so the widget loads this file on demand (next/dynamic).
 */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function KazanMarkdown({ children }: { children: string }) {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>;
}
