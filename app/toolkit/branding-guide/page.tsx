'use client';

import { startTransition, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, BookOpen, ChevronDown, Palette, Sparkles } from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';

type ChecklistGroup = { id: string; title: string; items: string[] };

const STORAGE_KEY = 'branding-guide-checklist';

export default function BrandingGuidePage() {
  const t = useTranslations('toolkit.branding');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  const checklistGroups: ChecklistGroup[] = [
    { id: 'strategy', title: t('checklistStrategyTitle'), items: [t('checklistStrategyItem1'), t('checklistStrategyItem2'), t('checklistStrategyItem3')] },
    { id: 'visual', title: t('checklistVisualTitle'), items: [t('checklistVisualItem1'), t('checklistVisualItem2'), t('checklistVisualItem3')] },
    { id: 'experience', title: t('checklistExperienceTitle'), items: [t('checklistExperienceItem1'), t('checklistExperienceItem2'), t('checklistExperienceItem3')] },
    { id: 'growth', title: t('checklistGrowthTitle'), items: [t('checklistGrowthItem1'), t('checklistGrowthItem2'), t('checklistGrowthItem3')] },
  ];

  const visualElements = [t('visualElement1'), t('visualElement2'), t('visualElement3'), t('visualElement4'), t('visualElement5'), t('visualElement6'), t('visualElement7')];
  const brandLevels = [
    { title: t('brandLevel1Title'), desc: t('brandLevel1Desc') },
    { title: t('brandLevel2Title'), desc: t('brandLevel2Desc') },
    { title: t('brandLevel3Title'), desc: t('brandLevel3Desc') },
  ];
  const brandPromises = [t('brandPromise1'), t('brandPromise2'), t('brandPromise3')];
  const socialStrategy = [t('social1'), t('social2'), t('social3'), t('social4')];
  const blogLinks = [
    { title: t('blogLink1Title'), href: '/blog/restoran-markalasma-konsept', tag: t('blogLink1Tag') },
    { title: t('blogLink2Title'), href: '/toolkit/menu-matrix', tag: t('blogLink2Tag') },
    { title: t('blogLink3Title'), href: '/kazan-ai', tag: t('blogLink3Tag') },
  ];

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [openGroup, setOpenGroup] = useState<string>('strategy');

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, boolean>;
        startTransition(() => setChecked(parsed));
      } catch { window.localStorage.removeItem(STORAGE_KEY); }
    }
  }, []);

  useEffect(() => { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)); }, [checked]);

  const totalItems = checklistGroups.reduce((sum, g) => sum + g.items.length, 0);
  const completedItems = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  const progressPct = totalItems === 0 ? 0 : (completedItems / totalItems) * 100;
  const toggleItem = (key: string) => setChecked((c) => ({ ...c, [key]: !c[key] }));

  // ── Input Section (Checklist Workbook + Visual Elements) ──────────

  const inputSection = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{t('workbookTitle')}</h2>
          <p className="text-sm text-slate-500">{t('workbookSubtitle')}</p>
        </div>
        <span className="rounded-full bg-pink-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-pink-600">
          {t('checklistBadge')}
        </span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-pink-600 transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="space-y-3">
        {checklistGroups.map((group) => {
          const isOpen = openGroup === group.id;
          return (
            <div key={group.id} className="overflow-hidden rounded-xl border border-slate-200">
              <button onClick={() => setOpenGroup(isOpen ? '' : group.id)}
                className="flex w-full items-center justify-between bg-slate-50 px-4 py-4 text-left">
                <div>
                  <div className="text-sm font-bold text-slate-900">{group.title}</div>
                  <div className="text-xs text-slate-500">{group.items.length}</div>
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>
              {isOpen && (
                <div className="space-y-3 bg-white p-4">
                  {group.items.map((item, index) => {
                    const key = `${group.id}-${index}`;
                    const active = Boolean(checked[key]);
                    return (
                      <button key={key} onClick={() => toggleItem(key)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                          active ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white hover:border-pink-200 hover:bg-pink-50'
                        }`}>
                        <span className={`mt-0.5 h-5 w-5 rounded-md border ${active ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`} />
                        <span className={`text-sm leading-6 ${active ? 'text-emerald-800' : 'text-slate-600'}`}>{item}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Visual Elements */}
      <div className="border-t border-slate-100 pt-5">
        <div className="mb-4 flex items-center gap-2 text-pink-600">
          <Palette size={18} />
          <h3 className="text-base font-bold text-slate-900">{t('visualElementsTitle')}</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {visualElements.map((item, index) => (
            <div key={index} className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <span className="mr-2 text-pink-600">{index + 1}.</span>{item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Result Section (Progress + Brand Levels + Promises + Social) ──

  const resultSection = (
    <div className="space-y-4">
      {/* Progress stats */}
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">{t('statCompleted')}</div>
        <div className="mt-1 text-3xl font-black text-slate-900">{completedItems}/{totalItems}</div>
      </div>
      <div className="rounded-xl bg-pink-50 p-4 ring-1 ring-pink-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('statProgressPct')}</div>
        <div className="mt-1 text-3xl font-black text-pink-600">{progressPct.toFixed(0)}%</div>
      </div>
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">{t('statVisualElements')}</div>
        <div className="mt-1 text-3xl font-black text-slate-900">{visualElements.length}</div>
      </div>

      {/* Brand levels */}
      <div className="border-t border-slate-100 pt-4">
        <div className="mb-3 inline-flex rounded-full bg-pink-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-pink-600">
          {t('brandWhatBadge')}
        </div>
        <div className="space-y-2">
          {brandLevels.map((item) => (
            <div key={item.title} className="rounded-xl bg-slate-50 p-3">
              <div className="text-sm font-bold text-slate-900">{item.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Brand promises */}
      <div className="border-t border-slate-100 pt-4">
        <div className="mb-2 flex items-center gap-2 text-pink-400">
          <Sparkles size={14} />
          <span className="text-[11px] font-bold uppercase tracking-widest">{t('brandPromisesLabel')}</span>
        </div>
        <div className="space-y-2">
          {brandPromises.map((item, index) => (
            <p key={index} className="rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-600">{item}</p>
          ))}
        </div>
      </div>

      {/* Social strategy */}
      <div className="border-t border-slate-100 pt-4">
        <h3 className="mb-2 text-sm font-bold text-slate-900">{t('socialStrategyTitle')}</h3>
        <div className="space-y-2">
          {socialStrategy.map((item, index) => (
            <div key={index} className="rounded-xl border border-slate-100 px-3 py-2.5 text-xs leading-relaxed text-slate-600">{item}</div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Bottom Section (DK Advice + Blog Links) ───────────────────────

  const bottomSection = (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl border border-pink-200 bg-pink-50 p-6 shadow-sm">
        <div className="mb-2 text-xs font-bold uppercase tracking-widest text-pink-600">{t('dkAdviceLabel')}</div>
        <p className="text-sm leading-7 text-slate-700">{t('dkAdviceBody')}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-slate-900">
          <BookOpen size={16} />
          <h3 className="text-base font-bold">{t('usefulLinksTitle')}</h3>
        </div>
        <div className="space-y-3">
          {blogLinks.map((item) => (
            <Link key={item.href} href={item.href}
              className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-pink-200 hover:bg-pink-50">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-600">{item.tag}</div>
                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
              </div>
              <ArrowRight size={16} className="text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ToolkitStudioLayout
      toolId="branding-guide"
      toolName={t('title')}
      toolDescription={t('subtitle')}
      tier="kalfa"
      inputSection={inputSection}
      resultSection={resultSection}
      bottomSection={bottomSection}
      aiInsight={aiInsight}
      onRequestInsight={async () => {
        setAiInsight({ status: 'loading' });
        const res = await getToolkitInsight({ toolId: 'branding-guide', locale, result: { completedItems, totalItems, progressPct } });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}
