'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Flame, Snowflake, Users, Wallet, Crown, Sun, Zap, Sunset } from 'lucide-react';
import DecimalInput from '@/components/toolkit/DecimalInput';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import ToolResetControls from '@/components/toolkit/ToolResetControls';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';
import { formatNumber } from '@/lib/i18n/format';
import AssumptionsPanel, { AssumptionField } from '@/components/toolkit/AssumptionsPanel';
import {
  KITCHEN_AVG_CHECK_DEFAULTS,
  KITCHEN_EXTRA_PCT_DEFAULT,
  KITCHEN_LABOR_TARGET_DEFAULT,
  KITCHEN_SALARY_DEFAULT,
  KITCHEN_WORK_DAYS,
} from '@/lib/toolkit/benchmarks';

type Concept = 'fast_food' | 'qsr_burger' | 'qsr_pizza' | 'dark_kitchen' | 'catering';
interface Kanallar {
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
  driveThru: boolean;
}

// TASK-0518: salary, employer extras, average check and the staff-cost target are EXAMPLE
// assumptions — single source in lib/toolkit/benchmarks.ts, editable on the page.
interface KitchenAssumptions {
  salary: number;
  extraPct: number;
  avgCheck: Record<Concept, number>;
  laborTarget: number;
}
const exampleAssumptions = (): KitchenAssumptions => ({
  salary: KITCHEN_SALARY_DEFAULT,
  extraPct: KITCHEN_EXTRA_PCT_DEFAULT,
  avgCheck: { ...KITCHEN_AVG_CHECK_DEFAULTS },
  laborTarget: KITCHEN_LABOR_TARGET_DEFAULT,
});

interface PlannerState {
  concept: Concept;
  menuSkuSayisi: number;
  gunlukFisSayisi: number;
  kanallar: Kanallar;
}

/** «Nümunəni yüklə» values (TASK-0517): a fast food spot with 25 menu items and 180 orders a day. */
const EXAMPLE: PlannerState = {
  concept: 'fast_food',
  menuSkuSayisi: 25,
  gunlukFisSayisi: 180,
  kanallar: { dineIn: true, takeaway: true, delivery: true, driveThru: false },
};

interface StationDef {
  key: string;
  hot: boolean;
}

function istasyonlar(sku: number): StationDef[] {
  if (sku <= 15)
    return [
      { key: 'grillFryer', hot: true },
      { key: 'assemblyCashier', hot: false },
    ];
  if (sku <= 30)
    return [
      { key: 'grillHot', hot: true },
      { key: 'fryerCold', hot: false },
      { key: 'assemblySauce', hot: false },
    ];
  if (sku <= 50)
    return [
      { key: 'hotKitchen', hot: true },
      { key: 'fryer', hot: true },
      { key: 'coldSalad', hot: false },
      { key: 'assemblyPack', hot: false },
    ];
  return [
    { key: 'hotKitchenA', hot: true },
    { key: 'hotKitchenB', hot: true },
    { key: 'fryer', hot: true },
    { key: 'coldSalad', hot: false },
    { key: 'assembly', hot: false },
    { key: 'expeditor', hot: false },
  ];
}

function compute(
  input: {
    concept: Concept;
    menuSkuSayisi: number;
    gunlukFisSayisi: number;
    kanallar: Kanallar;
  },
  a: KitchenAssumptions
) {
  const stations = istasyonlar(input.menuSkuSayisi);
  const istasyonSayisi = stations.length;

  let bazaKadro = istasyonSayisi;
  const fis = input.gunlukFisSayisi;
  if (fis >= 100 && fis < 200) bazaKadro += 1;
  else if (fis >= 200 && fis < 400) bazaKadro += 2;
  else if (fis >= 400) bazaKadro += 3;
  if (input.kanallar.delivery) bazaKadro += 1;
  if (input.kanallar.driveThru) bazaKadro += 2;
  if (input.kanallar.dineIn && fis > 200) bazaKadro += 1;

  const peakKadro = Math.ceil(bazaKadro * 1.5);
  const axsamVardiyasi = Math.ceil(bazaKadro * 0.8);
  const shiftLeaderLazim = fis >= 200;

  // Per-station distribution (>=1 each; extras to hot stations first)
  const perStation = stations.map(() => 1);
  let extra = bazaKadro - istasyonSayisi;
  const order = [...stations.keys()].sort(
    (a, b) => Number(stations[b].hot) - Number(stations[a].hot)
  );
  let oi = 0;
  while (extra > 0) {
    perStation[order[oi % order.length]] += 1;
    extra--;
    oi++;
  }

  const ayligLabor = Math.round(bazaKadro * a.salary * (1 + a.extraPct / 100));
  const aylikGelir = fis * a.avgCheck[input.concept] * KITCHEN_WORK_DAYS;
  // TASK-0515: 0 checks → no revenue → no labour % and no status (was 0% → «ideal»).
  const laborFaizi = aylikGelir > 0 ? (ayligLabor / aylikGelir) * 100 : null;
  const status: 'ideal' | 'dikkat' | 'kritik' | 'none' =
    laborFaizi === null
      ? 'none'
      : laborFaizi <= a.laborTarget
        ? 'ideal'
        : laborFaizi <= a.laborTarget + 8
          ? 'dikkat'
          : 'kritik';

  return {
    stations,
    perStation,
    istasyonSayisi,
    bazaKadro,
    peakKadro,
    axsamVardiyasi,
    shiftLeaderLazim,
    ayligLabor,
    laborFaizi,
    status,
  };
}

