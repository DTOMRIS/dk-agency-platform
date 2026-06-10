import { NextRequest, NextResponse } from 'next/server';

import { migrateBlogStructure } from '@/lib/db/blog-repository';
import { getServerMemberSession } from '@/lib/members/server-session';

export const maxDuration = 300;

// Admin-triggered dual content-model migration (server-run, no node CLI).
//   POST /api/blog/migrate-structure?dryRun=true  → preview, writes NOTHING
//   POST /api/blog/migrate-structure?apply=true    → applies (idempotent)
// Default (no apply flag) is dry-run, so an accidental call never mutates data.
export async function POST(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }

  const apply = request.nextUrl.searchParams.get('apply') === 'true';
  const result = await migrateBlogStructure(apply);

  return NextResponse.json({ ok: true, ...result });
}
