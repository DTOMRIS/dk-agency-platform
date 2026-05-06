import Link from 'next/link';
import type { Metadata } from 'next';
import { BarChart3, BriefcaseBusiness, ChartNoAxesCombined, Cpu, type LucideIcon } from 'lucide-react';
import { getLocale } from 'next-intl/server';

import { formatDateAz } from '@/lib/formatDate';
import {
  getApprovedEditorPick,
  getApprovedNewsArticles,
  type NewsCategoryKey,
  type PublicNewsArticle,
} from '@/lib/repositories/newsRepository';
import { normalizeLocale, type Locale } from '@/i18n/config';

/* ------------------------------------------------------------------ */
/*  i18n copy                                                          */
/* ------------------------------------------------------------------ */

interface NewsCopy {
  badge: string;
  title: string;
  subtitle: string;
  noArticles: string;
  featured: string;
  editorPick: string;
  noSource: string;
  categoryTabs: Array<{ key: NewsCategoryKey; label: string }>;
  categoryMeta: Record<
    Exclude<NewsCategoryKey, 'all'>,
    { label: string; gradient: string }
  >;
}

const newsCopy: Record<Locale, NewsCopy> = {
  az: {
    badge: 'Sektor Nəbzi',
    title: 'Sektor Nəbzi',
    subtitle: 'HoReCa sektorundan seçilmiş xəbərlər.',
    noArticles: 'Hələ approved xəbər yoxdur.',
    featured: 'Önə çıxan',
    editorPick: 'Editor Pick',
    noSource: 'Mənbə yoxdur',
    categoryTabs: [
      { key: 'all', label: 'Hamısı' },
      { key: 'finance', label: 'Maliyyə' },
      { key: 'operations', label: 'Əməliyyat' },
      { key: 'growth', label: 'Böyümə' },
      { key: 'market', label: 'Bazar' },
      { key: 'technology', label: 'Texnologiya' },
    ],
    categoryMeta: {
      finance: { label: 'Maliyyə', gradient: 'from-[#1A1A2E] via-[#243B6B] to-[#4C7DF0]' },
      operations: { label: 'Əməliyyat', gradient: 'from-[#1A1A2E] via-[#475569] to-[#94A3B8]' },
      growth: { label: 'Böyümə', gradient: 'from-[#0B3B2E] via-[#167B4D] to-[#6BCB77]' },
      market: { label: 'Bazar', gradient: 'from-[#5C4310] via-[#A67C1D] to-[#E8C15A]' },
      technology: { label: 'Texnologiya', gradient: 'from-[#102A43] via-[#1E5AA8] to-[#5BA8FF]' },
    },
  },
  tr: {
    badge: 'Sektör Nabzı',
    title: 'Sektör Nabzı',
    subtitle: 'HoReCa sektöründen seçilmiş haberler.',
    noArticles: 'Henüz onaylı haber yok.',
    featured: 'Öne çıkan',
    editorPick: 'Editör Seçimi',
    noSource: 'Kaynak yok',
    categoryTabs: [
      { key: 'all', label: 'Tümü' },
      { key: 'finance', label: 'Finans' },
      { key: 'operations', label: 'Operasyon' },
      { key: 'growth', label: 'Büyüme' },
      { key: 'market', label: 'Pazar' },
      { key: 'technology', label: 'Teknoloji' },
    ],
    categoryMeta: {
      finance: { label: 'Finans', gradient: 'from-[#1A1A2E] via-[#243B6B] to-[#4C7DF0]' },
      operations: { label: 'Operasyon', gradient: 'from-[#1A1A2E] via-[#475569] to-[#94A3B8]' },
      growth: { label: 'Büyüme', gradient: 'from-[#0B3B2E] via-[#167B4D] to-[#6BCB77]' },
      market: { label: 'Pazar', gradient: 'from-[#5C4310] via-[#A67C1D] to-[#E8C15A]' },
      technology: { label: 'Teknoloji', gradient: 'from-[#102A43] via-[#1E5AA8] to-[#5BA8FF]' },
    },
  },
  en: {
    badge: 'Sector Pulse',
    title: 'Sector Pulse',
    subtitle: 'Curated news from the HoReCa industry.',
    noArticles: 'No approved articles yet.',
    featured: 'Featured',
    editorPick: 'Editor Pick',
    noSource: 'No source',
    categoryTabs: [
      { key: 'all', label: 'All' },
      { key: 'finance', label: 'Finance' },
      { key: 'operations', label: 'Operations' },
      { key: 'growth', label: 'Growth' },
      { key: 'market', label: 'Market' },
      { key: 'technology', label: 'Technology' },
    ],
    categoryMeta: {
      finance: { label: 'Finance', gradient: 'from-[#1A1A2E] via-[#243B6B] to-[#4C7DF0]' },
      operations: { label: 'Operations', gradient: 'from-[#1A1A2E] via-[#475569] to-[#94A3B8]' },
      growth: { label: 'Growth', gradient: 'from-[#0B3B2E] via-[#167B4D] to-[#6BCB77]' },
      market: { label: 'Market', gradient: 'from-[#5C4310] via-[#A67C1D] to-[#E8C15A]' },
      technology: { label: 'Technology', gradient: 'from-[#102A43] via-[#1E5AA8] to-[#5BA8FF]' },
    },
  },
  ru: {
    badge: 'Пульс сектора',
    title: 'Пульс сектора',
    subtitle: 'Отобранные новости из индустрии HoReCa.',
    noArticles: 'Одобренных статей пока нет.',
    featured: 'Избранное',
    editorPick: 'Выбор редактора',
    noSource: 'Источник не указан',
    categoryTabs: [
      { key: 'all', label: 'Все' },
      { key: 'finance', label: 'Финансы' },
      { key: 'operations', label: 'Операции' },
      { key: 'growth', label: 'Рост' },
      { key: 'market', label: 'Рынок' },
      { key: 'technology', label: 'Технологии' },
    ],
    categoryMeta: {
      finance: { label: 'Финансы', gradient: 'from-[#1A1A2E] via-[#243B6B] to-[#4C7DF0]' },
      operations: { label: 'Операции', gradient: 'from-[#1A1A2E] via-[#475569] to-[#94A3B8]' },
      growth: { label: 'Рост', gradient: 'from-[#0B3B2E] via-[#167B4D] to-[#6BCB77]' },
      market: { label: 'Рынок', gradient: 'from-[#5C4310] via-[#A67C1D] to-[#E8C15A]' },
      technology: { label: 'Технологии', gradient: 'from-[#102A43] via-[#1E5AA8] to-[#5BA8FF]' },
    },
  },
};

