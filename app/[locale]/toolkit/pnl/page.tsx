'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ArrowRight,
  RotateCcw,
  Info,
  Shield,
  ShieldCheck,
  Lightbulb,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface PnlRow {
  key: string;
  label: string;
  value: number;
  setter: (v: number) => void;
  indent?: boolean;
  detailOnly?: boolean;
}

interface SubtotalRow {
  key: string;
  label: string;
  getValue: () => number;
  type: 'subtotal' | 'final';
  color?: string;
}

type Row = (PnlRow & { kind: 'input' }) | (SubtotalRow & { kind: 'subtotal' });

export default function PnlSimulator() {
  // ═══ Revenue ═══
  const [revenue, setRevenue] = useState(50000);

  // ═══ COGS ═══
  const [foodCost, setFoodCost] = useState(15000);
  const [packaging, setPackaging] = useState(500);

  // ═══ Nəzarət edilə bilən ═══
  const [staffCost, setStaffCost] = useState(10000);
  const [management, setManagement] = useState(2500);
  const [advertising, setAdvertising] = useState(1500);
  const [promo, setPromo] = useState(800);
  const [outsource, setOutsource] = useState(600);
  const [uniform, setUniform] = useState(200);
  const [supplies, setSupplies] = useState(400);
  const [repair, setRepair] = useState(300);
  const [utilities, setUtilities] = useState(2000);
  const [otherCtrl, setOtherCtrl] = useState(500);

  // ═══ Nəzarət edilə bilməyən ═══
  const [rent, setRent] = useState(5000);
  const [accounting, setAccounting] = useState(800);
  const [insurance, setInsurance] = useState(400);
  const [tax, setTax] = useState(1200);
  const [depreciation, setDepreciation] = useState(600);

  const [detailed, setDetailed] = useState(false);

  const calc = useMemo(() => {
    const cogs = foodCost + packaging;
    const opProfit = revenue - cogs;
    const controllable = staffCost + management + advertising + promo + outsource + uniform + supplies + repair + utilities + otherCtrl;
    const controllableProfit = opProfit - controllable;
    const uncontrollable = rent + accounting + insurance + tax + depreciation;
    const net = controllableProfit - uncontrollable;
    const pct = (v: number) => (revenue > 0 ? (v / revenue) * 100 : 0);
    const primeCost = foodCost + staffCost + management;
    return { cogs, opProfit, controllable, controllableProfit, uncontrollable, net, pct, primeCost };
  }, [revenue, foodCost, packaging, staffCost, management, advertising, promo, outsource, uniform, supplies, repair, utilities, otherCtrl, rent, accounting, insurance, tax, depreciation]);

  const p = (v: number) => (revenue > 0 ? ((v / revenue) * 100).toFixed(1) : '0.0');

  const resetAll = () => {
    setRevenue(50000); setFoodCost(15000); setPackaging(500);
    setStaffCost(10000); setManagement(2500); setAdvertising(1500); setPromo(800);
    setOutsource(600); setUniform(200); setSupplies(400); setRepair(300);
    setUtilities(2000); setOtherCtrl(500);
    setRent(5000); setAccounting(800); setInsurance(400); setTax(1200); setDepreciation(600);
  };

  const rows: Row[] = [
    // Revenue
    { kind: 'input', key: 'revenue', label: 'Ümumi Satış (Revenue)', value: revenue, setter: setRevenue },

    // COGS
    { kind: 'input', key: 'food', label: 'Ərzaq maliyyəti', value: foodCost, setter: setFoodCost, indent: true },
    { kind: 'input', key: 'pack', label: 'Qablaşdırma', value: packaging, setter: setPackaging, indent: true, detailOnly: true },
    { kind: 'subtotal', key: 'opProfit', label: 'Əməliyyat mənfəəti', getValue: () => calc.opProfit, type: 'subtotal' },

    // Controllable
    { kind: 'input', key: 'staff', label: 'Əməkdaş xərcləri', value: staffCost, setter: setStaffCost, indent: true },
    { kind: 'input', key: 'mgmt', label: 'Rəhbərlik maaşı', value: management, setter: setManagement, indent: true, detailOnly: true },
    { kind: 'input', key: 'ads', label: 'Reklam / Marketinq', value: advertising, setter: setAdvertising, indent: true },
    { kind: 'input', key: 'promo', label: 'Promo / İkram', value: promo, setter: setPromo, indent: true, detailOnly: true },
    { kind: 'input', key: 'out', label: 'Kənar xidmətlər', value: outsource, setter: setOutsource, indent: true, detailOnly: true },
    { kind: 'input', key: 'uni', label: 'Uniforma / Təchizat', value: uniform, setter: setUniform, indent: true, detailOnly: true },
    { kind: 'input', key: 'sup', label: 'Sərf materialları', value: supplies, setter: setSupplies, indent: true, detailOnly: true },
    { kind: 'input', key: 'rep', label: 'Təmir / Texniki xidmət', value: repair, setter: setRepair, indent: true, detailOnly: true },
    { kind: 'input', key: 'util', label: 'Kommunal xərclər', value: utilities, setter: setUtilities, indent: true },
    { kind: 'input', key: 'other', label: 'Digər nəzarət edilən', value: otherCtrl, setter: setOtherCtrl, indent: true, detailOnly: true },
    { kind: 'subtotal', key: 'ctrlProfit', label: 'Nəzarət edilə bilən mənfəət', getValue: () => calc.controllableProfit, type: 'subtotal' },

    // Uncontrollable
    { kind: 'input', key: 'rent', label: 'İcarə', value: rent, setter: setRent, indent: true },
    { kind: 'input', key: 'acc', label: 'Mühasibatlıq', value: accounting, setter: setAccounting, indent: true, detailOnly: true },
    { kind: 'input', key: 'ins', label: 'Sığorta', value: insurance, setter: setInsurance, indent: true, detailOnly: true },
    { kind: 'input', key: 'tax', label: 'Vergilər', value: tax, setter: setTax, indent: true, detailOnly: true },
    { kind: 'input', key: 'dep', label: 'Amortizasiya', value: depreciation, setter: setDepreciation, indent: true, detailOnly: true },

    // Final
    { kind: 'subtotal', key: 'net', label: 'Xalis Mənfəət', getValue: () => calc.net, type: 'final' },
  ];

  const visibleRows = detailed ? rows : rows.filter((r) => !('detailOnly' in r && r.detailOnly));

  // Section headers
  const sectionBefore: Record<string, string> = {
    food: 'COGS (Satılmış Malların Dəyəri)',
    staff: 'Nəzarət Edilə Bilən Xərclər',
    rent: 'Nəzarət Edilə Bilməyən Xərclər',
  };

  return (
    <div className="bg-white pb-24">

      {/* ═══ HERO ═══ */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-500/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-30%] left-[-5%] w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20">
          <Link href="/toolkit" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-8 group">
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Toolkit</span>
          </Link>
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight leading-[1.1] mb-5">
              P&L<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">Simulyatoru</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Aylıq gəlir-xərc hesabatını modelləşdir. Nəzarət edilən və edilməyən xərcləri ayır, xalis mənfəəti izlə.
            </p>
          </div>
        </div>
      </div>

      {/* ═══ KPI STRIP ═══ */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={`${calc.net >= 0 ? 'bg-emerald-50 ring-emerald-500/20' : 'bg-red-50 ring-red-500/20'} rounded-2xl p-5 ring-1`}>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Xalis Mənfəət</div>
            <div className={`text-3xl font-black tabular-nums ${calc.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{calc.net.toLocaleString()}<span className="text-lg ml-1">₼</span></div>
            <div className={`text-xs font-semibold mt-1 ${calc.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{p(calc.net)}%</div>
          </div>
          <div className={`${calc.pct(calc.primeCost) <= 65 ? 'bg-blue-50 ring-blue-500/20' : 'bg-red-50 ring-red-500/20'} rounded-2xl p-5 ring-1`}>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Prime Cost</div>
            <div className={`text-3xl font-black tabular-nums ${calc.pct(calc.primeCost) <= 65 ? 'text-blue-600' : 'text-red-600'}`}>{calc.pct(calc.primeCost).toFixed(1)}%</div>
            <div className="text-[10px] text-slate-400 mt-1">hədəf ≤65%</div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Food Cost</div>
            <div className={`text-3xl font-black tabular-nums ${calc.pct(foodCost) <= 32 ? 'text-emerald-600' : 'text-amber-600'}`}>{calc.pct(foodCost).toFixed(1)}%</div>
            <div className="text-[10px] text-slate-400 mt-1">hədəf ≤32%</div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">İcarə</div>
            <div className={`text-3xl font-black tabular-nums ${calc.pct(rent) <= 10 ? 'text-blue-600' : 'text-red-600'}`}>{calc.pct(rent).toFixed(1)}%</div>
            <div className="text-[10px] text-slate-400 mt-1">hədəf ≤10%</div>
          </div>
        </div>
      </div>

      {/* ═══ MAIN BODY ═══ */}
      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-6">

        {/* P&L Cədvəli — FULL WIDTH */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">P&L Hesabatı</h2>
            <div className="flex items-center gap-4">
              <button onClick={() => setDetailed(!detailed)} className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                {detailed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {detailed ? 'Sadə görünüş' : 'Detallı gör'}
              </button>
              <button onClick={resetAll} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors">
                <RotateCcw size={13} /> Sıfırla
              </button>
            </div>
          </div>

          {/* Header */}
          <div className="grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/60 px-6 py-3">
            <div className="col-span-5">Kateqoriya</div>
            <div className="col-span-4">Məbləğ (₼)</div>
            <div className="col-span-3 text-right">Faiz (%)</div>
          </div>

          {/* Rows */}
          <div>
            {visibleRows.map((row) => {
              // Section header
              const section = row.kind === 'input' && sectionBefore[row.key];

              return (
                <div key={row.key}>
                  {section && (
                    <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{section}</span>
                    </div>
                  )}

                  {row.kind === 'input' ? (
                    <div className={`grid grid-cols-12 items-center px-6 py-3 border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${row.key === 'revenue' ? 'bg-emerald-50/60' : ''}`}>
                      <div className={`col-span-5 text-sm font-medium text-slate-700 ${row.indent ? 'pl-4' : 'font-bold text-slate-900'}`}>
                        {row.label}
                      </div>
                      <div className="col-span-4">
                        <input
                          type="number"
                          value={row.value || ''}
                          onChange={(e) => row.setter(Number(e.target.value) || 0)}
                          className="w-full bg-slate-100/80 rounded-lg px-3 py-2 text-sm text-slate-900 font-medium outline-none focus:ring-2 focus:ring-blue-500/30 transition-shadow"
                        />
                      </div>
                      <div className="col-span-3 text-right text-sm font-semibold text-slate-500 tabular-nums">
                        {row.key === 'revenue' ? '100%' : `${p(row.value)}%`}
                      </div>
                    </div>
                  ) : (
                    <div className={`grid grid-cols-12 items-center px-6 py-4 border-b-2 border-slate-200 ${
                      row.type === 'final'
                        ? row.getValue() >= 0 ? 'bg-emerald-50' : 'bg-red-50'
                        : 'bg-slate-50/80'
                    }`}>
                      <div className="col-span-5 text-sm font-bold text-slate-900">{row.label}</div>
                      <div className={`col-span-4 text-lg font-black tabular-nums ${
                        row.type === 'final'
                          ? row.getValue() >= 0 ? 'text-emerald-600' : 'text-red-600'
                          : 'text-slate-900'
                      }`}>
                        {row.getValue().toLocaleString()} ₼
                      </div>
                      <div className={`col-span-3 text-right text-sm font-bold tabular-nums ${
                        row.type === 'final'
                          ? row.getValue() >= 0 ? 'text-emerald-600' : 'text-red-600'
                          : 'text-slate-600'
                      }`}>
                        {p(row.getValue())}%
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Benchmark + Parametrlər yan-yana */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* P&L Benchmark */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 p-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">P&L Benchmark</h3>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-emerald-50 rounded-xl p-4 text-center ring-1 ring-emerald-200/60">
                <div className="text-2xl font-black text-emerald-600">10-15%</div>
                <div className="text-xs text-slate-500 font-medium mt-1.5">Net Mənfəət</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center ring-1 ring-blue-200/60">
                <div className="text-2xl font-black text-blue-600">≤65%</div>
                <div className="text-xs text-slate-500 font-medium mt-1.5">Prime Cost</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center ring-1 ring-amber-200/60">
                <div className="text-2xl font-black text-amber-600">28-32%</div>
                <div className="text-xs text-slate-500 font-medium mt-1.5">Food Cost</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center ring-1 ring-purple-200/60">
                <div className="text-2xl font-black text-purple-600">≤10%</div>
                <div className="text-xs text-slate-500 font-medium mt-1.5">İcarə</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-sm text-slate-600">
              <div className="bg-slate-50 rounded-lg px-3 py-2.5">👨‍🍳 <strong>Labor</strong> 25-35%</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2.5">📢 <strong>Marketinq</strong> 3-6%</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2.5">⚡ <strong>Kommunal</strong> 3-5%</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2.5">🔧 <strong>Təmir</strong> 1-2%</div>
            </div>
          </div>

          {/* P&L Nədir + Formul */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200/60 p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Info size={15} className="text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">P&L Nədir?</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Profit & Loss (Mənfəət və Zərər) — restoranın müəyyən dövrdə nə qədər qazandığını və nə qədər xərclədiyini göstərən maliyyə hesabatıdır. <strong className="text-slate-800">Hər ay</strong> hazırlanmalıdır.
            </p>
            <div className="bg-slate-900 rounded-xl p-5 space-y-2.5">
              <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">P&L Strukturu</p>
              <div className="text-sm font-mono text-slate-300 space-y-0.5">
                <p className="text-white">Ümumi Satış (Revenue)</p>
                <p>− COGS (ərzaq + qablaşdırma)</p>
                <p className="text-blue-400">= Əməliyyat mənfəəti</p>
                <p>− Nəzarət edilən xərclər</p>
                <p className="text-blue-400">= Nəzarət edilə bilən mənfəət</p>
                <p>− Nəzarət edilməyən xərclər</p>
                <p className="text-emerald-400 font-bold">= Xalis Mənfəət</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BİLİK PANELİ — 3 SÜTUN ═══ */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            P&L-i <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Dərindən Anla</span>
          </h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">Rəqəmlərin arxasındakı məntiqi bil, nəzarəti ələ al.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Nəzarət Edilən vs Edilməyən */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50/60 to-white ring-1 ring-blue-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={15} className="text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Nəzarət Edilən vs Edilməyən</h3>
            </div>
            <div className="space-y-3 mt-auto">
              <div className="bg-emerald-50 ring-1 ring-emerald-200/60 rounded-xl p-4">
                <p className="text-sm font-bold text-emerald-700">✓ Nəzarət Edilə Bilən</p>
                <p className="text-[13px] text-emerald-600/80 mt-1.5 leading-relaxed">Ərzaq, əməkdaş, reklam, promo, kommunal, təmir — bunları dəyişə bilərsən. <strong>P&L-in 60-70%-i</strong> sənin əlindədir.</p>
              </div>
              <div className="bg-red-50 ring-1 ring-red-200/60 rounded-xl p-4">
                <p className="text-sm font-bold text-red-700">✕ Nəzarət Edilə Bilməyən</p>
                <p className="text-[13px] text-red-600/80 mt-1.5 leading-relaxed">İcarə, vergi, sığorta, amortizasiya — bunlar sabitdir. Dəyişdirmək çox çətindir, ona görə <strong>nəzarət edilənlərə fokuslan.</strong></p>
              </div>
            </div>
          </div>

          {/* Prime Cost */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50/80 to-white ring-1 ring-amber-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <Shield size={15} className="text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Prime Cost Nədir?</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">
              Restoranın ən böyük iki xərci: <strong className="text-slate-800">ərzaq + əməkdaş.</strong> P&L-in ən kritik göstəricisidir. Hədəf: satışın <strong className="text-slate-800">≤65%-i.</strong>
            </p>
            <div className="bg-amber-900 rounded-xl p-5 space-y-2.5 mt-auto">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">Formul</p>
              <div className="text-sm font-mono text-amber-100 space-y-0.5">
                <p>Food Cost + Labor Cost</p>
                <p className="text-amber-400 font-bold">= Prime Cost</p>
              </div>
              <div className="border-t border-amber-700 pt-2.5">
                <p className="text-[13px] font-mono text-amber-200 font-bold">Prime Cost % = (FC + LC) ÷ Satış × 100</p>
              </div>
            </div>
          </div>

          {/* Nə vaxt narahat olmalısan */}
          <div className="rounded-2xl bg-gradient-to-br from-red-50/60 to-white ring-1 ring-red-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                <Info size={15} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Xəbərdarlıq İşarələri</h3>
            </div>
            <div className="space-y-3 mt-auto">
              <div className="bg-white ring-1 ring-red-200/60 rounded-xl p-4">
                <p className="text-[13px] text-slate-700 leading-relaxed">🔴 <strong>Prime cost {'>'} 70%</strong> — restoran zərər edir və ya zərərin astanasındadır</p>
              </div>
              <div className="bg-white ring-1 ring-amber-200/60 rounded-xl p-4">
                <p className="text-[13px] text-slate-700 leading-relaxed">🟡 <strong>Net mənfəət {'<'} 5%</strong> — riskli zona, bir xəta zərərə çevirə bilər</p>
              </div>
              <div className="bg-white ring-1 ring-amber-200/60 rounded-xl p-4">
                <p className="text-[13px] text-slate-700 leading-relaxed">🟡 <strong>İcarə {'>'} 12%</strong> — lokasiya çox bahadır, danışıqlar aparın</p>
              </div>
              <div className="bg-white ring-1 ring-emerald-200/60 rounded-xl p-4">
                <p className="text-[13px] text-slate-700 leading-relaxed">🟢 <strong>Net mənfəət {'>'} 15%</strong> — əla performans, investisiya edə bilərsiniz</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ DK + OCAQ YAN-YANA ═══ */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[50px]" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Lightbulb size={16} className="text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-amber-400">DK Agency Məsləhəti</h3>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-5">
                P&L-i <strong className="text-white">ayda 1 dəfə</strong> hazırlayan restoran artıq rəqiblərinin 90%-indən öndədir. Amma həqiqi güc <strong className="text-white">həftəlik</strong> izləmədədir — trendləri erkən görərsən.
              </p>
              <Link href="/blog/pnl-oxuya-bilmirsen" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors group">
                Tam yazını oxu <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#E94560] to-[#d63b54] p-8 text-white shadow-xl shadow-red-500/15 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-display font-black mb-3">OCAQ Panel</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Avtomatik P&L hesabatı, food cost izləmə, əməkdaş xərcləri analizi. Hər şey bir paneldə.
              </p>
            </div>
            <Link href="/auth/register" className="flex items-center justify-center gap-2 w-full bg-white text-[#E94560] py-3.5 rounded-xl font-black text-sm hover:shadow-lg transition-all active:scale-[0.98]">
              Pulsuz başla <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══ ƏLAQƏLI YAZILAR ═══ */}
      <div className="max-w-6xl mx-auto px-6 mt-20">
        <div className="bg-slate-50 rounded-2xl p-8 sm:p-10">
          <div className="flex items-center gap-2.5 mb-8">
            <BookOpen size={18} className="text-[#E94560]" />
            <h3 className="text-lg font-bold text-slate-900">Daha Dərin Öyrən</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'P&L Oxuya Bilmirsən?', slug: 'pnl-oxuya-bilmirsen', tag: 'Maliyyə' },
              { title: 'Food Cost-un Qanlı Həqiqəti', slug: '1-porsiya-food-cost-hesablama', tag: 'Maliyyə' },
              { title: 'Başabaş Nöqtəsi Nədir?', slug: 'basabas-noqtesi', tag: 'Əməliyyat' },
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
