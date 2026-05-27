'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, Info, ListChecks, Users } from 'lucide-react';

interface ToolDescriptionProps {
  toolKey: string; // e.g. "marka_kompasi"
}

export default function ToolDescription({ toolKey }: ToolDescriptionProps) {
  const t = useTranslations('marketing_tools');
  const [expanded, setExpanded] = useState(true);

  const blocks = [
    {
      icon: Info,
      titleKey: `${toolKey}.description.block_1_title`,
      contentKey: `${toolKey}.description.block_1_content`,
      type: 'text' as const,
    },
    {
      icon: ListChecks,
      titleKey: `${toolKey}.description.block_2_title`,
      itemsKey: `${toolKey}.description.block_2_items`,
      type: 'list' as const,
    },
    {
      icon: Users,
      titleKey: `${toolKey}.description.block_3_title`,
      contentKey: `${toolKey}.description.block_3_content`,
      type: 'text' as const,
    },
  ];

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-slate-50"
      >
        <span className="text-sm font-bold uppercase tracking-wider text-slate-500">
          {t(`${toolKey}.description.section_label`)}
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {expanded && (
        <div className="divide-y divide-slate-100 border-t border-slate-100">
          {blocks.map((block) => {
            const Icon = block.icon;
            return (
              <div key={block.titleKey} className="px-6 py-5">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[var(--dk-red,#E94560)]" />
                  <h4 className="text-sm font-bold text-[var(--dk-navy,#1A1A2E)]">
                    {t(block.titleKey)}
                  </h4>
                </div>
                {block.type === 'text' && (
                  <p className="text-sm leading-relaxed text-slate-600">
                    {t(block.contentKey!)}
                  </p>
                )}
                {block.type === 'list' && (
                  <ul className="space-y-1.5">
                    {(t.raw(block.itemsKey!) as string[]).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--dk-red,#E94560)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
