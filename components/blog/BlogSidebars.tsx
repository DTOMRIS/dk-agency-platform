// components/blog/BlogSidebars.tsx
// DK Agency Blog — Sidebar Components (Dark Theme)
// Gold + Navy premium dizayn
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, MessageCircle, Send, Linkedin, Check, ChevronRight, Mail, Star } from 'lucide-react';
import type { BlogArticle } from '@/lib/data/blogArticles';

// ═══════════════════════════════════════════════════════════════
// NEWSLETTER WIDGET
// ═══════════════════════════════════════════════════════════════
export function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 3000);
      setEmail('');
    }
  };

  return (
    <div className="bg-[#16213E60] backdrop-blur-sm rounded-2xl p-5 border border-[#8892B015]">
      <div className="flex items-center gap-2 mb-1">
        <Mail className="w-4 h-4 text-[#C5A022]" />
        <h4 className="font-bold text-[15px] text-[#EAEAEA]">Həftəlik Bülletin</h4>
      </div>
      <p className="text-[12px] text-[#8892B0] mb-4">
        HoReCa trend analizləri birbaşa e-poçtunuza
      </p>
      <form onSubmit={handleSubscribe}>
        <input 
          type="email" 
          placeholder="E-poçt ünvanınız" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#0A0A1A] border border-[#8892B020] rounded-xl px-4 py-3 text-sm text-[#EAEAEA] mb-3 placeholder:text-[#8892B060] focus:outline-none focus:border-[#C5A022] transition-all" 
        />
        <button 
          type="submit"
          className={`w-full font-bold text-sm py-3 rounded-xl transition-all ${
            subscribed 
              ? 'bg-[#2ECC71] text-white' 
              : 'bg-[#E94560] text-white hover:bg-[#FF5A75]'
          }`}
        >
          {subscribed ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> Abunə oldunuz!
            </span>
          ) : (
            'Abunə ol'
          )}
        </button>
      </form>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DOĞAN VIEWPOINT WIDGET
