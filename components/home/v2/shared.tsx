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
    () => false,
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
      { threshold: 0.12 },
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

/** WhatsApp lead link — always through the counting redirect, never wa.me directly. */
export function whatsappHref(text: string): string {
  return `/api/leads/whatsapp?text=${encodeURIComponent(text)}`;
}
