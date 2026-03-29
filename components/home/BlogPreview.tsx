'use client';

import { getAllBlogArticles } from '@/lib/data/blogArticles';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function BlogPreview() {
  const articles = getAllBlogArticles().slice(0, 2);

  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-[var(--dk-border-soft)] pb-8 mb-12">
          <div>
            <h2 className="text-4xl font-serif text-[var(--dk-navy)]">Blog & Analizlər</h2>
            <p className="text-[var(--dk-ink-soft)] mt-2 font-normal">Sektor peşəkarları üçün dərinləməsinə araşdırmalar.</p>
          </div>
          <Link
            href="/blog"
            className="group flex items-center gap-2 bg-white border border-[var(--dk-border-soft)] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[var(--dk-gold)] hover:text-white hover:border-[var(--dk-gold)] transition-all"
          >
            Hamısını Gör <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {articles.map((article) => (
            <Link key={article.id} href={`/blog/${article.slug}`} className="group block">
              <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-[0_20px_40px_-12px_rgba(26,26,46,0.1)] border border-[var(--dk-border-soft)]">
                <img src={article.coverImage} alt={article.coverImageAlt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" referrerPolicy="no-referrer" />
              </div>
              <span className="text-[11px] font-bold text-[var(--dk-red)] uppercase tracking-[0.2em] mb-4 block">{article.categoryEmoji} {article.category}</span>
              <h3 className="text-3xl font-serif text-[var(--dk-navy)] leading-tight group-hover:text-[var(--dk-gold)] transition-colors">
                {article.title}
              </h3>
              <p className="text-[var(--dk-ink-soft)] mt-4 line-clamp-2 font-normal leading-relaxed">{article.summary}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
