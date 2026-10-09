'use client';

import { useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Sun, Sunset, Zap, Wallet, Info } from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import ToolResetControls from '@/components/toolkit/ToolResetControls';
import DecimalInput from '@/components/toolkit/DecimalInput';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';

type Concept = 'restoran_casual' | 'restoran_fine' | 'kafe' | 'bar';
type GunTipi = 'isgunu' | 'cuma' | 'haftaSonu';

// ── Industry constants (Cornell Hospitality / Shifty benchmarks) ──────
const SALARY = {
  garson: 450,
  barista: 500,
  asci: 600,
  host: 400,
  kasa: 420,
  sommelier: 600,
} as const;
const ORTALAMA_CEK: Record<Concept, number> = {
  restoran_casual: 15,
  restoran_fine: 30,
  kafe: 6,
  bar: 12,
};
const TARGET_HI: Record<Concept, number> = {
  restoran_casual: 35,
  restoran_fine: 35,
  kafe: 32,
  bar: 32,
};
const GUN_CARPANI: Record<GunTipi, number> = { isgunu: 1.0, cuma: 1.2, haftaSonu: 1.4 };
const WORK_DAYS = 30;

interface RoleCounts {
  garson?: number;
  barista?: number;
  asci: number;
  host?: number;
  sommelier?: number;
  kasa: number;
}

function sumRoles(r: RoleCounts): number {
  return (r.garson ?? 0) + (r.barista ?? 0) + r.asci + (r.host ?? 0) + (r.sommelier ?? 0) + r.kasa;
}

interface PlannerInput {
  concept: Concept;
  koltukSayisi: number;
  gunlukFis: number;
  gunTipi: GunTipi;
  achilisVaxti: number;
  kapanisSaati: number;
}

/** «Nümunəni yüklə» values (TASK-0517): a 60-seat casual restaurant, 150 checks, 10:00–23:00. */
const EXAMPLE: PlannerInput = {
  concept: 'restoran_casual',
  koltukSayisi: 60,
  gunlukFis: 150,
  gunTipi: 'isgunu',
  achilisVaxti: 10,
  kapanisSaati: 23,
};

function compute(input: PlannerInput) {
  const mult = GUN_CARPANI[input.gunTipi];
  const hours = Math.max(1, input.kapanisSaati - input.achilisVaxti);
  const isCafe = input.concept === 'kafe' || input.concept === 'bar';

  let opening: RoleCounts;
  let mainStaff: number; // garson or barista — the role peak scales
  let skeleton: number;

  if (input.concept === 'restoran_fine') {
    const garson = Math.max(1, Math.ceil((input.koltukSayisi / 14) * mult));
    const asci = Math.max(1, Math.ceil(garson * 1.1));
    opening = { garson, asci, host: 1, sommelier: 1, kasa: 1 };
    mainStaff = garson;
    const sg = Math.ceil(input.koltukSayisi / 14);
    skeleton = sg + Math.ceil(sg * 1.1) + 3;
  } else if (isCafe) {
    const saatlikSiparis = input.gunlukFis / hours;
    const barista = Math.max(1, Math.ceil((saatlikSiparis / 35) * mult));
    const asci = Math.max(1, Math.ceil(barista * 0.4));
    opening = { barista, asci, kasa: 1 };
    mainStaff = barista;
    const sb = Math.max(1, Math.ceil(input.gunlukFis / hours / 35));
    skeleton = sb + Math.ceil(sb * 0.4) + 1;
  } else {
    // restoran_casual
    const garson = Math.max(1, Math.ceil((input.koltukSayisi / 22) * mult));
    const asci = Math.max(1, Math.ceil(garson * 0.75));
    opening = { garson, asci, host: 1, kasa: 1 };
    mainStaff = garson;
    const sg = Math.ceil(input.koltukSayisi / 22);
    skeleton = sg + Math.ceil(sg * 0.75) + 2;
  }

  const acilisToplam = sumRoles(opening);
  const peakEkstra = Math.max(1, Math.ceil(mainStaff * 0.4));
  const peakToplam = acilisToplam + peakEkstra;
  const axsamToplam = Math.max(skeleton, Math.ceil(acilisToplam * 0.8));

  // Labor cost
  const toplamMaas =
    (opening.garson ?? 0) * SALARY.garson +
    (opening.barista ?? 0) * SALARY.barista +
    opening.asci * SALARY.asci +
    (opening.host ?? 0) * SALARY.host +
    (opening.sommelier ?? 0) * SALARY.sommelier +
    opening.kasa * SALARY.kasa;
  const ayligLabor = Math.round(toplamMaas * 1.22);
  const aylikGelir = input.gunlukFis * ORTALAMA_CEK[input.concept] * WORK_DAYS;
  const laborFaizi = aylikGelir > 0 ? (ayligLabor / aylikGelir) * 100 : 0;
  const hi = TARGET_HI[input.concept];
  const status: 'ideal' | 'dikkat' | 'kritik' =
    laborFaizi <= hi ? 'ideal' : laborFaizi <= hi + 10 ? 'dikkat' : 'kritik';

  return {
    opening,
    isCafe,
    acilisToplam,
    peakEkstra,
    peakToplam,
    axsamToplam,
    ayligLabor,
    laborFaizi,
    status,
    skeleton,
    hi,
  };
}

