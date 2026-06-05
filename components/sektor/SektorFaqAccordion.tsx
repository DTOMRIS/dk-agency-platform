'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import { trackSektorEvent } from '@/lib/analytics/sektorEvents';

interface FaqItem {
  questionKey: string;
  answerKey: string;
}

interface SektorFaqAccordionProps {
  namespace: string;
  sectionTitleKey: string;
  items: FaqItem[];
  sektorSlug?: string;
}

export default function SektorFaqAccordion({ namespace, sectionTitleKey, items, sektorSlug }: SektorFaqAccordionProps) {
  const t = useTranslations(namespace);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center font-display text-3xl font-black tracking-tighter text-slate-900 sm:text-4xl">
          {t(sectionTitleKey)}
        </h2>

        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <button
                  onClick={() => {
                    const opening = !isOpen;
                    setOpenIndex(opening ? i : null);
                    if (opening && sektorSlug) {
                      trackSektorEvent({ sektor: sektorSlug, action: 'faq_open', faqIndex: i });
                    }
                  }}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                >
                  <span className="pr-4 text-sm font-bold text-slate-900">{t(item.questionKey)}</span>
                  <ChevronDown
                    size={18}
                    className={`flex-shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-slate-100 px-6 pb-5 pt-3">
                    <p className="text-sm leading-relaxed text-slate-600">{t(item.answerKey)}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
