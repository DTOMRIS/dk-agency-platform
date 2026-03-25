// data/dashboard-mock.ts
import { Newspaper, Building2, FileText, TrendingUp, AlertCircle, MessageSquare, Target, BarChart3, Clock } from 'lucide-react';

export const stats = [
  { label: 'Toplam Haberler', value: '24', change: '+3', icon: Newspaper, color: 'red' },
  { label: 'B2B Partnerler', value: '12', change: '+2', icon: Building2, color: 'blue' },
  { label: 'Aktif İlanlar', value: '8', change: '+1', icon: FileText, color: 'green' },
  { label: 'Deal Flow', value: '15', change: '+5', icon: TrendingUp, color: 'purple' },
];

export const pipelineStages = [
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

export const pendingApprovals = [
  { id: 1, type: 'ilan', title: 'Yeni Devir İlanı: Sumqayıt Restaurant', submitter: 'Can Investments', time: '2 saat önce', priority: 'high' },
  { id: 2, type: 'partner', title: 'B2B Partner Başvurusu', submitter: 'Azer Food Group', time: '4 saat önce', priority: 'medium' },
  { id: 3, type: 'haber', title: 'HORECA Sektör Raporu 2025', submitter: 'Editör Ekibi', time: '6 saat önce', priority: 'low' },
  { id: 4, type: 'ilan', title: 'Franchise Başvurusu: Türk Mutfağı', submitter: 'Istanbul Lezzet', time: '1 gün önce', priority: 'high' },
];

export const unreadMessages = [
  { id: 1, from: 'Caspian Hotels', subject: 'Yatırım görüşmesi talebi', time: '30 dk önce', avatar: 'CH' },
  { id: 2, from: 'Azer Food Group', subject: 'Partnership detayları hk.', time: '2 saat önce', avatar: 'AF' },
  { id: 3, from: 'GP Restaurants', subject: 'Due Diligence belgeleri', time: '5 saat önce', avatar: 'GP' },
];

export const aiInsights = [
  { icon: TrendingUp, text: 'HORECA sektöründe %18 büyüme trendi tespit edildi', time: 'Bugün' },
  { icon: AlertCircle, text: '3 bekleyen ilan için fiyat analizi önerisi', time: 'Dün' },
  { icon: Target, text: 'Q4 deal flow hedefinin %78\'i gerçekleşti', time: '2 gün önce' },
];
