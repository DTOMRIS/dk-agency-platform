'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Clipboard,
  Download,
  Loader2,
  Sparkles,
  UserCircle,
} from 'lucide-react';
import { generatePersona } from '@/app/actions/persona-ai-generator';
import type { PersonaJSON } from '@/app/actions/persona-ai-generator';

// ── CONSTANTS ──────────────────────────────────────────────

const RESTAURANT_TYPES = [
  'milli_metbex',
  'fast_food',
  'cafe',
  'fine_dining',
  'pizza_burger',
  'sushi_asiya',
  'cay_evi',
  'diger',
] as const;

const CITIES = [
  'baki',
  'gence',
  'sumqayit',
  'istanbul',
  'ankara',
  'diger',
] as const;

const AVG_CHECK_RANGES = ['5-15', '15-30', '30-60', '60+'] as const;

const SERVICE_MODELS = ['zal', 'catdirilma', 'takeaway', 'catering'] as const;

const AGE_RANGES = ['18-24', '25-34', '35-44', '45-54', '55+'] as const;

const VISIT_TIMES = ['seher', 'nahar', 'axsam', 'gece'] as const;

const VISIT_FREQUENCIES = ['her_gun', 'heftede_2_3', 'heftede_1', 'ayda_2_3', 'nadir'] as const;

const TABLE_SIZES = ['1', '2', '3-4', '5+'] as const;

const PAYMENT_METHODS = ['nagd', 'kart', 'online'] as const;

const ARRIVAL_METHODS = ['piyada', 'avtomobil', 'taksi', 'catdirilma_sifaris'] as const;

const HISTORY_KEY = 'dk_persona_history';
const MAX_HISTORY = 3;

// ── TYPES ──────────────────────────────────────────────────

type HistoryItem = {
  name: string;
  tagline: string;
  date: string;
};

// ── COMPONENT ──────────────────────────────────────────────

