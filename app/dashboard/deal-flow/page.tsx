// app/dashboard/deal-flow/page.tsx
// DK Agency Admin - Deal Flow Analizi

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

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

const pageCopy: Record<
  Locale,
  {
    pageTitle: string;
    pageSubtitle: string;
    btn3m: string;
    btn6m: string;
    btn12m: string;
    kpiNewDeals: string;
    kpiWon: string;
    kpiWinRate: string;
    kpiTotalRevenue: string;
    kpiAvgCycle: string;
    kpiAvgCycleUnit: string;
    monthlyTrendTitle: string;
    funnelTitle: string;
    funnelStages: string[];
    topDealsTitle: string;
    colOpportunity: string;
    colValue: string;
    colStage: string;
    colProbability: string;
    colOwner: string;
    teamTitle: string;
    teamWon: string;
    teamLost: string;
    teamTotal: string;
    teamAvgCycle: string;
    teamAvgCycleUnit: string;
  }
> = {
  az: {
    pageTitle: 'Deal Flow',
    pageSubtitle: 'Fürsət axını və satış performansı analizi',
    btn3m: '3 Ay',
    btn6m: '6 Ay',
    btn12m: '1 İl',
    kpiNewDeals: 'Yeni Fürsət',
    kpiWon: 'Qazanılan',
    kpiWinRate: 'Qazanma Nisbəti',
    kpiTotalRevenue: 'Ümumi Gəlir',
    kpiAvgCycle: 'Ort. Satış Dövrü',
    kpiAvgCycleUnit: 'gün',
    monthlyTrendTitle: 'Aylıq Trend',
    funnelTitle: 'Dönüşüm Hunisi',
    funnelStages: ['Potensial', 'Kvalifisiya', 'Təklif', 'Danışıq', 'Bağlandı (Qazanıldı)'],
    topDealsTitle: 'Ən Böyük Aktiv Fürsətlər',
    colOpportunity: 'Fürsət',
    colValue: 'Dəyər',
    colStage: 'Mərhələ',
    colProbability: 'Ehtimal',
    colOwner: 'Cavabdeh',
    teamTitle: 'Komanda Performansı',
    teamWon: 'Qazanılan:',
    teamLost: 'İtirilən:',
    teamTotal: 'Cəmi:',
    teamAvgCycle: 'Ort. Dövrü:',
    teamAvgCycleUnit: 'g',
  },
  ru: {
    pageTitle: 'Deal Flow',
    pageSubtitle: 'Анализ потока сделок и эффективности продаж',
    btn3m: '3 мес.',
    btn6m: '6 мес.',
    btn12m: '1 год',
    kpiNewDeals: 'Новых сделок',
    kpiWon: 'Выиграно',
    kpiWinRate: 'Процент выигрыша',
    kpiTotalRevenue: 'Общий доход',
    kpiAvgCycle: 'Ср. цикл продаж',
    kpiAvgCycleUnit: 'дн.',
    monthlyTrendTitle: 'Ежемесячный тренд',
    funnelTitle: 'Воронка конверсии',
    funnelStages: ['Потенциал', 'Квалифицирован', 'Предложение', 'Переговоры', 'Закрыто (Выиграно)'],
    topDealsTitle: 'Крупнейшие активные сделки',
    colOpportunity: 'Сделка',
    colValue: 'Ценность',
    colStage: 'Этап',
    colProbability: 'Вероятность',
    colOwner: 'Ответственный',
    teamTitle: 'Результативность команды',
    teamWon: 'Выиграно:',
    teamLost: 'Проиграно:',
    teamTotal: 'Итого:',
    teamAvgCycle: 'Ср. цикл:',
    teamAvgCycleUnit: 'дн.',
  },
  en: {
    pageTitle: 'Deal Flow',
    pageSubtitle: 'Opportunity pipeline and sales performance analysis',
    btn3m: '3 Mo',
    btn6m: '6 Mo',
    btn12m: '1 Year',
    kpiNewDeals: 'New Deals',
    kpiWon: 'Won',
    kpiWinRate: 'Win Rate',
    kpiTotalRevenue: 'Total Revenue',
    kpiAvgCycle: 'Avg. Sales Cycle',
    kpiAvgCycleUnit: 'days',
    monthlyTrendTitle: 'Monthly Trend',
    funnelTitle: 'Conversion Funnel',
    funnelStages: ['Potential', 'Qualified', 'Proposal', 'Negotiation', 'Closed (Won)'],
    topDealsTitle: 'Top Active Opportunities',
    colOpportunity: 'Opportunity',
    colValue: 'Value',
    colStage: 'Stage',
    colProbability: 'Probability',
    colOwner: 'Owner',
    teamTitle: 'Team Performance',
    teamWon: 'Won:',
    teamLost: 'Lost:',
    teamTotal: 'Total:',
    teamAvgCycle: 'Avg. Cycle:',
    teamAvgCycleUnit: 'd',
  },
  tr: {
    pageTitle: 'Deal Flow',
    pageSubtitle: 'Fırsat akışı ve satış performansı analizi',
    btn3m: '3 Ay',
    btn6m: '6 Ay',
    btn12m: '1 Yıl',
    kpiNewDeals: 'Yeni Fırsat',
    kpiWon: 'Kazanılan',
    kpiWinRate: 'Kazanma Oranı',
    kpiTotalRevenue: 'Toplam Gelir',
    kpiAvgCycle: 'Ort. Satış Döngüsü',
    kpiAvgCycleUnit: 'gün',
    monthlyTrendTitle: 'Aylık Trend',
    funnelTitle: 'Dönüşüm Hunisi',
    funnelStages: ['Potansiyel', 'Nitelikli', 'Teklif', 'Müzakere', 'Kapandı (Kazanıldı)'],
    topDealsTitle: 'En Büyük Aktif Fırsatlar',
    colOpportunity: 'Fırsat',
    colValue: 'Değer',
    colStage: 'Aşama',
    colProbability: 'Olasılık',
    colOwner: 'Sorumlu',
    teamTitle: 'Takım Performansı',
    teamWon: 'Kazanılan:',
    teamLost: 'Kaybedilen:',
    teamTotal: 'Toplam:',
    teamAvgCycle: 'Ort. Döngü:',
    teamAvgCycleUnit: 'g',
  },
};

