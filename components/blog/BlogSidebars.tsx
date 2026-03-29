'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Copy, MessageCircle, Send, Linkedin, Check, ChevronRight, Mail, Star } from 'lucide-react';
import { CATEGORY_CONFIG, type BlogArticle } from '@/lib/data/blogArticles';

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
    <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[color:color-mix(in_srgb,var(--dk-surface-dark)_38%,transparent)] p-5 backdrop-blur-sm">
      <div className="mb-1 flex items-center gap-2">
        <Mail className="h-4 w-4 text-[var(--dk-gold)]" />
        <h4 className="text-[15px] font-bold text-[var(--dk-text)]">Həftəlik Bülletin</h4>
      </div>
      <p className="mb-4 text-[12px] text-[var(--dk-muted)]">
        HoReCa trend analizləri birbaşa e-poçtunuza
      </p>
      <form onSubmit={handleSubscribe}>
        <input
          type="email"
          placeholder="E-poçt ünvanınız"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded-xl border border-[color:color-mix(in_srgb,var(--dk-muted)_13%,transparent)] bg-[var(--dk-night)] px-4 py-3 text-sm text-[var(--dk-text)] placeholder:text-[color:color-mix(in_srgb,var(--dk-muted)_38%,transparent)] transition-all focus:border-[var(--dk-gold)] focus:outline-none"
        />
        <button
          type="submit"
          className={`w-full rounded-xl py-3 text-sm font-bold transition-all ${
            subscribed ? 'bg-[var(--dk-success)] text-white' : 'bg-[var(--dk-red)] text-white hover:bg-[var(--dk-red-hover)]'
          }`}
        >
          {subscribed ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" /> Abunə oldunuz!
            </span>
          ) : (
            'Abunə ol'
          )}
        </button>
      </form>
    </div>
  );
}

export function ViewpointWidget({ quote }: { quote: string }) {
  return (
    <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--dk-gold)_13%,transparent)] bg-[color:color-mix(in_srgb,var(--dk-surface-dark)_38%,transparent)] p-5 backdrop-blur-sm">
      <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[var(--dk-gold)]">
        <Star className="h-3 w-3" />
        Viewpoint
      </span>
      <blockquote className="mt-3 text-[15px] italic leading-relaxed text-[var(--dk-text)]">
        {'\u201C'}
        {quote}
        {'\u201D'}
      </blockquote>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--dk-gold)] text-xs font-bold text-[var(--dk-night)]">
          DT
        </div>
        <div>
          <p className="text-[12px] font-semibold text-[var(--dk-text)]">Dogan Tomris</p>
          <p className="text-[11px] text-[var(--dk-muted)]">DK Agency qurucusu</p>
        </div>
      </div>
    </div>
  );
}

