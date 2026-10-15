import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';

import { requireAdminPage } from '@/lib/auth/guards';
import { normalizeLocale, withLocale } from '@/i18n/config';
import {
  INBOX_PER_SOURCE_LIMIT,
  INBOX_PERIODS,
  INBOX_SOURCES,
  getInboxItems,
  getLeadSourceSummary,
  type InboxItem,
  type InboxPeriod,
  type InboxSource,
} from '@/lib/repositories/inboxRepository';

/**
 * TASK-0521 — «Bütün müraciətlər»: every inbound lead/inquiry in one admin list (read-only).
 * Filters live in the URL: ?source=listing|contact|kazan|franchise|newsletter&period=7|30|90&q=…
 */

export const dynamic = 'force-dynamic';

type Filters = { source: InboxSource | 'all'; period: InboxPeriod; q: string };

const DEFAULT_PERIOD: InboxPeriod = 30;

function parseFilters(params: Record<string, string | string[] | undefined>): Filters {
  const rawSource = typeof params.source === 'string' ? params.source : 'all';
  const rawPeriod = Number(typeof params.period === 'string' ? params.period : DEFAULT_PERIOD);
  const rawQ = typeof params.q === 'string' ? params.q.trim().slice(0, 100) : '';
  return {
    source: (INBOX_SOURCES as readonly string[]).includes(rawSource) ? (rawSource as InboxSource) : 'all',
    period: (INBOX_PERIODS as readonly number[]).includes(rawPeriod) ? (rawPeriod as InboxPeriod) : DEFAULT_PERIOD,
    q: rawQ,
  };
}

function matchesSearch(item: InboxItem, q: string): boolean {
  if (!q) return true;
  const needle = q.toLocaleLowerCase();
  return [item.name, item.phone, item.email, item.context, item.message, item.channel, item.origin]
    .filter((value): value is string => Boolean(value))
    .some((value) => value.toLocaleLowerCase().includes(needle));
}