/* ------------------------------------------------------------------ */
/*  Category icon map (static, locale-independent)                     */
/* ------------------------------------------------------------------ */

const CATEGORY_ICONS: Record<Exclude<NewsCategoryKey, 'all'>, LucideIcon> = {
  finance: BarChart3,
  operations: BriefcaseBusiness,
  growth: ChartNoAxesCombined,
  market: ChartNoAxesCombined,
  technology: Cpu,
};

const PAGE_SIZE = 12;

export const metadata: Metadata = {
  title: 'Haberler | DK Agency',
  description: 'HoReCa sektorundan seçilmiş xəbərlər.',
};

function NewsVisual({
  item,
  c,
  className,
  compact = false,
}: {
  item: PublicNewsArticle;
  c: NewsCopy;
  className?: string;
  compact?: boolean;
}) {
  if (item.imageUrl) {
    return (
      <img
        src={item.imageUrl}
        alt={item.title}
        className={className || 'h-full w-full object-cover'}
        referrerPolicy="no-referrer"
      />
    );
  }

  const meta = c.categoryMeta[item.category as Exclude<NewsCategoryKey, 'all'>];
  const Icon = CATEGORY_ICONS[item.category as Exclude<NewsCategoryKey, 'all'>] ?? BarChart3;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${meta.gradient} ${className || 'h-full w-full'} ${
        compact ? 'min-h-[180px]' : 'min-h-[320px]'
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_34%)]" />
      <div className="absolute -right-6 bottom-0 text-[88px] font-black uppercase tracking-[0.22em] text-white/10">
        DK
      </div>
      <div className="relative flex h-full flex-col justify-between p-6 text-white">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em]">
            {meta.label}
          </span>
          <span className="rounded-full border border-white/15 bg-white/10 p-3">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-white/75">DK Agency</div>
          <div className="mt-2 max-w-[18rem] text-sm leading-6 text-white/90">{c.subtitle}</div>
        </div>
      </div>
    </div>
  );
}

export default async function HaberlerPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const rawLocale = await getLocale();
  const locale = normalizeLocale(rawLocale);
  const c = newsCopy[locale];

  const category = (params.category as NewsCategoryKey) || 'all';
  const page = Math.max(1, Number(params.page || '1'));
  const offset = (page - 1) * PAGE_SIZE;

  const result = await getApprovedNewsArticles(
    {
      category,
      limit: PAGE_SIZE,
      offset,
    },
    locale,
  );

  const editorPick = offset === 0 ? await getApprovedEditorPick(category, locale) : null;
  const hero = editorPick || result.items[0];
  const gridItems = result.items.filter((item) => item.id !== hero?.id);
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-10 text-[#1A1A2E]">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <span className="inline-flex rounded-full bg-[#1A1A2E] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            {c.badge}
          </span>
          <h1 className="mt-4 font-display text-4xl font-black sm:text-5xl">{c.title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">{c.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {c.categoryTabs.map((tab) => {
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
                <NewsVisual item={hero} c={c} className="h-full w-full" />
              </div>
              <div className="p-8">
                <span className="inline-flex rounded-full bg-[#FFF8E7] px-3 py-1 text-xs font-bold text-[#C5A022]">
                  {hero.isEditorPick ? c.editorPick : c.featured}
                </span>
                <h2 className="mt-4 font-display text-4xl font-black leading-tight">{hero.title}</h2>
                <p className="mt-4 text-sm leading-7 text-slate-600">{hero.summary}</p>
                <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                  <span>{hero.sourceName || c.noSource}</span>
                  <span>&bull;</span>
                  <span>{formatDateAz(hero.publishedAt)}</span>
                  <span>&bull;</span>
                  <span>{hero.category}</span>
                </div>
              </div>
            </div>
          </Link>
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
            {c.noArticles}
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
                <NewsVisual item={item} c={c} className="h-full w-full" compact />
              </div>
              <div className="p-6">
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C5A022]">{item.category}</div>
                <h3 className="mt-2 text-xl font-bold leading-snug">{item.title}</h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{item.summary}</p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                  <span>{item.sourceName || c.noSource}</span>
                  <span>&bull;</span>
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
