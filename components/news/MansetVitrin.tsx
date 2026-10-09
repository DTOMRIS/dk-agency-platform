'use client';

/**
 * TASK-0515 — manşet slider for the /haberler lead area, restyled to the v2 inner design.
 * Slides are ONLY the stories the admin flagged «Xəbər manşet olsun?» in dashboard/xeberler
 * (getMansetNewsArticles). The page renders a single lead story when there is no manşet.
 * Auto-advance (7 s) pauses on hover/focus and is off for prefers-reduced-motion.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import s from '@/components/inner/inner.module.css';

export interface MansetSlide {
  id: number;
  href: string;
  title: string;
  summary: string;
  meta: string;
  cover: ReactNode;
}

interface MansetVitrinProps {
  slides: MansetSlide[];
  label: string;
  featuredLabel: string;
  prevLabel: string;
  nextLabel: string;
  /** e.g. «1 / 3» already resolved by the caller for each index. */
  slideLabels: string[];
}

export default function MansetVitrin({ slides, label, featuredLabel, prevLabel, nextLabel, slideLabels }: MansetVitrinProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  const next = useCallback(() => setCurrent((i) => (i + 1) % total), [total]);
  const prev = useCallback(() => setCurrent((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (total <= 1 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next, total, paused]);

  if (total === 0) return null;
  const index = Math.min(current, total - 1);
  const item = slides[index];

  return (
    <section
      className={s.mvWrap}
      aria-roledescription="carousel"
      aria-label={label}
      data-testid="manset-vitrin"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <Link href={item.href} className={s.leadStory} aria-roledescription="slide" aria-label={`${slideLabels[index]}: ${item.title}`}>
        {item.cover}
        <div className={s.lsBody}>
          <div className={s.metaRow}>
            <span className={s.cat}>{featuredLabel}</span>
            <span>{item.meta}</span>
          </div>
          <h2>{item.title}</h2>
          <p>{item.summary}</p>
        </div>
      </Link>
      {total > 1 ? (
        <div className={s.mvCtrl}>
          <button type="button" className={s.mvBtn} onClick={prev} aria-label={prevLabel}>
            <span aria-hidden="true">‹</span>
          </button>
          <div className={s.mvDots}>
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={slideLabels[i]}
                aria-current={i === index ? 'true' : undefined}
                onClick={() => setCurrent(i)}
              >
                <span />
              </button>
            ))}
          </div>
          <button type="button" className={s.mvBtn} onClick={next} aria-label={nextLabel}>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      ) : null}
    </section>
  );
}
