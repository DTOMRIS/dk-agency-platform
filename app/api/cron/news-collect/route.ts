/**
 * @file app/api/cron/news-collect/route.ts
 * @purpose TASK-0557: RSS collection on the web server, called every 2 h by `.github/workflows/news-collect.yml`.
 * Report.az / APA / Oxu.az RSS keep only the last 2.5–4 hours, so the old 6-hourly collection never saw
 * most of their stories. A curl job costs ~1 Actions minute; the heavy `npm ci` job stays twice a day.
 * Auth: same CRON_SECRET bearer token as the other /api/cron routes. Collection only — no AI, no Telegram.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ingestTradeRss } from '@/lib/news/rss-ingest';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!db) {
    return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 503 });
  }

  const started = Date.now();
  const r = await ingestTradeRss();
  const ok = r.errors.length === 0 && r.feedsOk > 0;
  return NextResponse.json(
    {
      ok,
      seconds: Math.round((Date.now() - started) / 100) / 10,
      feedsOk: r.feedsOk,
      feedsFailed: r.feedsFailed,
      inserted: r.inserted,
      belowThreshold: r.rejected.length,
      tooOld: r.tooOld,
      duplicates: r.duplicates,
      overCap: r.overCap,
      errors: r.errors,
    },
    { status: ok ? 200 : 500 }
  );
}
