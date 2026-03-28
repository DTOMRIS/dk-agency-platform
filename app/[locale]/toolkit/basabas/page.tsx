'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ArrowRight,
  Lightbulb,
  BookOpen,
  RotateCcw,
  Info,
  Target,
  TrendingDown,
  Users,
  ShieldCheck,
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
    return { totalFixed, contributionPct, breakEvenRevenue, dailyCustomers, safetyMargin, status };
  }, [rent, salaries, utilities, otherFixed, variablePct, avgCheck, currentSales]);

  const ss = {
    safe: { ring: 'ring-emerald-500/20', text: 'text-emerald-600', bg: 'bg-emerald-50', label: 'T\u0259hl\u00fck\u0259sizd\u0259' },
    warning: { ring: 'ring-amber-500/20', text: 'text-amber-600', bg: 'bg-amber-50', label: 'Diqqət' },
    danger: { ring: 'ring-red-500/20', text: 'text-red-600', bg: 'bg-red-50', label: 'Zər\u0259r Zonası' },
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

      {/* HERO */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-amber-500/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-30%] left-[-5%] w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20">
          <Link href="/toolkit" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-8 group">
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Toolkit</span>
          </Link>
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight leading-[1.1] mb-5">
              Ba\u015faba\u015f<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">N\u00f6qt\u0259si</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Ayl\u0131q minimum sat\u0131\u015f h\u0259ddi, g\u00fcnl\u00fck m\u00fc\u015ft\u0259ri say\u0131 v\u0259 t\u0259hl\u00fck\u0259sizlik marjas\u0131 — 3 \u0259sas r\u0259q\u0259m.
            </p>
          </div>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-amber-50 rounded-2xl p-5 ring-1 ring-amber-200/60">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Başabaş N\u00f6qt\u0259si</div>
            <div className="text-3xl font-black text-amber-600 tabular-nums">{calc.breakEvenRevenue.toFixed(0)}<span className="text-lg ml-1">\u20BC</span></div>
            <div className="text-[10px] text-slate-400 mt-1">ayl\u0131q minimum</div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">G\u00fcnl\u00fck M\u00fc\u015ft\u0259ri</div>
            <div className="text-3xl font-black text-slate-900 tabular-nums">{calc.dailyCustomers}<span className="text-lg ml-1">n\u0259f\u0259r</span></div>
            <div className="text-[10px] text-slate-400 mt-1">orta \u00e7ek {avgCheck}\u20BC</div>
          </div>
          <div className={`${ss.bg} rounded-2xl p-5 ring-1 ${ss.ring}`}>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">T\u0259hl\u00fck\u0259sizlik Marjas\u0131</div>
            <div className={`text-3xl font-black ${ss.text} tabular-nums`}>{calc.safetyMargin.toFixed(1)}%</div>
            <div className={`text-xs font-semibold ${ss.text} mt-1 flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {ss.label}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sabit X\u0259rcl\u0259r</div>
            <div className="text-3xl font-black text-slate-900 tabular-nums">{calc.totalFixed.toFixed(0)}<span className="text-lg ml-1">\u20BC</span></div>
            <div className="text-[10px] text-slate-400 mt-1">ayl\u0131q c\u0259m</div>
          </div>
        </div>
      </div>

      {/* CALCULATOR */}
      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-6">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* Sabit X\u0259rcl\u0259r */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sabit X\u0259rcl\u0259r (ayl\u0131q)</h3>
              <button onClick={resetAll} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors">
                <RotateCcw size={13} /> S\u0131f\u0131rla
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">\u0130car\u0259 (\u20BC)</label>
                <input type="number" step="100" value={rent || ''} onChange={(e) => setRent(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Maa\u015flar (\u20BC)</label>
                <input type="number" step="100" value={salaries || ''} onChange={(e) => setSalaries(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Kommunal (\u20BC)</label>
                <input type="number" step="50" value={utilities || ''} onChange={(e) => setUtilities(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Dig\u0259r sabit (\u20BC)</label>
                <input type="number" step="50" value={otherFixed || ''} onChange={(e) => setOtherFixed(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
            </div>
          </div>

          {/* D\u0259yi\u015f\u0259n X\u0259rc + Parametrl\u0259r */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 p-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">D\u0259yi\u015f\u0259n X\u0259rc v\u0259 Parametrl\u0259r</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">D\u0259yi\u015f\u0259n x\u0259rc %</label>
                <input type="number" min="0" max="99" value={variablePct || ''} onChange={(e) => setVariablePct(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Orta \u00e7ek (\u20BC)</label>
                <input type="number" step="0.5" value={avgCheck || ''} onChange={(e) => setAvgCheck(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Haz\u0131rk\u0131 sat\u0131\u015f (\u20BC)</label>
                <input type="number" step="500" value={currentSales || ''} onChange={(e) => setCurrentSales(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-amber-50 rounded-xl p-3 text-center ring-1 ring-amber-200/60">
                <div className="text-xl font-black text-amber-600">60-65%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Contribution \u0259ms.</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center ring-1 ring-blue-200/60">
                <div className="text-xl font-black text-blue-600">\u226520%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Ideal marja</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center ring-1 ring-emerald-200/60">
                <div className="text-xl font-black text-emerald-600">30 g\u00fcn</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Hesab d\u00f6vr\u00fc</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* B\u0130L\u0130K PANEL\u0130 */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            Ba\u015faba\u015f\u0131 <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Anlamaq</span>
          </h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">Sat\u0131\u015f h\u0259ddi bilm\u0259d\u0259n restoran a\u00e7maq, g\u00f6zba\u011fl\u0131 s\u00fcr\u00fcc\u00fcl\u00fckd\u00fcr.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Ba\u015faba\u015f N\u0259dir */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50/60 to-white ring-1 ring-amber-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Info size={15} className="text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Ba\u015faba\u015f N\u0259dir?</h3>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              Ba\u015faba\u015f n\u00f6qt\u0259si (Break-Even Point) \u2014 restoranın n\u0259 m\u0259nf\u0259\u0259t, n\u0259 z\u0259r\u0259r etm\u0259diyi <strong className="text-slate-800">minimum sat\u0131\u015f h\u0259ddidir</strong>. Bu r\u0259q\u0259md\u0259n a\u015fa\u011f\u0131 h\u0259r man v\u0259 ya ay z\u0259r\u0259rdir.
            </p>
            <div className="bg-slate-900 rounded-xl p-4 space-y-2 mt-auto">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Formul</p>
              <div className="text-[12px] font-mono text-slate-300 space-y-0.5">
                <p className="text-white">Sabit X\u0259rcl\u0259r</p>
                <p>\u00f7 Contribution Margin %</p>
                <p className="border-t border-slate-700 pt-1 text-amber-400 font-bold">= Ba\u015faba\u015f Sat\u0131\u015f (\u20BC)</p>
              </div>
              <div className="border-t border-slate-700 pt-2">
                <p className="text-[11px] font-mono text-white font-bold">CM% = 100% \u2212 D\u0259yi\u015f\u0259n X\u0259rc%</p>
              </div>
            </div>
          </div>

          {/* Sabit vs D\u0259yi\u015f\u0259n */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200/60 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <TrendingDown size={15} className="text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sabit vs D\u0259yi\u015f\u0259n X\u0259rc</h3>
            </div>
            <p className="text-[12px] text-slate-500 mb-4">Sat\u0131\u015f h\u0259cmi d\u0259yi\u015fs\u0259 d\u0259 sabit x\u0259rc d\u0259yi\u015fmir.</p>
            <div className="space-y-2.5 mt-auto">
              <div className="bg-amber-50 ring-1 ring-amber-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-amber-700">Sabit X\u0259rcl\u0259r</p>
                <p className="text-[11px] text-amber-600/80 mt-1 leading-relaxed">\u0130car\u0259, maa\u015f, s\u0131\u011forta, kredit \u00f6d\u0259ni\u015fi, lisenziya. Sat\u0131\u015f s\u0131f\u0131r olsa da \u00f6d\u0259n\u0259c\u0259ksiniz.</p>
              </div>
              <div className="bg-blue-50 ring-1 ring-blue-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-blue-700">D\u0259yi\u015f\u0259n X\u0259rcl\u0259r</p>
                <p className="text-[11px] text-blue-600/80 mt-1 leading-relaxed">\u018frzaq, i\u00e7ki, qabla\u015fd\u0131rma, \u00e7atd\u0131r\u0131lma. Sat\u0131\u015f art\u0131qca artan x\u0259rcl\u0259rdir. Ad\u0259t\u0259n 30-40%.</p>
              </div>
              <div className="bg-emerald-50 ring-1 ring-emerald-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-emerald-700">Contribution Margin</p>
                <p className="text-[11px] text-emerald-600/80 mt-1 leading-relaxed">Sat\u0131\u015fdan d\u0259yi\u015f\u0259n x\u0259rci \u00e7\u0131xd\u0131qdan sonra qalan hiss\u0259. Bu hiss\u0259 sabit x\u0259rcl\u0259ri \u00f6rt\u00fcr.</p>
              </div>
            </div>
          </div>

          {/* T\u0259hl\u00fck\u0259sizlik Marjas\u0131 */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white ring-1 ring-emerald-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={15} className="text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">T\u0259hl\u00fck\u0259sizlik Marjas\u0131</h3>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              Haz\u0131rk\u0131 sat\u0131\u015f\u0131n ba\u015faba\u015fdan n\u0259 q\u0259d\u0259r <strong className="text-slate-800">uzaq oldu\u011funu</strong> g\u00f6st\u0259rir. 20%-d\u0259n a\u015fa\u011f\u0131dırsa t\u0259hl\u00fck\u0259 zonas\u0131ndas\u0131n\u0131z.
            </p>
            <div className="bg-white ring-1 ring-emerald-200/60 rounded-xl p-4 mt-auto">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-3">Marja s\u0259viyy\u0259l\u0259ri</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-600"><strong className="text-emerald-700">\u226520%</strong> — T\u0259hl\u00fck\u0259sizd\u0259</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[11px] text-slate-600"><strong className="text-amber-700">0-20%</strong> — Diqqət zonas\u0131</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[11px] text-slate-600"><strong className="text-red-700">&lt;0%</strong> — Z\u0259r\u0259r ed\u0259rsiniz</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DK + OCAQ */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[50px]" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Lightbulb size={16} className="text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-amber-400">DK Agency M\u0259sl\u0259h\u0259ti</h3>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-5">
                Az\u0259rbaycan restoranlar\u0131n\u0131n <strong className="text-white">\u00e7oxu</strong> ba\u015faba\u015f n\u00f6qt\u0259sini bilm\u0259d\u0259n i\u015fl\u0259yir. N\u0259tic\u0259d\u0259 &quot;m\u00fc\u015ft\u0259ri var amma pul yoxdur&quot; sindromu ya\u015fan\u0131r. H\u0259r ay bu hesab\u0131 yenilyin.
              </p>
              <Link href="/blog/basabas-noqtesi-hesablama" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors group">
                Tam yaz\u0131n\u0131 oxu <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[var(--dk-red)] to-[var(--dk-red-strong)] p-8 text-white shadow-xl shadow-red-500/15 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-display font-black mb-3">OCAQ Panel</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Ayl\u0131q sabit x\u0259rcl\u0259ri izl\u0259, ba\u015faba\u015f\u0131 avtomatik hesabla, real-time maliyy\u0259 n\u0259zar\u0259ti al.
              </p>
            </div>
            <Link href="/auth/register" className="flex items-center justify-center gap-2 w-full bg-white text-[var(--dk-red)] py-3.5 rounded-xl font-black text-sm hover:shadow-lg transition-all active:scale-[0.98]">
              Pulsuz ba\u015fla <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* \u018FLAQ\u018FL\u0130 YAZILAR */}
      <div className="max-w-6xl mx-auto px-6 mt-20">
        <div className="bg-slate-50 rounded-2xl p-8 sm:p-10">
          <div className="flex items-center gap-2.5 mb-8">
            <BookOpen size={18} className="text-[var(--dk-red)]" />
            <h3 className="text-lg font-bold text-slate-900">Daha D\u0259rin \u00d6yr\u0259n</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Ba\u015faba\u015f N\u00f6qt\u0259si Hesablama', slug: 'basabas-noqtesi-hesablama', tag: 'Maliyy\u0259' },
              { title: 'P&L Oxuya Bilmirs\u0259n?', slug: 'pnl-oxuya-bilmirsen', tag: 'Maliyy\u0259' },
              { title: 'Food Cost-un Qanl\u0131 H\u0259qiq\u0259ti', slug: '1-porsiya-food-cost-hesablama', tag: 'Maliyy\u0259' },
            ].map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="group block bg-white rounded-xl p-5 ring-1 ring-slate-200/60 hover:shadow-md hover:ring-slate-300/60 transition-all duration-300">
                <span className="text-[10px] font-bold text-[var(--dk-red)] uppercase tracking-widest">{a.tag}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug group-hover:text-[var(--dk-red)] transition-colors">{a.title}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold mt-4 group-hover:text-[var(--dk-red)] group-hover:gap-2 transition-all">
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
