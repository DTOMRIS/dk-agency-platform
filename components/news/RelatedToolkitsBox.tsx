'use client';

import Link from 'next/link';
import { getToolkitEntries } from '@/lib/news/toolkit-catalog';

interface Props {
  toolkitSlugs: string[];
  blogSlug?: string | null;
  locale?: string;
}

export default function RelatedToolkitsBox({ toolkitSlugs, blogSlug, locale }: Props) {
  const entries = getToolkitEntries(toolkitSlugs);
  if (entries.length === 0 && !blogSlug) return null;

  const prefix = locale && locale !== 'az' ? `/${locale}` : '';

  return (
    <div className="rounded-[28px] border border-slate-200 bg-gradient-to-br from-[#1A1A2E] to-[#2D3561] p-6 text-white shadow-lg">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/60">DK Alətləri</h3>
      <p className="mt-1 text-sm text-white/70">Bu mövzu ilə bağlı hesablama alətləri</p>

      <div className="mt-4 space-y-2">
        {entries.map((tool) => (
          <Link
            key={tool.slug}
            href={`${prefix}/toolkit/${tool.slug}`}
            className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <span className="text-lg">{tool.icon}</span>
            <span>{tool.label} →</span>
          </Link>
        ))}

        {blogSlug ? (
          <Link
            href={`${prefix}/blog/${blogSlug}`}
            className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <span className="text-lg">📖</span>
            <span>Əlaqəli bloq yazısı →</span>
          </Link>
        ) : null}
      </div>
    </div>
  );
}
