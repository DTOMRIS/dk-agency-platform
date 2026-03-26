'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  Info,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';

export default function BasabasPage() {
  const [rent, setRent] = useState(3000);
  const [salaries, setSalaries] = useState(5000);
  const [utilities, setUtilities] = useState(800);
  const [otherFixed, setOtherFixed] = useState(700);
  const [variablePct, setVariablePct] = useState(35);
  const [avgCheck, setAvgCheck] = useState(25);
  const [currentSales, setCurrentSales] = useState(18000);

  const calc = useMemo(() => {
    const totalFixed = rent + salaries + utilities + otherFixed;
    const contributionPct = 100 - variablePct;
    const breakEvenRevenue = contributionPct > 0 ? totalFixed / (contributionPct / 100) : 0;
    const dailyCustomers = avgCheck > 0 ? Math.ceil(breakEvenRevenue / 30 / avgCheck) : 0;
    const safetyMargin = currentSales > 0 ? ((currentSales - breakEvenRevenue) / currentSales) * 100 : 0;

    const status: 'safe' | 'warning' | 'danger' =
      safetyMargin >= 20 ? 'safe' : safetyMargin >= 0 ? 'warning' : 'danger';

    return {
      totalFixed,
      contributionPct,
      breakEvenRevenue,
      dailyCustomers,
      safetyMargin,
      status,
    };
  }, [rent, salaries, utilities, otherFixed, variablePct, avgCheck, currentSales]);

  const statusStyles = {
    safe: {
      ring: 'ring-emerald-500/20',
      text: 'text-emerald-600',
      bg: 'bg-emerald-50',
      label: 'Təhlükəsizdə',
    },
    warning: {
      ring: 'ring-amber-500/20',
      text: 'text-amber-600',
      bg: 'bg-amber-50',
      label: 'Diqqət',
    },
    danger: {
      ring: 'ring-red-500/20',
      text: 'text-red-600',
      bg: 'bg-red-50',
      label: 'Zərər zonası',
    },
  }[calc.status];

  const resetAll = () => {
    setRent(3000);
    setSalaries(5000);
    setUtilities(800);
    setOtherFixed(700);
    setVariablePct(35);
    setAvgCheck(25);
    setCurrentSales(18000);
  };

  return (
    <div className="bg-white pb-24">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-amber-500/8 blur-[100px]" />
          <div className="absolute bottom-[-30%] left-[-5%] h-[400px] w-[400px] rounded-full bg-orange-500/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 pt-8 pb-20">
          <Link
            href="/toolkit"
            className="group mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Toolkit</span>
          </Link>
          <div className="max-w-2xl">
            <h1 className="mb-5 text-4xl font-display font-black leading-[1.1] tracking-tight text-white sm:text-5xl">
              Başabaş
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">
                Nöqtəsi
              </span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-slate-400">
              Aylıq minimum satış həddi, günlük müştəri sayı və təhlükəsizlik marjası üçün 3 əsas rəqəm.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200/60">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">Başabaş nöqtəsi</div>
            <div className="text-3xl font-black tabular-nums text-amber-600">
              {calc.breakEvenRevenue.toFixed(0)}
              <span className="ml-1 text-lg">₼</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">aylıq minimum</div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Günlük müştəri</div>
            <div className="text-3xl font-black tabular-nums text-slate-900">
              {calc.dailyCustomers}
              <span className="ml-1 text-lg">nəfər</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">orta çek {avgCheck} ₼</div>
          </div>

          <div className={`${statusStyles.bg} rounded-2xl p-5 ring-1 ${statusStyles.ring}`}>
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">Təhlükəsizlik marjası</div>
            <div className={`text-3xl font-black tabular-nums ${statusStyles.text}`}>{calc.safetyMargin.toFixed(1)}%</div>
            <div className={`mt-1 flex items-center gap-1 text-xs font-semibold ${statusStyles.text}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {statusStyles.label}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
            <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Sabit xərclər</div>
            <div className="text-3xl font-black tabular-nums text-slate-900">
              {calc.totalFixed.toFixed(0)}
              <span className="ml-1 text-lg">₼</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400">aylıq cəm</div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl space-y-6 px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200/80">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Sabit xərclər (aylıq)</h3>
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-red-500"
              >
                <RotateCcw size={13} /> Sıfırla
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">İcarə (₼)</label>
                <input
                  type="number"
                  step="100"
                  value={rent || ''}
                  onChange={(event) => setRent(parseFloat(event.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Maaşlar (₼)</label>
                <input
                  type="number"
                  step="100"
                  value={salaries || ''}
                  onChange={(event) => setSalaries(parseFloat(event.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Kommunal (₼)</label>
                <input
                  type="number"
                  step="50"
                  value={utilities || ''}
                  onChange={(event) => setUtilities(parseFloat(event.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Digər sabit (₼)</label>
                <input
                  type="number"
                  step="50"
                  value={otherFixed || ''}
                  onChange={(event) => setOtherFixed(parseFloat(event.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200/80">
            <h3 className="mb-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Dəyişən xərc və parametrlər</h3>

            <div className="mb-6 grid grid-cols-3 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Dəyişən xərc %</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={variablePct || ''}
                  onChange={(event) => setVariablePct(parseFloat(event.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Orta çek (₼)</label>
                <input
                  type="number"
                  step="0.5"
                  value={avgCheck || ''}
                  onChange={(event) => setAvgCheck(parseFloat(event.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Hazırkı satış (₼)</label>
                <input
                  type="number"
                  step="500"
                  value={currentSales || ''}
                  onChange={(event) => setCurrentSales(parseFloat(event.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl bg-amber-50 p-3 text-center ring-1 ring-amber-200/60">
                <div className="text-xl font-black text-amber-600">{calc.contributionPct.toFixed(0)}%</div>
                <div className="mt-1 text-[11px] font-medium text-slate-500">Contribution əms.</div>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-center ring-1 ring-blue-200/60">
                <div className="text-xl font-black text-blue-600">≥20%</div>
                <div className="mt-1 text-[11px] font-medium text-slate-500">Ideal marja</div>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-center ring-1 ring-emerald-200/60">
                <div className="text-xl font-black text-emerald-600">30 gün</div>
                <div className="mt-1 text-[11px] font-medium text-slate-500">Hesab dövrü</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-display font-black tracking-tight text-slate-900 sm:text-3xl">
            Başabaşı{' '}
            <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              Anlamaq
            </span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Satış həddi bilmədən restoran idarə etmək riskli oyundur.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-amber-50/60 to-white p-6 ring-1 ring-amber-200/40">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Info size={15} className="text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Başabaş nədir?</h3>
            </div>
            <p className="mb-5 text-[13px] leading-relaxed text-slate-600">
              Başabaş nöqtəsi restoranın nə mənfəət, nə də zərər etdiyi minimum satış həddidir. Bu rəqəmdən aşağı hər ay zərərdir.
            </p>
            <div className="mt-auto space-y-2 rounded-xl bg-slate-900 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Formul</p>
              <div className="space-y-0.5 font-mono text-[12px] text-slate-300">
                <p className="text-white">Sabit xərclər</p>
                <p>÷ Contribution Margin %</p>
                <p className="border-t border-slate-700 pt-1 font-bold text-amber-400">= Başabaş satış (₼)</p>
              </div>
              <div className="border-t border-slate-700 pt-2">
                <p className="font-mono text-[11px] font-bold text-white">CM% = 100% - Dəyişən xərc%</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 ring-1 ring-slate-200/60">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <TrendingDown size={15} className="text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sabit vs dəyişən xərc</h3>
            </div>
            <p className="mb-4 text-[12px] text-slate-500">Satış dəyişsə də, sabit xərc dəyişmir.</p>
            <div className="mt-auto space-y-2.5">
              <div className="rounded-xl bg-amber-50 p-3.5 ring-1 ring-amber-200/60">
                <p className="text-xs font-bold text-amber-700">Sabit xərclər</p>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-600/80">
                  İcarə, maaş, sığorta, kredit ödənişi, lisenziya. Satış sıfır olsa da ödənəcək.
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3.5 ring-1 ring-blue-200/60">
                <p className="text-xs font-bold text-blue-700">Dəyişən xərclər</p>
                <p className="mt-1 text-[11px] leading-relaxed text-blue-600/80">
                  Ərzaq, içki, qablaşdırma, çatdırılma. Satış artdıqca artan xərclərdir.
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3.5 ring-1 ring-emerald-200/60">
                <p className="text-xs font-bold text-emerald-700">Contribution Margin</p>
                <p className="mt-1 text-[11px] leading-relaxed text-emerald-600/80">
                  Satışdan dəyişən xərci çıxandan sonra qalan hissə sabit xərcləri örtür.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white p-6 ring-1 ring-emerald-200/40">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <ShieldCheck size={15} className="text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Təhlükəsizlik marjası</h3>
            </div>
            <p className="mb-5 text-[13px] leading-relaxed text-slate-600">
              Hazırkı satışın başabaşdan nə qədər uzaq olduğunu göstərir. 20%-dən aşağıdırsa, risk zonasındasan.
            </p>
            <div className="mt-auto rounded-xl bg-white p-4 ring-1 ring-emerald-200/60">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Marja səviyyələri</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-600"><strong className="text-emerald-700">≥20%</strong> - Təhlükəsizdə</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-[11px] text-slate-600"><strong className="text-amber-700">0-20%</strong> - Diqqət zonası</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-[11px] text-slate-600"><strong className="text-red-700">&lt;0%</strong> - Zərər edirsən</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl px-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/10 blur-[50px]" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
                  <Lightbulb size={16} className="text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-amber-400">DK Agency Məsləhəti</h3>
              </div>
              <p className="mb-5 text-[13px] leading-relaxed text-slate-400">
                Başabaş nöqtəsini aylıq yox, həftəlik də izlə. Çünki problem adətən ay sonunda yox, ayın ortasında başlayır.
              </p>
              <Link
                href="/blog/basabas-noqtesi-hesablama"
                className="group inline-flex items-center gap-2 text-sm font-bold text-amber-400 transition-colors hover:text-amber-300"
              >
                Tam yazını oxu
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 p-8 text-white shadow-xl shadow-orange-500/15">
            <div>
              <h3 className="mb-3 text-xl font-display font-black">OCAQ Panel</h3>
              <p className="mb-6 text-sm leading-relaxed text-white/85">
                Başabaş satışını, günlük müştəri hədəfini və satış boşluğunu paneldə avtomatik izlə.
              </p>
            </div>
            <Link
              href="/auth/register"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-orange-600 transition-colors hover:bg-orange-50"
            >
              OCAQ Panel-ə keç <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-6xl px-6">
        <div className="rounded-2xl bg-slate-50 p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-2.5">
            <BookOpen size={18} className="text-orange-600" />
            <h3 className="text-lg font-bold text-slate-900">Daha Dərin Öyrən</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { title: 'Başabaş Nöqtəsi Hesablama', slug: 'basabas-noqtesi-hesablama', tag: 'Maliyyə' },
              { title: 'P&L Oxuya Bilmirsən?', slug: 'pnl-oxuya-bilmirsen', tag: 'Maliyyə' },
              { title: 'Food Cost-un Qanlı Həqiqəti', slug: '1-porsiya-food-cost-hesablama', tag: 'Maliyyə' },
            ].map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-md hover:ring-slate-300/60"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">{article.tag}</span>
                <h4 className="mt-2.5 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-orange-600">
                  {article.title}
                </h4>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 transition-all group-hover:gap-2 group-hover:text-orange-600">
                  Oxu <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
