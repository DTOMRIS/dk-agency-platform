'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';

interface LegalRendererProps {
  content: string;
  className?: string;
}

/* Allow tables + common HTML in legal docs while sanitising XSS vectors */
const sanitizeSchema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
    'sup',
    'sub',
    'abbr',
  ],
  attributes: {
    ...defaultSchema.attributes,
    th: [...(defaultSchema.attributes?.['th'] ?? []), 'align'],
    td: [...(defaultSchema.attributes?.['td'] ?? []), 'align'],
  },
};

export default function LegalRenderer({ content, className = '' }: LegalRendererProps) {
  return (
    <div className={`legal-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={{
          h1: ({ children }) => (
            <h1 className="mb-6 text-2xl font-bold text-slate-900 md:text-3xl">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-10 mb-4 text-xl font-bold text-slate-900 md:text-2xl">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-8 mb-3 text-lg font-semibold text-slate-900">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="mt-6 mb-2 text-base font-semibold text-slate-800">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="mb-4 text-[15px] leading-relaxed text-slate-700">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-blue-700 underline underline-offset-2 hover:text-blue-900"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="mb-4 list-disc space-y-1 pl-6 text-[15px] text-slate-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-4 list-decimal space-y-1 pl-6 text-[15px] text-slate-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 border-l-4 border-slate-300 bg-slate-50 px-5 py-3 text-slate-700">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-8 border-slate-200" />,
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[480px] border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border-b border-slate-200 px-4 py-2.5 text-left font-semibold text-slate-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-slate-100 px-4 py-2.5 text-slate-700">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="transition-colors hover:bg-slate-50/60">{children}</tr>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
