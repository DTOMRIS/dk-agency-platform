'use client';

import { useState } from 'react';
import { Copy, Check, MessageCircle, Send, Facebook, Linkedin } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url: string;
  locale?: string;
}

const COPY_LABEL: Record<string, string> = {
  az: 'Link kopyalandı',
  tr: 'Link kopyalandı',
  en: 'Link copied',
  ru: 'Ссылка скопирована',
};

const SHARE_LABEL = 'Paylaş';

export function ShareButtons({ title, url, locale = 'az' }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const copyLabel = COPY_LABEL[locale] ?? COPY_LABEL.az;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">
        {SHARE_LABEL}
      </span>

      <a
        href={`https://wa.me/?text=${encodedTitle}+${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-transparent hover:bg-[#25D366] hover:text-white"
      >
        <MessageCircle className="h-4 w-4" />
      </a>

      <a
        href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Telegram"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-transparent hover:bg-[#229ED9] hover:text-white"
      >
        <Send className="h-4 w-4" />
      </a>

      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-transparent hover:bg-[#0A66C2] hover:text-white"
      >
        <Linkedin className="h-4 w-4" />
      </a>

      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
        className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-transparent hover:bg-[#1877F2] hover:text-white"
      >
        <Facebook className="h-4 w-4" />
      </a>

      <button
        type="button"
        onClick={() => void handleCopy()}
        aria-label={copied ? copyLabel : 'Link kopyala'}
        className={`flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition ${
          copied
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? copyLabel : 'Kopyala'}</span>
      </button>
    </div>
  );
}
