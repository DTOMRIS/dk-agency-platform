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
    {
      href: `/api/leads/whatsapp?text=${waText}`,
      external: true,
      icon: MessageCircle,
      tone: 'bg-[#E9F5EE] text-[#1F7A4D]',
      title: t('waTitle'),
      text: t('waText'),
    },
    {
      href: TELEGRAM_URL,
      external: true,
      icon: Send,
      tone: 'bg-[#E8F1F8] text-[#22577A]',
      title: t('tgTitle'),
      text: t('tgText'),
    },
    {
      href: '/kazan-ai',
      external: false,
      icon: Bot,
      tone: 'bg-[#FBF1DE] text-[#8A5A12]',
      title: t('aiTitle'),
      text: t('aiText'),
    },
  ];

  const faq = ['q1', 'q2', 'q3', 'q4'] as const;

  return (
    <div className="min-h-full bg-[#F6F1E9]">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#E4DCCD] bg-white text-[#0F172A]">
            <LifeBuoy size={22} />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">
              {t('title')}
            </h1>
            <p className="text-sm text-[#5B6474]">{t('subtitle')}</p>
          </div>
        </div>

        <ul className="mt-6 space-y-3" data-testid="support-channels">
          {channels.map((c) => {
            const Icon = c.icon;
            const inner = (
              <>
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${c.tone}`}
                >
                  <Icon size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-[#0F172A]">{c.title}</span>
                  <span className="block text-sm text-[#334155]">{c.text}</span>
                </span>
                <ChevronRight
                  size={18}
                  className="text-[#5B6474] transition group-hover:translate-x-0.5 group-hover:text-[#0F172A]"
                />
              </>
            );
            const cls =
              'group flex items-center gap-3 rounded-[22px] border border-[#E4DCCD] bg-white p-4 transition hover:border-[#0F172A]';
            return (
              <li key={c.title}>
                {c.external ? (
                  <a href={c.href} target="_blank" rel="noopener noreferrer" className={cls}>
                    {inner}
                  </a>
                ) : (
                  <Link href={c.href} className={cls}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-[#5B6474]">
          {t('waNumber', { number: `+${WHATSAPP_NUMBER}` })}
        </p>

        <h2 className="mt-10 text-lg font-extrabold text-[#0F172A]">{t('faqTitle')}</h2>
        <div className="mt-3 space-y-2">
          {faq.map((k) => (
            <details
              key={k}
              className="rounded-[18px] border border-[#E4DCCD] bg-white p-4 open:border-[#0F172A]"
            >
              <summary className="cursor-pointer text-sm font-bold text-[#0F172A]">
                {t(`${k}`)}
              </summary>
              <p className="mt-2 border-t border-[#EFE9DE] pt-2 text-sm leading-relaxed text-[#334155]">
                {t(`${k}a`)}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}
