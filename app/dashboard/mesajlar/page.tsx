// app/dashboard/mesajlar/page.tsx
// DK Agency Admin - Mesajlaşma Merkezi
// Inbox / Sent / Archive View

'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Inbox,
  Send,
  Archive,
  Star,
  Trash2,
  Search,
  Filter,
  MoreVertical,
  Paperclip,
  Reply,
  Forward,
  Clock,
  CheckCheck,
  Circle,
  ArrowLeft,
  User,
  Building2,
  Mail,
  Plus,
  FileText
} from 'lucide-react';

type Tab = 'inbox' | 'sent' | 'starred' | 'archive';

interface Message {
  id: number;
  from: string;
  fromCompany: string;
  avatar: string;
  subject: string;
  preview: string;
  content: string;
  time: string;
  date: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  category: 'partner' | 'ilan' | 'genel' | 'yatirim';
}

const messages: Message[] = [
  {
    id: 1,
    from: 'Rashad Mammadov',
    fromCompany: 'Caspian Hotels Group',
    avatar: 'RM',
    subject: 'Yatırım Görüşmesi Talebi - Premium Otel Projesi',
    preview: 'Merhaba, Bakü merkezde planlanan yeni otel projemiz için yatırımcı görüşmeleri planlanmaktadır...',
    content: 'Merhaba,\n\nBakü merkezde planlanan yeni otel projemiz için yatırımcı görüşmeleri planlanmaktadır. DK Agency\'nin HORECA sektöründeki deneyimini değerlendirerek sizinle iş birliği yapmak istiyoruz.\n\nProje detayları:\n- 120 oda kapasiteli 5 yıldızlı otel\n- Fine dining restaurant dahil\n- Toplam yatırım bütçesi: 8.5M ₼\n- Hedef ROI: %22 yıllık\n\nUygun olduğunuz bir zaman diliminde görüşme ayarlayabilir miyiz?\n\nSaygılarımla,\nRashad Mammadov\nCEO, Caspian Hotels Group',
    time: '30 dk önce',
    date: '2025-01-15',
    read: false,
    starred: true,
    hasAttachment: true,
    category: 'yatirim'
  },
  {
    id: 2,
    from: 'Aynur Hasanova',
    fromCompany: 'Azer Food Group',
    avatar: 'AH',
    subject: 'B2B Partnership Detayları',
    preview: 'DK Agency ile partnership başvurumuz hakkında ek bilgi ve dokümantasyon göndermek istiyoruz...',
    content: 'Merhaba DK Agency Ekibi,\n\nB2B partner başvurumuz ile ilgili talep edilen ek belgeleri ekte gönderiyorum:\n\n1. Şirket profili ve faaliyet raporu\n2. Son 3 yıllık mali tablolar\n3. Referans müşteri listesi\n4. Yatırım portföyü özeti\n\nBaşvurumuzun değerlendirilmesini rica ederiz.\n\nTeşekkürler,\nAynur Hasanova\nİş Geliştirme Direktörü',
    time: '2 saat önce',
    date: '2025-01-15',
    read: false,
    starred: false,
    hasAttachment: true,
    category: 'partner'
  },
  {
    id: 3,
    from: 'Elvin Guliyev',
    fromCompany: 'GP Restaurants',
    avatar: 'EG',
    subject: 'Due Diligence Belgeleri - Fine Dining Bakü',
    preview: 'Talep ettiğiniz due diligence belgeleri hazır durumda. Mali tablolar, kira kontratları...',
    content: 'Sayın DK Agency,\n\nFine Dining Bakü Merkez ilanımız için talep ettiğiniz due diligence belgelerini hazırladık:\n\n- Son 24 aylık gelir tablosu\n- Kira kontratı ve şartları\n- Personel listesi ve maliyetleri\n- Ekipman envanteri\n- Lisans ve izinler\n\nBelgeleri güvenli link üzerinden paylaşıyorum. İncelemenizi rica ederim.\n\nSaygılarımla,\nElvin Guliyev',
    time: '5 saat önce',
    date: '2025-01-15',
    read: true,
    starred: true,
    hasAttachment: true,
    category: 'ilan'
  },
  {
    id: 4,
    from: 'Leyla Aliyeva',
    fromCompany: 'Sweet Dreams Bakery',
    avatar: 'LA',
    subject: 'Franchise Genişleme Planı',
    preview: 'Franchise modelimizi Azerbaycan genelinde genişletmek istiyoruz. DK Agency desteği...',
    content: 'Merhaba,\n\nSweet Dreams Bakery olarak Azerbaycan genelinde franchise genişleme planımız bulunmaktadır. DK Agency\'nin franchise danışmanlık hizmetlerinden yararlanmak istiyoruz.\n\nMevcut durumumuz:\n- 5 şube aktif\n- 3 yıllık franchise deneyimi\n- Hedef: 2025 sonuna kadar 12 şube\n\nGörüşme için uygun zamanınızı bekliyoruz.\n\nLeyla Aliyeva',
    time: '1 gün önce',
    date: '2025-01-14',
    read: true,
    starred: false,
    hasAttachment: false,
    category: 'genel'
  },
  {
    id: 5,
    from: 'Kenan Rzayev',
    fromCompany: 'Mountain Ventures',
    avatar: 'KR',
    subject: 'Şəki Restaurant Yatırım Fırsatı',
    preview: 'Şəki bölgesinde turizm odaklı restaurant projemiz için yatırımcı aramaktayız...',
    content: 'DK Agency Ekibi,\n\nŞəki\'nin tarihi bölgesinde planlanan restaurant projemiz için finansman arıyoruz.\n\nProje özellikleri:\n- Geleneksel Azerbaycan mutfağı konsepti\n- 80 kişilik kapasite\n- Turist odaklı konum\n- Tahmini yatırım: 180K ₼\n\nDetaylı proje dosyasını paylaşmak isterim.\n\nKenan Rzayev\nKurucu Ortak',
    time: '2 gün önce',
    date: '2025-01-13',
    read: true,
    starred: false,
    hasAttachment: true,
    category: 'yatirim'
  }
];