export function RelatedArticlesWidget({ articles }: { articles: BlogArticle[] }) {
  return (
    <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[color:color-mix(in_srgb,var(--dk-surface-dark)_38%,transparent)] p-5 backdrop-blur-sm">
      <h4 className="mb-4 flex items-center gap-2 text-[15px] font-bold text-[var(--dk-text)]">
        Bənzər Yazılar
      </h4>
      <div className="space-y-3">
        {articles.slice(0, 3).map((article) => (
          <Link
            key={article.id}
            href={`/haberler/${article.slug}`}
            className="group -mx-2 flex gap-3 rounded-xl p-2 transition-colors hover:bg-[color:color-mix(in_srgb,var(--dk-gold)_3%,transparent)]"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[color:color-mix(in_srgb,var(--dk-gold)_19%,transparent)] bg-[color:color-mix(in_srgb,var(--dk-gold)_8%,transparent)]">
              <span className="text-xl">{CATEGORY_CONFIG[article.category]?.emoji || '📝'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="line-clamp-2 text-[13px] font-semibold leading-tight text-[var(--dk-body)] transition-colors group-hover:text-[var(--dk-gold)]">
                {article.title}
              </h5>
              <p className="mt-1 text-[11px] text-[var(--dk-muted)]">{article.readingTime} dəq oxu</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

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
    <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[color:color-mix(in_srgb,var(--dk-surface-dark)_38%,transparent)] p-5 backdrop-blur-sm">
      <h4 className="mb-4 text-[12px] font-bold uppercase tracking-widest text-[var(--dk-muted)]">PAYLAŞ</h4>
      <div className="space-y-2">
        <button
          onClick={handleCopy}
          className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium transition-all ${
            copied
              ? 'bg-[var(--dk-success)] text-white'
              : 'border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[color:color-mix(in_srgb,var(--dk-night)_38%,transparent)] text-[var(--dk-body)] hover:border-[color:color-mix(in_srgb,var(--dk-gold)_25%,transparent)] hover:text-[var(--dk-gold)]'
          }`}
          title="Link kopyala"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? 'Kopyalandı!' : 'Kopyala'}</span>
        </button>
        <a
          href={shareLinks.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[color:color-mix(in_srgb,var(--dk-night)_38%,transparent)] py-2.5 text-[13px] font-medium text-[var(--dk-body)] transition-all hover:border-transparent hover:bg-[var(--dk-social-whatsapp)] hover:text-white"
          title="WhatsApp"
        >
          <MessageCircle className="h-4 w-4" />
          <span>WhatsApp</span>
        </a>
        <a
          href={shareLinks.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[color:color-mix(in_srgb,var(--dk-night)_38%,transparent)] py-2.5 text-[13px] font-medium text-[var(--dk-body)] transition-all hover:border-transparent hover:bg-[var(--dk-social-telegram)] hover:text-white"
          title="Telegram"
        >
          <Send className="h-4 w-4" />
          <span>Telegram</span>
        </a>
        <a
          href={shareLinks.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[color:color-mix(in_srgb,var(--dk-night)_38%,transparent)] py-2.5 text-[13px] font-medium text-[var(--dk-body)] transition-all hover:border-transparent hover:bg-[var(--dk-social-linkedin)] hover:text-white"
          title="LinkedIn"
        >
          <Linkedin className="h-4 w-4" />
          <span>LinkedIn</span>
        </a>
      </div>
    </div>
  );
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: { content: string }) {
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
    <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[color:color-mix(in_srgb,var(--dk-surface-dark)_38%,transparent)] p-5 backdrop-blur-sm">
      <h4 className="mb-4 text-[12px] font-bold uppercase tracking-widest text-[var(--dk-muted)]">İÇİNDƏKİLƏR</h4>
      <nav className="space-y-1">
        {headings.slice(0, 6).map((heading, index) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            className={`group flex items-start gap-2.5 rounded-lg px-2 py-2 text-[13px] leading-snug text-[var(--dk-muted)] transition-all hover:bg-[color:color-mix(in_srgb,var(--dk-gold)_3%,transparent)] hover:text-[var(--dk-gold)] ${
              heading.level === 3 ? 'pl-4 text-[12px]' : 'font-medium'
            }`}
          >
            <span className="mt-0.5 font-mono text-[11px] text-[color:color-mix(in_srgb,var(--dk-gold)_38%,transparent)] group-hover:text-[var(--dk-gold)]">{index + 1}</span>
            <span className="line-clamp-2">{heading.text}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}

export function AuthorCard({ author }: { author: string }) {
  return (
    <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[var(--dk-surface-dark)] p-6">
      <div className="flex items-start gap-5">
        <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-[var(--dk-gold)] text-xl font-bold text-[var(--dk-night)]">
          DT
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-[var(--dk-text)]">{author}</h4>
          <p className="mt-1 text-sm text-[var(--dk-muted)]">
            DK Agency qurucusu, 15+ il HoReCa sektoru təcrübəsi. Azərbaycanda 50+ restoran və otel layihəsinin konsultantı.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Link
              href="/haqqimizda"
              className="flex items-center gap-1 text-sm font-medium text-[var(--dk-gold)] hover:text-[var(--dk-gold-hover)]"
            >
              Haqqında <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToolkitCTA() {
  return (
    <div className="rounded-2xl border border-[color:color-mix(in_srgb,var(--dk-gold)_19%,transparent)] bg-[var(--dk-surface-dark)] p-6 text-center md:p-8">
      <span className="text-sm font-bold uppercase tracking-wider text-[var(--dk-gold)]">DK Agency Toolkit</span>
      <h3 className="mt-3 mb-3 text-xl font-bold text-[var(--dk-text)] md:text-2xl">Bu mövzunu praktikaya çevir</h3>
      <p className="mx-auto mb-6 max-w-md text-sm text-[var(--dk-muted)]">
        Food Cost kalkulyatoru, P&L şablonu, ROI hesablayıcı və digər professional alətlər
      </p>
      <Link
        href="/b2b-panel/toolkit"
        className="inline-flex items-center gap-2 rounded-xl bg-[var(--dk-gold)] px-6 py-3 font-bold text-[var(--dk-night)] transition-all hover:bg-[var(--dk-gold-hover)]"
      >
        Pulsuz Toolkit-ə keç
      </Link>
    </div>
  );
}

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
    <div className="safe-area-inset-bottom fixed right-0 bottom-0 left-0 z-40 flex items-center justify-center gap-3 border-t border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[var(--dk-navy)] p-3 lg:hidden">
      <span className="mr-2 text-xs text-[var(--dk-muted)]">Paylaş:</span>
      <button
        onClick={handleCopy}
        className={`rounded-lg p-2 transition-all ${
          copied ? 'bg-[var(--dk-success)] text-white' : 'border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[var(--dk-surface-dark)] text-[var(--dk-body)]'
        }`}
      >
        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
      </button>
      <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[var(--dk-social-whatsapp)] p-2 text-white">
        <MessageCircle className="h-5 w-5" />
      </a>
      <a href={shareLinks.telegram} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[var(--dk-social-telegram)] p-2 text-white">
        <Send className="h-5 w-5" />
      </a>
      <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[var(--dk-social-linkedin)] p-2 text-white">
        <Linkedin className="h-5 w-5" />
      </a>
    </div>
  );
}