export default function DealFlowPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [period, setPeriod] = useState<'3m' | '6m' | '12m'>('6m');

  const totalNewDeals = monthlyData.reduce((sum, m) => sum + m.newDeals, 0);
  const totalWon = monthlyData.reduce((sum, m) => sum + m.closedWon, 0);
  const totalLost = monthlyData.reduce((sum, m) => sum + m.closedLost, 0);
  const totalRevenue = monthlyData.reduce((sum, m) => sum + m.totalValue, 0);
  const winRate = ((totalWon / (totalWon + totalLost)) * 100).toFixed(1);

  const funnelData = [
    { count: 198, pct: 100, color: 'bg-blue-500' },
    { count: 142, pct: 72, color: 'bg-indigo-500' },
    { count: 89, pct: 45, color: 'bg-purple-500' },
    { count: 54, pct: 27, color: 'bg-pink-500' },
    { count: 69, pct: 35, color: 'bg-green-500' },
  ];

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{copy.pageTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{copy.pageSubtitle}</p>
        </div>
        <div className="flex gap-2">
          {(['3m', '6m', '12m'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                period === p
                  ? 'bg-dk-red text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p === '3m' ? copy.btn3m : p === '6m' ? copy.btn6m : copy.btn12m}
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
          <p className="text-sm text-gray-500">{copy.kpiNewDeals}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={20} className="text-green-500" />
            <span className="flex items-center text-xs text-green-600">
              +12% <TrendingUp size={12} className="ml-1" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalWon}</p>
          <p className="text-sm text-gray-500">{copy.kpiWon}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <Target size={20} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">{winRate}%</p>
          <p className="text-sm text-gray-500">{copy.kpiWinRate}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} className="text-emerald-500" />
            <span className="flex items-center text-xs text-green-600">
              +24% <TrendingUp size={12} className="ml-1" />
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(totalRevenue / 1000000).toFixed(2)}M ₼</p>
          <p className="text-sm text-gray-500">{copy.kpiTotalRevenue}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <Clock size={20} className="text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">36</p>
          <p className="text-sm text-gray-500">{copy.kpiAvgCycle} ({copy.kpiAvgCycleUnit})</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Trend */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">{copy.monthlyTrendTitle}</h3>
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
            <h3 className="font-semibold text-gray-900">{copy.funnelTitle}</h3>
            <PieChart size={18} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            {funnelData.map((item, i) => (
              <div key={copy.funnelStages[i]}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">{copy.funnelStages[i]}</span>
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
            <h3 className="font-semibold text-gray-900">{copy.topDealsTitle}</h3>
            <Zap size={18} className="text-amber-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-100">
                  <th className="text-left pb-3 font-medium">{copy.colOpportunity}</th>
                  <th className="text-left pb-3 font-medium">{copy.colValue}</th>
                  <th className="text-left pb-3 font-medium">{copy.colStage}</th>
                  <th className="text-left pb-3 font-medium">{copy.colProbability}</th>
                  <th className="text-left pb-3 font-medium">{copy.colOwner}</th>
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
            <h3 className="font-semibold text-gray-900">{copy.teamTitle}</h3>
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
                    <span className="text-gray-500">{copy.teamWon}</span>
                    <span className="ml-1 text-green-600 font-semibold">{member.won}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{copy.teamLost}</span>
                    <span className="ml-1 text-red-600 font-semibold">{member.lost}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{copy.teamTotal}</span>
                    <span className="ml-1 font-semibold">{(member.totalValue / 1000).toFixed(0)}K</span>
                  </div>
                  <div>
                    <span className="text-gray-500">{copy.teamAvgCycle}</span>
                    <span className="ml-1 font-semibold">{member.avgCycle}{copy.teamAvgCycleUnit}</span>
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
