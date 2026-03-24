// app/b2b-panel/toolkit/roi-calculator/page.tsx
// DK Agency - ROI (Yatırım Getirisi) Hesaplayıcı

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, TrendingUp, Clock, Info } from 'lucide-react';

export default function ROICalculatorPage() {
  const [initialInvestment, setInitialInvestment] = useState<number>(500000);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(150000);
  const [monthlyCosts, setMonthlyCosts] = useState<number>(100000);
  const [projectionYears, setProjectionYears] = useState<number>(3);

  const calculations = useMemo(() => {
    const monthlyProfit = monthlyRevenue - monthlyCosts;
    const yearlyProfit = monthlyProfit * 12;
    const totalProfit = yearlyProfit * projectionYears;
    const roi = ((totalProfit - initialInvestment) / initialInvestment) * 100;
    const paybackMonths = monthlyProfit > 0 ? Math.ceil(initialInvestment / monthlyProfit) : Infinity;
    const paybackYears = paybackMonths / 12;

    // Yıllık getiri projeksiyonu
    const yearlyProjection = Array.from({ length: projectionYears }, (_, i) => {
      const year = i + 1;
      const cumulativeProfit = yearlyProfit * year;
      const netValue = cumulativeProfit - initialInvestment;
      return { year, profit: yearlyProfit, cumulative: cumulativeProfit, net: netValue };
    });

    return {
      monthlyProfit,
      yearlyProfit,
      totalProfit,
      roi,
      paybackMonths,
      paybackYears,
      yearlyProjection,
    };
  }, [initialInvestment, monthlyRevenue, monthlyCosts, projectionYears]);

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link href="/b2b-panel/toolkit" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors">
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Toolkit</span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center">
            <Calculator size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ROI Hesaplayıcı</h1>
            <p className="text-gray-500">Yatırım getirisi ve geri dönüş süresini hesaplayın</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Yatırım Bilgileri</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Toplam Yatırım Tutarı
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={initialInvestment}
                    onChange={(e) => setInitialInvestment(Number(e.target.value))}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Projeksiyon Süresi
                </label>
                <select
                  value={projectionYears}
                  onChange={(e) => setProjectionYears(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value={1}>1 Yıl</option>
                  <option value={2}>2 Yıl</option>
                  <option value={3}>3 Yıl</option>
                  <option value={5}>5 Yıl</option>
                  <option value={10}>10 Yıl</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Aylık Tahminler</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahmini Aylık Ciro
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahmini Aylık Giderler
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={monthlyCosts}
                    onChange={(e) => setMonthlyCosts(Number(e.target.value))}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">₺</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Kira, personel, malzeme, enerji vb.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <Info size={18} className="text-blue-600 mt-0.5" />
            <p className="text-sm text-blue-700">
              Bu hesaplama tahmini değerler üzerinden yapılmaktadır. 
              Gerçek sonuçlar piyasa koşullarına göre değişebilir.
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
              <TrendingUp size={24} className="mb-2 opacity-80" />
              <p className="text-3xl font-bold">
                {calculations.roi > 0 ? '+' : ''}{calculations.roi.toFixed(1)}%
              </p>
              <p className="text-sm text-white/80 mt-1">ROI ({projectionYears} Yıl)</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
              <Clock size={24} className="mb-2 opacity-80" />
              <p className="text-3xl font-bold">
                {calculations.paybackMonths === Infinity ? '∞' : calculations.paybackMonths}
              </p>
              <p className="text-sm text-white/80 mt-1">
                Ay Geri Dönüş ({calculations.paybackYears.toFixed(1)} yıl)
              </p>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Detaylı Hesaplama</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Aylık Kâr</span>
                <span className={`font-bold ${calculations.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculations.monthlyProfit.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Yıllık Kâr</span>
                <span className={`font-bold ${calculations.yearlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculations.yearlyProfit.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Toplam Kâr ({projectionYears} Yıl)</span>
                <span className={`font-bold ${calculations.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {calculations.totalProfit.toLocaleString('tr-TR')} ₺
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Net Getiri</span>
                <span className={`font-bold text-lg ${(calculations.totalProfit - initialInvestment) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(calculations.totalProfit - initialInvestment).toLocaleString('tr-TR')} ₺
                </span>
              </div>
            </div>
          </div>

          {/* Yearly Projection */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Yıllık Projeksiyon</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-gray-500">Yıl</th>
                    <th className="text-right py-2 text-gray-500">Kâr</th>
                    <th className="text-right py-2 text-gray-500">Kümülatif</th>
                    <th className="text-right py-2 text-gray-500">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {calculations.yearlyProjection.map((row) => (
                    <tr key={row.year} className="border-b border-gray-50">
                      <td className="py-2 font-medium">{row.year}. Yıl</td>
                      <td className="py-2 text-right text-gray-600">
                        {row.profit.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {row.cumulative.toLocaleString('tr-TR')} ₺
                      </td>
                      <td className={`py-2 text-right font-semibold ${row.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {row.net >= 0 ? '+' : ''}{row.net.toLocaleString('tr-TR')} ₺
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
