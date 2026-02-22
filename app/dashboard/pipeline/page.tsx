// app/dashboard/pipeline/page.tsx
// DK Agency Admin - Holding Proje Hunisi (Full Pipeline View)

'use client';

import { useState } from 'react';
import {
  BarChart3,
  Filter,
  Plus,
  MoreVertical,
  Flame,
  Clock,
  DollarSign,
  User,
  Building2,
  ChevronDown,
  Search,
  ArrowRight,
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Target,
  AlertCircle
} from 'lucide-react';

interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: string;
  daysInStage: number;
  hot: boolean;
  contact: string;
  phone: string;
  email: string;
  location: string;
  category: string;
  probability: number;
  nextAction: string;
  nextActionDate: string;
}

const stages = [
  { id: 'leads', name: 'Potansiyel', color: 'bg-gray-600' },
  { id: 'qualified', name: 'Nitelikli', color: 'bg-blue-600' },
  { id: 'proposal', name: 'Teklif', color: 'bg-amber-600' },
  { id: 'negotiation', name: 'Müzakere', color: 'bg-purple-600' },
  { id: 'closed', name: 'Kapandı', color: 'bg-green-600' },
];

const deals: Deal[] = [
  {
    id: '1',
    name: 'Fine Dining Bakü Merkez',
    company: 'GP Restaurants',
    value: 450000,
    stage: 'leads',
    daysInStage: 3,
    hot: true,
    contact: 'Elvin Guliyev',
    phone: '+994 50 123 4567',
    email: 'elvin@gprestaurants.az',
    location: 'Bakü, Azerbaycan',
    category: 'Devir',
    probability: 25,
    nextAction: 'İlk görüşme planla',
    nextActionDate: '2026-02-23'
  },
  {
    id: '2',
    name: 'Café & Bistro Şəki',
    company: 'Mountain Ventures',
    value: 120000,
    stage: 'leads',
    daysInStage: 7,
    hot: false,
    contact: 'Kenan Rzayev',
    phone: '+994 55 234 5678',
    email: 'kenan@mountainv.az',
    location: 'Şəki, Azerbaycan',
    category: 'Yatırım',
    probability: 15,
    nextAction: 'Belge talebi gönder',
    nextActionDate: '2026-02-25'
  },
  {
    id: '3',
    name: 'Fast Food Franchise',
    company: 'Türk Mutfağı Ltd',
    value: 280000,
    stage: 'leads',
    daysInStage: 2,
    hot: true,
    contact: 'Mehmet Yılmaz',
    phone: '+90 532 345 6789',
    email: 'mehmet@turkmutfagi.com',
    location: 'İstanbul, Türkiye',
    category: 'Franchise',
    probability: 30,
    nextAction: 'Franchise paketi gönder',
    nextActionDate: '2026-02-22'
  },
  {
    id: '4',
    name: 'Otel Restaurant Devri',
    company: 'Caspian Hotels',
    value: 680000,
    stage: 'qualified',
    daysInStage: 5,
    hot: true,
    contact: 'Rashad Mammadov',
    phone: '+994 50 456 7890',
    email: 'rashad@caspianhotels.az',
    location: 'Bakü, Azerbaycan',
    category: 'Devir',
    probability: 45,
    nextAction: 'Due diligence başlat',
    nextActionDate: '2026-02-24'
  },
  {
    id: '5',
    name: 'Catering İşletmesi',
    company: 'Event Masters',
    value: 220000,
    stage: 'qualified',
    daysInStage: 12,
    hot: false,
    contact: 'Aysel Huseynova',
    phone: '+994 55 567 8901',
    email: 'aysel@eventmasters.az',
    location: 'Bakü, Azerbaycan',
    category: 'Ortaklık',
    probability: 35,
    nextAction: 'Finansal tablo iste',
    nextActionDate: '2026-02-26'
  },
  {
    id: '6',
    name: 'Premium Steakhouse',
    company: 'Meat & Greet Co',
    value: 520000,
    stage: 'proposal',
    daysInStage: 8,
    hot: true,
    contact: 'Farid Ismayilov',
    phone: '+994 50 678 9012',
    email: 'farid@meatgreet.az',
    location: 'Bakü, Azerbaycan',
    category: 'Devir',
    probability: 60,
    nextAction: 'Teklif revizyonu',
    nextActionDate: '2026-02-22'
  },
  {
    id: '7',
    name: 'Franchise Genişleme',
    company: 'Döner King',
    value: 340000,
    stage: 'proposal',
    daysInStage: 4,
    hot: false,
    contact: 'Orkhan Aliyev',
    phone: '+994 55 789 0123',
    email: 'orkhan@donerking.az',
    location: 'Gəncə, Azerbaycan',
    category: 'Franchise',
    probability: 55,
    nextAction: 'Lokasyon değerlendirmesi',
    nextActionDate: '2026-02-28'
  },
  {
    id: '8',
    name: 'Zincir Restoran Satışı',
    company: 'Food Chain Corp',
    value: 890000,
    stage: 'negotiation',
    daysInStage: 15,
    hot: true,
    contact: 'Leyla Aliyeva',
    phone: '+994 50 890 1234',
    email: 'leyla@foodchain.az',
    location: 'Bakü, Azerbaycan',
    category: 'Devir',
    probability: 75,
    nextAction: 'Sözleşme taslağı hazırla',
    nextActionDate: '2026-02-21'
  },
  {
    id: '9',
    name: 'Bakery Franchise Deal',
    company: 'Sweet Dreams',
    value: 380000,
    stage: 'closed',
    daysInStage: 0,
    hot: false,
    contact: 'Nigar Hasanova',
    phone: '+994 55 901 2345',
    email: 'nigar@sweetdreams.az',
    location: 'Bakü, Azerbaycan',
    category: 'Franchise',
    probability: 100,
    nextAction: 'Tamamlandı',
    nextActionDate: '2026-02-15'
  },
];

