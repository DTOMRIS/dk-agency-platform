// app/dashboard/trends/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  MapPin, 
  TrendingUp, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Globe, 
  Navigation,
  ArrowUpRight,
  Plane,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';

import { initialDestinations } from '@/data/trends-mock';

interface Destination {
  id: number;
  name: string;
  country: string;
  price: string;
  discount: string | null;
  image: string;
  status: 'active' | 'draft';
  views: string;
  trending: boolean;
}

export default function TrendsPage() {
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations as Destination[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);

  const filteredDestinations = destinations.filter(dest => 
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (window.confirm('Bu istiqaməti silmək istədiyinizə əminsiniz?')) {
      setDestinations(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleToggleStatus = (id: number) => {
    setDestinations(prev => prev.map(d => 
      d.id === id ? { ...d, status: d.status === 'active' ? 'draft' : 'active' } : d
    ));
  };

  const handleOpenAddModal = () => {
    setEditingDestination(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dest: Destination) => {
    setEditingDestination(dest);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const destinationData = {
      name: formData.get('name') as string,
      country: formData.get('country') as string,
      price: formData.get('price') as string,
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1527359443443-84a48abc7df0?auto=format&fit=crop&w=800&q=80',
      status: 'active' as const,
      trending: formData.get('trending') === 'on',
      views: '0',
      discount: formData.get('discount') as string || null,
    };

    if (editingDestination) {
      setDestinations(prev => prev.map(d => 
        d.id === editingDestination.id ? { ...d, ...destinationData } : d
      ));
    } else {
      const newDest: Destination = {
        id: Math.max(0, ...destinations.map(d => d.id)) + 1,
        ...destinationData
      };
      setDestinations(prev => [newDest, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 lg:p-10 bg-[#FAFAF8] min-h-screen">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-serif text-[#1A1A2E] tracking-tight">Trendlərin İdarəedilməsi</h1>
            <div className="px-3 py-1 bg-[#C5A022]/10 text-[#C5A022] text-[10px] font-bold rounded-full flex items-center gap-1.5 border border-[#C5A022]/20 uppercase tracking-widest">
              <TrendingUp size={12} />
              Aktual Səyahətlər
            </div>
          </div>
          <p className="text-[#475569] text-base font-normal max-w-xl">Populyar istiqamətləri və trend səyahət paketlərini buradan idarə edin.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-[#E94560] text-white rounded-xl hover:bg-[#C5A022] transition-all shadow-lg shadow-[#E94560]/10 text-sm font-bold"
          >
            <Plus size={18} />
            <span>Yeni İstiqamət</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[24px] border border-[#EDEDE9] shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <Plane size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-serif text-[#1A1A2E] mb-1">{destinations.length}</p>
          <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Ümumi İstiqamət</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-[#EDEDE9] shadow-sm">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp size={20} className="text-orange-500" />
          </div>
          <p className="text-3xl font-serif text-[#1A1A2E] mb-1">{destinations.filter(d => d.trending).length}</p>
          <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Trenddə Olanlar</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-[#EDEDE9] shadow-sm">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
            <Eye size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-serif text-[#1A1A2E] mb-1">7.4k</p>
          <p className="text-[10px] font-bold text-[#888] uppercase tracking-widest">Toplam Baxış (Bu Ay)</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-[24px] border border-[#EDEDE9] p-4 mb-8 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#DDD]" size={18} />
          <input 
            type="text" 
            placeholder="İstiqamət və ya ölkə axtar..." 
            className="w-full pl-12 pr-4 py-3 bg-[#FAFAF8] border border-[#EDEDE9] rounded-xl text-sm outline-none focus:border-[#C5A022] transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#EDEDE9] rounded-xl hover:bg-[#FAFAF8] transition-all text-sm font-semibold text-[#1A1A2E]">
            <Filter size={16} className="text-[#888]" />
            Filter
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[#EDEDE9] rounded-xl hover:bg-[#FAFAF8] transition-all text-sm font-semibold text-[#1A1A2E]">
            <Globe size={16} className="text-[#888]" />
            Bütün Ölkələr
          </button>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filteredDestinations.map((dest) => (
          <motion.div 
            key={dest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-[32px] overflow-hidden border border-[#EDEDE9] hover:shadow-2xl transition-all duration-500"
          >
            {/* Image Section */}
            <div className="relative h-56 overflow-hidden">
              <img 
                src={dest.image} 
                alt={dest.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A2E]/60 to-transparent opacity-60" />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {dest.trending && (
                  <div className="px-3 py-1 bg-white/90 backdrop-blur-md text-[#E94560] text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                    <TrendingUp size={12} />
                    TREND
                  </div>
                )}
                {dest.discount && (
                  <div className="px-3 py-1 bg-[#C5A022] text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                    <Tag size={12} />
                    {dest.discount} ENDİRİM
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div 
                onClick={() => handleToggleStatus(dest.id)}
                className="absolute top-4 right-4 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                  dest.status === 'active' 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}>
                  {dest.status === 'active' ? 'Aktual' : 'Qaralama'}
                </div>
              </div>

              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => handleOpenEditModal(dest)}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1A1A2E] hover:bg-[#E94560] hover:text-white transition-all transform -translate-y-4 group-hover:translate-y-0 duration-300"
                >
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(dest.id)}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#1A1A2E] hover:bg-red-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 text-[#888] mb-1">
                    <MapPin size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{dest.country}</span>
                  </div>
                  <h3 className="text-2xl font-serif text-[#1A1A2E] group-hover:text-[#E94560] transition-colors">{dest.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[#AAA] line-through mb-0.5 leading-none">{dest.discount ? '550 ₼' : ''}</p>
                  <p className="text-xl font-bold text-[#1A1A2E] leading-none">{dest.price}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#FAFAF8]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#888]">
                    <Eye size={14} className="text-[#DDD]" />
                    {dest.views}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#888]">
                    <Navigation size={14} className="text-[#DDD]" />
                    42 Rezerv
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[#DDD] group-hover:text-[#C5A022] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-[#EDEDE9]"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-[#1A1A2E]">
                  {editingDestination ? 'İstiqaməti Redaktə Et' : 'Yeni İstiqamət Əlavə Et'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest px-1">İstiqamət</label>
                    <input 
                      name="name" 
                      defaultValue={editingDestination?.name} 
                      placeholder="Məs: Bakı"
                      required
                      className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#EDEDE9] rounded-xl text-sm outline-none focus:border-[#C5A022] transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest px-1">Ölkə</label>
                    <input 
                      name="country" 
                      defaultValue={editingDestination?.country} 
                      placeholder="Məs: Azərbaycan"
                      required
                      className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#EDEDE9] rounded-xl text-sm outline-none focus:border-[#C5A022] transition-colors" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest px-1">Qiymət</label>
                    <input 
                      name="price" 
                      defaultValue={editingDestination?.price} 
                      placeholder="Məs: 450 ₼"
                      required
                      className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#EDEDE9] rounded-xl text-sm outline-none focus:border-[#C5A022] transition-colors" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest px-1">Endirim (%)</label>
                    <input 
                      name="discount" 
                      defaultValue={editingDestination?.discount || ''} 
                      placeholder="Məs: 15"
                      className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#EDEDE9] rounded-xl text-sm outline-none focus:border-[#C5A022] transition-colors" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[#888] uppercase tracking-widest px-1">Şəkil URL</label>
                  <input 
                    name="image" 
                    defaultValue={editingDestination?.image} 
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 bg-[#FAFAF8] border border-[#EDEDE9] rounded-xl text-sm outline-none focus:border-[#C5A022] transition-colors" 
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-[#FAFAF8] rounded-2xl border border-[#EDEDE9]">
                  <input 
                    type="checkbox" 
                    name="trending" 
                    id="trending"
                    defaultChecked={editingDestination?.trending}
                    className="w-5 h-5 rounded-md border-[#EDEDE9] text-[#C5A022] focus:ring-[#C5A022]"
                  />
                  <label htmlFor="trending" className="text-sm font-semibold text-[#1A1A2E]">Trenddə göstər</label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-white border border-[#EDEDE9] text-[#1A1A2E] rounded-2xl hover:bg-gray-50 transition-all text-sm font-bold"
                  >
                    Ləğv Et
                  </button>
                  <button 
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-[#1A1A2E] text-white rounded-2xl hover:bg-[#C5A022] transition-all text-sm font-bold shadow-xl shadow-[#1A1A2E]/10"
                  >
                    Yadda Saxla
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