export default function CustomerPersona({ backHref = '/dashboard/marketinq-ocagi' }: { backHref?: string }) {
  const t = useTranslations('marketinq.customerPersona');
  const locale = useLocale();

  // Step 1: Restaurant profile
  const [restaurantType, setRestaurantType] = useState<string>(RESTAURANT_TYPES[0]);
  const [city, setCity] = useState<string>(CITIES[0]);
  const [customCity, setCustomCity] = useState('');
  const [avgCheckRange, setAvgCheckRange] = useState<string>(AVG_CHECK_RANGES[1]);
  const [serviceModels, setServiceModels] = useState<string[]>(['zal']);

  // Step 2: Customer observations
  const [ageRanges, setAgeRanges] = useState<string[]>(['25-34']);
  const [genderFemalePercent, setGenderFemalePercent] = useState(50);
  const [visitTimes, setVisitTimes] = useState<string[]>(['nahar']);
  const [visitFrequency, setVisitFrequency] = useState<string>(VISIT_FREQUENCIES[2]);
  const [tableSize, setTableSize] = useState<string>(TABLE_SIZES[1]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(['kart']);
  const [arrivalMethods, setArrivalMethods] = useState<string[]>(['piyada']);
  const [notes, setNotes] = useState('');

  // AI result
  const [persona, setPersona] = useState<PersonaJSON | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    let frameId: number | null = null;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as HistoryItem[];
        frameId = window.requestAnimationFrame(() => setHistory(parsed));
      }
    } catch { /* empty */ }
    return () => {
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  function toggleMulti(current: string[], value: string, setter: (v: string[]) => void) {
    setter(current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  }

  const handleGenerate = useCallback(() => {
    if (!serviceModels.length || !ageRanges.length) {
      setAiError(t('validation_error'));
      return;
    }
    setAiError(null);
    startTransition(async () => {
      const result = await generatePersona({
        restaurantType: t(`restaurant_types.${restaurantType}`),
        city: city === 'diger' && customCity.trim() ? customCity.trim() : t(`cities.${city}`),
        avgCheckRange: `${avgCheckRange} AZN`,
        serviceModels: serviceModels.map((m) => t(`service_models.${m}`)),
        ageRanges,
        genderFemalePercent,
        visitTimes: visitTimes.map((v) => t(`visit_times.${v}`)),
        visitFrequency: t(`frequencies.${visitFrequency}`),
        tableSize: t(`table_sizes.${tableSize}`),
        paymentMethods: paymentMethods.map((p) => t(`payment_methods.${p}`)),
        arrivalMethods: arrivalMethods.map((a) => t(`arrival_methods.${a}`)),
        notes,
      });

      if (result.ok && result.persona) {
        setPersona(result.persona);
        setAiError(null);
        const newItem: HistoryItem = {
          name: result.persona.name,
          tagline: result.persona.tagline,
          date: new Date().toLocaleDateString(locale === 'az' ? 'az-AZ' : locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : 'en-US'),
        };
        const updated = [newItem, ...history].slice(0, MAX_HISTORY);
        setHistory(updated);
        try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch { /* empty */ }
      } else {
        setPersona(null);
        setAiError(t(`errors.${result.error ?? 'ai-failed'}`));
      }
    });
  }, [ageRanges, avgCheckRange, city, customCity, genderFemalePercent, history, locale, notes, paymentMethods, arrivalMethods, restaurantType, serviceModels, startTransition, t, tableSize, visitFrequency, visitTimes]);

  function handleNewPersona() {
    setPersona(null);
    setAiError(null);
  }

  function buildCopyText(p: PersonaJSON): string {
    return `${t('title')}
${p.name}, ${p.age} yaş — ${p.occupation}
${p.tagline}

${t('demographics_label')}: ${p.demographics.income}, ${p.demographics.family}, ${p.demographics.education}
${t('psychographics_label')}: ${p.psychographics.values.join(', ')}
${t('motivation')}: ${p.psychographics.dining_motivation}
${t('digital_label')}: ${p.digital.social_media.join(', ')} (${p.digital.peak_online})
${t('pain_points')}: ${p.pain_points.join(', ')}
${t('marketing_msg')}: ${p.marketing_message}
${t('best_channels')}: ${p.best_channels.join(', ')}
${t('menu_rec')}: ${p.menu_recommendation}
${t('dos')}: ${p.dos.join(', ')}
${t('donts')}: ${p.donts.join(', ')}`;
  }

  async function copyResult() {
    if (!persona) return;
    await navigator.clipboard.writeText(buildCopyText(persona));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const inputClass = 'min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-[var(--dk-navy)] outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20';
  const checkboxClass = 'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-bold transition';
  const activeCheckbox = 'border-[var(--dk-gold)] bg-[var(--dk-gold)]/10 text-[var(--dk-navy)]';
  const inactiveCheckbox = 'border-slate-200 bg-white text-slate-500 hover:border-slate-300';

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 print:max-w-none print:px-0">
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          header, nav, footer, .no-print { display: none !important; }
          .print-surface { box-shadow: none !important; border-color: #d1d5db !important; break-inside: avoid; }
        }
      `}</style>

      <Link href={backHref} className="no-print mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />
        {t('back_to_tools')}
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700">
            USTA
          </div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)] sm:text-3xl">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('subtitle')}</p>
        </div>
        {persona && (
          <div className="no-print flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={copyResult} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[var(--dk-navy)] shadow-sm transition hover:border-[var(--dk-gold)]">
              <Clipboard size={16} />
              {copied ? t('copied') : t('copy_result')}
            </button>
            <button type="button" onClick={() => window.print()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[var(--dk-navy)] shadow-sm transition hover:border-[var(--dk-gold)]">
              <Download size={16} />
              {t('export_pdf')}
            </button>
          </div>
        )}
      </div>

      {/* ── FORM (hide when persona rendered) ── */}
      {!persona && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* STEP 1: Restaurant Profile */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('step1_title')}</h2>
            <div className="space-y-4">
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('restaurant_type')}</span>
                <select value={restaurantType} onChange={(e) => setRestaurantType(e.target.value)} className={inputClass}>
                  {RESTAURANT_TYPES.map((rt) => <option key={rt} value={rt}>{t(`restaurant_types.${rt}`)}</option>)}
                </select>
              </label>
              <div>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('city')}</span>
                <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
                  {CITIES.map((c) => <option key={c} value={c}>{t(`cities.${c}`)}</option>)}
                </select>
                {city === 'diger' && (
                  <input value={customCity} onChange={(e) => setCustomCity(e.target.value)} placeholder={t('custom_city')} className={`${inputClass} mt-2`} maxLength={60} />
                )}
              </div>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('avg_check')}</span>
                <select value={avgCheckRange} onChange={(e) => setAvgCheckRange(e.target.value)} className={inputClass}>
                  {AVG_CHECK_RANGES.map((r) => <option key={r} value={r}>{r} AZN</option>)}
                </select>
              </label>
              <div>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('service_model')}</span>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_MODELS.map((sm) => (
                    <button key={sm} type="button" onClick={() => toggleMulti(serviceModels, sm, setServiceModels)} className={`${checkboxClass} ${serviceModels.includes(sm) ? activeCheckbox : inactiveCheckbox}`}>
                      {t(`service_models.${sm}`)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* STEP 2: Customer Observations */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('step2_title')}</h2>
            <div className="space-y-4">
              <div>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('age_range')}</span>
                <div className="flex flex-wrap gap-2">
                  {AGE_RANGES.map((ar) => (
                    <button key={ar} type="button" onClick={() => toggleMulti(ageRanges, ar, setAgeRanges)} className={`${checkboxClass} ${ageRanges.includes(ar) ? activeCheckbox : inactiveCheckbox}`}>
                      {ar}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('gender_ratio')}</span>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-blue-600">{t('male')} {100 - genderFemalePercent}%</span>
                  <input type="range" min={0} max={100} value={genderFemalePercent} onChange={(e) => setGenderFemalePercent(Number(e.target.value))} className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-[var(--dk-gold)]" />
                  <span className="text-sm font-bold text-pink-600">{t('female')} {genderFemalePercent}%</span>
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('visit_time')}</span>
                <div className="flex flex-wrap gap-2">
                  {VISIT_TIMES.map((vt) => (
                    <button key={vt} type="button" onClick={() => toggleMulti(visitTimes, vt, setVisitTimes)} className={`${checkboxClass} ${visitTimes.includes(vt) ? activeCheckbox : inactiveCheckbox}`}>
                      {t(`visit_times.${vt}`)}
                    </button>
                  ))}
                </div>
              </div>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('visit_frequency')}</span>
                <select value={visitFrequency} onChange={(e) => setVisitFrequency(e.target.value)} className={inputClass}>
                  {VISIT_FREQUENCIES.map((vf) => <option key={vf} value={vf}>{t(`frequencies.${vf}`)}</option>)}
                </select>
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('table_size')}</span>
                <select value={tableSize} onChange={(e) => setTableSize(e.target.value)} className={inputClass}>
                  {TABLE_SIZES.map((ts) => <option key={ts} value={ts}>{t(`table_sizes.${ts}`)} {t('person')}</option>)}
                </select>
              </label>
              <div>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('payment_method')}</span>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((pm) => (
                    <button key={pm} type="button" onClick={() => toggleMulti(paymentMethods, pm, setPaymentMethods)} className={`${checkboxClass} ${paymentMethods.includes(pm) ? activeCheckbox : inactiveCheckbox}`}>
                      {t(`payment_methods.${pm}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('arrival_method')}</span>
                <div className="flex flex-wrap gap-2">
                  {ARRIVAL_METHODS.map((am) => (
                    <button key={am} type="button" onClick={() => toggleMulti(arrivalMethods, am, setArrivalMethods)} className={`${checkboxClass} ${arrivalMethods.includes(am) ? activeCheckbox : inactiveCheckbox}`}>
                      {t(`arrival_methods.${am}`)}
                    </button>
                  ))}
                </div>
              </div>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('notes')}</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={300} rows={3} className={`${inputClass} py-2`} placeholder={t('notes_placeholder')} />
                <span className="mt-1 block text-xs text-slate-400">{notes.length}/300</span>
              </label>
            </div>
          </section>
        </div>
      )}

      {/* ── GENERATE BUTTON ── */}
      {!persona && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending || !serviceModels.length || !ageRanges.length}
            className="no-print inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 text-base font-bold text-white shadow-lg transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {t('generate_btn')}
          </button>

          {isPending && (
            <div className="w-full max-w-md space-y-3">
              <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-9/12 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-10/12 animate-pulse rounded bg-slate-100" />
              <p className="text-center text-sm text-slate-500">{t('generating')}</p>
            </div>
          )}

          {!isPending && aiError && (
            <div className="w-full max-w-lg rounded-lg border border-amber-200 bg-amber-50 p-3 text-center text-sm font-semibold text-amber-800">
              {aiError}
            </div>
          )}
        </div>
      )}

      {/* ── PERSONA CARD ── */}
      {persona && (
        <div className="space-y-6">
          {/* Profile + Insights row */}
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)]">
            {/* LEFT: Profile */}
            <section className="print-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--dk-gold)]/10">
                  <UserCircle size={32} className="text-[var(--dk-gold)]" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-[var(--dk-navy)]">{persona.name}, {persona.age}</h2>
                  <p className="text-sm font-semibold text-slate-500">{persona.occupation} — {persona.location}</p>
                </div>
              </div>
              <p className="mb-5 rounded-lg bg-[var(--dk-gold)]/10 px-3 py-2 text-sm font-bold italic text-[var(--dk-navy)]">
                &ldquo;{persona.tagline}&rdquo;
              </p>

              <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">{t('demographics_label')}</h3>
              <ul className="space-y-1.5 text-sm text-slate-700">
                <li><span className="font-bold">{t('income')}:</span> {persona.demographics.income}</li>
                <li><span className="font-bold">{t('family')}:</span> {persona.demographics.family}</li>
                <li><span className="font-bold">{t('education')}:</span> {persona.demographics.education}</li>
              </ul>
            </section>

            {/* RIGHT: Insights */}
            <section className="print-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-5 sm:grid-cols-2">
                {/* Psychographics */}
                <div>
                  <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">{t('psychographics_label')}</h3>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {persona.psychographics.values.map((v) => (
                      <span key={v} className="rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-xs font-bold text-purple-700">{v}</span>
                    ))}
                  </div>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {persona.psychographics.interests.map((i) => (
                      <span key={i} className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{i}</span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600"><span className="font-bold">{t('motivation')}:</span> {persona.psychographics.dining_motivation}</p>
                </div>

                {/* Digital */}
                <div>
                  <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">{t('digital_label')}</h3>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {persona.digital.social_media.map((s) => (
                      <span key={s} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{s}</span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600"><span className="font-bold">{t('content_type')}:</span> {persona.digital.content_type}</p>
                  <p className="mt-1 text-sm text-slate-600"><span className="font-bold">{t('peak_online')}:</span> {persona.digital.peak_online}</p>
                </div>

                {/* Behavior */}
                <div>
                  <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">{t('behavior_label')}</h3>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    <li><span className="font-bold">{t('trigger')}:</span> {persona.behavior.decision_trigger}</li>
                    <li><span className="font-bold">{t('discovery')}:</span> {persona.behavior.discovery_channel}</li>
                    <li><span className="font-bold">{t('loyalty')}:</span> {persona.behavior.loyalty_driver}</li>
                  </ul>
                </div>

                {/* Pain Points */}
                <div>
                  <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">{t('pain_points')}</h3>
                  <ul className="space-y-1.5">
                    {persona.pain_points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-0.5 text-red-500">&#x26A0;</span> {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* BOTTOM: Marketing recommendations */}
          <section className="print-surface rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Marketing message */}
              <div className="rounded-lg bg-[var(--dk-gold)]/10 p-4">
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[var(--dk-navy)]">{t('marketing_msg')}</h3>
                <p className="text-sm font-bold leading-6 text-[var(--dk-navy)]">{persona.marketing_message}</p>
              </div>

              {/* Best channels */}
              <div>
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">{t('best_channels')}</h3>
                <div className="flex flex-wrap gap-2">
                  {persona.best_channels.map((c) => (
                    <span key={c} className="rounded-full border border-[var(--dk-gold)] bg-[var(--dk-gold)]/10 px-3 py-1.5 text-sm font-bold text-[var(--dk-navy)]">{c}</span>
                  ))}
                </div>
                <h3 className="mb-2 mt-4 text-xs font-extrabold uppercase tracking-wider text-slate-400">{t('menu_rec')}</h3>
                <p className="text-sm text-slate-700">{persona.menu_recommendation}</p>
              </div>

              {/* Do's */}
              <div>
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-emerald-600">{t('dos')}</h3>
                <ul className="space-y-1.5">
                  {persona.dos.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-0.5 text-emerald-500">&#x2713;</span> {d}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div>
                <h3 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-red-600">{t('donts')}</h3>
                <ul className="space-y-1.5">
                  {persona.donts.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="mt-0.5 text-red-500">&#x2717;</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* New Persona button */}
          <div className="no-print flex justify-center">
            <button type="button" onClick={handleNewPersona} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--dk-gold)] bg-white px-5 text-sm font-bold text-[var(--dk-navy)] transition hover:bg-[var(--dk-gold)]/10">
              <Sparkles size={16} />
              {t('new_persona_btn')}
            </button>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {history.length > 0 && (
        <section className="no-print mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-3 text-lg font-extrabold text-[var(--dk-navy)]">{t('history_title')}</h2>
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div key={`${item.name}-${idx}`} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <div>
                  <p className="text-sm font-bold text-[var(--dk-navy)]">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.tagline}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{item.date}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
