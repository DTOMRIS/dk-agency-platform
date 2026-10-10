/**
 * @file lib/dashboard/overview.ts
 * @purpose Real numbers for the OCAQ v2 command centre (TASK-0483): daily series for charts,
 *          totals, and the "decision queue" (what the owner has to act on today).
 *
 * Every query is isolated — a missing table or column on one source must not blank the page.
 */

import { and, count, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import {
  blogPosts,
  franchiseLeads,
  kazanLeads,
  leads,
  listingLeads,
  listings,
  memberProfiles,
  newsArticles,
  users,
} from '@/lib/db/schema';
import { PENDING_LISTING_STATUSES } from '@/lib/listings/pending-statuses';

export type DaySeries = Array<{ day: string; value: number }>;

export type DecisionItem = {
  id: string;
  kind: 'news' | 'listing' | 'profile' | 'lead';
  title: string;
  note: string;
  at: string | null;
  href: string;
};

export type DashboardOverview = {
  periodDays: number;
  leads: {
    total: number;
    previous: number;
    series: DaySeries;
    bySource: Array<{ source: string; value: number }>;
  };
  users: { total: number; newInPeriod: number; series: DaySeries };
  news: { published: number; awaiting: number; queue: number; series: DaySeries };
  listings: { live: number; pending: number };
  blog: { published: number };
  decisions: DecisionItem[];
  /** TASK-0484: items older than FRESH_DAYS are kept out of the queue and only counted. */
  staleDecisions: number;
  dbAvailable: boolean;
};

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Fill a dense day-by-day series (oldest → newest) from sparse {day, value} rows. */
function denseSeries(rows: Array<{ day: string; value: number }>, days: number): DaySeries {
  const map = new Map(rows.map((r) => [r.day, Number(r.value) || 0]));
  const out: DaySeries = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i)
    );
    const key = dayKey(d);
    out.push({ day: key, value: map.get(key) ?? 0 });
  }
  return out;
}

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

type DailyRow = { day: string; value: number };

/** Queue shows only what is still worth deciding; older items are counted as stale. */
const FRESH_DAYS = 14;

