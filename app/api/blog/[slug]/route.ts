import { NextRequest, NextResponse } from 'next/server';
import {
  archiveBlogPostInDb,
  getBlogPostDetail,
  updateBlogPostInDb,
} from '@/lib/db/blog-repository';
import { getServerMemberSession } from '@/lib/members/server-session';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getBlogPostDetail(slug);

  if (!post) {
    return NextResponse.json({ success: false, error: 'Yazı tapılmadı.' }, { status: 404 });
  }

  return NextResponse.json({
    post,
    guruBoxes: post.guruBoxes || [],
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }

  const { slug } = await params;
  const body = await request.json();
  const updated = await updateBlogPostInDb(slug, body);

  if (!updated) {
    return NextResponse.json({ success: false, error: 'Yazı tapılmadı.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }

  const { slug } = await params;
  await archiveBlogPostInDb(slug);
  return NextResponse.json({ success: true });
}
