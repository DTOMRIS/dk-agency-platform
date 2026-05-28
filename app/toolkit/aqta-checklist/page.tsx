'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { AlertTriangle, ArrowRight, BookOpen, ChevronDown, ChevronUp, ClipboardCheck, Droplets, Flame, Lightbulb, RefreshCcw, Shield, ShieldAlert, Soup, Users, Utensils, WalletCards, Waves } from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';

type FrequencyTab = 'daily' | 'weekly' | 'monthly';
type Section = { id: string; title: string; subtitle: string; icon: typeof Shield; accent: string; accentBg: string; accentRing: string; items: { id: string; text: string; detail: string }[] };
const STORAGE_KEY = 'dk-aqta-checklist';

export default function AqtaChecklistPage() {
  const t = useTranslations('toolkit.aqtaChecklist');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  const sections: Section[] = [
    { id: 'storage', title: t('storage_title'), subtitle: t('storage_subtitle'), icon: Soup, accent: 'text-red-600', accentBg: 'bg-red-50', accentRing: 'ring-red-200/60', items: [
      { id: 'storage-1', text: t('storage_item1_text'), detail: t('storage_item1_detail') }, { id: 'storage-2', text: t('storage_item2_text'), detail: t('storage_item2_detail') },
      { id: 'storage-3', text: t('storage_item3_text'), detail: t('storage_item3_detail') }, { id: 'storage-4', text: t('storage_item4_text'), detail: t('storage_item4_detail') },
      { id: 'storage-5', text: t('storage_item5_text'), detail: t('storage_item5_detail') },
    ]},
    { id: 'hygiene', title: t('hygiene_title'), subtitle: t('hygiene_subtitle'), icon: Users, accent: 'text-red-600', accentBg: 'bg-red-50', accentRing: 'ring-red-200/60', items: [
      { id: 'hygiene-1', text: t('hygiene_item1_text'), detail: t('hygiene_item1_detail') }, { id: 'hygiene-2', text: t('hygiene_item2_text'), detail: t('hygiene_item2_detail') },
      { id: 'hygiene-3', text: t('hygiene_item3_text'), detail: t('hygiene_item3_detail') }, { id: 'hygiene-4', text: t('hygiene_item4_text'), detail: t('hygiene_item4_detail') },
    ]},
    { id: 'kitchen', title: t('kitchen_title'), subtitle: t('kitchen_subtitle'), icon: Utensils, accent: 'text-red-600', accentBg: 'bg-red-50', accentRing: 'ring-red-200/60', items: [
      { id: 'kitchen-1', text: t('kitchen_item1_text'), detail: t('kitchen_item1_detail') }, { id: 'kitchen-2', text: t('kitchen_item2_text'), detail: t('kitchen_item2_detail') },
      { id: 'kitchen-3', text: t('kitchen_item3_text'), detail: t('kitchen_item3_detail') }, { id: 'kitchen-4', text: t('kitchen_item4_text'), detail: t('kitchen_item4_detail') },
    ]},
    { id: 'water', title: t('water_title'), subtitle: t('water_subtitle'), icon: Droplets, accent: 'text-red-600', accentBg: 'bg-red-50', accentRing: 'ring-red-200/60', items: [
      { id: 'water-1', text: t('water_item1_text'), detail: t('water_item1_detail') }, { id: 'water-2', text: t('water_item2_text'), detail: t('water_item2_detail') },
      { id: 'water-3', text: t('water_item3_text'), detail: t('water_item3_detail') },
    ]},
    { id: 'prep', title: t('prep_title'), subtitle: t('prep_subtitle'), icon: Flame, accent: 'text-red-600', accentBg: 'bg-red-50', accentRing: 'ring-red-200/60', items: [
      { id: 'prep-1', text: t('prep_item1_text'), detail: t('prep_item1_detail') }, { id: 'prep-2', text: t('prep_item2_text'), detail: t('prep_item2_detail') },
      { id: 'prep-3', text: t('prep_item3_text'), detail: t('prep_item3_detail') }, { id: 'prep-4', text: t('prep_item4_text'), detail: t('prep_item4_detail') },
    ]},
    { id: 'docs', title: t('docs_title'), subtitle: t('docs_subtitle'), icon: WalletCards, accent: 'text-red-600', accentBg: 'bg-red-50', accentRing: 'ring-red-200/60', items: [
      { id: 'docs-1', text: t('docs_item1_text'), detail: t('docs_item1_detail') }, { id: 'docs-2', text: t('docs_item2_text'), detail: t('docs_item2_detail') },
      { id: 'docs-3', text: t('docs_item3_text'), detail: t('docs_item3_detail') }, { id: 'docs-4', text: t('docs_item4_text'), detail: t('docs_item4_detail') },
    ]},
    { id: 'hall', title: t('hall_title'), subtitle: t('hall_subtitle'), icon: Waves, accent: 'text-red-600', accentBg: 'bg-red-50', accentRing: 'ring-red-200/60', items: [
      { id: 'hall-1', text: t('hall_item1_text'), detail: t('hall_item1_detail') }, { id: 'hall-2', text: t('hall_item2_text'), detail: t('hall_item2_detail') },
      { id: 'hall-3', text: t('hall_item3_text'), detail: t('hall_item3_detail') },
    ]},
    { id: 'allergen', title: t('allergen_title'), subtitle: t('allergen_subtitle'), icon: ShieldAlert, accent: 'text-red-600', accentBg: 'bg-red-50', accentRing: 'ring-red-200/60', items: [
      { id: 'allergen-1', text: t('allergen_item1_text'), detail: t('allergen_item1_detail') }, { id: 'allergen-2', text: t('allergen_item2_text'), detail: t('allergen_item2_detail') },
      { id: 'allergen-3', text: t('allergen_item3_text'), detail: t('allergen_item3_detail') },
    ]},
  ];

  const frequencyPlan: Record<FrequencyTab, string[]> = {
    daily: [t('daily_item1'), t('daily_item2'), t('daily_item3'), t('daily_item4'), t('daily_item5')],
    weekly: [t('weekly_item1'), t('weekly_item2'), t('weekly_item3'), t('weekly_item4')],
    monthly: [t('monthly_item1'), t('monthly_item2'), t('monthly_item3'), t('monthly_item4'), t('monthly_item5')],
  };

  const fineReasons = [t('fine1'), t('fine2'), t('fine3'), t('fine4'), t('fine5'), t('fine6'), t('fine7'), t('fine8'), t('fine9'), t('fine10')];
  const crossBoards = [
    { label: t('cross_red_label'), use: t('cross_red_use'), color: 'bg-red-500' },
    { label: t('cross_yellow_label'), use: t('cross_yellow_use'), color: 'bg-amber-400' },
    { label: t('cross_blue_label'), use: t('cross_blue_use'), color: 'bg-blue-500' },
    { label: t('cross_green_label'), use: t('cross_green_use'), color: 'bg-emerald-500' },
    { label: t('cross_white_label'), use: t('cross_white_use'), color: 'bg-slate-200 text-slate-700' },
  ];
  const blogLinks = [
    { title: t('related1Title'), href: '/blog/aqta-cerime-checklist', tag: t('related1Tag') },
    { title: t('related2Title'), href: '/toolkit/checklist', tag: t('related2Tag') },
    { title: t('related3Title'), href: '/toolkit/insaat-checklist', tag: t('related3Tag') },
  ];

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [openSection, setOpenSection] = useState<string>(sections[0].id);
  const [frequencyTab, setFrequencyTab] = useState<FrequencyTab>('daily');

  useEffect(() => { try { const saved = localStorage.getItem(STORAGE_KEY); if (saved) { setChecked(new Set(JSON.parse(saved) as string[])); } } catch {} }, []);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked])); }, [checked]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const totalItems = useMemo(() => sections.reduce((sum, s) => sum + s.items.length, 0), []);
  const progress = Math.round((checked.size / totalItems) * 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sectionProgress = useMemo(() => sections.map((s) => { const done = s.items.filter((i) => checked.has(i.id)).length; return { id: s.id, done, total: s.items.length, pct: Math.round((done / s.items.length) * 100) }; }), [checked]);

  const toggleCheck = (id: string) => setChecked((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const resetAll = () => { setChecked(new Set()); localStorage.removeItem(STORAGE_KEY); };

  // ── Input Section ─────────────────────────────────────────────────

  const inputSection = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-base font-bold text-slate-900">{t('checklistTitle')}</h2><p className="text-sm text-slate-500">{t('checklistSubtitle')}</p></div>
        <button onClick={resetAll} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-red-500"><RefreshCcw size={13} /> {t('resetBtn')}</button>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const stats = sectionProgress.find((i) => i.id === section.id)!;
          const Icon = section.icon;
          const isOpen = openSection === section.id;
          return (
            <div key={section.id} className="overflow-hidden rounded-xl border border-slate-200/80">
              <button onClick={() => setOpenSection(isOpen ? '' : section.id)} className="flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-slate-50">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${section.accentBg}`}><Icon size={18} className={section.accent} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-slate-900">{section.title}</h3><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${section.accentBg} ${section.accent}`}>{stats.done}/{stats.total}</span></div>
                  <p className="mt-0.5 text-xs text-slate-500">{section.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 sm:block"><div className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-500" style={{ width: `${stats.pct}%` }} /></div>
                  {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/40">
                  {section.items.map((item) => { const done = checked.has(item.id); return (
                    <button key={item.id} onClick={() => toggleCheck(item.id)} className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-white/70">
                      <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent'}`}><ClipboardCheck size={12} /></div>
                      <div className="min-w-0"><div className={`text-sm font-semibold ${done ? 'text-emerald-700' : 'text-slate-900'}`}>{item.text}</div><p className="mt-0.5 text-xs leading-relaxed text-slate-500">{item.detail}</p></div>
                    </button>
                  ); })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hygiene Plan */}
      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-2 text-base font-bold text-slate-900">{t('hygienePlanTitle')}</h3>
        <p className="mb-4 text-sm text-slate-500">{t('hygienePlanSubtitle')}</p>
        <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
          {(['daily', 'weekly', 'monthly'] as FrequencyTab[]).map((tab) => (
            <button key={tab} onClick={() => setFrequencyTab(tab)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${frequencyTab === tab ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}>
              {tab === 'daily' ? t('tabDaily') : tab === 'weekly' ? t('tabWeekly') : t('tabMonthly')}
            </button>
          ))}
        </div>
        <div className="overflow-hidden rounded-xl ring-1 ring-slate-200/80">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('tableColRegime')}</th><th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('tableColTask')}</th></tr></thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {frequencyPlan[frequencyTab].map((item, index) => (<tr key={item}><td className="px-4 py-3 text-xs font-bold text-red-600">{String(index + 1).padStart(2, '0')}</td><td className="px-4 py-3 text-sm text-slate-700">{item}</td></tr>))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ── Result Section ────────────────────────────────────────────────

  const resultSection = (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('progressLabel')}</div>
        <div className="flex items-end gap-2 mt-1"><div className="text-3xl font-black tabular-nums text-red-600">{progress}%</div><div className="pb-1 text-sm text-slate-500">{checked.size}/{totalItems}</div></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('riskZoneLabel')}</div>
        <div className="mt-1 text-3xl font-black text-red-600">{fineReasons.length}</div>
        <div className="mt-1 text-xs text-slate-500">{t('riskZoneSubtitle')}</div>
      </div>

      {/* AQTA info */}
      <div className="border-t border-slate-100 pt-4">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4"><div className="mb-2 flex items-center gap-2"><Shield size={16} className="text-red-600" /><h3 className="text-sm font-bold text-slate-900">{t('aqtaCardTitle')}</h3></div><p className="text-xs leading-relaxed text-slate-600">{t('aqtaCardDesc')}</p></div>
      </div>

      {/* Fine reasons */}
      <div className="border-t border-slate-100 pt-4">
        <div className="mb-2 flex items-center gap-2"><AlertTriangle size={14} className="text-red-600" /><h3 className="text-sm font-bold text-slate-900">{t('fineReasonsTitle')}</h3></div>
        <div className="space-y-1.5">{fineReasons.map((reason, i) => (<div key={i} className="flex items-start gap-2"><div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-[10px] font-black text-red-600">{i + 1}</div><p className="text-xs leading-relaxed text-slate-600">{reason}</p></div>))}</div>
      </div>

      {/* Cross-contamination */}
      <div className="border-t border-slate-100 pt-4">
        <div className="mb-2 flex items-center gap-2"><Droplets size={14} className="text-red-600" /><h3 className="text-sm font-bold text-slate-900">{t('crossContamTitle')}</h3></div>
        <p className="mb-3 text-xs leading-relaxed text-slate-600">{t('crossContamDesc')}</p>
        <div className="space-y-1.5">{crossBoards.map((b) => (<div key={b.label} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5"><span className={`inline-flex min-w-16 items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-bold text-white ${b.color}`}>{b.label}</span><span className="text-xs text-slate-600">{b.use}</span></div>))}</div>
      </div>
    </div>
  );

  // ── Bottom Section ────────────────────────────────────────────────

  const bottomSection = (
    <>
      <div className="mb-8 grid gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-6 text-white">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-red-500/15 blur-3xl" />
          <div className="relative"><div className="mb-3 flex items-center gap-2"><Lightbulb size={16} className="text-red-400" /><h3 className="text-base font-bold text-red-300">{t('dkAdviceTitle')}</h3></div>
            <p className="text-sm leading-relaxed text-slate-300">{t('dkAdviceDesc')}</p>
            <Link href="/blog/aqta-cerime-checklist" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-red-300 hover:text-red-200">{t('dkAdviceLink')} <ArrowRight size={14} /></Link></div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-red-600 to-rose-600 p-6 text-white shadow-xl shadow-red-500/15">
          <div className="mb-3 flex items-center gap-2"><Waves size={18} /><h2 className="text-base font-bold">{t('ocaqTitle')}</h2></div>
          <p className="text-sm leading-relaxed text-white/85">{t('ocaqDesc')}</p>
          <Link href="/auth/register" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-red-600 hover:bg-red-50">{t('ocaqCta')} <ArrowRight size={15} /></Link>
        </div>
      </div>
      <div className="rounded-2xl bg-slate-50 p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-2.5"><BookOpen size={18} className="text-red-600" /><h3 className="text-lg font-bold text-slate-900">{t('relatedTitle')}</h3></div>
        <div className="grid gap-4 md:grid-cols-3">
          {blogLinks.map((link) => (<Link key={link.href} href={link.href} className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/70 transition-all hover:shadow-md"><span className="text-[10px] font-bold uppercase tracking-widest text-red-600">{link.tag}</span><h4 className="mt-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-red-600">{link.title}</h4><div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-red-600">{t('relatedViewBtn')} <ArrowRight size={12} /></div></Link>))}
        </div>
      </div>
    </>
  );

  return (
    <ToolkitStudioLayout toolId="aqta-checklist" toolName={t('title')} toolDescription={t('description')} tier="sagird"
      inputSection={inputSection} resultSection={resultSection} bottomSection={bottomSection}
      aiInsight={aiInsight}
      onRequestInsight={async () => {
        setAiInsight({ status: 'loading' });
        const res = await getToolkitInsight({ toolId: 'aqta-checklist', locale, result: { progress, checkedCount: checked.size, totalItems } });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}