const SOURCE_TONE: Record<InboxSource, { dot: string; pill: string }> = {
  listing: { dot: 'bg-[#0F172A]', pill: 'bg-[#EFE9DE] text-[#0F172A]' },
  contact: { dot: 'bg-emerald-500', pill: 'bg-emerald-50 text-emerald-800' },
  kazan: { dot: 'bg-violet-500', pill: 'bg-violet-50 text-violet-800' },
  franchise: { dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-800' },
  newsletter: { dot: 'bg-[#FBF8F3]0', pill: 'bg-[#EFE9DE] text-[#334155]' },
};

export default async function DashboardInboxPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdminPage();
  const locale = normalizeLocale(await getLocale());
  const t = await getTranslations('dashboardInbox');
  const filters = parseFilters(await searchParams);

  const basePath = withLocale(locale, '/dashboard/muracietler');
  const hrefFor = (next: Partial<Filters>) => {
    const merged = { ...filters, ...next };
    const params = new URLSearchParams();
    if (merged.source !== 'all') params.set('source', merged.source);
    if (merged.period !== DEFAULT_PERIOD) params.set('period', String(merged.period));
    if (merged.q) params.set('q', merged.q);
    const query = params.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const [all, sourceSummary] = await Promise.all([getInboxItems(filters.period), getLeadSourceSummary(filters.period)]);

  const cardCls =
    'rounded-[22px] border border-[#E4DCCD] bg-white';
  const chipCls = (active: boolean) =>
    `inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${
      active ? 'bg-[#0F172A] text-white' : 'border border-[#E4DCCD] bg-white text-[#334155] hover:border-[#0F172A]'
    }`;

  if (!all) {
    return (
      <div className="min-h-full bg-[#F6F1E9] px-4 py-6 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-[1320px]">
          <div className={`${cardCls} px-6 py-16 text-center text-sm font-semibold text-[#334155]`}>{t('dbUnavailable')}</div>
        </div>
      </div>
    );
  }

  // Counts per source respect the period and the search, not the source filter (so the cards
  // double as the source filter and always show what each one would return).
  const searched = all.filter((item) => matchesSearch(item, filters.q));
  const counts = Object.fromEntries(
    INBOX_SOURCES.map((source) => [source, searched.filter((item) => item.source === source).length]),
  ) as Record<InboxSource, number>;
  const items = filters.source === 'all' ? searched : searched.filter((item) => item.source === filters.source);

  const dateLocale = locale === 'az' ? 'az-AZ' : locale === 'ru' ? 'ru-RU' : locale === 'tr' ? 'tr-TR' : 'en-GB';
  const formatDate = (date: Date) =>
    date.toLocaleString(dateLocale, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const channelLabel = (value: string | null) =>
    value ? (t.has(`channels.${value}`) ? t(`channels.${value}`) : value) : null;
  const statusLabel = (value: string | null) =>
    value ? (t.has(`statuses.${value}`) ? t(`statuses.${value}`) : value) : null;
  const detailHref = (item: InboxItem) => (item.href ? withLocale(locale, item.href) : null);

  const contactLines = (item: InboxItem) => {
    const lines = [item.name, item.phone, item.email].filter((value): value is string => Boolean(value));
    if (lines.length) return lines;
    // TASK-0529: a click carries no identity — say where the person is and show the click's code.
    const code = item.refCode;
    return [t('anonymous'), code ? t('refCode', { code }) : t('anonymousHint')];
  };

  return (
    <div className="min-h-full bg-[#F6F1E9] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <div className="min-w-0">
          <h1 className="text-[28px] font-black tracking-[-0.03em] text-[#0F172A] sm:text-[38px]">{t('title')}</h1>
          <p className="mt-1 max-w-3xl text-[15px] text-[#5B6474]">{t('subtitle')}</p>
        </div>

        {/* Counts per source — each card is also the source filter */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
          <Link
            href={hrefFor({ source: 'all' })}
            aria-current={filters.source === 'all' ? 'true' : undefined}
            className={`${cardCls} col-span-2 block p-4 transition-shadow hover:border-[#0F172A] sm:p-5 lg:col-span-1 ${filters.source === 'all' ? 'ring-2 ring-[#0F172A]' : ''}`}
          >
            <p className="flex min-h-[36px] items-start text-[13px] font-medium text-[#5B6474]">{t('all')}</p>
            <p className="mt-2 text-[30px] font-black leading-none tracking-[-0.03em] text-[#0F172A] tabular-nums">{searched.length}</p>
          </Link>
          {INBOX_SOURCES.map((source) => (
            <Link
              key={source}
              href={hrefFor({ source })}
              aria-current={filters.source === source ? 'true' : undefined}
              data-testid={`inbox-count-${source}`}
              className={`${cardCls} block p-4 transition-shadow hover:border-[#0F172A] sm:p-5 ${filters.source === source ? 'ring-2 ring-[#0F172A]' : ''}`}
            >
              <div className="flex min-h-[36px] items-start gap-2">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${SOURCE_TONE[source].dot}`} aria-hidden="true" />
                <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[#5B6474]" title={t(`sources.${source}`)}>{t(`sources.${source}`)}</p>
              </div>
              <p className="mt-2 text-[30px] font-black leading-none tracking-[-0.03em] text-[#0F172A] tabular-nums">{counts[source]}</p>
            </Link>
          ))}
        </div>

        {/* Period + search */}
        <div className={`${cardCls} flex flex-col gap-5 p-5 sm:p-6 xl:flex-row xl:items-end xl:justify-between`}>
          <div>
            <p className="text-[13px] font-semibold text-[#0F172A]">{t('period')}</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {INBOX_PERIODS.map((days) => (
                <Link key={days} href={hrefFor({ period: days })} aria-current={filters.period === days ? 'true' : undefined} className={chipCls(filters.period === days)}>
                  {t('periodDays', { days })}
                </Link>
              ))}
            </div>
          </div>
          <form method="get" action={basePath} className="flex w-full flex-col gap-2 sm:flex-row sm:items-end xl:max-w-xl">
            {filters.source !== 'all' ? <input type="hidden" name="source" value={filters.source} /> : null}
            {filters.period !== DEFAULT_PERIOD ? <input type="hidden" name="period" value={filters.period} /> : null}
            <label className="min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-[#0F172A]">{t('searchLabel')}</span>
              <input
                type="search"
                name="q"
                defaultValue={filters.q}
                placeholder={t('searchPlaceholder')}
                className="mt-2.5 h-11 w-full rounded-full border border-[#E4DCCD] bg-[#F6F1E9] px-4 text-[14px] text-[#0F172A] placeholder:text-[#5B6474] focus:border-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10"
              />
            </label>
            <div className="flex gap-2">
              <button type="submit" className="h-11 rounded-full bg-[#0F172A] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#1E293B]">
                {t('searchSubmit')}
              </button>
              {filters.q ? (
                <Link href={hrefFor({ q: '' })} className="inline-flex h-11 items-center rounded-full bg-[#F6F1E9] px-4 text-[14px] font-semibold text-[#334155] hover:bg-[#E4DCCD]">
                  {t('clear')}
                </Link>
              ) : null}
            </div>
          </form>
        </div>

        {/* TASK-0541: lead sources (utm / ad / referring site) in the same period */}
        <section className={`${cardCls} p-5 sm:p-6`} data-testid="inbox-sources">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[17px] font-semibold text-[#0F172A]">{t('sourcesTitle')}</h2>
            <p className="text-[12px] text-[#5B6474]">{t('sourcesNote')}</p>
          </div>
          {sourceSummary && sourceSummary.length > 0 ? (
            <ul className="mt-4 divide-y divide-[#EFE9DE]">
              {sourceSummary.map((row) => {
                const max = sourceSummary[0].total || 1;
                return (
                  <li key={row.source} className="grid gap-2 py-3 sm:grid-cols-[180px_1fr_auto] sm:items-center">
                    <span className="text-[14px] font-semibold text-[#0F172A]">
                      {t.has(`sourceNames.${row.source}`) ? t(`sourceNames.${row.source}`) : row.source}
                    </span>
                    <div className="min-w-0">
                      <div className="h-2 rounded-full bg-[#F6F1E9]">
                        <div className="h-2 rounded-full bg-[#0F172A]" style={{ width: `${Math.max(4, Math.round((row.total / max) * 100))}%` }} />
                      </div>
                      <p className="mt-1.5 text-[12px] text-[#5B6474]">
                        {Object.entries(row.byType)
                          .sort((a, b) => b[1] - a[1])
                          .map(([type, n]) => `${t.has(`leadTypes.${type}`) ? t(`leadTypes.${type}`) : type} ${n}`)
                          .join(' · ')}
                      </p>
                    </div>
                    <span className="text-[20px] font-semibold tabular-nums text-[#0F172A]">{row.total}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-3 text-[14px] text-[#5B6474]">{t('sourcesEmpty')}</p>
          )}
        </section>

        <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
          <p className="text-[14px] font-semibold text-[#0F172A]" data-testid="inbox-result-count">{t('results', { count: items.length })}</p>
          <p className="text-[12px] text-[#5B6474]">{t('limitNote', { limit: INBOX_PER_SOURCE_LIMIT })}</p>
        </div>

        {items.length === 0 ? (
          <div className={`${cardCls} px-6 py-16 text-center text-sm text-[#5B6474]`}>{t('empty')}</div>
        ) : (
          <>
            {/* Phones/tablets: cards */}
            <ul className="space-y-3 lg:hidden" data-testid="inbox-cards">
              {items.map((item) => {
                const href = detailHref(item);
                return (
                  <li key={item.key} className={`${cardCls} p-4`}>
                    <div className="flex flex-wrap items-center gap-1.5 text-[12px] font-semibold">
                      <span className={`rounded-full px-2.5 py-1 ${SOURCE_TONE[item.source].pill}`} title={t(`sources.${item.source}`)}>{t(`sourcesShort.${item.source}`)}</span>
                      {item.channel ? <span className="rounded-full bg-[#EFE9DE] px-2.5 py-1 text-[#334155]">{[channelLabel(item.channel), channelLabel(item.origin)].filter(Boolean).join(' · ')}</span> : null}
                      {item.status ? <span className="rounded-full bg-[#EFE9DE] px-2.5 py-1 text-[#334155]">{statusLabel(item.status)}</span> : null}
                      <span className="ml-auto text-[#5B6474] tabular-nums">{formatDate(item.date)}</span>
                    </div>
                    <div className="mt-3 space-y-0.5 text-[14px] text-[#0F172A]">
                      {contactLines(item).map((line, index) => (
                        <p key={`${item.key}-c${index}`} className={`break-words ${index === 0 ? 'font-semibold' : 'text-[#334155]'}`}>{line}</p>
                      ))}
                    </div>
                    {item.context ? <p className="mt-2 break-words text-[13px] text-[#5B6474]">{item.context}</p> : null}
                    {item.message ? <p className="mt-2 break-words rounded-[14px] bg-[#FBF8F3] px-3 py-2 text-[13px] leading-relaxed text-[#0F172A]">{item.message}</p> : null}
                    {href ? (
                      <Link href={href} className="mt-3 inline-flex min-h-11 items-center rounded-full bg-[#F6F1E9] px-4 text-[13px] font-semibold text-[#0F172A] hover:bg-[#E4DCCD]">
                        {t('open')} →
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            {/* Desktop: table */}
            <div className={`${cardCls} hidden overflow-hidden lg:block`}>
              <table className="w-full table-fixed text-left text-[13px]" data-testid="inbox-table">
                <thead className="bg-[#FBF8F3] text-[12px] font-semibold text-[#5B6474]">
                  <tr>
                    <th className="w-[130px] px-4 py-3">{t('cols.date')}</th>
                    <th className="w-[170px] px-4 py-3">{t('cols.source')}</th>
                    <th className="w-[210px] px-4 py-3">{t('cols.contact')}</th>
                    <th className="px-4 py-3">{t('cols.context')} · {t('cols.message')}</th>
                    <th className="w-[130px] px-4 py-3">{t('cols.status')}</th>
                    <th className="w-[80px] px-4 py-3" aria-label={t('open')} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFE9DE]">
                  {items.map((item) => {
                    const href = detailHref(item);
                    return (
                      <tr key={item.key} className="align-top hover:bg-[#FBF8F3]">
                        <td className="px-4 py-3 text-[#334155] tabular-nums">{formatDate(item.date)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${SOURCE_TONE[item.source].pill}`} title={t(`sources.${item.source}`)}>{t(`sourcesShort.${item.source}`)}</span>
                          {item.channel ? <p className="mt-1 text-[12px] text-[#5B6474]">{[channelLabel(item.channel), channelLabel(item.origin)].filter(Boolean).join(' · ')}</p> : null}
                        </td>
                        <td className="px-4 py-3">
                          {contactLines(item).map((line, index) => (
                            <p key={`${item.key}-c${index}`} className={`break-words ${index === 0 ? 'font-semibold text-[#0F172A]' : 'text-[#334155]'}`}>{line}</p>
                          ))}
                        </td>
                        <td className="px-4 py-3">
                          {item.context ? <p className="break-words font-medium text-[#0F172A]">{item.context}</p> : null}
                          {item.message ? <p className="mt-0.5 line-clamp-2 break-words text-[#5B6474]">{item.message}</p> : null}
                        </td>
                        <td className="px-4 py-3 text-[#334155]">{statusLabel(item.status) ?? '—'}</td>
                        <td className="px-4 py-3 text-right">
                          {href ? (
                            <Link href={href} className="font-semibold text-[#0F172A] hover:underline">{t('open')}</Link>
                          ) : (
                            <span className="text-[12px] text-[#5B6474]" title={t('noDetail')}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