export default function PipelinePage() {
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getStageDeals = (stageId: string) => {
    return deals.filter(d => d.stage === stageId && d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const getStageStats = (stageId: string) => {
    const stageDeals = getStageDeals(stageId);
    return {
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + d.value, 0),
    };
  };

  const totalPipeline = deals.reduce((sum, d) => sum + d.value, 0);
  const weightedPipeline = deals.reduce((sum, d) => sum + (d.value * d.probability / 100), 0);

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Holding Proje Hunisi</h1>
          <p className="text-sm text-gray-500 mt-1">Yatırım fırsatları ve deal flow yönetimi</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrele</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700">
            <Plus size={16} />
            <span className="text-sm font-bold">Yeni Fırsat</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <BarChart3 size={16} />
            <span className="text-xs font-medium">Toplam Pipeline</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{(totalPipeline / 1000000).toFixed(1)}M ₼</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Target size={16} />
            <span className="text-xs font-medium">Ağırlıklı Değer</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{(weightedPipeline / 1000000).toFixed(2)}M ₼</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Flame size={16} />
            <span className="text-xs font-medium">Sıcak Fırsatlar</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">{deals.filter(d => d.hot).length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <TrendingUp size={16} />
            <span className="text-xs font-medium">Bu Ay Kapanan</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{deals.filter(d => d.stage === 'closed').length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Fırsat ara..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stats = getStageStats(stage.id);
          const stageDeals = getStageDeals(stage.id);

          return (
            <div key={stage.id} className="min-w-[300px] flex-shrink-0">
              {/* Stage Header */}
              <div className={`${stage.color} text-white px-4 py-3 rounded-t-xl`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{stage.name}</span>
                  <span className="text-sm bg-white/20 px-2 py-0.5 rounded-full">{stats.count}</span>
                </div>
                <p className="text-sm text-white/80 mt-1">
                  {(stats.value / 1000).toFixed(0)}K ₼
                </p>
              </div>

              {/* Cards Container */}
              <div className="bg-gray-100 rounded-b-xl p-3 space-y-3 min-h-[500px]">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-gray-200"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{deal.name}</h4>
                      {deal.hot && <Flame size={16} className="text-orange-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{deal.company}</p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-bold text-gray-900">
                        {(deal.value / 1000).toFixed(0)}K ₼
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        deal.probability >= 70 ? 'bg-green-100 text-green-700' :
                        deal.probability >= 40 ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        %{deal.probability}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <MapPin size={12} />
                      {deal.location}
                    </div>

                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock size={12} />
                          {deal.daysInStage} gün
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          deal.category === 'Devir' ? 'bg-blue-50 text-blue-700' :
                          deal.category === 'Franchise' ? 'bg-purple-50 text-purple-700' :
                          deal.category === 'Yatırım' ? 'bg-green-50 text-green-700' :
                          'bg-gray-50 text-gray-700'
                        }`}>
                          {deal.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {stageDeals.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">Bu aşamada fırsat yok</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Deal Detail Drawer */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black/50 z-50" onClick={() => setSelectedDeal(null)}>
          <div
            className="absolute right-0 top-0 h-full w-[500px] bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">{selectedDeal.name}</h2>
                    {selectedDeal.hot && <Flame size={20} className="text-orange-500" />}
                  </div>
                  <p className="text-gray-500">{selectedDeal.company}</p>
                </div>
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Value & Stage */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs text-green-600 font-medium mb-1">Değer</p>
                  <p className="text-2xl font-bold text-green-700">
                    {(selectedDeal.value / 1000).toFixed(0)}K ₼
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-xs text-purple-600 font-medium mb-1">Olasılık</p>
                  <p className="text-2xl font-bold text-purple-700">%{selectedDeal.probability}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">İletişim</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{selectedDeal.contact}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{selectedDeal.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{selectedDeal.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{selectedDeal.location}</span>
                  </div>
                </div>
              </div>

              {/* Next Action */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle size={16} className="text-amber-600" />
                  <h3 className="font-semibold text-amber-800">Sonraki Aksiyon</h3>
                </div>
                <p className="text-sm text-amber-700 mb-2">{selectedDeal.nextAction}</p>
                <div className="flex items-center gap-2 text-xs text-amber-600">
                  <Calendar size={12} />
                  {selectedDeal.nextActionDate}
                </div>
              </div>

              {/* Stage Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Aşama Bilgisi</h3>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1.5 rounded-lg text-white text-sm font-medium ${
                    stages.find(s => s.id === selectedDeal.stage)?.color || 'bg-gray-500'
                  }`}>
                    {stages.find(s => s.id === selectedDeal.stage)?.name}
                  </span>
                  <span className="text-sm text-gray-500">{selectedDeal.daysInStage} gündür bu aşamada</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors">
                  Aşamayı İlerlet
                </button>
                <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  Düzenle
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
