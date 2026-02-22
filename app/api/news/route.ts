// app/api/news/route.ts
// DK Agency Haber Verici İstasyonu - TQTA ve diğer alt siteler bu endpoint'ten veri çeker

import { NextRequest, NextResponse } from 'next/server';
import { getAllNews, getNewsByCategory, getPublicNews, NewsArticle } from '@/lib/data/mockNewsDB';

// CORS Headers - TQTA ve diğer alt sitelerin erişimi için
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Production'da TQTA domain'i ile sınırlandırılacak
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400', // 24 saat cache
};

// OPTIONS request handler (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// GET - Haberleri dışarıya servis et
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parametreleri
    const category = searchParams.get('category') as NewsArticle['category'] | null;
    const publicOnly = searchParams.get('public') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let news: NewsArticle[];

    // Filtreleme
    if (publicOnly) {
      news = getPublicNews();
    } else if (category) {
      news = getNewsByCategory(category);
    } else {
      news = getAllNews();
    }

    // Pagination
    const total = news.length;
    const paginatedNews = news.slice(offset, offset + limit);

    // Dış tüketiciler için içerik kısaltma (premium koruması)
    const sanitizedNews = paginatedNews.map((article) => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      // Premium içerikler için sadece ilk 800 karakter
      content: article.isPremium 
        ? article.content.substring(0, 800) + '...' 
        : article.content,
      category: article.category,
      author: article.author,
      publishDate: article.publishDate,
      tags: article.tags,
      isPremium: article.isPremium,
      // Tam içerik için DK Agency'ye yönlendirme linki
      fullContentUrl: article.isPremium 
        ? `https://dk-agency.com/haberler/${article.slug}` 
        : null,
    }));

    return NextResponse.json(
      {
        success: true,
        source: 'DK Agency News API',
        timestamp: new Date().toISOString(),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total,
        },
        data: sanitizedNews,
      },
      { headers: corsHeaders }
    );

  } catch (error) {
    console.error('News API Hatası:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Haberler yüklenirken bir hata oluştu.',
        details: String(error),
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