const categoryColors = {
  partner: 'bg-purple-100 text-purple-700',
  ilan: 'bg-blue-100 text-blue-700',
  genel: 'bg-gray-100 text-gray-700',
  yatirim: 'bg-green-100 text-green-700'
};

const categoryLabels = {
  partner: 'Partner',
  ilan: 'İlan',
  genel: 'Genel',
  yatirim: 'Yatırım'
};

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('inbox');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMessages = messages.filter(m => {
    if (activeTab === 'starred') return m.starred;
    if (activeTab === 'inbox') return true;
    return true;
  }).filter(m => 
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.fromCompany.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mesaj Merkezi</h1>
            <p className="text-sm text-gray-500 mt-1">Partner ve yatırımcı iletişimi</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors">
            <Plus size={18} />
            Yeni Mesaj
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
          {/* Tabs */}
          <div className="p-4 space-y-1">
            <button
              onClick={() => { setActiveTab('inbox'); setSelectedMessage(null); }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'inbox' ? 'bg-red-600 text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <Inbox size={18} />
                <span className="font-medium">Gelen Kutusu</span>
              </div>
              {unreadCount > 0 && (
                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                  activeTab === 'inbox' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
                }`}>{unreadCount}</span>
              )}
            </button>
            <button
              onClick={() => { setActiveTab('starred'); setSelectedMessage(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'starred' ? 'bg-red-600 text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Star size={18} />
              <span className="font-medium">Yıldızlı</span>
            </button>
            <button
              onClick={() => { setActiveTab('sent'); setSelectedMessage(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'sent' ? 'bg-red-600 text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Send size={18} />
              <span className="font-medium">Gönderilenler</span>
            </button>
            <button
              onClick={() => { setActiveTab('archive'); setSelectedMessage(null); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'archive' ? 'bg-red-600 text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Archive size={18} />
              <span className="font-medium">Arşiv</span>
            </button>
          </div>

          {/* Categories Filter */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Kategoriler</p>
            <div className="space-y-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
                  <div className={`w-2 h-2 rounded-full ${
                    key === 'partner' ? 'bg-purple-500' :
                    key === 'ilan' ? 'bg-blue-500' :
                    key === 'yatirim' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
                  <span className="text-sm text-gray-700">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Message List */}
        <div className={`${selectedMessage ? 'w-96' : 'flex-1'} border-r border-gray-200 bg-white flex flex-col`}>
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Mesajlarda ara..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto">
            {filteredMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <Mail size={48} className="mb-4 opacity-50" />
                <p>Mesaj bulunamadı</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id ? 'bg-red-50 border-l-4 border-l-red-600' : 'hover:bg-gray-50'
                  } ${!message.read ? 'bg-blue-50/50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                      message.category === 'yatirim' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                      message.category === 'partner' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                      message.category === 'ilan' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                      'bg-gradient-to-br from-gray-500 to-gray-600'
                    }`}>
                      {message.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm truncate ${!message.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {message.from}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          {message.starred && <Star size={14} className="text-amber-500 fill-amber-500" />}
                          <span className="text-xs text-gray-400">{message.time}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">{message.fromCompany}</p>
                      <p className={`text-sm truncate ${!message.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                        {message.subject}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[message.category]}`}>
                          {categoryLabels[message.category]}
                        </span>
                        {message.hasAttachment && (
                          <Paperclip size={12} className="text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Detail */}
        {selectedMessage && (
          <div className="flex-1 bg-white flex flex-col">
            {/* Detail Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                    selectedMessage.category === 'yatirim' ? 'bg-gradient-to-br from-green-500 to-emerald-600' :
                    selectedMessage.category === 'partner' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' :
                    selectedMessage.category === 'ilan' ? 'bg-gradient-to-br from-blue-500 to-cyan-600' :
                    'bg-gradient-to-br from-gray-500 to-gray-600'
                  }`}>
                    {selectedMessage.avatar}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">{selectedMessage.from}</p>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm text-gray-500">{selectedMessage.fromCompany}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[selectedMessage.category]}`}>
                        {categoryLabels[selectedMessage.category]}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={12} />
                        {selectedMessage.time}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Star size={18} className={selectedMessage.starred ? 'text-amber-500 fill-amber-500' : 'text-gray-400'} />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Archive size={18} className="text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Trash2 size={18} className="text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical size={18} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {selectedMessage.content}
                </div>
              </div>

              {selectedMessage.hasAttachment && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Paperclip size={16} />
                    Ekler (2)
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">project_details.pdf</p>
                        <p className="text-xs text-gray-500">2.4 MB</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileText size={20} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">financials_2024.xlsx</p>
                        <p className="text-xs text-gray-500">856 KB</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reply Box */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors">
                  <Reply size={16} />
                  Yanıtla
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors">
                  <Forward size={16} />
                  İlet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
