'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ClipboardCheck, Calculator, MessageCircle } from 'lucide-react';

interface ToolItem {
  titleKey: string;
  descKey: string;
  ctaKey: string;
  href: string;
  icon: 'quiz' | 'calculator' | 'whatsapp';
  isHero?: boolean;
}

interface SektorToolGridProps {
  namespace: string;
  sectionTitleKey: string;
  tools: ToolItem[];
}

const ICONS = {
  quiz: ClipboardCheck,
  calculator: Calculator,
  whatsapp: MessageCircle,
} as const;

export default function SektorToolGrid({ namespace, sectionTitleKey, tools }: SektorToolGridProps) {
  const t = useTranslations(namespace);

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center font-display text-3xl font-black tracking-tighter text-slate-900 sm:text-4xl">
          {t(sectionTitleKey)}
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {tools.map((tool, i) => {
            const Icon = ICONS[tool.icon];
            return (
              <div
                key={i}
                className={`relative flex flex-col rounded-2xl border bg-white p-8 shadow-sm transition hover:shadow-lg ${
                  tool.isHero
                    ? 'border-[#C5A022]/40 ring-2 ring-[#C5A022]/20 sm:scale-105'
                    : 'border-slate-200'
                }`}
              >
                {tool.isHero && (
                  <div className="absolute -top-3 right-4 rounded-full bg-[#C5A022] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#1A1A2E]">
                    Fərqləndirici
                  </div>
                )}

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1A1A2E]">
                  <Icon size={22} className="text-[#C5A022]" />
                </div>

                <h3 className="mb-2 text-lg font-bold text-slate-900">{t(tool.titleKey)}</h3>
                <p className="mb-6 flex-1 text-sm leading-relaxed text-slate-500">{t(tool.descKey)}</p>

                <Link
                  href={tool.href}
                  className="inline-flex items-center gap-1 text-sm font-bold text-[var(--dk-red)] transition hover:underline"
                >
                  {t(tool.ctaKey)}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
