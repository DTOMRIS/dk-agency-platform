import { NextRequest, NextResponse } from 'next/server';
import { getApprovedNewsArticles } from '@/lib/repositories/newsRepository';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const locale = searchParams.get('locale') || 'az';
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '12'), 1), 50);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0'), 0);

    const { items, total, source } = await getApprovedNewsArticles(
      { category: category === 'all' ? undefined : category, limit, offset },
      locale,
    );

    return NextResponse.json(
      {
        success: true,
        source: `DK Agency News API (${source})`,
        timestamp: new Date().toISOString(),
        pagination: { total, limit, offset, hasMore: offset + limit < total },
        data: items,
      },
      { headers: corsHeaders },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: 'Xəbərlər yüklənərkən xəta baş verdi.' },
      { status: 500, headers: corsHeaders },
    );
  }
}
