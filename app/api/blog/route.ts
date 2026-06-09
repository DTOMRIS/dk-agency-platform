import { NextRequest, NextResponse } from 'next/server';
import {
  getBlogPostsFromDb,
  createBlogPostInDb,
  autoTranslateBlogPost,
} from '@/lib/db/blog-repository';
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

  // Auto-translate AZ → ru/en/tr on publish. Fire-and-forget: Hostinger is a
  // long-running Node server (no serverless timeout), so the background fill
  // completes without blocking the admin's save response. Best-effort, never throws.
  const createdId = (created as { id?: number }).id;
  if (createdId && body.status === 'published') {
    void autoTranslateBlogPost(createdId);
  }

  return NextResponse.json({ success: true, data: created }, { status: 201 });
}
