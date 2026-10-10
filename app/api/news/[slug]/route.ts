// app/api/news/[slug]/route.ts
// public-ok: one approved news story (same data as the public /haberler/[slug] page).
// TASK-0530: before, this served invented stories from lib/data/mockNewsDB with a «premium» cut that any
// caller could lift with an `x-dk-internal: true` header, and linked to the wrong domain.

import { NextRequest, NextResponse } from 'next/server';
import { getNewsArticleBySlug } from '@/lib/repositories/newsRepository';

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const locale = request.nextUrl.searchParams.get('locale') || 'az';
    const article = await getNewsArticleBySlug(slug, locale);

    if (!article) {
      return NextResponse.json(
        {
          success: false,
          error: 'Haber bulunamadı.',
        },
        { status: 404, headers: corsHeaders }
      );
    }

    const responseData = article;

    return NextResponse.json(
      {
        success: true,
        source: 'DK Agency News API',
        data: responseData,
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('News Detail API Hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Haber detayı yüklenirken bir hata oluştu.',
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