export default function MetbexIstasyonPage() {
  const t = useTranslations('toolkit.metbexIstasyon');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';

  const [concept, setConcept] = useState<Concept>(EXAMPLE.concept);
  const [menuSkuSayisi, setMenuSkuSayisi] = useState(EXAMPLE.menuSkuSayisi);
  const [gunlukFisSayisi, setGunlukFisSayisi] = useState(EXAMPLE.gunlukFisSayisi);
  const [kanallar, setKanallar] = useState<Kanallar>(EXAMPLE.kanallar);
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });
  const [assumptions, setAssumptions] = useState<KitchenAssumptions>(exampleAssumptions);

  const snapshot = (): PlannerState => ({ concept, menuSkuSayisi, gunlukFisSayisi, kanallar });
  const apply = (v: PlannerState) => {
    setConcept(v.concept);
    setMenuSkuSayisi(v.menuSkuSayisi);
    setGunlukFisSayisi(v.gunlukFisSayisi);
    setKanallar(v.kanallar);
  };
  // TASK-0517: no menu items or no orders → nothing to plan (no stations from zeros).
  const ready = menuSkuSayisi > 0 && gunlukFisSayisi > 0;

  const calc = useMemo(
    () => compute({ concept, menuSkuSayisi, gunlukFisSayisi, kanallar }, assumptions),
    [concept, menuSkuSayisi, gunlukFisSayisi, kanallar, assumptions]
  );

  const statusStyle = {
    ideal: {
      text: 'text-emerald-700',
      bg: 'bg-emerald-50',
      ring: 'ring-emerald-200/60',
      label: t('result.ideal'),
    },
    dikkat: {
      text: 'text-amber-800',
      bg: 'bg-amber-50',
      ring: 'ring-amber-200/60',
      label: t('result.dikkat'),
    },
    kritik: {
      text: 'text-red-700',
      bg: 'bg-red-50',
      ring: 'ring-red-200/60',
      label: t('result.kritik'),
    },
    none: {
      text: 'text-slate-700',
      bg: 'bg-slate-50',
      ring: 'ring-slate-200/60',
      label: t('result.noChecks'),
    },
  }[calc.status];

  const fmt = (n: number) => formatNumber(n, locale);

  const concepts: Concept[] = ['fast_food', 'qsr_burger', 'qsr_pizza', 'dark_kitchen', 'catering'];
  const conceptLabel: Record<Concept, string> = {
    fast_food: t('concept.fastFood'),
    qsr_burger: t('concept.qsrBurger'),
    qsr_pizza: t('concept.qsrPizza'),
    dark_kitchen: t('concept.darkKitchen'),
    catering: t('concept.catering'),
  };
  const kanalKeys: (keyof Kanallar)[] = ['dineIn', 'takeaway', 'delivery', 'driveThru'];
  const kanalLabel: Record<keyof Kanallar, string> = {
    dineIn: t('kanallar.dineIn'),
    takeaway: t('kanallar.takeaway'),
    delivery: t('kanallar.delivery'),
    driveThru: t('kanallar.driveThru'),
  };

  const inputSection = (
    <div className="space-y-6">
      <ToolResetControls
        snapshot={snapshot}
        restore={apply}
        onClear={() =>
          apply({
            ...snapshot(),
            menuSkuSayisi: 0,
            gunlukFisSayisi: 0,
            kanallar: { dineIn: false, takeaway: false, delivery: false, driveThru: false },
          })
        }
        onLoadExample={() => apply(EXAMPLE)}
      />

      <div>
        <label htmlFor="mi-concept" className="mb-1.5 block text-xs font-semibold text-slate-700">
          {t('concept.label')}
        </label>
        <select
          id="mi-concept"
          value={concept}
          onChange={(e) => setConcept(e.target.value as Concept)}
          className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
        >
          {concepts.map((c) => (
            <option key={c} value={c}>
              {conceptLabel[c]}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="mi-menuSkuSayisi" className="mb-1.5 block text-xs font-semibold text-slate-700">{t('menuSku')}</label>
        <DecimalInput id="mi-menuSkuSayisi" blankZero inputMode="numeric" value={menuSkuSayisi} onValueChange={(v) => setMenuSkuSayisi(Math.max(0, Math.round(v)))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
        />
        <p className="mt-1 text-[11px] text-slate-600">{t('menuSkuHelp')}</p>
      </div>

      {/* TASK-0518: «Mətbəx sahəsi (m²)» removed — it never entered the calculation and there is no sourced m² → staff rule. */}
      <div>
        <label htmlFor="mi-gunlukFisSayisi" className="mb-1.5 block text-xs font-semibold text-slate-700">
          {t('gunlukFis')}
        </label>
        <DecimalInput id="mi-gunlukFisSayisi" blankZero inputMode="numeric" value={gunlukFisSayisi} onValueChange={(v) => setGunlukFisSayisi(Math.max(0, Math.round(v)))}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
        />
      </div>

      <div>
        <p className="mb-2 block text-xs font-semibold text-slate-700">
          {t('kanallar.label')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {kanalKeys.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kanallar[k]}
              onClick={() => setKanallar((prev) => ({ ...prev, [k]: !prev[k] }))}
              className={`min-h-[40px] rounded-xl px-3 py-2.5 text-xs font-semibold ring-1 transition ${kanallar[k] ? 'bg-amber-50 text-amber-800 ring-amber-300' : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'}`}
            >
              {kanalLabel[k]}
            </button>
          ))}
        </div>
      </div>

      <AssumptionsPanel
        title={t('assumptions.title')}
        note={t('assumptions.note')}
        testId="mi-assumptions"
        controls={
          <ToolResetControls
            snapshot={() => assumptions}
            restore={setAssumptions}
            onClear={() =>
              setAssumptions({ ...assumptions, salary: 0, extraPct: 0, avgCheck: { ...assumptions.avgCheck, [concept]: 0 } })
            }
            onLoadExample={() => setAssumptions(exampleAssumptions())}
          />
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <AssumptionField
            id="mi-salary"
            label={t('assumptions.salary')}
            value={assumptions.salary}
            onChange={(v) => setAssumptions((a) => ({ ...a, salary: v }))}
          />
          <AssumptionField
            id="mi-extra"
            label={t('assumptions.extraPct')}
            help={t('assumptions.extraPctHelp')}
            value={assumptions.extraPct}
            max={100}
            onChange={(v) => setAssumptions((a) => ({ ...a, extraPct: v }))}
          />
          <AssumptionField
            id="mi-avg-check"
            label={t('assumptions.avgCheck')}
            value={assumptions.avgCheck[concept]}
            onChange={(v) => setAssumptions((a) => ({ ...a, avgCheck: { ...a.avgCheck, [concept]: v } }))}
          />
          <AssumptionField
            id="mi-target"
            label={t('assumptions.laborTarget')}
            value={assumptions.laborTarget}
            max={100}
            onChange={(v) => setAssumptions((a) => ({ ...a, laborTarget: v }))}
          />
        </div>
      </AssumptionsPanel>
    </div>
  );

  const resultSection = !ready ? (
    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200/60" data-testid="mi-empty">
      {t('result.empty')}
    </div>
  ) : (
    <div className="space-y-4">
      {/* Station map */}
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-700">
          {t('result.istasyonXeritesi')} · {calc.istasyonSayisi}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {calc.stations.map((s, i) => (
            <div
              key={s.key}
              className={`rounded-lg p-3 ring-1 ${s.hot ? 'bg-orange-50 ring-orange-200/70' : 'bg-sky-50 ring-sky-200/70'}`}
            >
              <div className="flex items-center gap-1.5">
                {s.hot ? (
                  <Flame size={13} className="text-orange-500" />
                ) : (
                  <Snowflake size={13} className="text-sky-500" />
                )}
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-600">
                  {i + 1}
                </span>
              </div>
              <div className="mt-1 text-[13px] font-semibold leading-tight text-slate-800">
                {t(`result.stations.${s.key}`)}
              </div>
              <div className="mt-1 text-[11px] font-bold text-slate-700">
                {calc.perStation[i]} {t('result.neferPerIstasyon')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shifts */}
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="mb-3 flex items-center gap-2">
          <Users size={15} className="text-slate-600" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
            {t('result.kadrolar')}
          </span>
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Sun size={13} className="text-amber-500" />
              {t('result.sabahVardiyasi')}
            </span>
            <span className="font-semibold tabular-nums text-slate-900">
              {calc.bazaKadro}{' '}
              <span className="text-[10px] text-slate-600">({t('result.baza')})</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Zap size={13} className="text-purple-500" />
              {t('result.ogleRush')}
            </span>
            <span className="font-semibold tabular-nums text-purple-700">
              {calc.peakKadro}{' '}
              <span className="text-[10px] text-slate-600">({t('result.peak')})</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Sunset size={13} className="text-blue-500" />
              {t('result.axsamVardiyasi')}
            </span>
            <span className="font-semibold tabular-nums text-blue-700">{calc.axsamVardiyasi}</span>
          </div>
        </div>
      </div>

      {/* Shift leader */}
      <div
        className={`flex items-center justify-between rounded-xl p-4 ring-1 ${calc.shiftLeaderLazim ? 'bg-amber-50 ring-amber-200/60' : 'bg-slate-50 ring-slate-200/60'}`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Crown
            size={15}
            className={calc.shiftLeaderLazim ? 'text-amber-500' : 'text-slate-400'}
          />
          {t('result.shiftLeader')}
        </span>
        <span
          className={`text-xs font-bold ${calc.shiftLeaderLazim ? 'text-amber-800' : 'text-slate-700'}`}
        >
          {calc.shiftLeaderLazim ? t('result.shiftLeaderLazim') : t('result.shiftLeaderLazimDeyil')}
        </span>
      </div>

      {/* Labor */}
      <div className={`rounded-xl p-4 ring-1 ${statusStyle.bg} ${statusStyle.ring}`}>
        <div className="mb-2 flex items-center gap-2">
          <Wallet size={15} className={statusStyle.text} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
            {t('result.laborMaliyyeti')}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-600">
              {t('result.aylig')}
            </div>
            <div className="text-2xl font-black tabular-nums text-slate-900">
              {fmt(calc.ayligLabor)} <span className="text-base">AZN</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-600">
              {t('result.laborFaizi')}
            </div>
            <div className={`text-2xl font-black tabular-nums ${statusStyle.text}`}>
              <span data-testid="mi-labor-pct">{calc.laborFaizi === null ? '—' : `${formatNumber(Math.round(calc.laborFaizi), locale)}%`}</span>
            </div>
            <div className={`text-[11px] font-semibold ${statusStyle.text}`} data-testid="mi-status">
              {statusStyle.label}
            </div>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-slate-700">{t('result.qsrHedep', { value: assumptions.laborTarget })}</div>
      </div>
    </div>
  );

  return (
    <ToolkitStudioLayout
      toolId="metbex-istasyon"
      toolName={t('title')}
      toolDescription={t('description')}
      tier="sagird"
      inputSection={inputSection}
      resultSection={resultSection}
      aiInsight={aiInsight}
      onRequestInsight={async () => {
        setAiInsight({ status: 'loading' });
        const res = await getToolkitInsight({
          toolId: 'metbex-istasyon',
          locale,
          result: {
            concept,
            sku: menuSkuSayisi,
            gunlukFis: gunlukFisSayisi,
            istasyon: calc.istasyonSayisi,
            bazaKadro: calc.bazaKadro,
            peakKadro: calc.peakKadro,
            laborFaizi: Math.round(calc.laborFaizi ?? 0),
            delivery: kanallar.delivery ? 1 : 0,
            driveThru: kanallar.driveThru ? 1 : 0,
          },
        });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}

