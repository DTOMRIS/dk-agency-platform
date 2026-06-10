import { NextResponse } from 'next/server';

import {
  autoTranslateBlogPost,
  getAllBlogPostIds,
  type BlogTranslateResult,
} from '@/lib/db/blog-repository';
import { getServerMemberSession } from '@/lib/members/server-session';

// Allow a long-running batch on the (long-lived) Node server.
export const maxDuration = 300;

type PostResult = { id: number } & BlogTranslateResult;

// Admin-triggered RE-translation of ALL blog posts (AZ → ru/en/tr).
// Routes every post through autoTranslateBlogPost, which:
//  - re-translates fields that are empty OR still Azerbaijian (needsTranslation),
//    so already-broken (AZ-echoed) values are healed, not skipped;
//  - covers title / summary / content + doganNote + guru quote + guru name;
//  - uses the echo-guarded translateText (never persists AZ as a translation);
//  - reports per-language status (no silent failure).
// Idempotent: re-running only touches fields that still need work.
export async function POST() {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }

  const ids = await getAllBlogPostIds();
  const results: PostResult[] = [];
  let okCount = 0;
  let failCount = 0;

  for (const id of ids) {
    const r = await autoTranslateBlogPost(id);
    results.push({ id, ...r });
    if (r.ok) okCount += 1;
    else failCount += 1;
  }

  return NextResponse.json({
    ok: failCount === 0,
    total: ids.length,
    okCount,
    failCount,
    results,
  });
}
