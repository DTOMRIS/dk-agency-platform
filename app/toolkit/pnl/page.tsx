'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function PnLPage() {
  const [revenue, setRevenue] = useState(50000);
  const [foodCost, setFoodCost] = useState(15000);
  const [laborCost, setLaborCost] = useState(12500);
  const [rent, setRent] = useState(5000);
  const [utilities, setUtilities] = useState(2500);
  const [marketing, setMarketing] = useState(1500);
  const [other, setOther] = useState(3000);

  const totalExpenses = foodCost + laborCost + rent + utilities + marketing + other;
  const netProfit = revenue - totalExpenses;
  const netMargin = revenue > 0 ? ((netProfit / revenue) * 100) : 0;
  const primeCost = foodCost + laborCost;
  const primeCostPct = revenue > 0 ? ((primeCost / revenue) * 100) : 0;

  const pct = (val: number) => revenue > 0 ? ((val / revenue) * 100).toFixed(1) : '0.0';

  const rows = [
    { label: 'Umumi Satis (Revenue)', value: revenue, setter: setRevenue, isRevenue: true },
    { label: 'Food Cost (Erzaq)', value: foodCost, setter: setFoodCost },
    { label: 'Isci Xercleri (Labor)', value: laborCost, setter: setLaborCost },
    { label: 'Icare (Rent)', value: rent, setter: setRent },
    { label: 'Kommunal (Utilities)', value: utilities, setter: setUtilities },
    { label: 'Marketinq', value: marketing, setter: setMarketing },
    { label: 'Diger Xercler', value: other, setter: setOther },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      <div className="bg-slate-950 py-16 text-white">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/toolkit" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Toolkit
          </Link>
          <h1 className="text-4xl font-display font-black tracking-tighter mb-4">
            P&L Simulyatoru
          </h1>
          <p className="text-slate-400 text-lg">
            Ayliq gelir-xerc hesabati. Xalis menfeet ve prime cost-u izle.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Xalis Menfeet</p>
            <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {netProfit.toLocaleString()} AZN
            </p>
            <div className="flex items-center justify-center gap-1 mt-1">
              {netMargin > 0 ? <TrendingUp size={14} className="text-emerald-500" /> : netMargin < 0 ? <TrendingDown size={14} className="text-red-500" /> : <Minus size={14} className="text-slate-400" />}
              <span className="text-xs font-bold text-slate-500">{netMargin.toFixed(1)}%</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Prime Cost</p>
            <p className={`text-2xl font-black ${primeCostPct <= 65 ? 'text-emerald-600' : 'text-red-600'}`}>
              {primeCostPct.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Hedefe: &le;65%</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center">
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Food Cost %</p>
            <p className={`text-2xl font-black ${revenue > 0 && (foodCost/revenue*100) <= 32 ? 'text-emerald-600' : 'text-amber-600'}`}>
              {pct(foodCost)}%
            </p>
            <p className="text-xs text-slate-400 mt-1">Hedefe: &le;32%</p>
          </div>
        </div>

        {/* P&L Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 bg-slate-900 text-white text-xs font-bold uppercase tracking-widest px-6 py-3">
            <div className="col-span-5">Kateqoriya</div>
            <div className="col-span-4">Mebleq (AZN)</div>
            <div className="col-span-3 text-right">Faiz (%)</div>
          </div>
          {rows.map((row) => (
            <div key={row.label} className={`grid grid-cols-12 items-center px-6 py-3 border-b border-slate-100 ${row.isRevenue ? 'bg-emerald-50' : ''}`}>
              <div className="col-span-5 text-sm font-medium text-slate-700">{row.label}</div>
              <div className="col-span-4">
                <input
                  type="number"
                  value={row.value || ''}
                  onChange={e => row.setter(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-900 outline-none focus:border-brand-red"
                />
              </div>
              <div className="col-span-3 text-right text-sm font-bold text-slate-500">
                {row.isRevenue ? '100%' : `${pct(row.value)}%`}
              </div>
            </div>
          ))}
          {/* Total Row */}
          <div className="grid grid-cols-12 items-center px-6 py-4 bg-slate-50 font-bold">
            <div className="col-span-5 text-sm text-slate-900">Xalis Menfeet</div>
            <div className={`col-span-4 text-lg ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {netProfit.toLocaleString()} AZN
            </div>
            <div className={`col-span-3 text-right text-sm ${netProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {netMargin.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
