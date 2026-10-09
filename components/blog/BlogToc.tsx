/**
 * @file BlogToc.tsx
 * @purpose Sticky blog table of contents with scroll-spy (desktop) — TASK-0514.
 *          Headings get their ids from MarkdownRenderer `headingIds`.
 */

'use client';

import { useEffect, useState } from 'react';
import type { TocItem } from '@/lib/blog/toc';
import s from '@/components/inner/inner.module.css';

export default function BlogToc({ items, title }: { items: TocItem[]; title: string }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    if (items.length === 0) return;
    const onScroll = () => {
      let current = items[0].id;
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) current = item.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [items]);

  if (items.length === 0) return null;
  return (
    <nav className={s.toc} aria-label={title}>
      <h4>{title}</h4>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={active === item.id ? s.tocOn : undefined}
              aria-current={active === item.id ? 'location' : undefined}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
