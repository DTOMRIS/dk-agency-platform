/**
 * @file app/api/cron/weekly-telegram/route.ts
 * @purpose TASK-0511: weekly business summary for the owner's Telegram (last 7 days).
 * Auth: same CRON_SECRET bearer token as the other /api/cron routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { and, count, eq, gte, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  franchiseLeads,
  kazanLeads,
  leads,
  listings,
  newsArticles,
  users,
} from '@/lib/db/schema';
import { notifyOwner } from '@/lib/telegram/notify-owner';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!db) {
    return NextResponse.json({ ok: false, error: 'Database unavailable' }, { status: 503 });
  }

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [contactBySource, franchiseBySource, kazan, members, news, newListings] = await Promise.all([
    db
      .select({ source: leads.source, channel: leads.channel, value: count() })
      .from(leads)
      .where(gte(leads.createdAt, since))
      .groupBy(leads.source, leads.channel),
    db
      .select({ source: sql<string>`coalesce(${franchiseLeads.score}->>'source', ${franchiseLeads.toolSource}::text)`, value: count() })
      .from(franchiseLeads)
      .where(gte(franchiseLeads.createdAt, since))
      .groupBy(sql`coalesce(${franchiseLeads.score}->>'source', ${franchiseLeads.toolSource}::text)`),
    db.select({ value: count() }).from(kazanLeads).where(gte(kazanLeads.createdAt, since)),
    db.select({ value: count() }).from(users).where(gte(users.createdAt, since)),
    db
      .select({ value: count() })
      .from(newsArticles)
      .where(and(eq(newsArticles.status, 'approved'), gte(newsArticles.publishedAt, since))),
    db.select({ value: count() }).from(listings).where(gte(listings.createdAt, since)),
  ]);

  const sourceLines: string[] = [
    ...contactBySource.map((row) => `• ${row.source ?? '—'} (${row.channel ?? '—'}): ${row.value}`),
    ...franchiseBySource.map((row) => `• ${row.source}: ${row.value}`),
    `• kazan_ai: ${Number(kazan[0]?.value ?? 0)}`,
  ];
  const leadTotal =
    contactBySource.reduce((sum, row) => sum + Number(row.value), 0) +
    franchiseBySource.reduce((sum, row) => sum + Number(row.value), 0) +
    Number(kazan[0]?.value ?? 0);

  const sent = await notifyOwner({
    title: '📊 Həftəlik xülasə (son 7 gün)',
    lines: [
      `Lead/klik cəmi: ${leadTotal}`,
      ...sourceLines,
      `Yeni üzv: ${Number(members[0]?.value ?? 0)}`,
      `Dərc olunan xəbər: ${Number(news[0]?.value ?? 0)}`,
      `Yeni elan: ${Number(newListings[0]?.value ?? 0)}`,
    ],
    buttons: [[{ text: '✏️ Paneldə aç', url: 'https://dkagency.com.tr/dashboard' }]],
  });

  return NextResponse.json({ ok: true, sent, leadTotal });
}