/** Plain-text title: DeepSeek/markdown output sometimes carries **bold** or # headings. */
function plain(value: string | null | undefined): string {
  return (value ?? '').replace(/\*\*|__|`/g, '').replace(/^#+\s*/, '').trim();
}

export async function getDashboardOverview(periodDays = 30): Promise<DashboardOverview> {
  const empty: DashboardOverview = {
    periodDays,
    leads: { total: 0, previous: 0, series: denseSeries([], periodDays), bySource: [] },
    users: { total: 0, newInPeriod: 0, series: denseSeries([], periodDays) },
    news: { published: 0, awaiting: 0, queue: 0, series: denseSeries([], periodDays) },
    listings: { live: 0, pending: 0 },
    blog: { published: 0 },
    decisions: [],
    staleDecisions: 0,
    dbAvailable: false,
  };
  if (!dbAvailable || !db) return empty;
  const d = db;

  const since = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);
  const prevSince = new Date(Date.now() - 2 * periodDays * 24 * 60 * 60 * 1000);
  const dayExpr = (col: unknown) => sql<string>`to_char(date_trunc('day', ${col}), 'YYYY-MM-DD')`;

  // ---- Leads: contact/WhatsApp + franchise + KAZAN + listing enquiries
  const leadSources = [
    { name: 'contact', table: leads, col: leads.createdAt },
    { name: 'franchise', table: franchiseLeads, col: franchiseLeads.createdAt },
    { name: 'kazan', table: kazanLeads, col: kazanLeads.createdAt },
    { name: 'listing', table: listingLeads, col: listingLeads.createdAt },
  ] as const;

  const leadRows = await Promise.all(
    leadSources.map((s) =>
      safe(
        async () => {
          const rows = await d
            .select({ day: dayExpr(s.col), value: count() })
            .from(s.table)
            .where(gte(s.col, since))
            .groupBy(sql`1`);
          const [prev] = await d
            .select({ value: count() })
            .from(s.table)
            .where(and(gte(s.col, prevSince), sql`${s.col} < ${since}`));
          return { name: s.name, rows: rows as DailyRow[], previous: Number(prev?.value ?? 0) };
        },
        { name: s.name, rows: [] as DailyRow[], previous: 0 }
      )
    )
  );
  const leadDaily = new Map<string, number>();
  for (const src of leadRows)
    for (const r of src.rows) leadDaily.set(r.day, (leadDaily.get(r.day) ?? 0) + Number(r.value));
  const leadSeries = denseSeries(
    [...leadDaily].map(([day, value]) => ({ day, value })),
    periodDays
  );
  const bySource = leadRows
    .map((s) => ({ source: s.name, value: s.rows.reduce((a, r) => a + Number(r.value), 0) }))
    .filter((s) => s.value > 0);

  // ---- Users
  const [userTotal, userRows] = await Promise.all([
    safe(async () => Number((await d.select({ value: count() }).from(users))[0]?.value ?? 0), 0),
    safe(
      async () =>
        (await d
          .select({ day: dayExpr(users.createdAt), value: count() })
          .from(users)
          .where(gte(users.createdAt, since))
          .groupBy(sql`1`)) as DailyRow[],
      [] as DailyRow[]
    ),
  ]);

  // ---- News
  const [newsRows, newsAwaiting, newsQueue, newsPublished] = await Promise.all([
    safe(
      async () =>
        (await d
          .select({ day: dayExpr(newsArticles.publishedAt), value: count() })
          .from(newsArticles)
          .where(and(eq(newsArticles.status, 'approved'), gte(newsArticles.publishedAt, since)))
          .groupBy(sql`1`)) as DailyRow[],
      [] as DailyRow[]
    ),
    safe(
      async () =>
        Number(
          (
            await d
              .select({ value: count() })
              .from(newsArticles)
              .where(eq(newsArticles.status, 'translated'))
          )[0]?.value ?? 0
        ),
      0
    ),
    safe(
      async () =>
        Number(
          (
            await d
              .select({ value: count() })
              .from(newsArticles)
              .where(eq(newsArticles.status, 'fetched'))
          )[0]?.value ?? 0
        ),
      0
    ),
    safe(
      async () =>
        Number(
          (
            await d
              .select({ value: count() })
              .from(newsArticles)
              .where(and(eq(newsArticles.status, 'approved'), gte(newsArticles.publishedAt, since)))
          )[0]?.value ?? 0
        ),
      0
    ),
  ]);

  // ---- Listings / blog
  // TASK-0526: shared definition (lib/listings/pending-statuses.ts) — same number as the listings page and badge.
  const pendingListingStatuses = PENDING_LISTING_STATUSES;
  const [live, pending, blogPublished] = await Promise.all([
    safe(
      async () =>
        Number(
          (
            await d
              .select({ value: count() })
              .from(listings)
              .where(eq(listings.status, 'showcase_ready'))
          )[0]?.value ?? 0
        ),
      0
    ),
    safe(
      async () =>
        Number(
          (
            await d
              .select({ value: count() })
              .from(listings)
              .where(
                inArray(
                  listings.status,
                  pendingListingStatuses as unknown as Array<typeof listings.$inferSelect.status>
                )
              )
          )[0]?.value ?? 0
        ),
      0
    ),
    safe(
      async () =>
        Number(
          (
            await d
              .select({ value: count() })
              .from(blogPosts)
              .where(eq(blogPosts.status, 'published'))
          )[0]?.value ?? 0
        ),
      0
    ),
  ]);

  // ---- Decision queue
  const decisions: DecisionItem[] = [];
  const fresh = new Date(Date.now() - FRESH_DAYS * 24 * 60 * 60 * 1000);
  const news = await safe(
    () =>
      d
        .select({
          id: newsArticles.id,
          title: newsArticles.titleAz,
          src: newsArticles.author,
          at: newsArticles.createdAt,
        })
        .from(newsArticles)
        .where(and(eq(newsArticles.status, 'translated'), gte(newsArticles.createdAt, fresh)))
        .orderBy(desc(newsArticles.id))
        .limit(4),
    [] as Array<{ id: number; title: string | null; src: string | null; at: Date | null }>
  );
  for (const n of news) {
    decisions.push({
      id: `n${n.id}`,
      kind: 'news',
      title: plain(n.title) || '—',
      note: n.src || '',
      at: n.at?.toISOString() ?? null,
      href: `/dashboard/xeberler/${n.id}`,
    });
  }
  const pendingListings = await safe(
    () =>
      d
        .select({
          id: listings.id,
          title: listings.titleAz,
          fallback: listings.title,
          city: listings.city,
          at: listings.createdAt,
        })
        .from(listings)
        .where(
          and(
            inArray(
              listings.status,
              pendingListingStatuses as unknown as Array<typeof listings.$inferSelect.status>
            ),
            gte(listings.createdAt, fresh)
          )
        )
        .orderBy(desc(listings.createdAt))
        .limit(3),
    [] as Array<{
      id: number;
      title: string | null;
      fallback: string;
      city: string;
      at: Date | null;
    }>
  );
  for (const l of pendingListings) {
    decisions.push({
      id: `e${l.id}`,
      kind: 'listing',
      title: plain(l.title || l.fallback),
      note: l.city,
      at: l.at?.toISOString() ?? null,
      href: `/dashboard/ilanlar/${l.id}`,
    });
  }
  const pendingProfiles = await safe(
    () =>
      d
        .select({
          id: memberProfiles.id,
          name: memberProfiles.fullName,
          city: memberProfiles.city,
          at: memberProfiles.createdAt,
        })
        .from(memberProfiles)
        .where(
          and(
            eq(memberProfiles.approvalStatus, 'submitted'),
            gte(memberProfiles.createdAt, fresh),
            // admins' own profiles are not something to approve
            sql`${memberProfiles.email} not in (select email from users where role = 'admin')`
          )
        )
        .orderBy(desc(memberProfiles.createdAt))
        .limit(3),
    [] as Array<{ id: string | number; name: string | null; city: string | null; at: Date | null }>
  );
  for (const p of pendingProfiles) {
    decisions.push({
      id: `p${p.id}`,
      kind: 'profile',
      title: plain(p.name) || '—',
      note: p.city || '',
      at: p.at?.toISOString() ?? null,
      href: '/dashboard/profil-onay',
    });
  }
  const recentFranchise = await safe(
    () =>
      d
        .select({ id: franchiseLeads.id, name: franchiseLeads.name, at: franchiseLeads.createdAt })
        .from(franchiseLeads)
        .where(gte(franchiseLeads.createdAt, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)))
        .orderBy(desc(franchiseLeads.createdAt))
        .limit(3),
    [] as Array<{ id: string; name: string | null; at: Date | null }>
  );
  for (const f of recentFranchise) {
    decisions.push({
      id: `f${f.id}`,
      kind: 'lead',
      title: f.name || '—',
      note: 'franchise',
      at: f.at?.toISOString() ?? null,
      href: '/dashboard/franchise-leads',
    });
  }

  const staleDecisions = await safe(async () => {
    const [n] = await d
      .select({ value: count() })
      .from(newsArticles)
      .where(and(eq(newsArticles.status, 'translated'), sql`${newsArticles.createdAt} < ${fresh}`));
    const [l] = await d
      .select({ value: count() })
      .from(listings)
      .where(
        and(
          inArray(listings.status, pendingListingStatuses as unknown as Array<typeof listings.$inferSelect.status>),
          sql`${listings.createdAt} < ${fresh}`
        )
      );
    return Number(n?.value ?? 0) + Number(l?.value ?? 0);
  }, 0);

  const totalLeads = leadSeries.reduce((a, r) => a + r.value, 0);
  return {
    periodDays,
    leads: {
      total: totalLeads,
      previous: leadRows.reduce((a, s) => a + s.previous, 0),
      series: leadSeries,
      bySource,
    },
    users: {
      total: userTotal,
      newInPeriod: userRows.reduce((a, r) => a + Number(r.value), 0),
      series: denseSeries(userRows, periodDays),
    },
    news: {
      published: newsPublished,
      awaiting: newsAwaiting,
      queue: newsQueue,
      series: denseSeries(newsRows, periodDays),
    },
    listings: { live, pending },
    blog: { published: blogPublished },
    decisions,
    staleDecisions,
    dbAvailable: true,
  };
}
