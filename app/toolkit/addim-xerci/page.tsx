'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowRight, BookOpen, Footprints, Lightbulb, RotateCcw } from 'lucide-react';
import ToolkitStudioLayout from '@/components/toolkit/ToolkitStudioLayout';
import { calculateAddimXerci, hourlyFromMonthly, tripsToMinutes } from '@/lib/toolkit/addimXerci';

type Mode = 'minutes' | 'trips';

const DEFAULTS = {
  workers: 3,
  extraMinutes: 40,
  trips: 60,
  secondsPerTrip: 40,
  hourlyWage: 6,
  workDays: 26,
  monthlySalary: 1250,
  monthlyHours: 208,
};

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString('az-AZ')} ₼`;
}

function formatHours(value: number) {
  return (Math.round(value * 10) / 10).toLocaleString('az-AZ');
}

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-teal-300 focus:ring-2 focus:ring-teal-500/20';
const labelClass = 'mb-1.5 block text-xs font-semibold text-slate-700';

function NumberField({
  id,
  label,
  hint,
  value,
  onChange,
  step,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step={step ?? 1}
        value={value}
        onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
        className={inputClass}
      />
      {hint && <p className="mt-1 text-xs text-slate-600">{hint}</p>}
    </div>
  );
}

export default function AddimXerciPage() {
  const t = useTranslations('toolkit.addimXerci');

  const [mode, setMode] = useState<Mode>('minutes');
  const [workers, setWorkers] = useState(DEFAULTS.workers);
  const [extraMinutes, setExtraMinutes] = useState(DEFAULTS.extraMinutes);
  const [trips, setTrips] = useState(DEFAULTS.trips);
  const [secondsPerTrip, setSecondsPerTrip] = useState(DEFAULTS.secondsPerTrip);
  const [hourlyWage, setHourlyWage] = useState(DEFAULTS.hourlyWage);
  const [workDays, setWorkDays] = useState(DEFAULTS.workDays);
  const [monthlySalary, setMonthlySalary] = useState(DEFAULTS.monthlySalary);
  const [monthlyHours, setMonthlyHours] = useState(DEFAULTS.monthlyHours);

  const minutesPerDay = mode === 'minutes' ? extraMinutes : tripsToMinutes(trips, secondsPerTrip);

  const result = useMemo(
    () =>
      calculateAddimXerci({
        workers,
        extraMinutesPerDay: minutesPerDay,
        hourlyWage,
        workDaysPerMonth: workDays,
      }),
    [workers, minutesPerDay, hourlyWage, workDays]
  );

  const resetAll = () => {
    setMode('minutes');
    setWorkers(DEFAULTS.workers);
    setExtraMinutes(DEFAULTS.extraMinutes);
    setTrips(DEFAULTS.trips);
    setSecondsPerTrip(DEFAULTS.secondsPerTrip);
    setHourlyWage(DEFAULTS.hourlyWage);
    setWorkDays(DEFAULTS.workDays);
    setMonthlySalary(DEFAULTS.monthlySalary);
    setMonthlyHours(DEFAULTS.monthlyHours);
  };

  const howToSteps = [t('howTo1'), t('howTo2'), t('howTo3'), t('howTo4'), t('howTo5')];

  const usefulLinks = [
    { title: t('link1Title'), tag: t('link1Tag'), href: '/toolkit/metbex-istasyon' },
    { title: t('link2Title'), tag: t('link2Tag'), href: '/toolkit/personel-planlayici' },
    { title: t('link3Title'), tag: t('link3Tag'), href: '/toolkit/insaat-checklist' },
  ];

  const modeButton = (value: Mode, label: string) => (
    <button
      type="button"
      onClick={() => setMode(value)}
      aria-pressed={mode === value}
      className={`flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
        mode === value
          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
          : 'text-slate-700 hover:text-slate-900'
      }`}
    >
      {label}
    </button>
  );

  // ── Input Section ─────────────────────────────────────────────────

  const inputSection = (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-base font-bold text-slate-900">{t('calculatorTitle')}</h2>
          <p className="text-sm text-slate-600">{t('calculatorSubtitle')}</p>
        </div>
        <button
          type="button"
          onClick={resetAll}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 transition-colors hover:text-teal-700"
        >
          <RotateCcw size={13} /> {t('reset')}
        </button>
      </div>

      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {modeButton('minutes', t('modeMinutes'))}
        {modeButton('trips', t('modeTrips'))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField id="workers" label={t('labelWorkers')} value={workers} onChange={setWorkers} />
        {mode === 'minutes' ? (
          <NumberField
            id="extraMinutes"
            label={t('labelExtraMinutes')}
            hint={t('hintExtraMinutes')}
            value={extraMinutes}
            onChange={setExtraMinutes}
          />
        ) : (
          <>
            <NumberField id="trips" label={t('labelTrips')} value={trips} onChange={setTrips} />
            <NumberField
              id="secondsPerTrip"
              label={t('labelSecondsPerTrip')}
              hint={t('hintTripsMinutes', { minutes: formatHours(minutesPerDay) })}
              value={secondsPerTrip}
              onChange={setSecondsPerTrip}
            />
          </>
        )}
        <NumberField
          id="hourlyWage"
          label={t('labelHourlyWage')}
          value={hourlyWage}
          onChange={setHourlyWage}
          step={0.5}
        />
        <NumberField
          id="workDays"
          label={t('labelWorkDays')}
          value={workDays}
          onChange={setWorkDays}
        />
      </div>

      {/* Saatlıq əmək haqqı köməkçisi */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h3 className="text-sm font-bold text-slate-900">{t('wageHelperTitle')}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <NumberField
            id="monthlySalary"
            label={t('labelMonthlySalary')}
            value={monthlySalary}
            onChange={setMonthlySalary}
          />
          <NumberField
            id="monthlyHours"
            label={t('labelMonthlyHours')}
            value={monthlyHours}
            onChange={setMonthlyHours}
          />
          <button
            type="button"
            onClick={() =>
              setHourlyWage(Math.round(hourlyFromMonthly(monthlySalary, monthlyHours) * 100) / 100)
            }
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
          >
            {t('wageHelperApply')}
          </button>
        </div>
      </div>

      {/* Necə ölçülür */}
      <div className="border-t border-slate-100 pt-5">
        <div className="mb-3 flex items-center gap-2 text-teal-700">
          <Footprints size={18} />
          <h3 className="text-base font-bold text-slate-900">{t('howToTitle')}</h3>
        </div>
        <ol className="space-y-2">
          {howToSteps.map((step, index) => (
            <li
              key={index}
              className="flex gap-3 rounded-xl bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-700"
            >
              <span className="font-black text-teal-700">{index + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );

  // ── Result Section ────────────────────────────────────────────────

  const resultSection = (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-900 p-4 text-white" data-testid="addim-monthly">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-300">
          {t('statMonthly')}
        </div>
        <div className="mt-1 text-3xl font-black">{formatCurrency(result.monthlyCost)}</div>
      </div>
      <div className="rounded-xl bg-teal-50 p-4 ring-1 ring-teal-200/60" data-testid="addim-yearly">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
          {t('statYearly')}
        </div>
        <div className="mt-1 text-2xl font-black text-teal-800">
          {formatCurrency(result.yearlyCost)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div
          className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60"
          data-testid="addim-hours-day"
        >
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
            {t('statHoursPerDay')}
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {formatHours(result.lostHoursPerDay)}
          </div>
        </div>
        <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
          <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">
            {t('statHoursPerMonth')}
          </div>
          <div className="mt-1 text-2xl font-black text-slate-900">
            {formatHours(result.lostHoursPerMonth)}
          </div>
        </div>
      </div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
        {t('onlyWageNote')}
      </p>
    </div>
  );

  // ── Bottom Section ────────────────────────────────────────────────

  const bottomSection = (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-teal-300">
          <Lightbulb size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">{t('dkAdviceLabel')}</span>
        </div>
        <p className="text-sm leading-7 text-slate-300">{t('dkAdviceBody')}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-slate-900">
          <BookOpen size={16} />
          <h3 className="text-base font-bold">{t('usefulLinksTitle')}</h3>
        </div>
        <div className="space-y-3">
          {usefulLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-teal-200 hover:bg-teal-50"
            >
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-widest text-slate-600">{item.tag}</div>
                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-slate-500 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ToolkitStudioLayout
      toolId="addim-xerci"
      toolName={t('title')}
      toolDescription={t('subtitle')}
      tier="sagird"
      inputSection={inputSection}
      resultSection={resultSection}
      bottomSection={bottomSection}
    />
  );
}
