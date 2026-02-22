// app/dashboard/page.tsx
// DK Agency Dashboard - Holding ve Yatırım Kontrol Merkezi
// God Mode Admin Dashboard with Pipeline View

import Link from 'next/link';
import {
  Newspaper,
  Building2,
  FileText,
  TrendingUp,
  Users,
  ArrowUpRight,
  AlertCircle,
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Target,
  DollarSign,
  BarChart3,
  Activity,
  Shield,
  Sparkles,
  Eye,
  ThumbsUp,
  ArrowRight,
  Filter,
  MoreVertical,
  Briefcase,
  Zap,
  Flame
} from 'lucide-react';

const stats = [
  { label: 'Toplam Haberler', value: '24', change: '+3', icon: Newspaper, color: 'red' },
  { label: 'B2B Partnerler', value: '12', change: '+2', icon: Building2, color: 'blue' },
  { label: 'Aktif İlanlar', value: '8', change: '+1', icon: FileText, color: 'green' },
  { label: 'Deal Flow', value: '15', change: '+5', icon: TrendingUp, color: 'purple' },
];

// Pipeline stages data
const pipelineStages = [
  {
    id: 'leads',
    name: 'Potansiyel',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    headerColor: 'bg-gray-600',
    count: 12,
    value: '2.4M ₼',
    deals: [
      { name: 'Fine Dining Bakü Merkez', company: 'GP Restaurants', value: '450K ₼', daysInStage: 3, hot: true },
      { name: 'Café & Bistro Şəki', company: 'Mountain Ventures', value: '120K ₼', daysInStage: 7, hot: false },
      { name: 'Fast Food Franchise', company: 'Türk Mutfağı Ltd', value: '280K ₼', daysInStage: 2, hot: true },
    ]
  },
  {
    id: 'qualified',
    name: 'Nitelikli',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    headerColor: 'bg-blue-600',
    count: 8,
    value: '1.8M ₼',
    deals: [
      { name: 'Otel Restaurant Devri', company: 'Caspian Hotels', value: '680K ₼', daysInStage: 5, hot: true },
      { name: 'Catering İşletmesi', company: 'Event Masters', value: '220K ₼', daysInStage: 12, hot: false },
    ]
  },
  {
    id: 'proposal',
    name: 'Teklif Aşaması',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    headerColor: 'bg-amber-600',
    count: 5,
    value: '980K ₼',
    deals: [
      { name: 'Premium Steakhouse', company: 'Meat & Greet Co', value: '520K ₼', daysInStage: 8, hot: true },
      { name: 'Franchise Genişleme', company: 'Döner King', value: '340K ₼', daysInStage: 4, hot: false },
    ]
  },
  {
    id: 'negotiation',
    name: 'Müzakere',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    headerColor: 'bg-purple-600',
    count: 3,
    value: '1.2M ₼',
    deals: [
      { name: 'Zincir Restoran Satışı', company: 'Food Chain Corp', value: '890K ₼', daysInStage: 15, hot: true },
    ]
  },
  {
    id: 'closed',
    name: 'Kapandı',
    color: 'bg-green-50 text-green-700 border-green-200',
    headerColor: 'bg-green-600',
    count: 4,
    value: '1.5M ₼',
    deals: [
      { name: 'Bakery Franchise Deal', company: 'Sweet Dreams', value: '380K ₼', daysInStage: 0, hot: false },
    ]
  },
];

// Pending approvals queue
const pendingApprovals = [
  { id: 1, type: 'ilan', title: 'Yeni Devir İlanı: Sumqayıt Restaurant', submitter: 'Can Investments', time: '2 saat önce', priority: 'high' },
  { id: 2, type: 'partner', title: 'B2B Partner Başvurusu', submitter: 'Azer Food Group', time: '4 saat önce', priority: 'medium' },
  { id: 3, type: 'haber', title: 'HORECA Sektör Raporu 2025', submitter: 'Editör Ekibi', time: '6 saat önce', priority: 'low' },
  { id: 4, type: 'ilan', title: 'Franchise Başvurusu: Türk Mutfağı', submitter: 'Istanbul Lezzet', time: '1 gün önce', priority: 'high' },
];

// Unread messages
const unreadMessages = [
  { id: 1, from: 'Caspian Hotels', subject: 'Yatırım görüşmesi talebi', time: '30 dk önce', avatar: 'CH' },
  { id: 2, from: 'Azer Food Group', subject: 'Partnership detayları hk.', time: '2 saat önce', avatar: 'AF' },
  { id: 3, from: 'GP Restaurants', subject: 'Due Diligence belgeleri', time: '5 saat önce', avatar: 'GP' },
];

