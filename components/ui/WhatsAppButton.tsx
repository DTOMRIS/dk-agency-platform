/**
 * @file WhatsAppButton.tsx
 * @purpose Floating WhatsApp contact (every public page, mounted in PublicChrome — TASK-0529). Goes through /api/leads/whatsapp (click is counted
 *          in `leads` + Telegram ping to the owner), never a bare wa.me link.
 *          Bottom-LEFT so it never meets the KAZAN AI button (bottom-right); below lg it sits above
 *          MobileBottomNav (64px) like KAZAN, and both lift above the cookie bar while it is shown
 *          (--dk-cookie-bar-h, published by CookiesBanner).
 * @pattern A (useTranslations) — whatsappFloat
 *          TASK-0519: hidden below md — on phones the bottom nav + KAZAN already cover contact.
 *          TASK-0522 (owner screenshot 2026-10-09): appears only after the first screen is scrolled —
 *          at the top it sat on the hero's «Pulsuz diaqnostika» button on short laptop windows.
 * @task TASK-0516 · TASK-0519 · TASK-0522
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { whatsappHref } from '@/lib/contact-channels';

export default function WhatsAppButton() {
  const t = useTranslations('whatsappFloat');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!scrolled) return null;

  // TASK-0518: above the tool result sheet (--dk-tool-sheet-h), hidden while it is open.
  return (
    <div className="group hidden md:block fixed bottom-[calc(5.5rem+var(--dk-cookie-bar-h,0px)+var(--dk-tool-sheet-h,0px))] [[data-dk-sheet-open]_&]:hidden left-3 z-[65] sm:left-6 lg:bottom-[calc(2rem+var(--dk-cookie-bar-h,0px))] lg:left-8">
      <span className="pointer-events-none absolute left-16 top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-[var(--dk-ink)] px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 lg:block">
        {t('label')}
      </span>

      {/* Plain <a> (not next/link): no prefetch of the counting redirect. */}
      <a
        href={whatsappHref(t('text'))}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('aria')}
        data-testid="whatsapp-float"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--dk-social-whatsapp)] text-white shadow-[0_10px_30px_rgba(37,211,102,0.45)] transition-transform duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dk-ink)] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <span className="absolute inset-0 rounded-full bg-[var(--dk-social-whatsapp)] opacity-40 motion-safe:animate-ping" aria-hidden="true" />
        <svg viewBox="0 0 24 24" className="relative z-10 h-7 w-7 fill-current" aria-hidden="true">
          <path d="M20.52 3.48A11.88 11.88 0 0 0 12.03 0C5.39 0 0 5.4 0 12.04c0 2.12.55 4.2 1.59 6.03L0 24l6.1-1.56a11.99 11.99 0 0 0 5.93 1.51h.01c6.63 0 12.03-5.4 12.03-12.03 0-3.21-1.25-6.23-3.55-8.44Zm-8.49 18.43h-.01a9.94 9.94 0 0 1-5.06-1.39l-.36-.21-3.62.92.97-3.53-.23-.37a9.97 9.97 0 0 1-1.53-5.3C2.2 6.58 6.57 2.2 12.03 2.2a9.8 9.8 0 0 1 6.95 2.88 9.78 9.78 0 0 1 2.89 6.95c0 5.46-4.39 9.88-9.84 9.88Zm5.42-7.43c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.66.15-.2.3-.77.96-.95 1.16-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.79-1.67-2.09-.18-.3-.02-.46.13-.61.13-.12.3-.32.45-.47.15-.15.2-.25.3-.42.1-.17.05-.32-.03-.47-.07-.15-.66-1.6-.9-2.2-.24-.57-.49-.5-.66-.5h-.56c-.2 0-.47.07-.71.32-.25.25-.96.94-.96 2.28s.98 2.64 1.11 2.82c.15.2 1.94 2.96 4.7 4.15.66.29 1.18.46 1.58.59.67.21 1.27.18 1.74.11.53-.08 1.76-.72 2-.1.25-.57.25-1.06.17-1.16-.07-.1-.27-.17-.57-.32Z" />
        </svg>
      </a>
    </div>
  );
}
