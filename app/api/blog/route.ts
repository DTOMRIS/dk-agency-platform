import { NextRequest, NextResponse, after } from 'next/server';
import { getBlogPostsFromDb, createBlogPostInDb } from '@/lib/db/blog-repository';
import { startTranslationJob } from '@/lib/blog/translationJobs';
import { getServerMemberSession } from '@/lib/members/server-session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status') || 'published';
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');
  const locale = searchParams.get('locale') || 'az';

  const result = await getBlogPostsFromDb(
    {
      category,
      status,
      limit: limit ? Number(limit) : undefined,
      offset: offset ? Number(offset) : undefined,
    },
    locale
  );

  return NextResponse.json({
    posts: result.posts,
    total: result.total,
    source: result.source,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json(
      { success: false, error: 'Admin girişi tələb olunur.' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const created = await createBlogPostInDb(body);

  // Auto-translate AZ → ru/en/tr on create (any status — the editor saves new
  // posts as draft by default), in the background (`after`) via the
  // shared job registry (TASK-0455) — the editor button sees this job and does
  // not start a second one. Best-effort, never throws.
  // (Was keyed on `created.id`, but createBlogPostInDb returns only { slug, source }
  // → the auto-translate on publish never ran.)
  if (created.source === 'db') {
    const createdSlug = created.slug;
    const { started, done } = startTranslationJob(createdSlug);
    if (started) after(() => done);
  }

  return NextResponse.json({ success: true, data: created }, { status: 201 });
}
