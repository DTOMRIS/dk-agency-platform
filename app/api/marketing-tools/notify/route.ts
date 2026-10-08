/**
 * @file app/api/marketing-tools/notify/route.ts
 * @purpose «Xəbər ver» — üzv hələ hazır olmayan (`status: 'planned'`) alətə maraq bildirir.
 *
 * Yeni cədvəl yoxdur: sorğu `user_events`-ə `tool_notify_request` + `{ toolSlug }` kimi yazılır
 * (TASK-0505). Bir üzv bir alət üçün bir dəfə sayılır — təkrar basmaq yeni sətir yaratmır.
 *
 * GET  → { requested: string[] } (bu üzvün xəbər gözlədiyi alətlər);
 *        admin üçün əlavə olaraq { counts: Record<toolSlug, number> } (neçə üzv gözləyir).
 * POST → { toolSlug } → { ok: true, alreadyRequested: boolean }
 */

import { NextRequest, NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';

import { requireApiMember } from '@/lib/api/guards';
import { db } from '@/lib/db';
import { userEvents, users } from '@/lib/db/schema';
import { getToolConfig } from '@/lib/marketing-tools-config';

const EVENT_TYPE = 'tool_notify_request';
const toolSlugField = sql<string>`${userEvents.payload}->>'toolSlug'`;

async function resolveUserId(email: string): Promise<number | null> {
  if (!db) return null;
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return row?.id ?? null;
}

export async function GET() {
  const guard = await requireApiMember();
  if (!guard.ok) return guard.response;
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  const userId = guard.session.email ? await resolveUserId(guard.session.email) : null;

  const requested = userId
    ? (
        await db
          .selectDistinct({ toolSlug: toolSlugField })
          .from(userEvents)
          .where(and(eq(userEvents.userId, userId), eq(userEvents.eventType, EVENT_TYPE)))
      )
        .map((row) => row.toolSlug)
        .filter((slug): slug is string => typeof slug === 'string')
    : [];

  if (guard.session.plan !== 'admin') {
    return NextResponse.json({ requested });
  }

  const rows = await db
    .select({
      toolSlug: toolSlugField,
      members: sql<number>`count(distinct ${userEvents.userId})::int`,
    })
    .from(userEvents)
    .where(eq(userEvents.eventType, EVENT_TYPE))
    .groupBy(toolSlugField);

  const counts: Record<string, number> = {};
  for (const row of rows) {
    if (typeof row.toolSlug === 'string') counts[row.toolSlug] = row.members;
  }

  return NextResponse.json({ requested, counts });
}

export async function POST(request: NextRequest) {
  const guard = await requireApiMember();
  if (!guard.ok) return guard.response;
  if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const toolSlug = (body as { toolSlug?: unknown }).toolSlug;
  const tool = typeof toolSlug === 'string' ? getToolConfig(toolSlug) : undefined;
  // Yalnız hələ hazır olmayan alət: hazır alətə «xəbər ver» mənasızdır, naməlum slug isə zibil sətirdir.
  if (!tool || tool.status !== 'planned') {
    return NextResponse.json({ error: 'Invalid tool' }, { status: 400 });
  }

  const userId = guard.session.email ? await resolveUserId(guard.session.email) : null;
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const [existing] = await db
    .select({ id: userEvents.id })
    .from(userEvents)
    .where(
      and(
        eq(userEvents.userId, userId),
        eq(userEvents.eventType, EVENT_TYPE),
        sql`${toolSlugField} = ${tool.slug}`,
      ),
    )
    .limit(1);

  if (existing) {
    return NextResponse.json({ ok: true, alreadyRequested: true });
  }

  await db.insert(userEvents).values({
    userId,
    eventType: EVENT_TYPE,
    payload: { toolSlug: tool.slug },
  });

  return NextResponse.json({ ok: true, alreadyRequested: false });
}
