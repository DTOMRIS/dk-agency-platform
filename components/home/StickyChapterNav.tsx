'use client';

import type { HomeSectionId } from './home.constants';
import { homeSections } from './home.constants';

interface StickyChapterNavProps {
  activeId: HomeSectionId;
}

export default function StickyChapterNav({ activeId }: StickyChapterNavProps) {
  return (
    <nav className="chapter-nav" aria-label="Homepage chapters">
      {homeSections.map((section) => (
        <button
          key={section.id}
          type="button"
          data-active={activeId === section.id}
          onClick={() => {
            document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          {section.label}
        </button>
      ))}
    </nav>
  );
}
