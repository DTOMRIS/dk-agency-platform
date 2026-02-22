// app/api/news/[slug]/route.ts
// Tek haber detayı endpoint'i

import { NextRequest, NextResponse } from 'next/server';
import { getNewsBySlug } from '@/lib/data/mockNewsDB';

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
    const article = getNewsBySlug(slug);

    if (!article) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Haber bulunamadı.',
        },
        { status: 404, headers: corsHeaders }
      );
    }

    // Dış tüketiciler için premium içerik koruması
    const isInternalRequest = request.headers.get('x-dk-internal') === 'true';
    
    const responseData = {
      ...article,
      content: (!isInternalRequest && article.isPremium)
        ? article.content.substring(0, 800) + '...'
        : article.content,
      fullContentUrl: (!isInternalRequest && article.isPremium)
        ? `https://dk-agency.com/haberler/${article.slug}`
        : null,
    };

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
