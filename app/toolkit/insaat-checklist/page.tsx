'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { AlertTriangle, ArrowRight, Compass, BookOpen, Camera, Check, ChevronDown, ChevronUp, HardHat, Lightbulb, Paintbrush, PartyPopper, Video, Wrench, X } from 'lucide-react';
import { isVideo, resizeImage, validateFile } from '@/lib/utils/image-resize';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';
import ToolResetControls from '@/components/toolkit/ToolResetControls';
import AssumptionsPanel from '@/components/toolkit/AssumptionsPanel';
import DecimalInput from '@/components/toolkit/DecimalInput';
import { CONSTRUCTION_BUDGET_DEFAULTS } from '@/lib/toolkit/benchmarks';
import { formatNumber } from '@/lib/i18n/format';

type PhaseKey = 'design' | 'prep' | 'rough' | 'finish' | 'equipment' | 'opening';
interface ChecklistItem { id: number; text: string; detail: string; }
interface Phase { key: PhaseKey; title: string; subtitle: string; duration: string; icon: typeof HardHat; accent: string; bg: string; items: ChecklistItem[]; }
interface MediaItem { name: string; url: string; type: 'image' | 'video'; }

const STORAGE_KEY = 'insaat-checklist-progress-v1';
const MEDIA_KEY = 'insaat-checklist-media-v1';
// TASK-0518: the example budget is editable; the user's own numbers are kept in this browser.
const BUDGET_KEY = 'insaat-checklist-budget-v1';
type BudgetKey = (typeof CONSTRUCTION_BUDGET_DEFAULTS)[number]['key'];
interface BudgetRow { key: BudgetKey; min: number; max: number; }
const exampleBudget = (): BudgetRow[] => CONSTRUCTION_BUDGET_DEFAULTS.map((r) => ({ key: r.key, min: r.min, max: r.max }));
const BUDGET_STYLE: Record<BudgetKey, { bg: string; ring: string; text: string }> = {
  prep: { bg: 'bg-amber-50', ring: 'ring-amber-200/60', text: 'text-amber-700' },
  rough: { bg: 'bg-orange-50', ring: 'ring-orange-200/60', text: 'text-orange-700' },
  finish: { bg: 'bg-rose-50', ring: 'ring-rose-200/60', text: 'text-rose-700' },
  equipment: { bg: 'bg-sky-50', ring: 'ring-sky-200/60', text: 'text-sky-700' },
  opening: { bg: 'bg-emerald-50', ring: 'ring-emerald-200/60', text: 'text-emerald-700' },
  reserve: { bg: 'bg-slate-100', ring: 'ring-slate-200/60', text: 'text-slate-800' },
};
/** Reads a saved budget; anything malformed falls back to the example. */
function parseBudget(raw: string | null): BudgetRow[] | null {
  if (!raw) return null;
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return null;
    const byKey = new Map<string, { min: number; max: number }>();
    for (const row of data) {
      if (row && typeof row === 'object' && 'key' in row && 'min' in row && 'max' in row) {
        const { key, min, max } = row as { key: unknown; min: unknown; max: unknown };
        if (typeof key === 'string' && typeof min === 'number' && typeof max === 'number' && Number.isFinite(min) && Number.isFinite(max)) byKey.set(key, { min, max });
      }
    }
    return exampleBudget().map((r) => byKey.get(r.key) ? { key: r.key, ...byKey.get(r.key)! } : r);
  } catch { return null; }
}
const initialOpenState: Record<PhaseKey, boolean> = { design: true, prep: false, rough: false, finish: false, equipment: false, opening: false };

