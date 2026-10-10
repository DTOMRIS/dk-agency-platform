'use client';

/**
 * @file NewsFeedRail.tsx
 * @purpose TASK-0529 (owner 10.10: «burada xəbərlər axmalı, sağda trend… biznesmerkezi səhifəmizə bax»).
 *          Right-hand «Son xəbərlər · Xəbər axını» rail next to the /haberler lead — the newsroom pattern
 *          of our Biznes Mərkəzi home (NewsroomHome) and of most news sites (lead left, live feed right).
 *          On desktop it is exactly as tall as the lead and scrolls inside; up/down buttons step it.
 *          On phones it is a plain list under the lead.
 */

import { useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Clock3 } from 'lucide-react';

export interface FeedItem {
  id: number;
  href: string;
  title: string;
  category: string;
  date: string;
  thumb: ReactNode;
}

export default function NewsFeedRail({
  items,
  eyebrow,
  title,
  upLabel,
  downLabel,
}: {
  items: FeedItem[];
  eyebrow: string;
  title: string;
  upLabel: string;
  downLabel: string;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const step = (dir: 1 | -1) => {
    const el = listRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ top: dir * el.clientHeight * 0.8, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <aside className="relative min-h-0" aria-label={title} data-testid="news-feed-rail">
      <div className="flex flex-col rounded-[26px] border border-[#E4DCCD] bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_40px_-24px_rgba(15,23,42,0.25)] lg:absolute lg:inset-0">
        <div className="flex items-center justify-between border-b border-[#EFE9DE] pb-3">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#BE2F47]">{eyebrow}</p>
            <h2 className="mt-1 text-[22px] font-black tracking-[-0.03em] text-[#0F172A]">{title}</h2>
          </div>
          <div className="hidden flex-col lg:flex">
            <button type="button" onClick={() => step(-1)} aria-label={upLabel} className="rounded-lg p-1 text-slate-500 transition hover:bg-[#F6F1E9] hover:text-[#BE2F47]">
              <ChevronUp size={20} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => step(1)} aria-label={downLabel} className="rounded-lg p-1 text-slate-500 transition hover:bg-[#F6F1E9] hover:text-[#BE2F47]">
              <ChevronDown size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div ref={listRef} className="mt-3 max-h-[440px] min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 lg:max-h-none" style={{ scrollbarWidth: 'thin' }}>
          {items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="group flex gap-3 rounded-2xl border border-transparent bg-[#F6F1E9] p-2.5 transition hover:border-[#E4DCCD] hover:bg-white"
            >
              <span className="relative block h-16 w-24 shrink-0 overflow-hidden rounded-xl [&>*]:!h-full [&>*]:!min-h-0 [&>*]:!rounded-xl">{item.thumb}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10.5px] font-black uppercase tracking-[0.14em] text-[#BE2F47]">{item.category}</span>
                <span className="mt-0.5 line-clamp-2 block text-[14.5px] font-bold leading-5 text-[#0F172A] group-hover:text-[#BE2F47]">{item.title}</span>
                <span className="mt-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-slate-500">
                  <Clock3 size={11} aria-hidden="true" />
                  {item.date}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