// ═══════════════════════════════════════════════════════════════
export function ViewpointWidget({ quote }: { quote: string }) {
  return (
    <div className="bg-[#16213E60] backdrop-blur-sm rounded-2xl p-5 border border-[#C5A02220]">
      <span className="text-[11px] font-bold text-[#C5A022] uppercase tracking-wider flex items-center gap-1">
        <Star className="w-3 h-3" />
        Viewpoint
      </span>
      <blockquote className="mt-3 text-[15px] leading-relaxed italic text-[#EAEAEA]">
        "{quote}"
      </blockquote>
      <div className="mt-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#C5A022] flex items-center justify-center text-[#0A0A1A] text-xs font-bold">
          DT
        </div>
        <div>
          <p className="text-[12px] font-semibold text-[#EAEAEA]">Doğan Tomris</p>
          <p className="text-[11px] text-[#8892B0]">DK Agency qurucusu</p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// RELATED ARTICLES WIDGET
// ═══════════════════════════════════════════════════════════════
export function RelatedArticlesWidget({ articles }: { articles: BlogArticle[] }) {
  const CATEGORY_EMOJIS: Record<string, string> = {
    maliyye: '💰',
    kadr: '👥',
    emeliyyat: '⚙️',
    konsept: '💡',
    acilis: '🚀',
    satis: '📈',
  };

  return (
    <div className="bg-[#16213E60] backdrop-blur-sm rounded-2xl p-5 border border-[#8892B015]">
      <h4 className="font-bold text-[15px] text-[#EAEAEA] mb-4 flex items-center gap-2">
        📰 Bənzər Yazılar
      </h4>
      <div className="space-y-3">
        {articles.slice(0, 3).map(article => (
          <Link 
            key={article.id}
            href={`/haberler/${article.slug}`}
            className="flex gap-3 p-2 -mx-2 rounded-xl hover:bg-[#C5A02208] transition-colors group"
          >
            {/* Thumbnail placeholder */}
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#C5A02215] border border-[#C5A02230] flex items-center justify-center">
              <span className="text-xl">{CATEGORY_EMOJIS[article.category] || '📝'}</span>
            </div>
            
            {/* Text */}
            <div className="flex-1 min-w-0">
              <h5 className="text-[13px] font-semibold leading-tight text-[#B0B8C8] line-clamp-2 group-hover:text-[#C5A022] transition-colors">
                {article.title}
              </h5>
              <p className="text-[11px] text-[#8892B0] mt-1">
                {article.readingTime} dəq oxu
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHARE BUTTONS (LEFT SIDEBAR)
// ═══════════════════════════════════════════════════════════════
interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  return (
    <div className="bg-[#16213E60] backdrop-blur-sm rounded-2xl border border-[#8892B015] p-5">
      <h4 className="text-[12px] font-bold text-[#8892B0] uppercase tracking-widest mb-4">PAYLAŞ</h4>
      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium transition-all ${
            copied 
              ? 'bg-[#2ECC71] text-white' 
              : 'bg-[#0A0A1A60] border border-[#8892B015] text-[#B0B8C8] hover:border-[#C5A02240] hover:text-[#C5A022]'
          }`}
          title="Link kopyala"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
        </button>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium bg-[#0A0A1A60] border border-[#8892B015] text-[#B0B8C8] hover:bg-[#25D366] hover:text-white hover:border-transparent transition-all"
          title="WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
          <span>WhatsApp</span>
        </a>
        <a
          href={shareLinks.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium bg-[#0A0A1A60] border border-[#8892B015] text-[#B0B8C8] hover:bg-[#0088cc] hover:text-white hover:border-transparent transition-all"
          title="Telegram"
        >
          <Send className="w-4 h-4" />
          <span>Telegram</span>
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-medium bg-[#0A0A1A60] border border-[#8892B015] text-[#B0B8C8] hover:bg-[#0A66C2] hover:text-white hover:border-transparent transition-all"
          title="LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TABLE OF CONTENTS (LEFT SIDEBAR)
// ═══════════════════════════════════════════════════════════════
interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
  // Extract headings from markdown content
  const headings: TOCItem[] = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);
    
    if (h2Match) {
      headings.push({
        id: `heading-${index}`,
        text: h2Match[1].replace(/\*\*/g, ''),
        level: 2,
      });
    } else if (h3Match) {
      headings.push({
        id: `heading-${index}`,
        text: h3Match[1].replace(/\*\*/g, ''),
        level: 3,
      });
    }
  });

  if (headings.length === 0) return null;

  return (
    <div className="bg-[#16213E60] backdrop-blur-sm rounded-2xl border border-[#8892B015] p-5">
      <h4 className="text-[12px] font-bold text-[#8892B0] uppercase tracking-widest mb-4">İÇİNDƏKİLƏR</h4>
      <nav className="space-y-1">
        {headings.slice(0, 6).map((heading, index) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`flex items-start gap-2.5 py-2 px-2 rounded-lg text-[13px] leading-snug text-[#8892B0] hover:text-[#C5A022] hover:bg-[#C5A02208] transition-all group ${
              heading.level === 3 ? 'pl-4 text-[12px]' : 'font-medium'
            }`}
          >
            <span className="text-[#C5A02260] font-mono text-[11px] mt-0.5 group-hover:text-[#C5A022]">{index + 1}</span>
            <span className="line-clamp-2">{heading.text}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AUTHOR CARD (BOTTOM OF ARTICLE)
// ═══════════════════════════════════════════════════════════════
export function AuthorCard({ author }: { author: string }) {
  return (
    <div className="bg-[#16213E] rounded-2xl p-6 border border-[#8892B015]">
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-full bg-[#C5A022] flex items-center justify-center text-[#0A0A1A] text-xl font-bold flex-shrink-0">
          DT
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-lg text-[#EAEAEA]">{author}</h4>
          <p className="text-sm text-[#8892B0] mt-1">
            DK Agency qurucusu, 15+ il HoReCa sektoru təcrübəsi. 
            Azərbaycanda 50+ restoran və otel layihəsinin konsultantı.
          </p>
          <div className="flex items-center gap-3 mt-3">
            <Link 
              href="/about"
              className="text-sm text-[#C5A022] hover:text-[#D4AF37] font-medium flex items-center gap-1"
            >
              Haqqında <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TOOLKIT CTA (BOTTOM OF ARTICLE)
// ═══════════════════════════════════════════════════════════════
export function ToolkitCTA() {
  return (
    <div className="bg-[#16213E] rounded-2xl p-6 md:p-8 text-center border border-[#C5A02230]">
      <span className="text-[#C5A022] text-sm font-bold tracking-wider uppercase">
        DK Agency Toolkit
      </span>
      <h3 className="text-xl md:text-2xl font-bold text-[#EAEAEA] mt-3 mb-3">
        Bu mövzunu praktikaya çevir
      </h3>
      <p className="text-[#8892B0] text-sm mb-6 max-w-md mx-auto">
        Food Cost kalkulyatoru, P&L şablonu, ROI hesablayıcı və digər professional alətlər
      </p>
      <Link
        href="/b2b-panel/toolkit"
        className="inline-flex items-center gap-2 bg-[#C5A022] hover:bg-[#D4AF37] text-[#0A0A1A] px-6 py-3 rounded-xl font-bold transition-all"
      >
        🧰 Pulsuz Toolkit-ə keç
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MOBILE SHARE BAR (FIXED BOTTOM)
// ═══════════════════════════════════════════════════════════════
export function MobileShareBar({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1A1A2E] border-t border-[#8892B015] p-3 flex items-center justify-center gap-3 lg:hidden z-40 safe-area-inset-bottom">
      <span className="text-xs text-[#8892B0] mr-2">Paylaş:</span>
      <button
        onClick={handleCopy}
        className={`p-2 rounded-lg transition-all ${
          copied ? 'bg-[#2ECC71] text-white' : 'bg-[#16213E] text-[#B0B8C8] border border-[#8892B015]'
        }`}
      >
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
      </button>
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-[#25D366] text-white"
      >
        <MessageCircle className="w-5 h-5" />
      </a>
      <a
        href={shareLinks.telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-[#0088cc] text-white"
      >
        <Send className="w-5 h-5" />
      </a>
      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg bg-[#0A66C2] text-white"
      >
        <Linkedin className="w-5 h-5" />
      </a>
    </div>
  );
}
