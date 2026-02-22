// app/dashboard/deal-flow/page.tsx
// DK Agency Admin - Deal Flow Analizi

'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  Building2
} from 'lucide-react';

interface DealFlowData {
  month: string;
  newDeals: number;
  closedWon: number;
  closedLost: number;
  totalValue: number;
  avgDealSize: number;
}

const monthlyData: DealFlowData[] = [
  { month: 'Eylül 2025', newDeals: 28, closedWon: 8, closedLost: 5, totalValue: 890000, avgDealSize: 111250 },
  { month: 'Ekim 2025', newDeals: 35, closedWon: 12, closedLost: 4, totalValue: 1250000, avgDealSize: 104166 },
  { month: 'Kasım 2025', newDeals: 31, closedWon: 9, closedLost: 7, totalValue: 980000, avgDealSize: 108888 },
  { month: 'Aralık 2025', newDeals: 24, closedWon: 15, closedLost: 3, totalValue: 1420000, avgDealSize: 94666 },
  { month: 'Ocak 2026', newDeals: 42, closedWon: 11, closedLost: 6, totalValue: 1180000, avgDealSize: 107272 },
  { month: 'Şubat 2026', newDeals: 38, closedWon: 14, closedLost: 4, totalValue: 1560000, avgDealSize: 111428 },
];

interface TopDeal {
  name: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  owner: string;
  daysInPipeline: number;
}

const topDeals: TopDeal[] = [
  { name: 'Fine Dining Bakü', company: 'GP Restaurants', value: 450000, stage: 'Müzakere', probability: 85, owner: 'Elvin G.', daysInPipeline: 28 },
  { name: 'Hotel Restaurant Chain', company: 'Boutique Hotels', value: 520000, stage: 'Teklif', probability: 60, owner: 'Aysel H.', daysInPipeline: 45 },
  { name: 'Fast Food Franchise', company: 'Türk Mutfağı Ltd', value: 280000, stage: 'Nitelikli', probability: 40, owner: 'Orkhan M.', daysInPipeline: 12 },
  { name: 'Merkez Café Zinciri', company: 'Caspian Ventures', value: 380000, stage: 'Müzakere', probability: 90, owner: 'Elvin G.', daysInPipeline: 65 },
  { name: 'Beach Restaurant', company: 'Event Masters', value: 180000, stage: 'Teklif', probability: 55, owner: 'Nigar H.', daysInPipeline: 20 },
];

const salesTeam = [
  { name: 'Elvin Guliyev', won: 8, lost: 2, totalValue: 890000, avgCycle: 32 },
  { name: 'Aysel Huseynova', won: 6, lost: 3, totalValue: 620000, avgCycle: 45 },
  { name: 'Orkhan Mammadov', won: 5, lost: 2, totalValue: 480000, avgCycle: 28 },
  { name: 'Nigar Hasanova', won: 4, lost: 1, totalValue: 350000, avgCycle: 38 },
];

