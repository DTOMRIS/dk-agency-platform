'use client';

/**
 * @file ContactFunnel.tsx
 * @purpose /elaqe kanal kartları — WhatsApp (əsas), KAZAN AI (beta), Telegram kanalı.
 * @task TASK-0513 — ana səhifə v2 dilində yenidən stilləndi (krem/ağ kartlar, inline SVG ikonlar);
 *       tracking (`/api/leads/track`), `kazan:open` hadisəsi və `/api/leads/whatsapp` yönləndirməsi dəyişmədi.
 */

import { useLocale, useTranslations } from 'next-intl';
import { TELEGRAM_HANDLE, TELEGRAM_URL, WHATSAPP_NUMBER } from '@/lib/contact-channels';

type ContactChannel = 'kazan' | 'whatsapp' | 'telegram';

function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** WhatsApp loqo forması (dəyirmi nitq balonu + telefon), tək rəngli, currentColor. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.17.25-.64.8-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29Z" />
    </svg>
  );
}

/** Telegram kağız təyyarəsi, tək rəngli. */
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M21.43 3.32a1.3 1.3 0 0 0-1.33-.2L2.83 9.86c-.98.38-.97 1.77.02 2.13l4.21 1.53 1.64 5.3c.2.65 1.01.86 1.5.39l2.42-2.33 4.48 3.29c.66.48 1.6.12 1.77-.68l3.02-14.36c.1-.45-.06-.92-.46-1.21Zm-3.9 3.6-8.08 7.3a.6.6 0 0 0-.19.36l-.33 2.6-1.07-3.47 9.67-6.79Z" />
    </svg>
  );
}

/** KAZAN AI — ana səhifə v2 «spark» ştrix ikonu. */
function SparkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

const CARD =
  'group relative flex min-h-[248px] w-full flex-col rounded-3xl p-6 text-left transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-4';
const LIGHT_CARD =
  'border border-[#E4DCCD] bg-white text-slate-900 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-12px_rgba(15,23,42,0.14)]';

export function ContactFunnel() {
  const t = useTranslations('contact.funnel');
  const locale = useLocale();

  const track = (
    channel: ContactChannel,
    extra?: { prefillText?: string; destinationPhone?: string }
  ) => {
    fetch('/api/leads/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'contact_page',
        channel,
        locale,
        // Which page the click came from + the intent we seeded, so the
        // dashboard shows more than a bare "clicked" event.
        sourceUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        prefillText: extra?.prefillText,
        destinationPhone: extra?.destinationPhone,
      }),
      keepalive: true,
    }).catch(() => {
      // Lead tracking must not block the contact action.
    });
  };

  const whatsappPreFill = t('whatsapp.preFill');
  const whatsappUrl = `/api/leads/whatsapp?text=${encodeURIComponent(whatsappPreFill)}`;

  return (
    <div className="grid gap-4 md:grid-cols-[1.25fr_1fr_1fr]">
      {/* Əsas kanal — WhatsApp (tünd kart: ağ mətn yalnız tünd fonda) */}
      <button
        type="button"
        onClick={() => {
          track('whatsapp', { prefillText: whatsappPreFill, destinationPhone: WHATSAPP_NUMBER });
          openExternal(whatsappUrl);
        }}
        className={`${CARD} bg-[#0F172A] text-white shadow-[0_18px_40px_-18px_rgba(15,23,42,0.55)] focus-visible:ring-[#E94560]/40`}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-white">
            <WhatsAppIcon className="h-8 w-8" />
          </span>
          <span className="rounded-full bg-[#E94560] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white">
            {t('whatsapp.primary')}
          </span>
        </span>
        <span className="mt-6 block text-2xl font-black tracking-tight text-white">{t('whatsapp.title')}</span>
        <span className="mt-2 block text-[15px] leading-6 text-slate-300">{t('whatsapp.description')}</span>
        <span className="mt-auto inline-flex items-center gap-2 self-start rounded-full bg-[#E94560] px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-8px_rgba(233,69,96,0.6)] transition group-hover:bg-[#D63B54]">
          {t('whatsapp.cta')}
          <ArrowIcon className="h-4 w-4" />
        </span>
      </button>

      {/* KAZAN AI — beta */}
      <button
        type="button"
        onClick={() => {
          track('kazan');
          window.dispatchEvent(
            new CustomEvent('kazan:open', {
              detail: { context: 'contact_page' },
            })
          );
        }}
        className={`${CARD} ${LIGHT_CARD} hover:border-[#E94560]/40 focus-visible:ring-[#E94560]/30`}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FDECEF] text-[#E94560]">
            <SparkIcon className="h-7 w-7" />
          </span>
          <span className="rounded-full border border-[#E4DCCD] bg-[#F6F1E9] px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-slate-700">
            {t('kazan.beta')}
          </span>
        </span>
        <span className="mt-6 block text-xl font-black tracking-tight text-slate-900">{t('kazan.title')}</span>
        <span className="mt-2 block text-[15px] leading-6 text-slate-600">{t('kazan.description')}</span>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[#C53352]">
          {t('kazan.cta')}
          <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </button>

      {/* Telegram — açıq kanal (yazışma yox, abunə) */}
      <button
        type="button"
        onClick={() => {
          track('telegram', { destinationPhone: TELEGRAM_URL });
          openExternal(TELEGRAM_URL);
        }}
        className={`${CARD} ${LIGHT_CARD} hover:border-[#229ED9]/40 focus-visible:ring-[#229ED9]/30`}
      >
        <span className="flex items-center justify-between gap-3">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#229ED9] text-white">
            <TelegramIcon className="h-7 w-7" />
          </span>
          <span className="rounded-full border border-[#E4DCCD] bg-[#F6F1E9] px-3 py-1 text-xs font-bold text-slate-700">
            t.me/{TELEGRAM_HANDLE}
          </span>
        </span>
        <span className="mt-6 block text-xl font-black tracking-tight text-slate-900">
          {t('telegram.channelTitle')}
        </span>
        <span className="mt-2 block text-[15px] leading-6 text-slate-600">
          {t('telegram.channelDescription')}
        </span>
        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[#1B7FB0]">
          {t('telegram.cta')}
          <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </button>
    </div>
  );
}
