import { NextRequest, NextResponse } from 'next/server';
import { getBlogPostsFromDb, createBlogPostInDb } from '@/lib/db/blog-repository';
import { getServerMemberSession } from '@/lib/members/server-session';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status') || 'published';
  const limit = searchParams.get('limit');
  const offset = searchParams.get('offset');

  const result = await getBlogPostsFromDb({
    category,
    status,
    limit: limit ? Number(limit) : undefined,
    offset: offset ? Number(offset) : undefined,
  });

  return NextResponse.json({
    posts: result.posts,
    total: result.total,
    source: result.source,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }

  const body = await request.json();
  const created = await createBlogPostInDb(body);
  return NextResponse.json({ success: true, data: created }, { status: 201 });
}
