'use client';

/**
 * @file SpotlightTour.tsx
 * @purpose TASK-0529 (owner 10.10: «bəziləri blur edir, tıklayacağın, veri girəcəyin yerləri göstərir,
 *          istəmirsənsə keç deyirsən — bence bu lazım» → Spotlight Guided Tour / İnteraktiv Bələdçi).
 *          No package: the page around the current target is dimmed and blurred by four panels (the
 *          target stays sharp and clickable-looking), a card next to it explains the step, «Keç» ends the
 *          tour at any step. Seen once per tool (localStorage), re-opened from the «Bələdçi» button.
 *          Pattern follows the common product-tour practice (Appcues / Shepherd / Intro.js): 3–5 short
 *          steps, always skippable, Esc = skip, arrows = back/next, steps whose target is missing are dropped.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';

export type TourStep = {
  /** CSS selector; the first visible match is highlighted. */
  target: string;
  title: string;
  body: string;
};

type Rect = { top: number; left: number; width: number; height: number };

const PAD = 8;
const CARD_W = 340;

function findVisible(selector: string): HTMLElement | null {
  const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
  return nodes.find((el) => el.offsetWidth > 0 && el.offsetHeight > 0 && window.getComputedStyle(el).visibility !== 'hidden') ?? null;
}

function storageKey(id: string) {
  return `dk-tour:${id}`;
}

export function hasSeenTour(id: string): boolean {
  try {
    return window.localStorage.getItem(storageKey(id)) === '1';
  } catch {
    return false;
  }
}

function markSeen(id: string) {
  try {
    window.localStorage.setItem(storageKey(id), '1');
  } catch {
    /* private mode — the tour may show again, harmless */
  }
}

export default function SpotlightTour({
  id,
  steps,
  open,
  onClose,
}: {
  id: string;
  steps: TourStep[];
  open: boolean;
  onClose: () => void;
}) {
  const t = useTranslations('innerV2.common.tour');
  const [active, setActive] = useState<TourStep[]>([]);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);

  // Keep only the steps whose target exists on this page right now.
  useEffect(() => {
    if (!open) return;
    const id2 = window.requestAnimationFrame(() => {
      setActive(steps.filter((step) => findVisible(step.target)));
      setIndex(0);
    });
    return () => window.cancelAnimationFrame(id2);
  }, [open, steps]);

  const step = open ? active[index] : undefined;

  const measure = useCallback(() => {
    if (!step) return;
    const el = findVisible(step.target);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 });
  }, [step]);

  // Bring the target into view, then measure (and re-measure while the page moves).
  useLayoutEffect(() => {
    if (!step) return;
    const el = findVisible(step.target);
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const r = el.getBoundingClientRect();
    const fits = r.top >= 80 && r.bottom <= window.innerHeight - 40;
    if (!fits) el.scrollIntoView({ block: r.height > window.innerHeight * 0.6 ? 'start' : 'center', behavior: reduce ? 'auto' : 'smooth' });
    const raf = window.requestAnimationFrame(measure);
    const timer = window.setTimeout(measure, reduce ? 0 : 420);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, { passive: true });
    return () => {
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure);
    };
  }, [step, measure]);

  const finish = useCallback(() => {
    markSeen(id);
    setRect(null);
    onClose();
  }, [id, onClose]);

  const next = useCallback(() => {
    if (index >= active.length - 1) finish();
    else setIndex((i) => i + 1);
  }, [index, active.length, finish]);
  const back = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    if (!step) return;
    primaryRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') back();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [step, finish, next, back]);

  // Nothing to show (all targets missing) → close quietly once the steps were checked.
  useEffect(() => {
    if (open && active.length === 0) {
      const timer = window.setTimeout(() => {
        if (steps.every((s) => !findVisible(s.target))) onClose();
      }, 300);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open, active.length, steps, onClose]);

  if (!step || !rect) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const cardW = Math.min(CARD_W, vw - 32);
  const below = rect.top + rect.height + 16;
  // Below the target when there is room, else above it — anchored by `bottom` so the card's real height
  // never makes it overlap the highlighted area.
  const placeBelow = below + 250 < vh || rect.top < 260;
  const cardPos = placeBelow ? { top: Math.min(below, vh - 260) } : { bottom: vh - rect.top + 16 };
  const cardLeft = Math.min(Math.max(16, rect.left), vw - cardW - 16);
  const panel = 'fixed bg-[#0F172A]/55 backdrop-blur-[3px] transition-all duration-300 motion-reduce:transition-none';
  const bottom = rect.top + rect.height;
  const right = rect.left + rect.width;

  return (
    <div className="fixed inset-0 z-[120]" data-testid="spotlight-tour" role="dialog" aria-modal="true" aria-labelledby="dk-tour-title">
      {/* Four panels around the hole: dim + blur everything except the highlighted area. */}
      <div className={panel} style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top) }} onClick={finish} />
      <div className={panel} style={{ top: bottom, left: 0, right: 0, bottom: 0 }} onClick={finish} />
      <div className={panel} style={{ top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height }} onClick={finish} />
      <div className={panel} style={{ top: rect.top, left: right, right: 0, height: rect.height }} onClick={finish} />
      {/* Ring around the target; it also covers the hole, so a click there does not change the tool mid-tour. */}
      <div
        className="pointer-events-auto fixed rounded-2xl ring-[3px] ring-[#D63B54] shadow-[0_0_0_6px_rgba(214,59,84,0.18)] transition-all duration-300 motion-reduce:transition-none"
        style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }}
      />

      <div
        className="fixed rounded-2xl border border-[#E4DCCD] bg-white p-5 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.45)]"
        style={{ ...cardPos, left: cardLeft, width: cardW }}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-[#FBEFF1] px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-[#BE2F47]">
            {t('step', { n: index + 1, total: active.length })}
          </span>
          <button type="button" onClick={finish} aria-label={t('skip')} className="-mr-1 -mt-1 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900">
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <p id="dk-tour-title" className="mt-3 text-[17px] font-black leading-snug tracking-[-0.02em] text-[#0F172A]">{step.title}</p>
        <p className="mt-1.5 text-[14px] leading-6 text-slate-600">{step.body}</p>
        <div className="mt-4 flex items-center gap-2">
          <button type="button" onClick={finish} data-testid="tour-skip" className="text-[13px] font-bold text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline">
            {t('skip')}
          </button>
          <span className="ml-auto" />
          {index > 0 ? (
            <button type="button" onClick={back} className="min-h-10 rounded-full border border-[#E4DCCD] px-4 text-[13px] font-bold text-slate-800 hover:bg-[#F6F1E9]">
              {t('back')}
            </button>
          ) : null}
          <button
            ref={primaryRef}
            type="button"
            onClick={next}
            data-testid="tour-next"
            className="min-h-10 rounded-full bg-dk-red-strong px-5 text-[13px] font-bold text-white hover:bg-dk-red-deep"
          >
            {index >= active.length - 1 ? t('done') : t('next')}
          </button>
        </div>
      </div>
    </div>
  );
}
