/**
 * /dashboard/xeberler/rss — news sources (read-only).
 * TASK-0549: this page listed the old `news_sources` table (6 feeds, each twice, never fetched since April) with an
 * «Aktiv» switch that changed nothing — the pipeline reads RSS_FEEDS in lib/news/rss-ingest.ts and NewsData.io
 * queries. Now it shows the real feed list and what each feed brought in the last 7 days.
 */
import { sql } from 'drizzle-orm';
import { requireAdminPage } from '@/lib/auth/guards';
import { db } from '@/lib/db';
import { formatAzDateTime } from '@/lib/i18n/format';
import { RSS_FEEDS } from '@/lib/news/rss-ingest';

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
    where created_at > now() - interval '7 days'
    group by 1
  `)) as unknown as { rows?: Row[] } | Row[];
  const rows = (Array.isArray(res) ? res : (res.rows ?? [])) as Row[];
  for (const r of rows) map.set(r.src, { ...r, total: Number(r.total), approved: Number(r.approved) });
  return map;
}

export default async function DashboardXeberlerRssPage() {
  await requireAdminPage();
  const counts = await loadCounts();
  const feedNames = new Set(RSS_FEEDS.map((f) => f.name));
  const others = [...counts.values()].filter((r) => !feedNames.has(r.src));
  const othersTotal = others.reduce((sum, r) => sum + r.total, 0);
  const othersApproved = others.reduce((sum, r) => sum + r.approved, 0);

  const card = 'rounded-[22px] border border-[#E4DCCD] bg-white';
  return (
    <div className="min-h-screen bg-[#F6F1E9] p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className={`${card} p-6`}>
          <h1 className="text-[32px] font-bold tracking-tight text-[#0F172A] sm:text-[38px]">Xəbər mənbələri</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[#5B6474]">
            Xəbər axını gündə 4 dəfə bu RSS mənbələrini və NewsData.io axtarışlarını oxuyur. Hər mənbədən bir
            dövrdə ən çox 3 yeni xəbər götürülür; başqa mənbədə artıq olan eyni xəbər (son 7 gün) təkrar götürülmür.
            Rəqəmlər son 7 gündür.
          </p>
        </div>

        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-[#F6F1E9] text-left text-[12px] uppercase tracking-wider text-[#5B6474]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Mənbə</th>
                  <th className="px-5 py-3 font-semibold">Növ</th>
                  <th className="px-5 py-3 text-right font-semibold">Gəldi</th>
                  <th className="px-5 py-3 text-right font-semibold">Dərc olundu</th>
                  <th className="px-5 py-3 font-semibold">Son xəbər</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE9DE]">
                {RSS_FEEDS.map((feed) => {
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
                        {feed.kind === 'trade' ? 'Sektor' : 'Ümumi'}
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
                    <div className="font-semibold text-[#0F172A]">NewsData.io (axtarış)</div>
                    <div className="text-xs text-[#5B6474]">{others.length} müxtəlif nəşr</div>
                  </td>
                  <td className="px-5 py-3 text-[#334155]">Axtarış</td>
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
