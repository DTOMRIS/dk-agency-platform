'use client';

import { useLocale, useTranslations } from 'next-intl';
import { MessageCircle, Send, Sparkles } from 'lucide-react';

type ContactChannel = 'kazan' | 'whatsapp' | 'telegram';

const TELEGRAM_URL = 'https://t.me/dkagency';

function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function ContactFunnel() {
  const t = useTranslations('contact.funnel');
  const locale = useLocale();

  const track = (channel: ContactChannel) => {
    fetch('/api/leads/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source: 'contact_page', channel, locale }),
      keepalive: true,
    }).catch(() => {
      // Lead tracking must not block the contact action.
    });
  };

  const whatsappUrl = `/api/leads/whatsapp?text=${encodeURIComponent(t('whatsapp.preFill'))}`;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <button
        type="button"
        onClick={() => {
          track('kazan');
          window.dispatchEvent(
            new CustomEvent('kazan:open', {
              detail: { context: 'contact_page' },
            }),
          );
        }}
        className="group relative flex min-h-[220px] flex-col justify-between rounded-2xl border-2 border-[var(--dk-navy)] bg-[var(--dk-navy)] p-5 text-left text-white shadow-xl shadow-[var(--dk-navy)]/10 transition hover:-translate-y-0.5 hover:shadow-2xl"
      >
        <span className="absolute -top-2 right-4 rounded-full bg-[var(--dk-gold)] px-3 py-1 text-xs font-black text-[var(--dk-navy)]">
          {t('kazan.badge')}
        </span>
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[var(--dk-navy)]">
          <Sparkles size={24} />
        </span>
        <span>
          <span className="block text-xl font-black">{t('kazan.title')}</span>
          <span className="mt-3 block text-sm leading-6 text-white/75">{t('kazan.description')}</span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          track('whatsapp');
          openExternal(whatsappUrl);
        }}
        className="group flex min-h-[220px] flex-col justify-between rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xl"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
          <MessageCircle size={24} />
        </span>
        <span>
          <span className="block text-xl font-black text-slate-900">{t('whatsapp.title')}</span>
          <span className="mt-3 block text-sm leading-6 text-slate-600">{t('whatsapp.description')}</span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          track('telegram');
          openExternal(TELEGRAM_URL);
        }}
        className="group flex min-h-[220px] flex-col justify-between rounded-2xl border border-sky-200 bg-sky-50 p-5 text-left transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-xl"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-sky-600 shadow-sm">
          <Send size={24} />
        </span>
        <span>
          <span className="block text-xl font-black text-slate-900">{t('telegram.title')}</span>
          <span className="mt-3 block text-sm leading-6 text-slate-600">{t('telegram.description')}</span>
        </span>
      </button>
    </div>
  );
}