// Recent AI insights
const aiInsights = [
  { icon: TrendingUp, text: 'HORECA sektöründe %18 büyüme trendi tespit edildi', time: 'Bugün' },
  { icon: AlertCircle, text: '3 bekleyen ilan için fiyat analizi önerisi', time: 'Dün' },
  { icon: Target, text: 'Q4 deal flow hedefinin %78\'i gerçekleşti', time: '2 gün önce' },
];

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header with God Mode Badge */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Holding Kontrol Merkezi</h1>
            <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg">
              <Shield size={12} />
              GOD MODE
            </span>
          </div>
          <p className="text-gray-500 text-sm mt-1">DK Agency Yatırım ve Proje Yönetim Paneli</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Filter size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrele</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg">
            <Zap size={16} />
            <span className="text-sm font-bold">Hızlı İşlem</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colors = {
            red: 'bg-red-100 text-red-600',
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
          };

          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all hover:border-gray-300"
            >
              <div className={`w-12 h-12 rounded-xl ${colors[stat.color as keyof typeof colors]} flex items-center justify-center mb-4`}>
                <Icon size={24} />
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              <p className="text-xs text-green-600 font-medium mt-2 flex items-center gap-1">
                <TrendingUp size={12} />
                {stat.change} bu hafta
              </p>
            </div>
          );
        })}
      </div>

      {/* Pipeline Section - God Mode Feature */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Holding Proje Hunisi (Pipeline)</h2>
              <p className="text-xs text-gray-500">Toplam: 32 fırsat • 7.9M ₼ potansiyel değer</p>
            </div>
          </div>
          <Link href="/dashboard/pipeline" className="text-sm text-purple-600 font-medium hover:text-purple-700 flex items-center gap-1">
            Tam Görünüm
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Pipeline Kanban */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => (
            <div key={stage.id} className="min-w-[260px] flex-shrink-0">
              {/* Stage Header */}
              <div className={`${stage.headerColor} text-white px-4 py-3 rounded-t-xl`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{stage.name}</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{stage.count}</span>
                </div>
                <p className="text-xs text-white/80 mt-1">{stage.value}</p>
              </div>

              {/* Stage Cards */}
              <div className={`border-x border-b ${stage.color} rounded-b-xl p-3 space-y-3 min-h-[200px]`}>
                {stage.deals.map((deal, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{deal.name}</p>
                      {deal.hot && (
                        <Flame size={14} className="text-orange-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{deal.company}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-800">{deal.value}</span>
                      <span className="text-xs text-gray-400">{deal.daysInStage}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-amber-600" />
              <h2 className="font-bold text-gray-900">Bekleyen Onaylar</h2>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">{pendingApprovals.length}</span>
            </div>
            <Link href="/dashboard/onaylar" className="text-sm text-amber-600 font-medium hover:text-amber-700">
              Tümü
            </Link>
          </div>
          <div className="space-y-3">
            {pendingApprovals.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      item.priority === 'high' ? 'bg-red-500' :
                      item.priority === 'medium' ? 'bg-amber-500' : 'bg-green-500'
                    }`} />
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      item.type === 'ilan' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'partner' ? 'bg-purple-100 text-purple-700' :
                      'bg-red-100 text-red-700'
                    }`}>{item.type === 'ilan' ? 'İlan' : item.type === 'partner' ? 'Partner' : 'Haber'}</span>
                  </div>
                  <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                    <MoreVertical size={14} className="text-gray-400" />
                  </button>
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">{item.title}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{item.submitter}</p>
                  <p className="text-xs text-gray-400">{item.time}</p>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition-colors">
                    <ThumbsUp size={12} />
                    Onayla
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
                    <Eye size={12} />
                    İncele
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unread Messages */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">Okunmamış Mesajlar</h2>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{unreadMessages.length}</span>
            </div>
            <Link href="/dashboard/mesajlar" className="text-sm text-blue-600 font-medium hover:text-blue-700">
              Tümü
            </Link>
          </div>
          <div className="space-y-3">
            {unreadMessages.map((msg) => (
              <div key={msg.id} className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {msg.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{msg.from}</p>
                      <p className="text-xs text-gray-400 shrink-0">{msg.time}</p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{msg.subject}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/mesajlar"
            className="flex items-center justify-center gap-2 mt-4 p-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            <MessageSquare size={16} />
            Mesaj Kutusuna Git
          </Link>
        </div>

        {/* AI Insights & Quick Actions */}
        <div className="space-y-6">
          {/* AI Insights */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <h2 className="font-bold text-purple-900">Almila AI İçgörüleri</h2>
            </div>
            <div className="space-y-3">
              {aiInsights.map((insight, i) => {
                const InsightIcon = insight.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-3 bg-white/60 rounded-lg">
                    <InsightIcon size={16} className="text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-purple-800">{insight.text}</p>
                      <p className="text-xs text-purple-500 mt-1">{insight.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/haberler/yeni"
                className="flex items-center gap-3 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
              >
                <Newspaper size={18} className="text-red-600" />
                <span className="text-sm font-medium text-red-700">Yeni Haber Ekle</span>
              </Link>
              <Link
                href="/dashboard/b2b-yonetimi/ilanlar/yeni"
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                <FileText size={18} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Yeni İlan Oluştur</span>
              </Link>
              <Link
                href="/dashboard/b2b-yonetimi/partnerler"
                className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <Users size={18} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Partner Yönetimi</span>
              </Link>
              <Link
                href="/dashboard/raporlar"
                className="flex items-center gap-3 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
              >
                <Activity size={18} className="text-green-600" />
                <span className="text-sm font-medium text-green-700">Raporları Görüntüle</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
