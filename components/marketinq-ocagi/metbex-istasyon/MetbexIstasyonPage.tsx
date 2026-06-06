'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Flame, Snowflake, Users, Wallet, Crown, Sun, Zap, Sunset } from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';

type Concept = 'fast_food' | 'qsr_burger' | 'qsr_pizza' | 'dark_kitchen' | 'catering';
interface Kanallar {
  dineIn: boolean;
  takeaway: boolean;
  delivery: boolean;
  driveThru: boolean;
}

const ORTALAMA_CEK: Record<Concept, number> = {
  fast_food: 10,
  qsr_burger: 12,
  qsr_pizza: 18,
  dark_kitchen: 14,
  catering: 25,
};
const WORK_DAYS = 26;
const SALARY = 380;
const OVERHEAD = 1.15;
const TARGET_LABOR = 32;

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

function compute(input: {
  concept: Concept;
  menuSkuSayisi: number;
  gunlukFisSayisi: number;
  kanallar: Kanallar;
}) {
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

  const ayligLabor = Math.round(bazaKadro * SALARY * OVERHEAD);
  const aylikGelir = fis * ORTALAMA_CEK[input.concept] * WORK_DAYS;
  const laborFaizi = aylikGelir > 0 ? (ayligLabor / aylikGelir) * 100 : 0;
  const status: 'ideal' | 'dikkat' | 'kritik' =
    laborFaizi <= TARGET_LABOR ? 'ideal' : laborFaizi <= TARGET_LABOR + 8 ? 'dikkat' : 'kritik';

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

  const [concept, setConcept] = useState<Concept>('fast_food');
  const [menuSkuSayisi, setMenuSkuSayisi] = useState(25);
  const [gunlukFisSayisi, setGunlukFisSayisi] = useState(180);
  const [mutfaqMetrekare, setMutfaqMetrekare] = useState(45);
  const [kanallar, setKanallar] = useState<Kanallar>({
    dineIn: true,
    takeaway: true,
    delivery: true,
    driveThru: false,
  });
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  const calc = useMemo(
    () => compute({ concept, menuSkuSayisi, gunlukFisSayisi, kanallar }),
    [concept, menuSkuSayisi, gunlukFisSayisi, kanallar]
  );

  const statusStyle = {
    ideal: {
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      ring: 'ring-emerald-200/60',
      label: t('result.ideal'),
    },
    dikkat: {
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      ring: 'ring-amber-200/60',
      label: t('result.dikkat'),
    },
    kritik: {
      text: 'text-red-600',
      bg: 'bg-red-50',
      ring: 'ring-red-200/60',
      label: t('result.kritik'),
    },
  }[calc.status];

  const fmt = (n: number) => new Intl.NumberFormat(locale === 'az' ? 'az-AZ' : locale).format(n);

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
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-500">
          {t('concept.label')}
        </label>
        <select
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
        <label className="mb-1.5 block text-xs font-medium text-slate-500">{t('menuSku')}</label>
        <input
          type="number"
          min={1}
          max={100}
          value={menuSkuSayisi || ''}
          onChange={(e) => setMenuSkuSayisi(parseInt(e.target.value) || 0)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
        />
        <p className="mt-1 text-[11px] text-slate-400">{t('menuSkuHelp')}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            {t('gunlukFis')}
          </label>
          <input
            type="number"
            min={50}
            max={2000}
            value={gunlukFisSayisi || ''}
            onChange={(e) => setGunlukFisSayisi(parseInt(e.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">
            {t('mutfaqMetrekare')}
          </label>
          <input
            type="number"
            min={10}
            max={200}
            value={mutfaqMetrekare || ''}
            onChange={(e) => setMutfaqMetrekare(parseInt(e.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-xs font-medium text-slate-500">
          {t('kanallar.label')}
        </label>
        <div className="grid grid-cols-2 gap-2">
          {kanalKeys.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKanallar((prev) => ({ ...prev, [k]: !prev[k] }))}
              className={`rounded-xl px-3 py-2.5 text-xs font-semibold ring-1 transition ${kanallar[k] ? 'bg-amber-50 text-amber-700 ring-amber-300' : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'}`}
            >
              {kanalLabel[k]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const resultSection = (
    <div className="space-y-4">
      {/* Station map */}
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
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
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  {i + 1}
                </span>
              </div>
              <div className="mt-1 text-[13px] font-semibold leading-tight text-slate-800">
                {t(`result.stations.${s.key}`)}
              </div>
              <div className="mt-1 text-[11px] font-bold text-slate-500">
                {calc.perStation[i]} {t('result.neferPerIstasyon')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shifts */}
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="mb-3 flex items-center gap-2">
          <Users size={15} className="text-slate-500" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
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
              <span className="text-[10px] text-slate-400">({t('result.baza')})</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Zap size={13} className="text-purple-500" />
              {t('result.ogleRush')}
            </span>
            <span className="font-semibold tabular-nums text-purple-600">
              {calc.peakKadro}{' '}
              <span className="text-[10px] text-slate-400">({t('result.peak')})</span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Sunset size={13} className="text-blue-500" />
              {t('result.axsamVardiyasi')}
            </span>
            <span className="font-semibold tabular-nums text-blue-600">{calc.axsamVardiyasi}</span>
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
          className={`text-xs font-bold ${calc.shiftLeaderLazim ? 'text-amber-600' : 'text-slate-400'}`}
        >
          {calc.shiftLeaderLazim ? t('result.shiftLeaderLazim') : t('result.shiftLeaderLazimDeyil')}
        </span>
      </div>

      {/* Labor */}
      <div className={`rounded-xl p-4 ring-1 ${statusStyle.bg} ${statusStyle.ring}`}>
        <div className="mb-2 flex items-center gap-2">
          <Wallet size={15} className={statusStyle.text} />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {t('result.laborMaliyyeti')}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              {t('result.aylig')}
            </div>
            <div className="text-2xl font-black tabular-nums text-slate-900">
              {fmt(calc.ayligLabor)} <span className="text-base">AZN</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              {t('result.laborFaizi')}
            </div>
            <div className={`text-2xl font-black tabular-nums ${statusStyle.text}`}>
              {calc.laborFaizi.toFixed(0)}%
            </div>
            <div className={`text-[11px] font-semibold ${statusStyle.text}`}>
              {statusStyle.label}
            </div>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-slate-400">{t('result.qsrHedep')}</div>
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
            laborFaizi: Math.round(calc.laborFaizi),
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
