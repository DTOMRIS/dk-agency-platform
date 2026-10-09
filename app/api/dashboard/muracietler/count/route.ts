/**
 * TASK-0521 — sidebar badge for «Bütün müraciətlər»: number of inbound items (all sources) in the
 * last 7 days. Admin only; read-only COUNT(*) queries.
 */

import { NextResponse } from 'next/server';

import { requireApiAdmin } from '@/lib/api/guards';
import { countInboxSince } from '@/lib/repositories/inboxRepository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const guard = await requireApiAdmin();
  if (!guard.ok) return guard.response;

  try {
    const count = await countInboxSince(7);
    if (count === null) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    return NextResponse.json({ count, days: 7 });
  } catch (error) {
    console.error('[dashboard/muracietler/count] failed:', error);
    return NextResponse.json({ error: 'Count failed' }, { status: 500 });
  }
}
