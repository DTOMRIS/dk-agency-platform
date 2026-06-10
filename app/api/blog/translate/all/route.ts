import { NextResponse } from 'next/server';

import { autoTranslateBlogPost, getAllBlogPostIds } from '@/lib/db/blog-repository';
import { getServerMemberSession } from '@/lib/members/server-session';

// Keep each invocation short so it never trips Hostinger's proxy timeout / OOM.
export const maxDuration = 60;

// Time budget per request — well under the proxy/OOM ceiling. The client calls
// this repeatedly until { done: true }. autoTranslateBlogPost is idempotent and
// cheap on already-translated posts (no DeepSeek calls), so re-scanning from the
// start each call is fine and self-converging.
const BUDGET_MS = 40_000;

// Admin-triggered batch re-translation of blog posts (AZ → ru/en/tr), one short
// slice per call. Routes through the echo-guarded autoTranslateBlogPost
// (empty OR still-AZ fields; title/summary/content + doganNote + guru).
export async function POST() {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }

  const ids = await getAllBlogPostIds();
  const startedAt = Date.now();
  let processed = 0;
  let translated = 0;
  const failed: number[] = [];

  for (const id of ids) {
    const r = await autoTranslateBlogPost(id);
    processed += 1;
    if (Object.values(r.langs).some((s) => s === 'done')) translated += 1;
    if (!r.ok) failed.push(id);
    if (Date.now() - startedAt > BUDGET_MS) break;
  }

  const done = processed >= ids.length;
  return NextResponse.json({
    ok: true,
    done,
    processed,
    total: ids.length,
    translated,
    failed,
  });
}
