import Link from 'next/link';
import type { Metadata } from 'next';

import { formatDateAz } from '@/lib/formatDate';
import { getApprovedNewsArticles, type NewsCategoryKey } from '@/lib/repositories/newsRepository';

const CATEGORY_TABS: Array<{ key: NewsCategoryKey; label: string }> = [
  { key: 'all', label: 'Hamısı' },
  { key: 'finance', label: 'Maliyyə' },
  { key: 'operations', label: 'Əməliyyat' },
  { key: 'growth', label: 'Böyümə' },
  { key: 'market', label: 'Bazar' },
  { key: 'technology', label: 'Texnologiya' },
];

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: 'Haberler | DK Agency',
  description: 'HoReCa sektoru üzrə təsdiqlənmiş xəbərlər, analizlər və editor pick seçimləri.',
};

function buildImageFallback(title: string) {
  return `https://placehold.co/1200x800/1A1A2E/C5A022?text=${encodeURIComponent(title.slice(0, 36))}`;
}

export default async function HaberlerPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = (params.category as NewsCategoryKey) || 'all';
  const page = Math.max(1, Number(params.page || '1'));
  const offset = (page - 1) * PAGE_SIZE;

  const result = await getApprovedNewsArticles({
    category,
    limit: PAGE_SIZE,
    offset,
  });

  const hero = result.items.find((item) => item.isEditorPick) || result.items[0];
  const gridItems = result.items.filter((item) => item.id !== hero?.id);
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-10 text-[#1A1A2E]">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="inline-flex rounded-full bg-[#1A1A2E] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            SEKTOR NƏBZİ
          </span>
          <h1 className="mt-4 font-display text-5xl font-black">HoReCa xəbər axını</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
            RSS pipeline ilə yığılan, tərcümə olunan və redaksiya tərəfindən təsdiqlənən xəbərlər.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => {
            const href = tab.key === 'all' ? '/haberler' : `/haberler?category=${tab.key}`;
            const active = category === tab.key;
            return (
              <Link
                key={tab.key}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  active
                    ? 'bg-[#E94560] text-white'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-[#C5A022] hover:text-[#1A1A2E]'
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {hero ? (
          <Link
            href={`/haberler/${hero.slug}`}
            className="block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
          >
            <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="relative min-h-[320px] bg-slate-100">
                <img
                  src={hero.imageUrl || buildImageFallback(hero.title)}
                  alt={hero.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-8">
                <span className="inline-flex rounded-full bg-[#FFF8E7] px-3 py-1 text-xs font-bold text-[#C5A022]">
                  {hero.isEditorPick ? 'Editor Pick' : 'Önə çıxan'}
                </span>
                <h2 className="mt-4 font-display text-4xl font-black leading-tight">{hero.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{hero.summary}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                  <span>{hero.sourceName || 'Mənbə yoxdur'}</span>
                  <span>•</span>
                  <span>{formatDateAz(hero.publishedAt)}</span>
                  <span>•</span>
                  <span>{hero.category}</span>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
            Hələ approved xəbər yoxdur.
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {gridItems.map((item) => (
            <Link
              key={item.id}
              href={`/haberler/${item.slug}`}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="aspect-[16/10] bg-slate-100">
                <img
                  src={item.imageUrl || buildImageFallback(item.title)}
                  alt={item.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C5A022]">{item.category}</div>
                <h3 className="mt-2 text-xl font-bold leading-snug">{item.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                  <span>{item.sourceName || 'Mənbə yoxdur'}</span>
                  <span>•</span>
                  <span>{formatDateAz(item.publishedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-wrap justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, index) => {
              const nextPage = index + 1;
              const href =
                category === 'all'
                  ? `/haberler?page=${nextPage}`
                  : `/haberler?category=${category}&page=${nextPage}`;
              return (
                <Link
                  key={nextPage}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${
                    page === nextPage
                      ? 'bg-[#1A1A2E] text-white'
                      : 'border border-slate-200 bg-white text-slate-600'
                  }`}
                >
                  {nextPage}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </main>
  );
}
