'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  HardHat,
  Lightbulb,
  Paintbrush,
  PartyPopper,
  RotateCcw,
  Video,
  Wrench,
  X,
} from 'lucide-react';
import { isVideo, resizeImage, validateFile } from '@/lib/utils/image-resize';

type PhaseKey = 'prep' | 'rough' | 'finish' | 'equipment' | 'opening';

interface ChecklistItem {
  id: number;
  text: string;
  detail: string;
}

interface Phase {
  key: PhaseKey;
  title: string;
  subtitle: string;
  duration: string;
  icon: typeof HardHat;
  accent: string;
  bg: string;
  items: ChecklistItem[];
}

interface MediaItem {
  name: string;
  url: string;
  type: 'image' | 'video';
}

const STORAGE_KEY = 'insaat-checklist-progress-v1';
const MEDIA_KEY = 'insaat-checklist-media-v1';

const initialOpenState: Record<PhaseKey, boolean> = {
  prep: true,
  rough: false,
  finish: false,
  equipment: false,
  opening: false,
};

export default function InsaatChecklistPage() {
  const t = useTranslations('toolkit.insaatChecklist');

  const phases: Phase[] = [
    {
      key: 'prep',
      title: t('phase_prep_title'),
      subtitle: t('phase_prep_subtitle'),
      duration: t('phase_prep_duration'),
      icon: AlertTriangle,
      accent: 'text-amber-600',
      bg: 'bg-amber-50',
      items: [
        { id: 1, text: t('phase_prep_item1_text'), detail: t('phase_prep_item1_detail') },
        { id: 2, text: t('phase_prep_item2_text'), detail: t('phase_prep_item2_detail') },
        { id: 3, text: t('phase_prep_item3_text'), detail: t('phase_prep_item3_detail') },
        { id: 4, text: t('phase_prep_item4_text'), detail: t('phase_prep_item4_detail') },
        { id: 5, text: t('phase_prep_item5_text'), detail: t('phase_prep_item5_detail') },
        { id: 6, text: t('phase_prep_item6_text'), detail: t('phase_prep_item6_detail') },
        { id: 7, text: t('phase_prep_item7_text'), detail: t('phase_prep_item7_detail') },
        { id: 8, text: t('phase_prep_item8_text'), detail: t('phase_prep_item8_detail') },
        { id: 9, text: t('phase_prep_item9_text'), detail: t('phase_prep_item9_detail') },
        { id: 10, text: t('phase_prep_item10_text'), detail: t('phase_prep_item10_detail') },
        { id: 11, text: t('phase_prep_item11_text'), detail: t('phase_prep_item11_detail') },
        { id: 12, text: t('phase_prep_item12_text'), detail: t('phase_prep_item12_detail') },
      ],
    },
    {
      key: 'rough',
      title: t('phase_rough_title'),
      subtitle: t('phase_rough_subtitle'),
      duration: t('phase_rough_duration'),
      icon: HardHat,
      accent: 'text-orange-600',
      bg: 'bg-orange-50',
      items: [
        { id: 13, text: t('phase_rough_item1_text'), detail: t('phase_rough_item1_detail') },
        { id: 14, text: t('phase_rough_item2_text'), detail: t('phase_rough_item2_detail') },
        { id: 15, text: t('phase_rough_item3_text'), detail: t('phase_rough_item3_detail') },
        { id: 16, text: t('phase_rough_item4_text'), detail: t('phase_rough_item4_detail') },
        { id: 17, text: t('phase_rough_item5_text'), detail: t('phase_rough_item5_detail') },
        { id: 18, text: t('phase_rough_item6_text'), detail: t('phase_rough_item6_detail') },
        { id: 19, text: t('phase_rough_item7_text'), detail: t('phase_rough_item7_detail') },
        { id: 20, text: t('phase_rough_item8_text'), detail: t('phase_rough_item8_detail') },
        { id: 21, text: t('phase_rough_item9_text'), detail: t('phase_rough_item9_detail') },
        { id: 22, text: t('phase_rough_item10_text'), detail: t('phase_rough_item10_detail') },
        { id: 23, text: t('phase_rough_item11_text'), detail: t('phase_rough_item11_detail') },
        { id: 24, text: t('phase_rough_item12_text'), detail: t('phase_rough_item12_detail') },
      ],
    },
    {
      key: 'finish',
      title: t('phase_finish_title'),
      subtitle: t('phase_finish_subtitle'),
      duration: t('phase_finish_duration'),
      icon: Paintbrush,
      accent: 'text-rose-600',
      bg: 'bg-rose-50',
      items: [
        { id: 25, text: t('phase_finish_item1_text'), detail: t('phase_finish_item1_detail') },
        { id: 26, text: t('phase_finish_item2_text'), detail: t('phase_finish_item2_detail') },
        { id: 27, text: t('phase_finish_item3_text'), detail: t('phase_finish_item3_detail') },
        { id: 28, text: t('phase_finish_item4_text'), detail: t('phase_finish_item4_detail') },
        { id: 29, text: t('phase_finish_item5_text'), detail: t('phase_finish_item5_detail') },
        { id: 30, text: t('phase_finish_item6_text'), detail: t('phase_finish_item6_detail') },
        { id: 31, text: t('phase_finish_item7_text'), detail: t('phase_finish_item7_detail') },
        { id: 32, text: t('phase_finish_item8_text'), detail: t('phase_finish_item8_detail') },
        { id: 33, text: t('phase_finish_item9_text'), detail: t('phase_finish_item9_detail') },
        { id: 34, text: t('phase_finish_item10_text'), detail: t('phase_finish_item10_detail') },
        { id: 35, text: t('phase_finish_item11_text'), detail: t('phase_finish_item11_detail') },
        { id: 36, text: t('phase_finish_item12_text'), detail: t('phase_finish_item12_detail') },
      ],
    },
    {
      key: 'equipment',
      title: t('phase_equipment_title'),
      subtitle: t('phase_equipment_subtitle'),
      duration: t('phase_equipment_duration'),
      icon: Wrench,
      accent: 'text-sky-600',
      bg: 'bg-sky-50',
      items: [
        { id: 37, text: t('phase_equipment_item1_text'), detail: t('phase_equipment_item1_detail') },
        { id: 38, text: t('phase_equipment_item2_text'), detail: t('phase_equipment_item2_detail') },
        { id: 39, text: t('phase_equipment_item3_text'), detail: t('phase_equipment_item3_detail') },
        { id: 40, text: t('phase_equipment_item4_text'), detail: t('phase_equipment_item4_detail') },
        { id: 41, text: t('phase_equipment_item5_text'), detail: t('phase_equipment_item5_detail') },
        { id: 42, text: t('phase_equipment_item6_text'), detail: t('phase_equipment_item6_detail') },
        { id: 43, text: t('phase_equipment_item7_text'), detail: t('phase_equipment_item7_detail') },
        { id: 44, text: t('phase_equipment_item8_text'), detail: t('phase_equipment_item8_detail') },
        { id: 45, text: t('phase_equipment_item9_text'), detail: t('phase_equipment_item9_detail') },
      ],
    },
    {
      key: 'opening',
      title: t('phase_opening_title'),
      subtitle: t('phase_opening_subtitle'),
      duration: t('phase_opening_duration'),
      icon: PartyPopper,
      accent: 'text-emerald-600',
      bg: 'bg-emerald-50',
      items: [
        { id: 46, text: t('phase_opening_item1_text'), detail: t('phase_opening_item1_detail') },
        { id: 47, text: t('phase_opening_item2_text'), detail: t('phase_opening_item2_detail') },
        { id: 48, text: t('phase_opening_item3_text'), detail: t('phase_opening_item3_detail') },
        { id: 49, text: t('phase_opening_item4_text'), detail: t('phase_opening_item4_detail') },
        { id: 50, text: t('phase_opening_item5_text'), detail: t('phase_opening_item5_detail') },
        { id: 51, text: t('phase_opening_item6_text'), detail: t('phase_opening_item6_detail') },
        { id: 52, text: t('phase_opening_item7_text'), detail: t('phase_opening_item7_detail') },
      ],
    },
  ];

  const budgetCards = [
    { labelKey: 'budget_prep_label', rangeKey: 'budget_prep_range', pctKey: 'budget_prep_pct', bg: 'bg-amber-50', ring: 'ring-amber-200/60', text: 'text-amber-700' },
    { labelKey: 'budget_rough_label', rangeKey: 'budget_rough_range', pctKey: 'budget_rough_pct', bg: 'bg-orange-50', ring: 'ring-orange-200/60', text: 'text-orange-700' },
    { labelKey: 'budget_finish_label', rangeKey: 'budget_finish_range', pctKey: 'budget_finish_pct', bg: 'bg-rose-50', ring: 'ring-rose-200/60', text: 'text-rose-700' },
    { labelKey: 'budget_equipment_label', rangeKey: 'budget_equipment_range', pctKey: 'budget_equipment_pct', bg: 'bg-sky-50', ring: 'ring-sky-200/60', text: 'text-sky-700' },
    { labelKey: 'budget_opening_label', rangeKey: 'budget_opening_range', pctKey: 'budget_opening_pct', bg: 'bg-emerald-50', ring: 'ring-emerald-200/60', text: 'text-emerald-700' },
    { labelKey: 'budget_reserve_label', rangeKey: 'budget_reserve_range', pctKey: 'budget_reserve_pct', bg: 'bg-slate-100', ring: 'ring-slate-200/60', text: 'text-slate-800' },
  ] as const;

  const [checked, setChecked] = useState<number[]>([]);
  const [openPhases, setOpenPhases] = useState<Record<PhaseKey, boolean>>(initialOpenState);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [media, setMedia] = useState<Record<number, MediaItem[]>>({});
  const [uploadTarget, setUploadTarget] = useState<number | null>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedChecked = window.localStorage.getItem(STORAGE_KEY);
    const savedMedia = window.localStorage.getItem(MEDIA_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedChecked) setChecked(JSON.parse(savedChecked));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedMedia) setMedia(JSON.parse(savedMedia));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  useEffect(() => {
    window.localStorage.setItem(MEDIA_KEY, JSON.stringify(media));
  }, [media]);

  const totalItems = phases.reduce((sum, phase) => sum + phase.items.length, 0);
  const progress = Math.round((checked.length / totalItems) * 100);

  const phaseProgress = useMemo(
    () =>
      phases.map((phase) => ({
        key: phase.key,
        done: phase.items.filter((item) => checked.includes(item.id)).length,
        total: phase.items.length,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [checked],
  );

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !uploadTarget) return;

    const validation = validateFile(file, { maxSizeMB: 20, allowVideo: true });
    if (!validation.valid) {
      setError(validation.error || 'Fayl yüklənmədi.');
      return;
    }

    const resolved = isVideo(file)
      ? ({ name: file.name, url: URL.createObjectURL(file), type: 'video' as const })
      : await resizeImage(file, { maxWidth: 1600, maxHeight: 1600, quality: 0.82 }).then((image) => ({
          name: file.name,
          url: image.url,
          type: 'image' as const,
        }));

    setMedia((current) => ({
      ...current,
      [uploadTarget]: [...(current[uploadTarget] || []), resolved],
    }));
    setUploadTarget(null);
    setError('');
    event.target.value = '';
  }

  function toggleItem(id: number) {
    setChecked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  function togglePhase(key: PhaseKey) {
    setOpenPhases((current) => ({ ...current, [key]: !current[key] }));
  }

  function removeMedia(itemId: number, url: string) {
    setMedia((current) => ({
      ...current,
      [itemId]: (current[itemId] || []).filter((entry) => entry.url !== url),
    }));
    URL.revokeObjectURL(url);
  }

  function resetChecklist() {
    setChecked([]);
    setNotes({});
    Object.values(media).flat().forEach((entry) => URL.revokeObjectURL(entry.url));
    setMedia({});
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(MEDIA_KEY);
  }

  return (
    <div className="min-h-screen bg-[var(--dk-paper)] pb-16">
      <input
        ref={fileRef}
        type="file"
        accept="image/*,video/mp4,video/webm,video/quicktime"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="border-b border-orange-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/toolkit" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-orange-600">
            <ChevronLeft size={16} />
            {t('backLink')}
          </Link>
          <button
            onClick={resetChecklist}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-orange-200 hover:text-orange-600"
          >
            <RotateCcw size={14} />
            {t('resetBtn')}
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 pt-8 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_360px]">
        <section>
          <div className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-orange-950 px-6 py-8 text-white shadow-xl sm:px-8">
            <span className="inline-flex rounded-full bg-orange-500/20 px-3 py-1 text-[11px] font-black uppercase tracking-[0.3em] text-orange-200">
              {t('badgeLabel')}
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">{t('pageTitle')}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-orange-100/80 sm:text-base">
              {t('pageDesc')}
            </p>

            <div className="mt-6 rounded-3xl bg-white/10 p-5 ring-1 ring-white/10">
              <div className="flex items-center justify-between text-sm font-semibold text-white">
                <span>{t('progressLabel')}</span>
                <span>{checked.length}/{totalItems}</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-amber-300" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-2 text-xs text-orange-100/70">%{progress} {t('progressCompleted')}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {phases.map((phase) => {
              const stat = phaseProgress.find((item) => item.key === phase.key)!;
              return (
                <div key={phase.key} className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-sm">
                  <button onClick={() => togglePhase(phase.key)} className="flex w-full items-center justify-between px-5 py-5 text-left sm:px-6">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 flex h-12 w-12 items-center justify-center rounded-2xl ${phase.bg}`}>
                        <phase.icon size={22} className={phase.accent} />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-black text-slate-900">{phase.title}</h2>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                            {phase.duration}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{phase.subtitle}</p>
                        <p className="mt-2 text-xs font-semibold text-slate-400">{stat.done}/{stat.total} {t('sectionCompleted')}</p>
                      </div>
                    </div>
                    {openPhases[phase.key] ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                  </button>

                  {openPhases[phase.key] && (
                    <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                      <div className="space-y-3">
                        {phase.items.map((item) => {
                          const done = checked.includes(item.id);
                          return (
                            <div key={item.id} className={`rounded-2xl border p-4 transition-all ${done ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-slate-50/70'}`}>
                              <div className="flex items-start gap-3">
                                <button
                                  onClick={() => toggleItem(item.id)}
                                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors ${done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 bg-white text-transparent'}`}
                                >
                                  <Check size={14} />
                                </button>
                                <div className="min-w-0 flex-1">
                                  <div className="text-sm font-bold text-slate-900">{item.id}. {item.text}</div>
                                  <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
                                  <textarea
                                    value={notes[item.id] || ''}
                                    onChange={(event) => setNotes((current) => ({ ...current, [item.id]: event.target.value }))}
                                    placeholder={t('notePlaceholder')}
                                    className="mt-3 min-h-[76px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-orange-300"
                                  />

                                  {!!media[item.id]?.length && (
                                    <div className="mt-3 flex flex-wrap gap-3">
                                      {media[item.id].map((entry) => (
                                        <div key={entry.url} className="group relative">
                                          {entry.type === 'image' ? (
                                            <img src={entry.url} alt={entry.name} className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200 sm:h-24 sm:w-24" />
                                          ) : (
                                            <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-100 ring-1 ring-slate-200 sm:h-24 sm:w-24">
                                              <Video size={20} className="text-slate-400" />
                                            </div>
                                          )}
                                          <button
                                            onClick={() => removeMedia(item.id, entry.url)}
                                            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                          >
                                            <X size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  <button
                                    onClick={() => {
                                      setUploadTarget(item.id);
                                      fileRef.current?.click();
                                    }}
                                    className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-slate-500 transition-colors hover:text-orange-600"
                                  >
                                    <Camera size={13} />
                                    {t('addMedia')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="mt-10">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">{t('budgetTitle')}</h2>
              <p className="mt-2 text-sm text-slate-500">{t('budgetSubtitle')}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {budgetCards.map((card) => (
                <div key={card.labelKey} className={`${card.bg} rounded-2xl p-5 ring-1 ${card.ring}`}>
                  <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">{t(card.labelKey)}</div>
                  <div className={`mt-2 text-2xl font-black ${card.text}`}>{t(card.rangeKey)}</div>
                  <div className="mt-1 text-xs text-slate-400">{t('budgetPct', { pct: t(card.pctKey) })}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-3xl bg-slate-950 px-6 py-6 text-center text-white">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-amber-400">{t('budgetTotal')}</div>
              <div className="mt-2 text-4xl font-black">{t('budgetTotalValue')}</div>
              <p className="mt-2 text-sm text-slate-400">{t('budgetTotalNote')}</p>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-[1.6rem] border border-orange-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-100">
                <Lightbulb size={20} className="text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-black text-slate-900">{t('dkAdviceTitle')}</div>
                <div className="text-xs text-slate-500">{t('dkAdviceSubtitle')}</div>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {t('dkAdviceDesc')}
            </p>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-slate-900">
              <BookOpen size={18} className="text-orange-600" />
              <h3 className="text-base font-black">{t('commonMistakesTitle')}</h3>
            </div>
            <ul className="space-y-3 text-sm leading-6 text-slate-600">
              <li>{t('mistake1')}</li>
              <li>{t('mistake2')}</li>
              <li>{t('mistake3')}</li>
              <li>{t('mistake4')}</li>
            </ul>
          </div>

          <div className="rounded-[1.6rem] bg-gradient-to-br from-[var(--dk-red)] to-[var(--dk-red-strong)] p-6 text-white shadow-xl shadow-red-500/15">
            <h3 className="text-xl font-black">{t('ocaqTitle')}</h3>
            <p className="mt-3 text-sm leading-6 text-white/80">
              {t('ocaqDesc')}
            </p>
            <Link href="/auth/register" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[var(--dk-red)]">
              {t('ocaqCta')}
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-black text-slate-900">{t('relatedTitle')}</h3>
            <div className="mt-4 space-y-3">
              {[
                { title: t('related1Title'), href: '/toolkit/checklist', tag: t('related1Tag') },
                { title: t('related2Title'), href: '/blog/1-porsiya-food-cost-hesablama', tag: t('related2Tag') },
                { title: t('related3Title'), href: '/toolkit/basabas', tag: t('related3Tag') },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="group block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-orange-200 hover:bg-orange-50">
                  <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-orange-600">{item.tag}</div>
                  <div className="mt-2 text-sm font-bold text-slate-900 group-hover:text-orange-700">{item.title}</div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