export default function InsaatChecklistPage() {
  const t = useTranslations('toolkit.insaatChecklist');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  const phases: Phase[] = [
    // TASK-0449: tikintidən əvvəlki əməliyyat dizaynı. id 53–62 — mövcud id-lər dəyişmir, saxlanmış irəliləyiş pozulmur.
    { key: 'design', title: t('phase_design_title'), subtitle: t('phase_design_subtitle'), duration: t('phase_design_duration'), icon: Compass, accent: 'text-violet-600', bg: 'bg-violet-50', items: Array.from({ length: 10 }, (_, i) => ({ id: i + 53, text: t(`phase_design_item${i + 1}_text`), detail: t(`phase_design_item${i + 1}_detail`) })) },
    { key: 'prep', title: t('phase_prep_title'), subtitle: t('phase_prep_subtitle'), duration: t('phase_prep_duration'), icon: AlertTriangle, accent: 'text-amber-600', bg: 'bg-amber-50', items: Array.from({ length: 12 }, (_, i) => ({ id: i + 1, text: t(`phase_prep_item${i + 1}_text`), detail: t(`phase_prep_item${i + 1}_detail`) })) },
    { key: 'rough', title: t('phase_rough_title'), subtitle: t('phase_rough_subtitle'), duration: t('phase_rough_duration'), icon: HardHat, accent: 'text-orange-600', bg: 'bg-orange-50', items: Array.from({ length: 12 }, (_, i) => ({ id: i + 13, text: t(`phase_rough_item${i + 1}_text`), detail: t(`phase_rough_item${i + 1}_detail`) })) },
    { key: 'finish', title: t('phase_finish_title'), subtitle: t('phase_finish_subtitle'), duration: t('phase_finish_duration'), icon: Paintbrush, accent: 'text-rose-600', bg: 'bg-rose-50', items: Array.from({ length: 12 }, (_, i) => ({ id: i + 25, text: t(`phase_finish_item${i + 1}_text`), detail: t(`phase_finish_item${i + 1}_detail`) })) },
    { key: 'equipment', title: t('phase_equipment_title'), subtitle: t('phase_equipment_subtitle'), duration: t('phase_equipment_duration'), icon: Wrench, accent: 'text-sky-600', bg: 'bg-sky-50', items: Array.from({ length: 9 }, (_, i) => ({ id: i + 37, text: t(`phase_equipment_item${i + 1}_text`), detail: t(`phase_equipment_item${i + 1}_detail`) })) },
    { key: 'opening', title: t('phase_opening_title'), subtitle: t('phase_opening_subtitle'), duration: t('phase_opening_duration'), icon: PartyPopper, accent: 'text-emerald-600', bg: 'bg-emerald-50', items: Array.from({ length: 7 }, (_, i) => ({ id: i + 46, text: t(`phase_opening_item${i + 1}_text`), detail: t(`phase_opening_item${i + 1}_detail`) })) },
  ];

  const [checked, setChecked] = useState<number[]>([]);
  const [openPhases, setOpenPhases] = useState<Record<PhaseKey, boolean>>(initialOpenState);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [media, setMedia] = useState<Record<number, MediaItem[]>>({});
  const [uploadTarget, setUploadTarget] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [budget, setBudget] = useState<BudgetRow[]>(exampleBudget);
  // TASK-0518: only ids that exist in today's list are kept, so an old saved array can never show «63/62».
  const knownIds = new Set(phases.flatMap((p) => p.items.map((it) => it.id)));
  useEffect(() => {
    try {
      const sc = window.localStorage.getItem(STORAGE_KEY);
      const sm = window.localStorage.getItem(MEDIA_KEY);
      if (sc) { const ids: unknown = JSON.parse(sc); if (Array.isArray(ids)) setChecked([...new Set(ids.filter((id): id is number => typeof id === 'number' && knownIds.has(id)))]); }
      if (sm) setMedia(JSON.parse(sm));
      const sb = parseBudget(window.localStorage.getItem(BUDGET_KEY));
      if (sb) setBudget(sb);
    } catch { /* storage unavailable or malformed — start empty */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked)); } catch { /* ignore */ } }, [checked]);
  useEffect(() => { try { window.localStorage.setItem(MEDIA_KEY, JSON.stringify(media)); } catch { /* ignore */ } }, [media]);
  useEffect(() => { try { window.localStorage.setItem(BUDGET_KEY, JSON.stringify(budget)); } catch { /* ignore */ } }, [budget]);
  const budgetMin = budget.reduce((sum, r) => sum + r.min, 0);
  const budgetMax = budget.reduce((sum, r) => sum + r.max, 0);
  const budgetMid = (budgetMin + budgetMax) / 2;
  const money = (n: number) => `${formatNumber(Math.round(n), locale)} ₼`;
  const setBudgetValue = (key: BudgetKey, field: 'min' | 'max', value: number) => setBudget((rows) => rows.map((r) => (r.key === key ? { ...r, [field]: Math.max(0, value) } : r)));

  const totalItems = phases.reduce((sum, p) => sum + p.items.length, 0);
  // Ekranda sıra nömrəsi göstərilir (id yox): dizayn mərhələsi 1-dən başlayır.
  const displayNo = new Map(phases.flatMap((p) => p.items).map((it, idx) => [it.id, idx + 1]));
  const progress = totalItems > 0 ? Math.round((checked.length / totalItems) * 100) : 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const phaseProgress = useMemo(() => phases.map((p) => ({ key: p.key, done: p.items.filter((i) => checked.includes(i.id)).length, total: p.items.length })), [checked]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; if (!file || !uploadTarget) return;
    const validation = validateFile(file, { maxSizeMB: 20, allowVideo: true });
    if (!validation.valid) { setError(validation.error || t('uploadError')); return; }
    const resolved = isVideo(file) ? { name: file.name, url: URL.createObjectURL(file), type: 'video' as const } : await resizeImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 }).then((img) => ({ name: file.name, url: img.url, type: 'image' as const }));
    setMedia((c) => ({ ...c, [uploadTarget]: [...(c[uploadTarget] || []), resolved] })); setUploadTarget(null); setError(''); event.target.value = '';
  }
  function toggleItem(id: number) { setChecked((c) => (c.includes(id) ? c.filter((i) => i !== id) : [...c, id])); }
  function togglePhase(key: PhaseKey) { setOpenPhases((c) => ({ ...c, [key]: !c[key] })); }
  function removeMedia(itemId: number, url: string) { setMedia((c) => ({ ...c, [itemId]: (c[itemId] || []).filter((e) => e.url !== url) })); URL.revokeObjectURL(url); }
  // TASK-0517: «Təmizlə» unticks every item and clears this browser's notes and photos (nothing is stored on a server).
  // Object URLs are not revoked here so «Geri al» can bring the photos back; storage is synced by the effects above.
  type Snapshot = { checked: number[]; notes: Record<number, string>; media: Record<number, MediaItem[]> };
  const snapshot = (): Snapshot => ({ checked, notes, media });
  const restore = (saved: Snapshot) => { setChecked(saved.checked); setNotes(saved.notes); setMedia(saved.media); };
  function clearChecklist() { setChecked([]); setNotes({}); setMedia({}); }

  // ── Input Section ─────────────────────────────────────────────────

  const inputSection = (
    <div className="space-y-6">
      <input ref={fileRef} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden" onChange={handleFileChange} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">{t('listTitle')}</h2>
        <ToolResetControls variant="checklist" snapshot={snapshot} restore={restore} onClear={clearChecklist} />
      </div>

      <div className="space-y-4">
        {phases.map((phase) => {
          const stat = phaseProgress.find((i) => i.key === phase.key)!;
          const isOpen = openPhases[phase.key];
          return (
            <div key={phase.key} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <button type="button" aria-expanded={isOpen} onClick={() => togglePhase(phase.key)} className="flex w-full items-center justify-between px-4 py-4 text-left">
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl ${phase.bg}`}><phase.icon size={18} className={phase.accent} /></div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-bold text-slate-900">{phase.title}</h3><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">{phase.duration}</span></div>
                    <p className="mt-0.5 text-xs text-slate-600">{phase.subtitle}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-600">{stat.done}/{stat.total} {t('sectionCompleted')}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-3 space-y-3">
                  {phase.items.map((item) => { const done = checked.includes(item.id); return (
                    <div key={item.id} className={`rounded-xl border p-3 transition-all ${done ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-50/70'}`}>
                      <div className="flex items-start gap-3">
                        <button type="button" role="checkbox" aria-checked={done} aria-label={item.text} onClick={() => toggleItem(item.id)} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent'}`}><Check size={12} /></button>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-slate-900">{displayNo.get(item.id)}. {item.text}</div>
                          <p className="mt-0.5 text-xs leading-relaxed text-slate-600">{item.detail}</p>
                          <textarea aria-label={t('noteLabel')} value={notes[item.id] || ''} onChange={(e) => setNotes((c) => ({ ...c, [item.id]: e.target.value }))} placeholder={t('notePlaceholder')} className="mt-2 min-h-[60px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-orange-300" />
                          {!!media[item.id]?.length && (
                            <div className="mt-2 flex flex-wrap gap-2">{media[item.id].map((entry) => (
                              <div key={entry.url} className="group relative">{entry.type === 'image' ? <img src={entry.url} alt={entry.name} className="h-16 w-16 rounded-lg object-cover ring-1 ring-slate-200" /> : <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 ring-1 ring-slate-200"><Video size={16} className="text-slate-400" /></div>}
                                <button type="button" aria-label={t('removeMedia')} onClick={() => removeMedia(item.id, entry.url)} className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white"><X size={10} /></button>
                              </div>
                            ))}</div>
                          )}
                          <button type="button" onClick={() => { setUploadTarget(item.id); fileRef.current?.click(); }} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600"><Camera size={12} /> {t('addMedia')}</button>
                        </div>
                      </div>
                    </div>
                  ); })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Budget — TASK-0518: editable example numbers, live total */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="mb-2 text-lg font-black text-slate-900">{t('budgetTitle')}</h3>
        <p className="mb-4 text-sm text-slate-600">{t('budgetSubtitle')}</p>
        <AssumptionsPanel
          title={t('budgetEditTitle')}
          note={t('budgetExampleNote')}
          testId="budget-panel"
          controls={
            <ToolResetControls
              snapshot={() => budget}
              restore={(saved: BudgetRow[]) => setBudget(saved)}
              onClear={() => setBudget(exampleBudget().map((r) => ({ ...r, min: 0, max: 0 })))}
              onLoadExample={() => setBudget(exampleBudget())}
            />
          }
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {budget.map((row) => {
              const st = BUDGET_STYLE[row.key];
              const share = budgetMid > 0 ? Math.round((((row.min + row.max) / 2) / budgetMid) * 100) : null;
              const label = t(`budget_${row.key}_label`);
              return (
                <div key={row.key} className={`${st.bg} rounded-xl p-4 ring-1 ${st.ring}`} data-testid={`budget-row-${row.key}`}>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-700">{label}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <label className="block text-[11px] font-semibold text-slate-700">
                      {t('budgetFrom')}
                      <DecimalInput blankZero inputMode="numeric" value={row.min} onValueChange={(v) => setBudgetValue(row.key, 'min', v)} aria-label={`${label}: ${t('budgetFrom')} (₼)`} data-testid={`budget-${row.key}-min`} className={`mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-bold ${st.text} outline-none focus:border-orange-300`} />
                    </label>
                    <label className="block text-[11px] font-semibold text-slate-700">
                      {t('budgetTo')}
                      <DecimalInput blankZero inputMode="numeric" value={row.max} onValueChange={(v) => setBudgetValue(row.key, 'max', v)} aria-label={`${label}: ${t('budgetTo')} (₼)`} data-testid={`budget-${row.key}-max`} className={`mt-1 w-full rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm font-bold ${st.text} outline-none focus:border-orange-300`} />
                    </label>
                  </div>
                  <div className="mt-1.5 text-xs text-slate-700">{share === null ? '—' : t('budgetShare', { pct: share })}</div>
                </div>
              );
            })}
          </div>
        </AssumptionsPanel>
        <div className="mt-3 rounded-xl bg-slate-950 px-5 py-4 text-center text-white">
          <div className="text-[10px] font-bold uppercase tracking-widest text-amber-400">{t('budgetTotal')}</div>
          <div className="mt-1 text-3xl font-black" data-testid="budget-total">{budgetMax > 0 ? (budgetMin === budgetMax ? money(budgetMin) : `${money(budgetMin)} – ${money(budgetMax)}`) : '—'}</div>
          <p className="mt-1 text-xs text-slate-300">{t('budgetTotalNote')}</p>
        </div>
        {budget.some((r) => r.min > r.max) ? <p className="mt-2 text-xs font-semibold text-amber-800" role="alert">{t('budgetMinOverMax')}</p> : null}
      </div>
    </div>
  );

  // ── Result Section ────────────────────────────────────────────────

  const resultSection = (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="flex items-center justify-between text-sm font-semibold"><span className="text-slate-600">{t('progressLabel')}</span><span className="text-slate-900">{checked.length}/{totalItems}</span></div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300 transition-all" style={{ width: `${progress}%` }} /></div>
        <div className="mt-1 text-xs text-slate-600">{progress}% {t('progressCompleted')}</div>
      </div>

      {/* Phase breakdown */}
      <div className="space-y-1.5">
        {phaseProgress.map((p) => (<div key={p.key} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"><span className="text-xs text-slate-600">{phases.find((ph) => ph.key === p.key)?.title}</span><span className={`text-xs font-bold ${p.done === p.total ? 'text-emerald-600' : 'text-slate-600'}`}>{p.done}/{p.total}</span></div>))}
      </div>

      {/* DK Advice */}
      <div className="border-t border-slate-100 pt-4">
        <div className="rounded-xl border border-orange-200 bg-white p-4">
          <div className="flex items-center gap-2"><Lightbulb size={16} className="text-orange-600" /><h3 className="text-sm font-bold text-slate-900">{t('dkAdviceTitle')}</h3></div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{t('dkAdviceDesc')}</p>
        </div>
      </div>

      {/* Common mistakes */}
      <div className="border-t border-slate-100 pt-4">
        <div className="mb-2 flex items-center gap-2"><BookOpen size={14} className="text-orange-600" /><h3 className="text-sm font-bold text-slate-900">{t('commonMistakesTitle')}</h3></div>
        <ul className="space-y-1.5 text-xs leading-relaxed text-slate-600"><li>{t('mistake1')}</li><li>{t('mistake2')}</li><li>{t('mistake3')}</li><li>{t('mistake4')}</li></ul>
      </div>

      {/* Related */}
      <div className="border-t border-slate-100 pt-4 space-y-2">
        {[{ title: t('related1Title'), href: '/toolkit/checklist', tag: t('related1Tag') }, { title: t('related2Title'), href: '/blog/1-porsiya-food-cost-hesablama', tag: t('related2Tag') }, { title: t('related3Title'), href: '/toolkit/basabas', tag: t('related3Tag') }].map((item) => (
          <Link key={item.href} href={item.href} className="group block rounded-lg border border-slate-200 bg-slate-50 p-3 transition-all hover:border-orange-200 hover:bg-orange-50">
            <div className="text-[9px] font-bold uppercase tracking-widest text-orange-600">{item.tag}</div>
            <div className="mt-1 text-xs font-bold text-slate-900 group-hover:text-orange-700">{item.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );

  // ── Bottom Section ────────────────────────────────────────────────

  const bottomSection = (
    <div className="rounded-2xl bg-gradient-to-br from-dk-red-strong to-dk-red-deep p-6 text-white shadow-xl shadow-red-500/15">
      <h3 className="text-xl font-black">{t('ocaqTitle')}</h3>
      <p className="mt-3 text-sm leading-6 text-white/80">{t('ocaqDesc')}</p>
      <Link href="/auth/register" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-black text-dk-red-deep">{t('ocaqCta')} <ArrowRight size={15} /></Link>
    </div>
  );

  return (
    <ToolkitStudioLayout toolId="insaat-checklist" toolName={t('pageTitle')} toolDescription={t('pageDesc')} tier="kalfa"
      inputSection={inputSection} resultSection={resultSection} bottomSection={bottomSection}
      aiInsight={aiInsight}
      onRequestInsight={async () => {
        setAiInsight({ status: 'loading' });
        const res = await getToolkitInsight({ toolId: 'insaat-checklist', locale, result: { progress, checkedCount: checked.length, totalItems } });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}
