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
    safe: { ring: 'ring-emerald-500/20', text: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Təhlükəsizdə' },
    warning: { ring: 'ring-amber-500/20', text: 'text-amber-600', bg: 'bg-amber-50', label: 'Diqqət' },
    danger: { ring: 'ring-red-500/20', text: 'text-red-600', bg: 'bg-red-50', label: 'Zərər Zonası' },
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
              Başabaş<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-300 bg-clip-text text-transparent">Nöqtəsi</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Aylıq minimum satış həddi, günlük müştəri sayı və təhlükəsizlik marjası - 3 əsas rəqəm.
            </p>
          </div>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-amber-50 rounded-2xl p-5 ring-1 ring-amber-200/60">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Başabaş Nöqtəsi</div>
            <div className="text-3xl font-black text-amber-600 tabular-nums">{calc.breakEvenRevenue.toFixed(0)}<span className="text-lg ml-1">₼</span></div>
            <div className="text-[10px] text-slate-400 mt-1">aylıq minimum</div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Günlük Müştəri</div>
            <div className="text-3xl font-black text-slate-900 tabular-nums">{calc.dailyCustomers}<span className="text-lg ml-1">nəfər</span></div>
            <div className="text-[10px] text-slate-400 mt-1">orta çek {avgCheck}₼</div>
          </div>
          <div className={`${ss.bg} rounded-2xl p-5 ring-1 ${ss.ring}`}>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Təhlükəsizlik Marjası</div>
            <div className={`text-3xl font-black ${ss.text} tabular-nums`}>{calc.safetyMargin.toFixed(1)}%</div>
            <div className={`text-xs font-semibold ${ss.text} mt-1 flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {ss.label}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Sabit Xərclər</div>
            <div className="text-3xl font-black text-slate-900 tabular-nums">{calc.totalFixed.toFixed(0)}<span className="text-lg ml-1">₼</span></div>
            <div className="text-[10px] text-slate-400 mt-1">aylıq cəm</div>
          </div>
        </div>
      </div>

      {/* CALCULATOR */}
      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-6">
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* Sabit Xərclər */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Sabit Xərclər (aylıq)</h3>
              <button onClick={resetAll} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors">
                <RotateCcw size={13} /> Sıfırla
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">İcarə (₼)</label>
                <input type="number" step="100" value={rent || ''} onChange={(e) => setRent(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Maaşlar (₼)</label>
                <input type="number" step="100" value={salaries || ''} onChange={(e) => setSalaries(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Kommunal (₼)</label>
                <input type="number" step="50" value={utilities || ''} onChange={(e) => setUtilities(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Digər sabit (₼)</label>
                <input type="number" step="50" value={otherFixed || ''} onChange={(e) => setOtherFixed(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
            </div>
          </div>

          {/* Dəyişən Xərc + Parametrlər */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 p-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Dəyişən Xərc və Parametrlər</h3>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Dəyişən xərc %</label>
                <input type="number" min="0" max="99" value={variablePct || ''} onChange={(e) => setVariablePct(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Orta çek (₼)</label>
                <input type="number" step="0.5" value={avgCheck || ''} onChange={(e) => setAvgCheck(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Hazırkı satış (₼)</label>
                <input type="number" step="500" value={currentSales || ''} onChange={(e) => setCurrentSales(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-300 transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-amber-50 rounded-xl p-3 text-center ring-1 ring-amber-200/60">
                <div className="text-xl font-black text-amber-600">60-65%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Contribution əms.</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center ring-1 ring-blue-200/60">
                <div className="text-xl font-black text-blue-600">≥20%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Ideal marja</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center ring-1 ring-emerald-200/60">
                <div className="text-xl font-black text-emerald-600">30 gün</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Hesab dövrü</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BİLİK PANELİ */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            Başabaşı <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">Anlamaq</span>
          </h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">Satış həddi bilmədən restoran açmaq, gözbağlı sürücülükdür.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Başabaş Nədir */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50/60 to-white ring-1 ring-amber-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Info size={15} className="text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Başabaş Nədir?</h3>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              Başabaş nöqtəsi (Break-Even Point) - restoranın nə mənfəət, nə zərər etmədiyi <strong className="text-slate-800">minimum satış həddidir</strong>. Bu rəqəmdən aşağı hər ay zərərdir.
            </p>
            <div className="bg-slate-900 rounded-xl p-4 space-y-2 mt-auto">
              <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Formul</p>
              <div className="text-[12px] font-mono text-slate-300 space-y-0.5">
                <p className="text-white">Sabit Xərclər</p>
                <p>÷ Contribution Margin %</p>
                <p className="border-t border-slate-700 pt-1 text-amber-400 font-bold">= Başabaş Satış (₼)</p>
              </div>
              <div className="border-t border-slate-700 pt-2">
                <p className="text-[11px] font-mono text-white font-bold">CM% = 100% − Dəyişən Xərc%</p>
              </div>
            </div>
          </div>

          {/* Sabit vs Dəyişən */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200/60 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <TrendingDown size={15} className="text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Sabit vs Dəyişən Xərc</h3>
            </div>
            <p className="text-[12px] text-slate-500 mb-4">Satış həcmi dəyişsə də sabit xərc dəyişmir.</p>
            <div className="space-y-2.5 mt-auto">
              <div className="bg-amber-50 ring-1 ring-amber-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-amber-700">Sabit Xərclər</p>
                <p className="text-[11px] text-amber-600/80 mt-1 leading-relaxed">İcarə, maaş, sığorta, kredit ödənişi, lisenziya. Satış sıfır olsa da ödənəcəksiniz.</p>
              </div>
              <div className="bg-blue-50 ring-1 ring-blue-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-blue-700">Dəyişən Xərclər</p>
                <p className="text-[11px] text-blue-600/80 mt-1 leading-relaxed">Ərzaq, içki, qablaşdırma, çatdırılma. Satış artıqca artan xərclərdir. Adətən 30-40%.</p>
              </div>
              <div className="bg-emerald-50 ring-1 ring-emerald-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-emerald-700">Contribution Margin</p>
                <p className="text-[11px] text-emerald-600/80 mt-1 leading-relaxed">Satışdan dəyişən xərci çıxdıqdan sonra qalan hissə. Bu hissə sabit xərcləri örtür.</p>
              </div>
            </div>
          </div>

          {/* Təhlükəsizlik Marjası */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white ring-1 ring-emerald-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={15} className="text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Təhlükəsizlik Marjası</h3>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              Hazırkı satışın başabaşdan nə qədər <strong className="text-slate-800">uzaq olduğunu</strong> göstərir. 20%-dən aşağıdırsa təhlükə zonasındasınız.
            </p>
            <div className="bg-white ring-1 ring-emerald-200/60 rounded-xl p-4 mt-auto">
              <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-3">Marja səviyyələri</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-600"><strong className="text-emerald-700">≥20%</strong> - Təhlükəsizdə</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-[11px] text-slate-600"><strong className="text-amber-700">0-20%</strong> - Diqqət zonası</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[11px] text-slate-600"><strong className="text-red-700">&lt;0%</strong> - Zərər edərsiniz</span>
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
                <h3 className="text-base font-bold text-amber-400">DK Agency Məsləhəti</h3>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-5">
                Azərbaycan restoranlarının <strong className="text-white">çoxu</strong> başabaş nöqtəsini bilmədən işləyir. Nəticədə &quot;müştəri var amma pul yoxdur&quot; sindromu yaşanır. Hər ay bu hesabı yenilyin.
              </p>
              <Link href="/blog/basabas-noqtesi-hesablama" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors group">
                Tam yazını oxu <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#E94560] to-[#d63b54] p-8 text-white shadow-xl shadow-red-500/15 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-display font-black mb-3">OCAQ Panel</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Aylıq sabit xərcləri izlə, başabaşı avtomatik hesabla, real-time maliyyə nəzarəti al.
              </p>
            </div>
            <Link href="/auth/register" className="flex items-center justify-center gap-2 w-full bg-white text-[#E94560] py-3.5 rounded-xl font-black text-sm hover:shadow-lg transition-all active:scale-[0.98]">
              Pulsuz başla <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ƏLAQƏLİ YAZILAR */}
      <div className="max-w-6xl mx-auto px-6 mt-20">
        <div className="bg-slate-50 rounded-2xl p-8 sm:p-10">
          <div className="flex items-center gap-2.5 mb-8">
            <BookOpen size={18} className="text-[#E94560]" />
            <h3 className="text-lg font-bold text-slate-900">Daha Dərin Öyrən</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Başabaş Nöqtəsi Hesablama', slug: 'basabas-noqtesi-hesablama', tag: 'Maliyyə' },
              { title: 'P&L Oxuya Bilmirsən?', slug: 'pnl-oxuya-bilmirsen', tag: 'Maliyyə' },
              { title: 'Food Cost-un Qanlı Həqiqəti', slug: '1-porsiya-food-cost-hesablama', tag: 'Maliyyə' },
            ].map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="group block bg-white rounded-xl p-5 ring-1 ring-slate-200/60 hover:shadow-md hover:ring-slate-300/60 transition-all duration-300">
                <span className="text-[10px] font-bold text-[#E94560] uppercase tracking-widest">{a.tag}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug group-hover:text-[#E94560] transition-colors">{a.title}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold mt-4 group-hover:text-[#E94560] group-hover:gap-2 transition-all">
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


