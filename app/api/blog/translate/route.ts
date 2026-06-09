import { NextRequest, NextResponse } from 'next/server';
import { translateBlogPostBySlug } from '@/lib/db/blog-repository';
import { getServerMemberSession } from '@/lib/members/server-session';

// Admin-triggered translation of an existing blog post (AZ → ru/en/tr).
// Returns a per-language result so the editor can show success/failure
// (no silent failure).
export async function POST(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ ok: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { slug?: string };
  if (!body.slug) {
    return NextResponse.json({ ok: false, error: 'slug tələb olunur' }, { status: 400 });
  }

  const result = await translateBlogPostBySlug(body.slug);
  return NextResponse.json(result, { status: 200 });
}
