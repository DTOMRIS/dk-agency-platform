'use client';

import { useParams } from 'next/navigation';
import { getBlogArticleBySlug, getRelatedArticles, CATEGORY_CONFIG } from '@/lib/data/blogArticles';
import { MarkdownRenderer } from '@/components/blog';
import { motion } from 'framer-motion';
import { Calendar, User, Tag, ChevronLeft, Share2, Bookmark, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-display font-black text-slate-900 mb-4">Məqalə tapılmadı</h1>
          <Link href="/blog" className="text-brand-red font-bold hover:underline flex items-center justify-center gap-2">
            <ChevronLeft size={20} /> Bloga qayıt
          </Link>
        </div>
      </div>
    );
  }

  const cat = CATEGORY_CONFIG[article.category];
  const related = getRelatedArticles(slug);

  return (
    <div className="bg-[#FAFAF8] min-h-screen pb-20">
      {/* Hero Image Section */}
      <div className="relative w-full h-[420px] overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.coverImageAlt || article.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Back button */}
        <Link href="/blog" className="absolute top-6 left-6 z-10 flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors">
          <ChevronLeft size={18} /> Bloga qayıt
        </Link>

        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="bg-brand-red text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-red/20">
                {cat?.emoji} {cat?.label}
              </span>
              <h1 className="text-3xl lg:text-5xl font-display font-black text-white leading-tight tracking-tighter">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="text-lg text-white/70 max-w-2xl">{article.subtitle}</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <article className="lg:col-span-8">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 pb-8 border-b border-slate-200 mb-10 text-slate-400 text-xs font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <User size={16} className="text-brand-red" />
                {article.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-brand-red" />
                {new Date(article.publishDate).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-brand-red" />
                {article.readingTime} dəq oxu
              </div>
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-brand-red" />
                {cat?.label}
              </div>
              <div className="ml-auto flex items-center gap-4">
                <button className="hover:text-brand-red transition-colors"><Share2 size={18} /></button>
                <button className="hover:text-brand-red transition-colors"><Bookmark size={18} /></button>
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {article.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Rich Markdown Content via MarkdownRenderer */}
            <MarkdownRenderer content={article.content || ''} />
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="sticky top-32 space-y-8">
              {/* Article Summary */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Xülasə</h3>
                <p className="text-slate-700 text-sm leading-relaxed">{article.summary}</p>
              </div>

              {/* Related Articles */}
              {related.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Əlaqəli Yazılar</h3>
                  <div className="space-y-4">
                    {related.map(rel => (
                      <Link key={rel.slug} href={`/blog/${rel.slug}`} className="group block">
                        <div className="flex items-start gap-3">
                          <div className="text-lg flex-shrink-0">{CATEGORY_CONFIG[rel.category]?.emoji}</div>
                          <div>
                            <h4 className="text-sm font-semibold text-slate-900 group-hover:text-brand-red transition-colors leading-snug">
                              {rel.title}
                            </h4>
                            <p className="text-xs text-slate-400 mt-1">{rel.readingTime} dəq oxu</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="bg-brand-red rounded-2xl p-8 text-white shadow-2xl shadow-brand-red/20">
                <h3 className="text-xl font-display font-black mb-3 leading-tight">Pulsuz Toolkit</h3>
                <p className="text-sm text-white/80 mb-6 leading-relaxed">
                  Food cost, P&L, menyu matrisi — pulsuz alətlərlə restoranını optimallaşdır.
                </p>
                <Link href="/toolkit" className="flex items-center justify-center gap-2 w-full bg-white text-brand-red py-3 rounded-xl font-black text-sm hover:bg-slate-50 transition-all uppercase tracking-widest">
                  Alətlərə bax <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
