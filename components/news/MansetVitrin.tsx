'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateAz } from '@/lib/formatDate';

interface MansetItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  imageUrl: string | null;
  category: string;
  sourceName: string | null;
  publishedAt: string;
  isManset: boolean;
  isGundem: boolean;
}

interface MansetVitrinProps {
  items: MansetItem[];
  noSource: string;
}

export default function MansetVitrin({ items, noSource }: MansetVitrinProps) {
  const [current, setCurrent] = useState(0);
  const total = items.length;

  const next = useCallback(() => setCurrent((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + total) % total), [total]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    if (total <= 1) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, total]);

  if (!items.length) return null;

  const item = items[current];

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Image — no text overlay */}
        <Link href={`/haberler/${item.slug}`} className="relative block min-h-[320px] bg-slate-100">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.title}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <span className="text-6xl font-black text-white/10">DK</span>
            </div>
          )}
        </Link>

        {/* Content — beside image, not on top */}
        <div className="flex flex-col justify-between p-8">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex rounded-full bg-[#E94560] px-3 py-1 text-xs font-bold text-white">
                MANŞET XƏBƏR
              </span>
              {item.isGundem && (
                <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-600">
                  Gündəm
                </span>
              )}
              <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                {item.category}
              </span>
            </div>
            <Link href={`/haberler/${item.slug}`}>
              <h2 className="mt-4 font-display text-2xl font-black leading-tight text-[#1A1A2E] transition hover:text-[#E94560] sm:text-3xl lg:text-4xl">
                {item.title}
              </h2>
            </Link>
            <p className="mt-4 line-clamp-3 text-sm leading-7 text-slate-600">{item.summary}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
              <span>{item.sourceName || noSource}</span>
              <span>&bull;</span>
              <span>{formatDateAz(item.publishedAt)}</span>
            </div>
          </div>

          {/* Navigation */}
          {total > 1 && (
            <div className="mt-6 flex items-center gap-4">
              <button
                type="button"
                onClick={prev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-[#C5A022] hover:text-[#1A1A2E]"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {/* Dots */}
              <div className="flex gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrent(i)}
                    className={`h-2.5 rounded-full transition-all ${
                      i === current
                        ? 'w-8 bg-[#E94560]'
                        : 'w-2.5 bg-slate-200 hover:bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={next}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-[#C5A022] hover:text-[#1A1A2E]"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <span className="ml-auto text-xs font-bold text-slate-400">
                {current + 1} / {total}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
