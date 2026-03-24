'use client';

import { useParams } from 'next/navigation';
import { getBlogArticleBySlug, getRelatedArticles, CATEGORY_CONFIG } from '@/lib/data/blogArticles';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { Calendar, User, Tag, ChevronLeft, Share2, Bookmark, Clock } from 'lucide-react';
import Link from 'next/link';

function cleanContent(content: string): string {
  return content
    .replace(/[║╔╗╚╝═╠╣╦╩╬┌┐└┘├┤┬┴┼─│]/g, "")
    .replace(/\|\|/g, "")
    .replace(/\| *\| *\|/g, "")
    .replace(/^\s*\|\s*$/gm, "")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const article = getBlogArticleBySlug(slug);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-display font-black text-slate-900 mb-4">Məqalə tapılmadı</h1>
          <Link href="/" className="text-brand-red font-bold hover:underline flex items-center justify-center gap-2">
            <ChevronLeft size={20} /> Ana səhifəyə qayıt
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Hero Image Section */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <img
          src={article.coverImage}
          alt={article.coverImageAlt || article.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-16">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <span className="bg-brand-red text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-red/20">
                {CATEGORY_CONFIG[article.category]?.emoji} {CATEGORY_CONFIG[article.category]?.label}
              </span>
              <h1 className="text-4xl lg:text-6xl font-display font-black text-white leading-tight tracking-tighter">
                {article.title}
              </h1>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid lg:grid-cols-12 gap-16">
          {/* Main Content */}
          <article className="lg:col-span-8">
            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-8 pb-8 border-b border-slate-100 mb-12 text-slate-400 text-xs font-bold uppercase tracking-widest">
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
                {CATEGORY_CONFIG[article.category]?.label}
              </div>
              <div className="ml-auto flex items-center gap-4">
                <button className="hover:text-brand-red transition-colors"><Share2 size={18} /></button>
                <button className="hover:text-brand-red transition-colors"><Bookmark size={18} /></button>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg prose-strong:text-slate-900 prose-blockquote:border-l-4 prose-blockquote:border-brand-red prose-blockquote:bg-slate-50 prose-blockquote:p-6 prose-blockquote:rounded-r-2xl prose-blockquote:italic">
              <ReactMarkdown
                components={{
                  pre: ({children}) => (
                    <pre className="bg-[#F8F8F5] text-[#333] p-6 rounded-2xl overflow-x-auto my-8 text-sm leading-relaxed font-mono border border-[#E5E7EB]">
                      {children}
                    </pre>
                  ),
                  code: ({className, children, ...props}) => {
                    const isBlock = className?.includes("language-");
                    if (isBlock) {
                      return <code className="text-[#333]" {...props}>{children}</code>;
                    }
                    return (
                      <code className="bg-[#FEF3C7] text-[#92700C] px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table: ({children}) => (
                    <div className="overflow-x-auto my-8 rounded-xl border border-[#E5E7EB]">
                      <table className="w-full border-collapse text-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({children}) => (
                    <thead className="bg-[#1A1A2E] text-white">
                      {children}
                    </thead>
                  ),
                  th: ({children}) => (
                    <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  tbody: ({children}) => (
                    <tbody className="divide-y divide-[#E5E7EB]">
                      {children}
                    </tbody>
                  ),
                  tr: ({children}) => (
                    <tr className="hover:bg-[#FAFAF8] transition-colors">
                      {children}
                    </tr>
                  ),
                  td: ({children}) => (
                    <td className="px-5 py-3 text-[#444]">
                      {children}
                    </td>
                  ),
                }}
              >
                {cleanContent(article.content || '')}
              </ReactMarkdown>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12">
            <div className="sticky top-32">
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                <h3 className="text-xl font-display font-black text-slate-900 uppercase tracking-tighter mb-6">Mündəricat</h3>
                <nav className="space-y-4">
                  <a href="#" className="block text-sm font-bold text-brand-red hover:underline">1. P&L Hesabatı nədir?</a>
                  <a href="#" className="block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">2. Nümunə Cədvəl</a>
                  <a href="#" className="block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">3. Niyə vacibdir?</a>
                </nav>
              </div>

              <div className="mt-12 bg-brand-red rounded-3xl p-8 text-white shadow-2xl shadow-brand-red/20">
                <h3 className="text-2xl font-display font-black mb-4 leading-tight">Maliyyə Toolkitini yüklə</h3>
                <p className="text-sm text-white/80 mb-8 leading-relaxed">
                  Restoranınızın gəlir və xərclərini idarə etmək üçün hazır Excel şablonunu əldə edin.
                </p>
                <button className="w-full bg-white text-brand-red py-4 rounded-xl font-black text-sm hover:bg-slate-50 transition-all uppercase tracking-widest">
                  İndi Yüklə
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
