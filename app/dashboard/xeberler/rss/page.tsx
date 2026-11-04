/**
 * /dashboard/xeberler/rss — news sources (read-only).
 * TASK-0549: this page listed the old `news_sources` table (6 feeds, each twice, never fetched since April) with an
 * «Aktiv» switch that changed nothing — the pipeline reads RSS_FEEDS in lib/news/rss-ingest.ts and NewsData.io
 * queries. Now it shows the real feed list and what each feed brought in the last 7 days.
 */
import { sql } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { requireAdminPage } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { formatAzDateTime } from '@/lib/i18n/format';
import { RSS_FEEDS } from '@/lib/news/rss-ingest';
import { OFFICIAL_SOURCES } from '@/lib/news/official-sources';

export const dynamic = 'force-dynamic';

type Row = { src: string; total: number; approved: number; last: string | null };

async function loadCounts(): Promise<Map<string, Row>> {
  const map = new Map<string, Row>();
  if (!db) return map;
  const res = (await db.execute(sql`
    select coalesce(author, '?') as src,
           count(*)::int as total,
           count(*) filter (where status = 'approved')::int as approved,
           max(created_at) as last
    from news_articles
    where created_at > now() - interval '7 days' AND origin <> 'manual'
    group by 1
  `)) as unknown as { rows?: Row[] } | Row[];
  const rows = (Array.isArray(res) ? res : (res.rows ?? [])) as Row[];
  for (const r of rows) map.set(r.src, { ...r, total: Number(r.total), approved: Number(r.approved) });
  return map;
}

export default async function DashboardXeberlerRssPage() {
  await requireAdminPage();
  const t = await getTranslations('newsSources');
  const counts = await loadCounts();
  const sources = [
    ...RSS_FEEDS.map((feed) => ({ ...feed, official: false })),
    ...OFFICIAL_SOURCES.map((source) => ({ name: source.name, url: source.url, kind: 'general' as const, region: 'az' as const, official: true })),
  ];
  const feedNames = new Set(sources.map((f) => f.name));
  const others = [...counts.values()].filter((r) => !feedNames.has(r.src));
  const othersTotal = others.reduce((sum, r) => sum + r.total, 0);
  const othersApproved = others.reduce((sum, r) => sum + r.approved, 0);

  const card = 'rounded-[22px] border border-[#E4DCCD] bg-white';
  return (
    <div className="min-h-screen bg-[#F6F1E9] p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className={`${card} p-6`}>
          <h1 className="text-[32px] font-bold tracking-tight text-[#0F172A] sm:text-[38px]">{t('title')}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5B6474]">
            {t('intro')}
          </p>
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-[#F6F1E9] text-left text-[12px] uppercase tracking-wider text-[#5B6474]">
                <tr>
                  <th className="px-5 py-3 font-semibold">{t('source')}</th>
                  <th className="px-5 py-3 font-semibold">{t('type')}</th>
                  <th className="px-5 py-3 text-right font-semibold">{t('received')}</th>
                  <th className="px-5 py-3 text-right font-semibold">{t('published')}</th>
                  <th className="px-5 py-3 font-semibold">{t('latest')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DE]">
                {sources.map((feed) => {
                  const c = counts.get(feed.name);
                  return (
                    <tr key={feed.url}>
                      <td className="px-5 py-3">
                        <div className="font-semibold text-[#0F172A]">{feed.name}</div>
                        <div className="max-w-[360px] overflow-hidden text-ellipsis whitespace-nowrap text-xs text-[#5B6474]">
                          {feed.url}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#334155]">
                        {t(feed.official ? 'official' : feed.kind === 'trade' ? 'trade' : 'general')}
                        {feed.region === 'az' ? ' · AZ' : ''}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums text-[#334155]">{c?.total ?? 0}</td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums text-[#0F172A]">{c?.approved ?? 0}</td>
                      <td className="px-5 py-3 text-[#5B6474]">{c?.last ? formatAzDateTime(c.last) : '—'}</td>
                    </tr>
                  );
                })}
                <tr className="bg-[#FBF8F3]">
                  <td className="px-5 py-3">
                    <div className="font-semibold text-[#0F172A]">{t('searchTitle')}</div>
                    <div className="text-xs text-[#5B6474]">{t('outlets', { count: others.length })}</div>
                  </td>
                  <td className="px-5 py-3 text-[#334155]">{t('search')}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-[#334155]">{othersTotal}</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-[#0F172A]">{othersApproved}</td>
                  <td className="px-5 py-3 text-[#5B6474]">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
