// app/dashboard/ilan-onaylari/page.tsx
// DK Agency Admin - İlan Onay Kuyruğu

'use client';

import { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  MessageSquare,
  Image,
  Paperclip,
  AlertCircle,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  ExternalLink
} from 'lucide-react';

type ListingStatus = 'pending' | 'approved' | 'rejected';

interface PendingListing {
  id: string;
  title: string;
  category: string;
  submitter: string;
  company: string;
  price: number;
  location: string;
  submitDate: string;
  status: ListingStatus;
  priority: 'high' | 'medium' | 'low';
  hasImages: boolean;
  hasDocuments: boolean;
  description: string;
  notes?: string;
}

const pendingListings: PendingListing[] = [
  {
    id: 'L-2026-0156',
    title: 'Fine Dining Bakü Merkez',
    category: 'Devir',
    submitter: 'Elvin Guliyev',
    company: 'GP Restaurants',
    price: 450000,
    location: 'Bakü, Azerbaycan',
    submitDate: '2026-02-21 10:30',
    status: 'pending',
    priority: 'high',
    hasImages: true,
    hasDocuments: true,
    description: '200 m² fine dining restaurant. Merkezi lokasyon, tam teşekküllü mutfak, 60 kişilik kapasite. 5 yıllık kira sözleşmesi mevcut.',
  },
  {
    id: 'L-2026-0155',
    title: 'Café & Lounge Bar',
    category: 'Ortaklık',
    submitter: 'Aysel Huseynova',
    company: 'Event Masters',
    price: 180000,
    location: 'Sumqayıt, Azerbaycan',
    submitDate: '2026-02-20 16:45',
    status: 'pending',
    priority: 'medium',
    hasImages: true,
    hasDocuments: false,
    description: '150 m² café ve lounge bar. Deniz manzaralı teras, 40 kişilik kapasite.',
    notes: 'Belgeler eksik - talep edildi'
  },
  {
    id: 'L-2026-0154',
    title: 'Fast Food Franchise Fırsatı',
    category: 'Franchise',
    submitter: 'Mehmet Yılmaz',
    company: 'Türk Mutfağı Ltd',
    price: 280000,
    location: 'Bakü, Azerbaycan',
    submitDate: '2026-02-20 14:20',
    status: 'pending',
    priority: 'high',
    hasImages: true,
    hasDocuments: true,
    description: 'Türk mutfağı franchise fırsatı. 3 lokasyonluk master franchise hakkı.',
  },
  {
    id: 'L-2026-0153',
    title: 'Butik Otel Restaurant',
    category: 'Devir',
    submitter: 'Nigar Hasanova',
    company: 'Boutique Hotels AZ',
    price: 320000,
    location: 'Qəbələ, Azerbaycan',
    submitDate: '2026-02-19 11:15',
    status: 'pending',
    priority: 'low',
    hasImages: true,
    hasDocuments: true,
    description: 'Turizm bölgesinde butik otel bünyesindeki restaurant. Sezonluk yüksek ciro.',
  },
  {
    id: 'L-2026-0152',
    title: 'Şəhər Mərkəzində Restoran',
    category: 'Yatırım',
    submitter: 'Rashad Aliyev',
    company: 'Caspian Ventures',
    price: 520000,
    location: 'Bakü, Azerbaycan',
    submitDate: '2026-02-18 09:30',
    status: 'approved',
    priority: 'high',
    hasImages: true,
    hasDocuments: true,
    description: '300 m² lüks restoran. Tam renovasyon yapılmış, modern ekipman.',
  },
  {
    id: 'L-2026-0151',
    title: 'Kafe Zinciri Satışı',
    category: 'Devir',
    submitter: 'Anonymous',
    company: 'Bilinmiyor',
    price: 150000,
    location: 'Gəncə, Azerbaycan',
    submitDate: '2026-02-17 15:45',
    status: 'rejected',
    priority: 'low',
    hasImages: false,
    hasDocuments: false,
    description: 'Eksik bilgi ve belgeler.',
    notes: 'Ret sebebi: Yetersiz bilgi, eksik belgeler, doğrulanmayan şirket bilgileri'
  },
];

