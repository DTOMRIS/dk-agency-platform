import { NextRequest, NextResponse } from 'next/server';
import { canAccessNewsAdmin } from '@/lib/news/admin-access';
import { translateNewsArticleBySlug } from '@/lib/repositories/newsRepository';

// Admin-triggered AI translation of a saved news article (AZ → ru/en/tr).
// Mirrors app/api/blog/translate (slug-based, per-language done/failed result).
export async function POST(request: NextRequest) {
  const auth = await canAccessNewsAdmin(request);
  if (!auth.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Admin girişi tələb olunur.' },
      { status: 403 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { slug?: string };
  if (!body.slug || typeof body.slug !== 'string') {
    return NextResponse.json({ ok: false, error: 'slug tələb olunur' }, { status: 400 });
  }

  const result = await translateNewsArticleBySlug(body.slug);
  return NextResponse.json(result, { status: 200 });
}
