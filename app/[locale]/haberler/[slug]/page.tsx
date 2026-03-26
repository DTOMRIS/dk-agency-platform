// app/haberler/[slug]/page.tsx
// DK Agency Blog Detay Səhifəsi - 3 sütunlu premium layout
// foodinlife.com + thecaterer.com ilhamı

import { notFound } from 'next/navigation';
import { getBlogArticleBySlug, getAllBlogArticles, CATEGORY_CONFIG as BLOG_CATEGORY, type BlogArticle } from '@/lib/data/blogArticles';
import { getGuruByName } from '@/lib/data/guruDatabase';
import Link from 'next/link';
import { ArrowLeft, Clock, Newspaper, ChevronRight, BookOpen, Calendar, Zap } from 'lucide-react';
import { MarkdownRenderer } from '@/components/blog';
import DoganNote from '@/components/blog/DoganNote';
import MikroCTA, { MainCTA } from '@/components/blog/MikroCTA';
import { ReadingTime } from '@/components/blog/BlogElements';
import BlogContentWrapper from '@/components/news/BlogContentWrapper';
import {
  NewsletterWidget,
  ViewpointWidget,
  RelatedArticlesWidget,
  ShareButtons,
  TableOfContents,
  AuthorCard,
  ToolkitCTA,
  MobileShareBar,
} from '@/components/blog/BlogSidebars';

// Static params for SSG
export async function generateStaticParams() {
  const articles = getAllBlogArticles();
  return articles.map((article: BlogArticle) => ({
    slug: article.slug,
  }));
}

// Metadata generation
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);
  
  if (!article) {
    return { title: 'Bloq Yazısı Tapılmadı - DK Agency' };
  }

  return {
    title: `${article.title} - DK Agency Blog`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: article.publishDate,
    },
  };
}

// Use BLOG_CATEGORY from blogArticles (proper UTF-8), map color to Tailwind
const COLOR_MAP: Record<string, string> = {
  green: 'bg-emerald-600', blue: 'bg-blue-600', purple: 'bg-purple-600',
  pink: 'bg-pink-600', orange: 'bg-orange-600', cyan: 'bg-cyan-600',
};
const CATEGORY_CONFIG = Object.fromEntries(
  Object.entries(BLOG_CATEGORY).map(([k, v]) => [
    k,
    { ...v, color: COLOR_MAP[v.color] || 'bg-slate-600' },
  ])
) as Record<string, { label: string; emoji: string; color: string }>;


// Dogan viewpoint quotes by category
const VIEWPOINT_QUOTES: Record<string, string> = {
  maliyye: 'Hesabları bilmədən mənfəət idarə edilmir. Əvvəlcə ölçün, sonra qərar verin.',
  kadr: 'İnsanlar sistemə deyil, liderə bağlıdır. Əvvəlcə mədəniyyət qur, sonra iş axınını izah et.',
  emeliyyat: 'Standart olmadan keyfiyyət olmur. Əvvəlcə prosedur yaz, sonra hər kəsi öyrət.',
  konsept: 'Konseptiniz tarixçənizdir. İnsanlar yeməkdən əvvəl hekayənizi alırlar.',
  acilis: 'Açılış günü deyil, həftəsidir. Hər şey plana uyğun deyil, buna hazır ol.',
  satis: 'Upsell gülüşlə başlayır. Xidmət etsən, satış özü gəlir.',
};