const priorityConfig = {
  high: { color: 'bg-red-100 text-red-700', label: 'Yüksek' },
  medium: { color: 'bg-amber-100 text-amber-700', label: 'Orta' },
  low: { color: 'bg-gray-100 text-gray-600', label: 'Düşük' },
};

const statusConfig = {
  pending: { color: 'bg-amber-100 text-amber-700', label: 'Beklemede', icon: Clock },
  approved: { color: 'bg-green-100 text-green-700', label: 'Onaylandı', icon: CheckCircle },
  rejected: { color: 'bg-red-100 text-red-700', label: 'Reddedildi', icon: XCircle },
};

export default function IlanOnaylariPage() {
  const [filter, setFilter] = useState<'all' | ListingStatus>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedListing, setSelectedListing] = useState<PendingListing | null>(null);

  const filteredListings = pendingListings.filter(l => {
    if (filter !== 'all' && l.status !== filter) return false;
    if (searchQuery && !l.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    pending: pendingListings.filter(l => l.status === 'pending').length,
    approved: pendingListings.filter(l => l.status === 'approved').length,
    rejected: pendingListings.filter(l => l.status === 'rejected').length,
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">İlan Onayları</h1>
          <p className="text-sm text-gray-500 mt-1">Bekleyen ilanları incele ve onayla</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div 
          onClick={() => setFilter('pending')}
          className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
            filter === 'pending' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              <p className="text-sm text-gray-500">Beklemede</p>
            </div>
            <Clock size={32} className="text-amber-200" />
          </div>
        </div>
        <div 
          onClick={() => setFilter('approved')}
          className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
            filter === 'approved' ? 'border-green-500 ring-2 ring-green-500/20' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-sm text-gray-500">Onaylandı</p>
            </div>
            <CheckCircle size={32} className="text-green-200" />
          </div>
        </div>
        <div 
          onClick={() => setFilter('rejected')}
          className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
            filter === 'rejected' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-gray-500">Reddedildi</p>
            </div>
            <XCircle size={32} className="text-red-200" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="İlan ara..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
      </div>

      {/* Listings Grid */}
      <div className="grid lg:grid-cols-2 gap-4">
        {filteredListings.map((listing) => {
          const StatusIcon = statusConfig[listing.status].icon;
          return (
            <div
              key={listing.id}
              onClick={() => setSelectedListing(listing)}
              className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-lg ${
                selectedListing?.id === listing.id ? 'border-red-500 ring-2 ring-red-500/20' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-400">{listing.id}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${priorityConfig[listing.priority].color}`}>
                      {priorityConfig[listing.priority].label}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900">{listing.title}</h3>
                </div>
                <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig[listing.status].color}`}>
                  <StatusIcon size={12} />
                  {statusConfig[listing.status].label}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{listing.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Building2 size={14} />
                  {listing.company}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  {listing.location}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-green-600">
                    {(listing.price / 1000).toFixed(0)}K ₼
                  </span>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                    {listing.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {listing.hasImages && <Image size={14} className="text-gray-400" />}
                  {listing.hasDocuments && <Paperclip size={14} className="text-gray-400" />}
                  <span className="text-xs text-gray-400">{listing.submitDate}</span>
                </div>
              </div>

              {listing.notes && (
                <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                  <p className="text-xs text-amber-700">{listing.notes}</p>
                </div>
              )}

              {listing.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <ThumbsUp size={14} />
                    Onayla
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <ThumbsDown size={14} />
                    Reddet
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText size={48} className="text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">İlan Bulunamadı</h3>
          <p className="text-sm text-gray-500">Bu filtreye uygun ilan bulunmuyor.</p>
        </div>
      )}
    </div>
  );
}
