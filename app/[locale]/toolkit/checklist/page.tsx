'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CheckCircle, Circle, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';

interface ChecklistItem {
  id: string;
  text: string;
  detail?: string;
}

interface ChecklistSection {
  title: string;
  emoji: string;
  items: ChecklistItem[];
}

export default function ChecklistPage() {
  const t = useTranslations('toolkit.checklist');

  const CHECKLIST_DATA: ChecklistSection[] = [
    {
      title: t('sec_legal_title'),
      emoji: '\uD83D\uDCCB',
      items: [
        { id: 'h1', text: t('sec_legal_item_h1_text'), detail: t('sec_legal_item_h1_detail') },
        { id: 'h2', text: t('sec_legal_item_h2_text'), detail: t('sec_legal_item_h2_detail') },
        { id: 'h3', text: t('sec_legal_item_h3_text'), detail: t('sec_legal_item_h3_detail') },
        { id: 'h4', text: t('sec_legal_item_h4_text') },
        { id: 'h5', text: t('sec_legal_item_h5_text') },
        { id: 'h6', text: t('sec_legal_item_h6_text') },
        { id: 'h7', text: t('sec_legal_item_h7_text') },
      ],
    },
    {
      title: t('sec_venue_title'),
      emoji: '\uD83C\uDFD7\uFE0F',
      items: [
        { id: 'm1', text: t('sec_venue_item_m1_text'), detail: t('sec_venue_item_m1_detail') },
        { id: 'm2', text: t('sec_venue_item_m2_text') },
        { id: 'm3', text: t('sec_venue_item_m3_text'), detail: t('sec_venue_item_m3_detail') },
        { id: 'm4', text: t('sec_venue_item_m4_text') },
        { id: 'm5', text: t('sec_venue_item_m5_text'), detail: t('sec_venue_item_m5_detail') },
        { id: 'm6', text: t('sec_venue_item_m6_text') },
        { id: 'm7', text: t('sec_venue_item_m7_text') },
      ],
    },
    {
      title: t('sec_kitchen_title'),
      emoji: '\uD83C\uDF73',
      items: [
        { id: 'a1', text: t('sec_kitchen_item_a1_text'), detail: t('sec_kitchen_item_a1_detail') },
        { id: 'a2', text: t('sec_kitchen_item_a2_text') },
        { id: 'a3', text: t('sec_kitchen_item_a3_text') },
        { id: 'a4', text: t('sec_kitchen_item_a4_text') },
        { id: 'a5', text: t('sec_kitchen_item_a5_text') },
      ],
    },
    {
      title: t('sec_menu_title'),
      emoji: '\uD83D\uDCDD',
      items: [
        { id: 'mn1', text: t('sec_menu_item_mn1_text'), detail: t('sec_menu_item_mn1_detail') },
        { id: 'mn2', text: t('sec_menu_item_mn2_text'), detail: t('sec_menu_item_mn2_detail') },
        { id: 'mn3', text: t('sec_menu_item_mn3_text') },
        { id: 'mn4', text: t('sec_menu_item_mn4_text') },
        { id: 'mn5', text: t('sec_menu_item_mn5_text') },
        { id: 'mn6', text: t('sec_menu_item_mn6_text') },
      ],
    },
    {
      title: t('sec_staff_title'),
      emoji: '\uD83D\uDC65',
      items: [
        { id: 'k1', text: t('sec_staff_item_k1_text') },
        { id: 'k2', text: t('sec_staff_item_k2_text') },
        { id: 'k3', text: t('sec_staff_item_k3_text') },
        { id: 'k4', text: t('sec_staff_item_k4_text') },
        { id: 'k5', text: t('sec_staff_item_k5_text'), detail: t('sec_staff_item_k5_detail') },
        { id: 'k6', text: t('sec_staff_item_k6_text') },
      ],
    },
    {
      title: t('sec_marketing_title'),
      emoji: '\uD83D\uDE80',
      items: [
        { id: 'mr1', text: t('sec_marketing_item_mr1_text') },
        { id: 'mr2', text: t('sec_marketing_item_mr2_text') },
        { id: 'mr3', text: t('sec_marketing_item_mr3_text') },
        { id: 'mr4', text: t('sec_marketing_item_mr4_text') },
        { id: 'mr5', text: t('sec_marketing_item_mr5_text'), detail: t('sec_marketing_item_mr5_detail') },
        { id: 'mr6', text: t('sec_marketing_item_mr6_text') },
        { id: 'mr7', text: t('sec_marketing_item_mr7_text') },
      ],
    },
    {
      title: t('sec_finance_title'),
      emoji: '\uD83D\uDCB0',
      items: [
        { id: 'f1', text: t('sec_finance_item_f1_text'), detail: t('sec_finance_item_f1_detail') },
        { id: 'f2', text: t('sec_finance_item_f2_text') },
        { id: 'f3', text: t('sec_finance_item_f3_text') },
        { id: 'f4', text: t('sec_finance_item_f4_text') },
        { id: 'f5', text: t('sec_finance_item_f5_text') },
      ],
    },
  ];

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0, 1]));

  const totalItems = CHECKLIST_DATA.reduce((sum, s) => sum + s.items.length, 0);
  const checkedCount = checked.size;
  const progress = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSection = (idx: number) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--dk-paper)] pb-20">
      {/* Header */}
      <div className="bg-slate-950 pt-8 pb-16 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/toolkit" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-8 group">
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>{t('backLink')}</span>
          </Link>
          <span className="bg-amber-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block">{t('badge')}</span>
          <h1 className="text-4xl font-display font-black tracking-tighter mb-4">
            {t('title')}
          </h1>
          <p className="text-slate-400 text-lg">
            {t('description')}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700">{checkedCount} / {totalItems} {t('progressLabel')}</span>
            <span className="text-sm font-black text-brand-red">{progress}%</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-red rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="max-w-3xl mx-auto px-4 mt-8 space-y-4">
        {CHECKLIST_DATA.map((section, sIdx) => {
          const sectionChecked = section.items.filter(i => checked.has(i.id)).length;
          const isExpanded = expandedSections.has(sIdx);
          const isComplete = sectionChecked === section.items.length;

          return (
            <div key={sIdx} className={`bg-white rounded-2xl border transition-colors ${isComplete ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200'}`}>
              <button
                type="button"
                onClick={() => toggleSection(sIdx)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.emoji}</span>
                  <div>
                    <h2 className="font-bold text-slate-900">{section.title}</h2>
                    <p className="text-xs text-slate-400">{sectionChecked}/{section.items.length} {t('section_completed')}</p>
                  </div>
                </div>
                {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 space-y-1">
                  {section.items.map((item) => {
                    const isDone = checked.has(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggle(item.id)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${isDone ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                      >
                        {isDone
                          ? <CheckCircle size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                          : <Circle size={20} className="text-slate-300 flex-shrink-0 mt-0.5" />
                        }
                        <div>
                          <span className={`text-sm font-medium ${isDone ? 'text-emerald-700 line-through' : 'text-slate-800'}`}>
                            {item.text}
                          </span>
                          {item.detail && (
                            <p className="text-xs text-slate-400 mt-0.5">{item.detail}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
