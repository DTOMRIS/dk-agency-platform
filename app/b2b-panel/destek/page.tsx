'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Bot, ChevronRight, LifeBuoy, MessageCircle, Send } from 'lucide-react';

import { TELEGRAM_URL, WHATSAPP_NUMBER } from '@/lib/contact-channels';

// TASK-0507: əvvəl "Bu bölmə hazırlanır" idi. Kanallar SST-dən (lib/contact-channels.ts) —
// nömrə/handle burada təkrar yazılmır. WhatsApp mövcud /api/leads/whatsapp yönləndirməsindən keçir.
export default function SupportPage() {
  const t = useTranslations('b2bPages.support');
  const waText = encodeURIComponent(t('waPrefill'));

  const channels = [
    { href: `/api/leads/whatsapp?text=${waText}`, external: true, icon: MessageCircle, tone: 'bg-emerald-50 text-emerald-600', title: t('waTitle'), text: t('waText') },
    { href: TELEGRAM_URL, external: true, icon: Send, tone: 'bg-sky-50 text-sky-600', title: t('tgTitle'), text: t('tgText') },
    { href: '/kazan-ai', external: false, icon: Bot, tone: 'bg-amber-50 text-amber-600', title: t('aiTitle'), text: t('aiText') },
  ];

  const faq = ['q1', 'q2', 'q3', 'q4'] as const;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <LifeBuoy size={22} />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('title')}</h1>
          <p className="text-sm text-slate-600">{t('subtitle')}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-3" data-testid="support-channels">
        {channels.map((c) => {
          const Icon = c.icon;
          const inner = (
            <>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.tone}`}>
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900">{c.title}</span>
                <span className="block text-sm text-slate-600">{c.text}</span>
              </span>
              <ChevronRight size={18} className="text-slate-400" />
            </>
          );
          const cls = 'flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-[var(--dk-gold)]';
          return (
            <li key={c.title}>
              {c.external ? (
                <a href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
              ) : (
                <Link href={c.href} className={cls}>{inner}</Link>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-slate-600">{t('waNumber', { number: `+${WHATSAPP_NUMBER}` })}</p>

      <h2 className="mt-10 text-lg font-bold text-slate-900">{t('faqTitle')}</h2>
      <div className="mt-3 space-y-2">
        {faq.map((k) => (
          <details key={k} className="rounded-xl border border-slate-200 bg-white p-4">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">{t(`${k}`)}</summary>
            <p className="mt-2 text-sm text-slate-700">{t(`${k}a`)}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
