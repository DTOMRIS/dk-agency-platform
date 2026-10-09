/**
 * @file shared.tsx
 * @purpose Homepage v2 helpers — icon set (same strokes as /tanitim), reduced-motion hook,
 *          scroll reveal wrapper and the WhatsApp lead link builder.
 * @task TASK-0512
 */

'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import styles from './homeV2.module.css';

/** Icon paths copied from public/tanitim/index.html so the homepage matches the approved design. */
const ICONS = {
  pie: (
    <>
      <path d="M21 12A9 9 0 1 1 12 3v9z" />
      <path d="M15 3.5A9 9 0 0 1 20.5 9H15z" />
    </>
  ),
  scooter: (
    <>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M6 17h7l3-8h3M14 5h3" />
    </>
  ),
  flame: (
    <path d="M12 22c4 0 7-3 7-7 0-5-5-7-5-12-3 2-4 5-4 7-1-1-2-2-2-4-2 2-3 5-3 9 0 4 3 7 7 7z" />
  ),
  spark: (
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
  ),
  grid: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </>
  ),
  bag: (
    <>
      <path d="M6 7h12l-1 13H7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </>
  ),
  calc: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 7h6M9 11h2M13 11h2M9 15h2M13 15h2" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M14 20c0-2.5 1.5-4.5 4-4.5s3 1.5 3 4.5" />
    </>
  ),
  home: <path d="M3 11 12 4l9 7v9H3z" />,
  send: <path d="m22 2-7 20-4-9-9-4z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  pause: <path d="M9 5v14M15 5v14" />,
  play: <path d="M7 4l13 8-13 8z" />,
  playSolid: <path d="M8 5v14l11-7z" />,
  up: <path d="M7 17 17 7M8 7h9v9" />,
  down: <path d="M17 7 7 17M16 17H7V8" />,
  /* TASK-0512 (owner 2026-10-08): extra icons for the restyled news, market, blog and receipt
     blocks — same 24px grid, 2px stroke, round caps. */
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m10.8 12.2 9.2-9.2M17 6l3 3M14 9l2 2" />
    </>
  ),
  store: (
    <>
      <path d="M4 4h16l1.5 5H2.5z" />
      <path d="M4 9v11h16V9" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  trend: (
    <>
      <path d="M3 17l6-6 4 4 8-8" />
      <path d="M14 7h7v7" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1M10 21v-3h4v3" />
    </>
  ),
  wrench: (
    <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z" />
  ),
  bars: <path d="M4 20V10M10 20V4M16 20v-7M2 20h20" />,
  book: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
      <path d="M4 19V5M8 7h7" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3l-5.5 2.9 1-6.2L3 9.6l6.2-.9z" />,
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </>
  ),
  coin: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9.5c-.5-1-1.6-1.5-3-1.5-1.7 0-3 .8-3 2s1.3 1.7 3 2 3 .8 3 2-1.3 2-3 2c-1.4 0-2.5-.5-3-1.5M12 6v2M12 16v2" />
    </>
  ),
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  /* TASK-0514 (owner 2026-10-09): inner pages (Toolkit, News, Blog) — icons from the approved
     mockup DK-ic-sayfalar-v2.html, same grid and stroke. */
  left: <path d="M19 12H5M11 6l-6 6 6 6" />,
  chevUp: <path d="m6 15 6-6 6 6" />,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  foot: (
    <>
      <path d="M7 16c-1.6 0-2.6-1.6-2.6-4.2S5.5 6 7.4 6 10 8 10 10.6 8.6 16 7 16z" />
      <path d="M5.6 19.5h3" />
      <path d="M17 11c-1.6 0-2.6-1.6-2.6-4.2S15.5 1.5 17.4 1.5 20 3.5 20 6.1 18.6 11 17 11z" />
      <path d="M15.6 14.5h3" />
    </>
  ),
  house: (
    <>
      <path d="M3 11 12 4l9 7v9H3z" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  bed: (
    <>
      <path d="M3 19V6M3 15h18v4M21 15v-3a3 3 0 0 0-3-3h-7v6" />
      <circle cx="7" cy="11.5" r="2" />
    </>
  ),
  clip: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3h6v1M9 11l2 2 4-4M9 17h6" />
    </>
  ),
  hat: (
    <>
      <path d="M3 18h18M5 18v-3a7 7 0 0 1 14 0v3" />
      <path d="M10 8V5h4v3" />
    </>
  ),
  palette: (
    <>
      <path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-2.5a2 2 0 0 0-1.5 3.3c.5.6.3 2.7-2 2.7z" />
      <circle cx="7.5" cy="11" r="1.2" />
      <circle cx="11" cy="7" r="1.2" />
      <circle cx="16" cy="8.5" r="1.2" />
    </>
  ),
  retain: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M3 9a9 9 0 0 1 3-5.5M21 9a9 9 0 0 0-3-5.5" />
    </>
  ),
  shift: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
      <circle cx="12" cy="15.5" r="2" />
    </>
  ),
  chef: (
    <>
      <path d="M6 14a4 4 0 0 1-1-7.9A5 5 0 0 1 14.5 4a4 4 0 1 1 3.5 10z" />
      <path d="M6 14v6h12v-6M9.5 17h5" />
    </>
  ),
  tg: (
    <>
      <path d="M21.5 3.5 2.5 11l6.5 2.2 2.3 6.8 3.6-4.6 5 3.6z" />
      <path d="m9 13.2 12.5-9.7" />
    </>
  ),
  file: (
    <>
      <path d="M14 3H6v18h12V7z" />
      <path d="M14 3v4h4M9 13h6M9 17h4" />
    </>
  ),
  brief: (
    <>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M9 7V5h6v2M3 12.5h18" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" />
    </>
  ),
  scale: (
    <path d="M12 3v18M5 21h14M6 7h12M6 7l-3 7a3 3 0 0 0 6 0zM18 7l-3 7a3 3 0 0 0 6 0z" />
  ),
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className ? `${styles.i} ${className}` : styles.i}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReduce(cb: () => void) {
  const mq = window.matchMedia(REDUCE_QUERY);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
}

/** true when the visitor asked for reduced motion; false during SSR. */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE_QUERY).matches,
    () => false
  );
}

/** Fades content in once it scrolls into view (instant under reduced motion). */
export function Reveal({
  children,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      const t = window.setTimeout(() => setShown(true), 0);
      return () => window.clearTimeout(t);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls = [styles.rv, shown ? styles.rvIn : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <div ref={ref} className={cls} aria-label={ariaLabel} role={ariaLabel ? 'group' : undefined}>
      {children}
    </div>
  );
}

/** WhatsApp lead link — lives in lib/contact-channels (server-safe); re-exported for v2 sections. */
export { whatsappHref } from '@/lib/contact-channels';