export default function PersonelPlanlayiciPage() {
  const t = useTranslations('toolkit.personelPlanlayici');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';

  const [concept, setConcept] = useState<Concept>(EXAMPLE.concept);
  const [koltukSayisi, setKoltukSayisi] = useState(EXAMPLE.koltukSayisi);
  const [gunlukFis, setGunlukFis] = useState(EXAMPLE.gunlukFis);
  const [gunTipi, setGunTipi] = useState<GunTipi>(EXAMPLE.gunTipi);
  const [achilisVaxti, setAchilisVaxti] = useState(EXAMPLE.achilisVaxti);
  const [kapanisSaati, setKapanisSaati] = useState(EXAMPLE.kapanisSaati);
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  const snapshot = (): PlannerInput => ({ concept, koltukSayisi, gunlukFis, gunTipi, achilisVaxti, kapanisSaati });
  const apply = (v: PlannerInput) => {
    setConcept(v.concept);
    setKoltukSayisi(v.koltukSayisi);
    setGunlukFis(v.gunlukFis);
    setGunTipi(v.gunTipi);
    setAchilisVaxti(v.achilisVaxti);
    setKapanisSaati(v.kapanisSaati);
  };

  const calc = useMemo(
    () => compute({ concept, koltukSayisi, gunlukFis, gunTipi, achilisVaxti, kapanisSaati }),
    [concept, koltukSayisi, gunlukFis, gunTipi, achilisVaxti, kapanisSaati]
  );
  // TASK-0517: with empty inputs there is nothing to plan — no fake «ideal» on zeros.
  const isCafeConcept = concept === 'kafe' || concept === 'bar';
  const ready = gunlukFis > 0 && (isCafeConcept || koltukSayisi > 0) && kapanisSaati > achilisVaxti;

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
  }[calc.status];

  const fmt = (n: number) => new Intl.NumberFormat(locale === 'az' ? AZ_NUMBER_LOCALE : locale).format(n);

  // ── Input section ──────────────────────────────────────────────────
  const concepts: Concept[] = ['restoran_casual', 'restoran_fine', 'kafe', 'bar'];
  const conceptLabel: Record<Concept, string> = {
    restoran_casual: t('concept.restoranCasual'),
    restoran_fine: t('concept.restoranFine'),
    kafe: t('concept.kafe'),
    bar: t('concept.bar'),
  };
  const gunTipleri: GunTipi[] = ['isgunu', 'cuma', 'haftaSonu'];
  const gunLabel: Record<GunTipi, string> = {
    isgunu: t('gunTipi.isgunu'),
    cuma: t('gunTipi.cuma'),
    haftaSonu: t('gunTipi.haftaSonu'),
  };

  const inputSection = (
    <div className="space-y-6">
      <ToolResetControls
        snapshot={snapshot}
        restore={apply}
        onClear={() => apply({ ...snapshot(), koltukSayisi: 0, gunlukFis: 0, achilisVaxti: 0, kapanisSaati: 0 })}
        onLoadExample={() => apply(EXAMPLE)}
      />

      <div>
        <label htmlFor="pp-concept" className="mb-1.5 block text-xs font-semibold text-slate-700">
          {t('concept.label')}
        </label>
        <select
          id="pp-concept"
          value={concept}
          onChange={(e) => setConcept(e.target.value as Concept)}
          className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
        >
          {concepts.map((c) => (
            <option key={c} value={c}>
              {conceptLabel[c]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="pp-koltuk" className="mb-1.5 block text-xs font-semibold text-slate-700">
            {t('koltukSayisi')}
          </label>
          <DecimalInput
            id="pp-koltuk"
            blankZero
            inputMode="numeric"
            value={koltukSayisi}
            onValueChange={(v) => setKoltukSayisi(Math.max(0, Math.round(v)))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label htmlFor="pp-fis" className="mb-1.5 block text-xs font-semibold text-slate-700">
            {t('gunlukFis')}
          </label>
          <DecimalInput
            id="pp-fis"
            blankZero
            inputMode="numeric"
            value={gunlukFis}
            onValueChange={(v) => setGunlukFis(Math.max(0, Math.round(v)))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div>
        <p className="mb-2 block text-xs font-semibold text-slate-700">
          {t('gunTipi.label')}
        </p>
        <div className="grid grid-cols-3 gap-2">
          {gunTipleri.map((g) => (
            <button
              key={g}
              type="button"
              aria-pressed={gunTipi === g}
              onClick={() => setGunTipi(g)}
              className={`min-h-[40px] rounded-xl px-3 py-2.5 text-xs font-semibold ring-1 transition ${
                gunTipi === g
                  ? 'bg-emerald-50 text-emerald-800 ring-emerald-300'
                  : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {gunLabel[g]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="pp-open" className="mb-1.5 block text-xs font-semibold text-slate-700">{t('achilis')}</label>
          <DecimalInput
            id="pp-open"
            blankZero
            inputMode="numeric"
            value={achilisVaxti}
            onValueChange={(v) => setAchilisVaxti(Math.max(0, Math.min(23, Math.round(v))))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label htmlFor="pp-close" className="mb-1.5 block text-xs font-semibold text-slate-700">{t('kapanis')}</label>
          <DecimalInput
            id="pp-close"
            blankZero
            inputMode="numeric"
            value={kapanisSaati}
            onValueChange={(v) => setKapanisSaati(Math.max(0, Math.min(26, Math.round(v))))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-700 ring-1 ring-slate-200/60">
        <Info size={14} className="mt-0.5 shrink-0 text-slate-600" aria-hidden="true" />
        <span>
          {t('result.benchmark', { value: calc.hi })}
          {ready ? (
            <>
              {' · '}
              {t('result.skeletonMinimum')}: {calc.skeleton}
            </>
          ) : null}
        </span>
      </div>
    </div>
  );

  // ── Result section ─────────────────────────────────────────────────
  const mainRoleLabel = calc.isCafe ? t('result.barista') : t('result.garson');
  const mainRoleCount = calc.isCafe ? (calc.opening.barista ?? 0) : (calc.opening.garson ?? 0);

  const resultSection = !ready ? (
    <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 ring-1 ring-slate-200/60" data-testid="pp-empty">
      {t('result.empty')}
    </div>
  ) : (
    <div className="space-y-4">
      {/* Opening crew */}
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="mb-3 flex items-center gap-2">
          <Sun size={15} className="text-amber-500" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
            {t('result.acilisBrigadasi')}
          </span>
        </div>
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">{mainRoleLabel}</span>
            <span className="font-semibold tabular-nums text-slate-900">{mainRoleCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">{t('result.asci')}</span>
            <span className="font-semibold tabular-nums text-slate-900">{calc.opening.asci}</span>
          </div>
          {calc.opening.host != null && (
            <div className="flex justify-between">
              <span className="text-slate-600">{t('result.host')}</span>
              <span className="font-semibold tabular-nums text-slate-900">{calc.opening.host}</span>
            </div>
          )}
          {calc.opening.sommelier != null && (
            <div className="flex justify-between">
              <span className="text-slate-600">{t('result.sommelier')}</span>
              <span className="font-semibold tabular-nums text-slate-900">
                {calc.opening.sommelier}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-slate-600">{t('result.kasa')}</span>
            <span className="font-semibold tabular-nums text-slate-900">{calc.opening.kasa}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-slate-100 pt-2">
            <span className="font-bold text-slate-900">{t('result.toplam')}</span>
            <span className="font-black tabular-nums text-slate-900">{calc.acilisToplam}</span>
          </div>
        </div>
      </div>

      {/* Peak */}
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="mb-2 flex items-center gap-2">
          <Zap size={15} className="text-purple-500" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
            {t('result.peakBrigada')}
          </span>
          <span className="ml-auto text-[11px] font-semibold text-purple-700">
            +{calc.peakEkstra} {t('result.ekstra')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-bold text-slate-900">{t('result.toplam')}</span>
          <span className="font-black tabular-nums text-purple-700">{calc.peakToplam}</span>
        </div>
      </div>

      {/* Evening */}
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="mb-2 flex items-center gap-2">
          <Sunset size={15} className="text-blue-500" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
            {t('result.axsamBrigadasi')}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-bold text-slate-900">{t('result.toplam')}</span>
          <span className="font-black tabular-nums text-blue-700">{calc.axsamToplam}</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-600">{t('result.peakNote')}</div>
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
              {calc.laborFaizi.toFixed(0)}%
            </div>
            <div className={`text-[11px] font-semibold ${statusStyle.text}`}>
              {statusStyle.label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ToolkitStudioLayout
      toolId="personel-planlayici"
      toolName={t('title')}
      toolDescription={t('description')}
      tier="sagird"
      inputSection={inputSection}
      resultSection={resultSection}
      aiInsight={aiInsight}
      onRequestInsight={async () => {
        setAiInsight({ status: 'loading' });
        const res = await getToolkitInsight({
          toolId: 'personel-planlayici',
          locale,
          result: {
            concept,
            koltuk: koltukSayisi,
            gunlukFis,
            acilisKadro: calc.acilisToplam,
            peakKadro: calc.peakToplam,
            laborFaizi: Math.round(calc.laborFaizi),
          },
        });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}
