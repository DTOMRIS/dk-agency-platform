'use client';

import { useEffect, useState } from 'react';
import { HOME_CHAPTERS, type HomeChapterId } from './wp1Chapters';

export default function StickyChapterNavWp1() {
  const [activeId, setActiveId] = useState<HomeChapterId>('hero');

  useEffect(() => {
    const targets = HOME_CHAPTERS.map((item) => document.getElementById(item.id)).filter(
      (item): item is HTMLElement => item instanceof HTMLElement,
    );

    if (targets.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveId(visible.target.id as HomeChapterId);
        }
      },
      {
        threshold: [0.2, 0.45, 0.7],
        rootMargin: '-28% 0px -52% 0px',
      },
    );

    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  return (
    <nav aria-label="Homepage chapter navigation" className="sticky top-24 rounded-2xl border border-[var(--dk-warm-border)] bg-[color-mix(in srgb, var(--dk-gold) 12%, white)]/90 p-3 backdrop-blur hidden lg:block">
      <ul className="space-y-1">
        {HOME_CHAPTERS.map((chapter) => (
          <li key={chapter.id}>
            <button
              type="button"
              onClick={() => {
                document.getElementById(chapter.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                activeId === chapter.id
                  ? 'bg-[color-mix(in srgb, var(--dk-mint) 72%, white)] text-[var(--dk-teal)] font-semibold'
                  : 'text-[var(--dk-ink-soft)] hover:bg-[color-mix(in srgb, var(--dk-gold) 16%, white)]'
              }`}
            >
              {chapter.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
