'use client';

/**
 * @file KazanNudge.tsx
 * @purpose TASK-0536 (owner 10.10, reference: owner.com «soru sor, cevap al» bubble). A proactive one-question
 *          bubble above the KAZAN AI launcher with an inline reply field. The answer opens the KAZAN panel
 *          (`kazan:ask`): the question becomes KAZAN's first line and the answer is sent as the first message.
 *          Rules (proactive-chat practice): appears after 30 s or half a page of scrolling, once per session,
 *          «×» hides it for 7 days, one question per page type, desktop only (on phones it would cover the
 *          content — same reason the launcher is lg+), says plainly that it is KAZAN AI, not a person.
 */

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowUp, Sparkles, X } from 'lucide-react';
import { stripLocalePrefix } from '@/i18n/config';

const SESSION_KEY = 'dk_kazan_nudge_seen';
const DISMISS_KEY = 'dk_kazan_nudge_dismissed_at';
const DISMISS_DAYS = 7;
const DELAY_MS = 30_000;

type Topic = 'home' | 'foodCost' | 'toolkit' | 'franchise' | 'pricing' | 'blog' | 'news';

function topicFor(path: string): Topic | null {
  if (path === '/') return 'home';
  if (path.startsWith('/toolkit/food-cost')) return 'foodCost';
  if (path.startsWith('/toolkit')) return 'toolkit';
  if (path.startsWith('/franchise')) return 'franchise';
  if (path.startsWith('/pricing') || path.startsWith('/qiymet') || path.startsWith('/marketinq')) return 'pricing';
  if (path.startsWith('/blog')) return 'blog';
  if (path.startsWith('/haberler')) return 'news';
  return null;
}

function blocked(): boolean {
  try {
    if (window.sessionStorage.getItem(SESSION_KEY)) return true;
    const at = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
    return at > 0 && Date.now() - at < DISMISS_DAYS * 86_400_000;
  } catch {
    return false;
  }
}

function remember(key: 'session' | 'dismiss') {
  try {
    window.sessionStorage.setItem(SESSION_KEY, '1');
    if (key === 'dismiss') window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {
    /* storage blocked — the bubble may show again, harmless */
  }
}

export default function KazanNudge() {
  const t = useTranslations('kazanNudge');
  const path = stripLocalePrefix(usePathname()) || '/';
  const topic = topicFor(path);
  const [show, setShow] = useState(false);
  const [answer, setAnswer] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!topic || navigator.webdriver || blocked()) return;
    if (!window.matchMedia('(min-width: 1024px)').matches) return;
    let done = false;
    const reveal = () => {
      if (done || blocked()) return;
      // Not on top of the tool tour (SpotlightTour) — try again a little later.
      if (document.querySelector('[data-testid="spotlight-tour"]')) {
        window.setTimeout(reveal, 5_000);
        return;
      }
      done = true;
      setShow(true);
      remember('session');
    };
    const timer = window.setTimeout(reveal, DELAY_MS);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max >= 0.5) reveal();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    // The KAZAN panel opened another way → the bubble is not needed on this page.
    const onOpen = () => { done = true; setShow(false); };
    window.addEventListener('kazan:open', onOpen);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('kazan:open', onOpen);
    };
  }, [topic]);

  if (!show || !topic) return null;

  const question = t(`questions.${topic}`);
  const submit = () => {
    const text = answer.trim();
    if (!text) {
      inputRef.current?.focus();
      return;
    }
    window.dispatchEvent(new CustomEvent('kazan:ask', { detail: { intro: question, question: text } }));
    setShow(false);
  };

  return (
    <div className="fixed bottom-[calc(6.5rem+var(--dk-cookie-bar-h,0px))] right-8 z-[69] hidden w-[360px] lg:block" role="dialog" aria-label={t('aria')} data-testid="kazan-nudge">
      <div className="relative rounded-[22px] bg-[#0F172A]/90 p-4 pr-10 text-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.55)] backdrop-blur-md">
        <div className="flex gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-[#F28A9B]">
            <Sparkles size={17} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[14.5px] font-semibold leading-snug">{question}</p>
            <p className="mt-1 text-[12px] text-slate-400">{t('meta')}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { remember('dismiss'); setShow(false); }}
          aria-label={t('close')}
          data-testid="kazan-nudge-close"
          className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full border border-[#E4DCCD] bg-white text-slate-600 shadow hover:text-[#0F172A]"
        >
          <X size={15} aria-hidden="true" />
        </button>
      </div>
      <form
        className="mt-2 flex items-center gap-2 rounded-full border border-[#E4DCCD] bg-white p-1.5 pl-4 shadow-[0_14px_34px_-14px_rgba(15,23,42,0.35)]"
        onSubmit={(e) => { e.preventDefault(); submit(); }}
      >
        <input
          ref={inputRef}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          maxLength={300}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          data-testid="kazan-nudge-input"
          className="min-w-0 flex-1 bg-transparent text-[14.5px] text-[#0F172A] outline-none placeholder:text-slate-400"
        />
        <button type="submit" aria-label={t('send')} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-dk-red-strong text-white hover:bg-dk-red-deep">
          <ArrowUp size={17} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