interface BlogDetayProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetay({ params }: BlogDetayProps) {
  const { slug } = await params;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return (
      <main className="bg-white min-h-screen">
        <div className="bg-white px-4 py-4 border-b border-slate-200">
          <Link href="/haberler" className="flex items-center gap-2 text-sm text-slate-600 hover:text-amber-600 transition-colors">
            <ArrowLeft size={16} /> Geri
          </Link>
        </div>
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
            <Newspaper size={32} className="text-slate-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Bloq yazısı tapılmadı</h2>
          <p className="mt-2 text-slate-500">Bu məzmun silinmiş və ya köçürülmüş ola bilər.</p>
        </div>
      </main>
    );
  }

  // Tarih formatlama
  const publishDate = new Date(article.publishDate).toLocaleDateString('az-AZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const categoryConfig = CATEGORY_CONFIG[article.category] || { label: article.category, emoji: '📝', color: 'bg-slate-600' };
  
  // Get related articles for sidebar
  const relatedArticles = getAllBlogArticles()
    .filter((a: BlogArticle) => a.category === article.category && a.slug !== article.slug)
    .slice(0, 3);

  // Get all related articles for bottom section
  const allRelatedArticles = getAllBlogArticles()
    .filter((a: BlogArticle) => a.slug !== article.slug)
    .slice(0, 3);

  // Article URL for sharing
  const articleUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/haberler/${slug}`
    : `https://dkagency.az/haberler/${slug}`;

  return (
    <BlogContentWrapper articleTitle={article.title}>
      <main className="bg-slate-50 min-h-screen pb-20 lg:pb-0">
        {/* Section */}
        {/* Section */}
        {/* Section */}
        <div className="bg-slate-900 border-b-4 border-amber-500">
          <div className="px-4 py-3">
            <div className="mx-auto max-w-7xl flex items-center justify-between">
              <Link href="/haberler" className="inline-flex items-center gap-2">
                <div className="bg-amber-500 p-1.5 rounded">
                  <Zap className="w-4 h-4 text-slate-900" />
                </div>
                <span className="text-sm font-bold text-white">SEKTOR <span className="text-amber-400">NABZI</span></span>
              </Link>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 hidden sm:block">{publishDate}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readingTime} dəq
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section */}
        {/* Section */}
        {/* Section */}
        <header className="bg-white border-b border-slate-200">
          <div className="px-4 py-8 md:py-12">
            <div className="mx-auto max-w-4xl">
        {/* Section */}
              <div className="mb-6 flex items-center justify-between">
                <Link href="/haberler" className="flex items-center gap-2 text-sm text-slate-500 hover:text-amber-600 transition-colors">
                  <ArrowLeft size={16} /> Bütün yazılar
                </Link>
                <ReadingTime wordCount={article.wordCount} />
              </div>

        {/* Section */}
              <div className="mb-4 flex items-center gap-3">
                <span className={`${categoryConfig.color} rounded-lg px-3 py-1.5 text-xs font-bold text-white flex items-center gap-1.5 shadow-sm`}>
                  <span>{categoryConfig.emoji}</span>
                  {categoryConfig.label}
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 text-sm font-medium">
                  {article.readingTime} dəq oxuma
                </span>
              </div>

        {/* Section */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] text-slate-900 max-w-3xl">
                {article.title}
              </h1>

        {/* Section */}
              <p className="mt-5 text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl">
                {article.summary}
              </p>

        {/* Section */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-lg">
                    DT
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{article.author}</p>
                    <p className="text-sm text-slate-500">DK Agency qurucusu</p>
                  </div>
                </div>
                <span className="text-slate-300 hidden sm:block">|</span>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <Calendar size={14} />
                  <span>{publishDate}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Section */}
        {/* Section */}
        {/* Section */}
        {article.coverImage && (
          <div className="bg-white pb-8">
            <div className="mx-auto max-w-5xl px-4">
              <figure className="rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src={article.coverImage} 
                  alt={article.coverImageAlt || article.title}
                  className="w-full h-auto object-cover"
                />
                {article.coverImageAlt && (
                  <figcaption className="bg-slate-50 text-center text-sm text-slate-500 py-3 px-4">
                    {article.coverImageAlt}
                  </figcaption>
                )}
              </figure>
            </div>
          </div>
        )}

        {/* Section */}
        {/* Section */}
        {/* Section */}
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_300px] xl:grid-cols-[220px_1fr_320px] gap-6 lg:gap-8">
            
            {/* Sidebar */}
        {/* Section */}
        {/* Section */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-4">
                <ShareButtons title={article.title} url={`https://dkagency.az/haberler/${slug}`} />
                <TableOfContents content={article.content} />
              </div>
            </aside>

            {/* Main content */}
        {/* Section */}
        {/* Section */}
            <article className="min-w-0">
        {/* Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10">
                <MarkdownRenderer content={article.content} />
              </div>

        {/* Section */}
              <div className="mt-8">
                <DoganNote variant="insight">
                  {VIEWPOINT_QUOTES[article.category] || VIEWPOINT_QUOTES.maliyye}
                </DoganNote>
              </div>

        {/* Section */}
              <div className="mt-8">
                <MikroCTA 
                  type={article.category === 'maliyye' ? 'calculator' : 'consultation'}
                  text={article.category === 'maliyye' 
                    ? 'Food Cost hesablayıcımızla dərhal öz rəqəmlərinizi tapın' 
                    : 'Bu mövzuda pulsuz konsultasiya almaq istəyirsiniz?'
                  }
                  href={article.category === 'maliyye' ? '/b2b-panel/toolkit' : '/elaqe'}
                />
              </div>

        {/* Section */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <h4 className="text-sm font-medium text-slate-500 mb-3">Etiketlər:</h4>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string) => (
                    <Link 
                      key={tag} 
                      href={`/haberler?tag=${encodeURIComponent(tag)}`}
                      className="bg-slate-100 hover:bg-amber-100 hover:text-amber-700 text-slate-600 px-4 py-2 rounded-full text-sm transition-colors"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>

        {/* Section */}
              <div className="mt-10">
                <AuthorCard author={article.author} />
              </div>

        {/* Section */}
              <div className="mt-10">
                <ToolkitCTA />
              </div>

        {/* Section */}
              <div className="mt-12">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <BookOpen size={20} className="text-amber-500" />
                  Oxşar Yazılar
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allRelatedArticles.map((relatedArticle: BlogArticle) => (
                    <Link 
                      key={relatedArticle.slug}
                      href={`/haberler/${relatedArticle.slug}`}
                      className="group block"
                    >
                      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white hover:border-amber-300 hover:shadow-lg transition-all">
        {/* Section */}
                        <div className="aspect-[16/10] bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                          <span className="text-4xl opacity-60">
                            {CATEGORY_CONFIG[relatedArticle.category]?.emoji || '📝'}
                          </span>
                        </div>
        {/* Section */}
                        <div className="p-4">
                          <span className={`${CATEGORY_CONFIG[relatedArticle.category]?.color || 'bg-slate-500'} text-white text-[10px] font-bold px-2 py-1 rounded`}>
                            {CATEGORY_CONFIG[relatedArticle.category]?.label || relatedArticle.category}
                          </span>
                          <h4 className="mt-2 font-semibold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-2 text-[15px]">
                            {relatedArticle.title}
                          </h4>
                          <p className="mt-2 text-xs text-slate-500 line-clamp-2">
                            {relatedArticle.summary}
                          </p>
                          <p className="mt-3 text-xs text-slate-400">
                            {relatedArticle.readingTime} dəq oxu
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </article>

            {/* Sidebar */}
        {/* Section */}
        {/* Section */}
            <aside className="space-y-6">
              <div className="lg:sticky lg:top-24 space-y-6">
        {/* Section */}
                {relatedArticles.length > 0 && (
                  <RelatedArticlesWidget articles={relatedArticles} />
                )}

        {/* Section */}
                <ViewpointWidget quote={VIEWPOINT_QUOTES[article.category] || VIEWPOINT_QUOTES.maliyye} />

        {/* Section */}
                <NewsletterWidget />
              </div>
            </aside>
          </div>
        </div>

        {/* Section */}
        <MobileShareBar title={article.title} url={`https://dkagency.az/haberler/${slug}`} />
      </main>
    </BlogContentWrapper>
  );
}