export default function DealFlowPage() {
  const [period, setPeriod] = useState<'3m' | '6m' | '12m'>('6m');

  const totalNewDeals = monthlyData.reduce((sum, m) => sum + m.newDeals, 0);
  const totalWon = monthlyData.reduce((sum, m) => sum + m.closedWon, 0);
  const totalLost = monthlyData.reduce((sum, m) => sum + m.closedLost, 0);
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.totalValue, 0);
  const winRate = ((totalWon / (totalWon + totalLost)) * 100).toFixed(1);

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deal Flow</h1>
          <p className="text-sm text-gray-500 mt-1">Fırsat akışı ve satış performansı analizi</p>
        </div>
        <div className="flex gap-2">
          {(['3m', '6m', '12m'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === p 
                  ? 'bg-red-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p === '3m' ? '3 Ay' : p === '6m' ? '6 Ay' : '1 Yıl'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <Activity size={20} className="text-blue-500" />
            <span className="flex items-center text-xs text-green-600">
              +18% <TrendingUp size={12} className="ml-1" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalNewDeals}</p>
          <p className="text-sm text-gray-500">Yeni Fırsat</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={20} className="text-green-500" />
            <span className="flex items-center text-xs text-green-600">
              +12% <TrendingUp size={12} className="ml-1" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalWon}</p>
          <p className="text-sm text-gray-500">Kazanılan</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <Target size={20} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{winRate}%</p>
          <p className="text-sm text-gray-500">Kazanma Oranı</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} className="text-emerald-500" />
            <span className="flex items-center text-xs text-green-600">
              +24% <TrendingUp size={12} className="ml-1" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(totalRevenue / 1000000).toFixed(2)}M ₼</p>
          <p className="text-sm text-gray-500">Toplam Gelir</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <Clock size={20} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">36</p>
          <p className="text-sm text-gray-500">Ort. Satış Döngüsü (gün)</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Aylık Trend</h3>
            <BarChart3 size={18} className="text-gray-400" />
          </div>
          <div className="space-y-3">
            {monthlyData.map((data) => {
              const maxValue = Math.max(...monthlyData.map(d => d.totalValue));
              return (
                <div key={data.month} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-24 shrink-0">{data.month}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div 
                      className="h-6 bg-gradient-to-r from-red-500 to-red-600 rounded"
                      style={{ width: `${(data.totalValue / maxValue) * 100}%` }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {(data.totalValue / 1000).toFixed(0)}K ₼
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Dönüşüm Hunisi</h3>
            <PieChart size={18} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { stage: 'Potansiyel', count: 198, pct: 100, color: 'bg-blue-500' },
              { stage: 'Nitelikli', count: 142, pct: 72, color: 'bg-indigo-500' },
              { stage: 'Teklif', count: 89, pct: 45, color: 'bg-purple-500' },
              { stage: 'Müzakere', count: 54, pct: 27, color: 'bg-pink-500' },
              { stage: 'Kapandı (Kazanıldı)', count: 69, pct: 35, color: 'bg-green-500' },
            ].map((item, idx) => (
              <div key={item.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{item.stage}</span>
                  <span className="text-sm font-medium text-gray-700">{item.count}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Deals & Team Performance */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top Deals */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">En Büyük Aktif Fırsatlar</h3>
            <Zap size={18} className="text-amber-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left pb-3 font-medium">Fırsat</th>
                  <th className="text-left pb-3 font-medium">Değer</th>
                  <th className="text-left pb-3 font-medium">Aşama</th>
                  <th className="text-left pb-3 font-medium">Olasılık</th>
                  <th className="text-left pb-3 font-medium">Sorumlu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {topDeals.map((deal) => (
                  <tr key={deal.name} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3">
                      <div>
                        <p className="font-medium text-gray-900">{deal.name}</p>
                        <p className="text-xs text-gray-500">{deal.company}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="font-semibold text-green-600">{(deal.value / 1000).toFixed(0)}K ₼</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                        {deal.stage}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              deal.probability >= 70 ? 'bg-green-500' : 
                              deal.probability >= 40 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${deal.probability}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{deal.probability}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-600">{deal.owner}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Team Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Takım Performansı</h3>
            <Award size={18} className="text-amber-500" />
          </div>
          <div className="space-y-4">
            {salesTeam.map((member, idx) => (
              <div 
                key={member.name}
                className={`p-3 rounded-lg ${idx === 0 ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{member.name}</span>
                  {idx === 0 && <Award size={16} className="text-amber-500" />}
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Kazanılan:</span>
                    <span className="ml-1 text-green-600 font-semibold">{member.won}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Kaybedilen:</span>
                    <span className="ml-1 text-red-600 font-semibold">{member.lost}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Toplam:</span>
                    <span className="ml-1 font-semibold">{(member.totalValue / 1000).toFixed(0)}K</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Ort. Döngü:</span>
                    <span className="ml-1 font-semibold">{member.avgCycle}g</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
