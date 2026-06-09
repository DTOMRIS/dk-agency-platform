// app/b2b-panel/mesajlar/page.tsx
// DK Agency B2B Panel - Mesajlaşma Sayfası
// Partner/Yatırımcı Kullanıcı Arayüzü

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Inbox,
  Star,
  Search,
  Paperclip,
  Reply,
  Clock,
  ArrowLeft,
  Mail,
  Plus,
  Sparkles,
  Shield,
  Bell,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

interface Message {
  id: number;
  from: string;
  avatar: string;
  subject: string;
  preview: string;
  content: string;
  time: string;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  isFromAdmin: boolean;
}

const pageCopy: Record<
  Locale,
  {
    heading: string;
    subheading: string;
    newMessage: string;
    statTotal: string;
    statUnread: string;
    statAiReports: string;
    searchPlaceholder: string;
    filterAll: string;
    filterUnread: string;
    attachmentLabel: string;
    officialBadge: string;
    noMessages: string;
    attachments: string;
    reply: string;
    markRead: string;
    download: string;
  }
> = {
  az: {
    heading: 'Mesajlarım',
    subheading: 'DK Agency ilə əlaqə mərkəzi',
    newMessage: 'Yeni Mesaj',
    statTotal: 'Ümumi Mesaj',
    statUnread: 'Oxunmamış',
    statAiReports: 'AI Hesabatları',
    searchPlaceholder: 'Mesajlarda axtar...',
    filterAll: 'Hamısı',
    filterUnread: 'Oxunmamış',
    attachmentLabel: 'Əlavə fayl',
    officialBadge: 'Rəsmi',
    noMessages: 'Mesaj tapılmadı',
    attachments: 'Əlavələr',
    reply: 'Cavabla',
    markRead: 'Oxunmuş İşarələ',
    download: 'Yüklə',
  },
  ru: {
    heading: 'Мои сообщения',
    subheading: 'Центр коммуникации с DK Agency',
    newMessage: 'Новое сообщение',
    statTotal: 'Всего сообщений',
    statUnread: 'Непрочитанных',
    statAiReports: 'AI Отчёты',
    searchPlaceholder: 'Поиск в сообщениях...',
    filterAll: 'Все',
    filterUnread: 'Непрочитанные',
    attachmentLabel: 'Прикреплённый файл',
    officialBadge: 'Официально',
    noMessages: 'Сообщения не найдены',
    attachments: 'Вложения',
    reply: 'Ответить',
    markRead: 'Отметить прочитанным',
    download: 'Скачать',
  },
  en: {
    heading: 'My Messages',
    subheading: 'Communication centre with DK Agency',
    newMessage: 'New Message',
    statTotal: 'Total Messages',
    statUnread: 'Unread',
    statAiReports: 'AI Reports',
    searchPlaceholder: 'Search messages...',
    filterAll: 'All',
    filterUnread: 'Unread',
    attachmentLabel: 'Attached file',
    officialBadge: 'Official',
    noMessages: 'No messages found',
    attachments: 'Attachments',
    reply: 'Reply',
    markRead: 'Mark as Read',
    download: 'Download',
  },
  tr: {
    heading: 'Mesajlarım',
    subheading: 'DK Agency ile iletişim merkezi',
    newMessage: 'Yeni Mesaj',
    statTotal: 'Toplam Mesaj',
    statUnread: 'Okunmamış',
    statAiReports: 'AI Raporları',
    searchPlaceholder: 'Mesajlarda ara...',
    filterAll: 'Tümü',
    filterUnread: 'Okunmamış',
    attachmentLabel: 'Ek dosya',
    officialBadge: 'Resmi',
    noMessages: 'Mesaj bulunamadı',
    attachments: 'Ekler',
    reply: 'Yanıtla',
    markRead: 'Okundu İşaretle',
    download: 'İndir',
  },
};

// Real mesajlaşma backend-i qoşulana qədər boş (mock yox — TASK-0224 prinsipi).
const messages: Message[] = [];

export default function B2BMessagesPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'starred'>('all');

  const filteredMessages = messages
    .filter((m) => {
      if (filter === 'unread') return !m.read;
      if (filter === 'starred') return m.starred;
      return true;
    })
    .filter(
      (m) =>
        m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.from.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{copy.heading}</h1>
            <p className="text-sm text-gray-500 mt-1">{copy.subheading}</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-dk-red to-dk-red-strong hover:from-dk-red-strong hover:to-dk-red-strong text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl">
            <Plus size={18} />
            {copy.newMessage}
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Inbox size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                <p className="text-xs text-gray-500">{copy.statTotal}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Bell size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{unreadCount}</p>
                <p className="text-xs text-gray-500">{copy.statUnread}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Sparkles size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {messages.filter((m) => m.avatar === 'AI').length}
                </p>
                <p className="text-xs text-gray-500">{copy.statAiReports}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Message List */}
          <div
            className={`${selectedMessage ? 'hidden lg:block lg:w-[400px]' : 'flex-1'} bg-white rounded-2xl border border-gray-200 overflow-hidden`}
          >
            {/* Search & Filter */}
            <div className="p-4 border-b border-gray-100">
              <div className="relative mb-4">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === 'all'
                      ? 'bg-dk-red text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copy.filterAll}
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    filter === 'unread'
                      ? 'bg-dk-red text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {copy.filterUnread}
                  {unreadCount > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded-full ${
                        filter === 'unread' ? 'bg-white/20' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setFilter('starred')}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    filter === 'starred'
                      ? 'bg-dk-red text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Star size={14} className={filter === 'starred' ? 'fill-white' : ''} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                  <Mail size={48} className="mb-4 opacity-50" />
                  <p>{copy.noMessages}</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all ${
                      selectedMessage?.id === message.id
                        ? 'bg-red-50 border-l-4 border-l-dk-red'
                        : 'hover:bg-gray-50'
                    } ${!message.read ? 'bg-blue-50/30' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                          message.avatar === 'AI'
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                            : message.avatar === 'DK'
                              ? 'bg-gradient-to-br from-dk-red to-dk-red-strong'
                              : message.avatar === 'DS'
                                ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                                : message.avatar === 'SY'
                                  ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                                  : 'bg-gradient-to-br from-gray-500 to-gray-700'
                        }`}
                      >
                        {message.avatar === 'AI' ? <Sparkles size={18} /> : message.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm truncate ${!message.read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}
                            >
                              {message.from}
                            </p>
                            {message.isFromAdmin && <Shield size={12} className="text-red-600" />}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {message.starred && (
                              <Star size={14} className="text-amber-500 fill-amber-500" />
                            )}
                            <span className="text-xs text-gray-400">{message.time}</span>
                          </div>
                        </div>
                        <p
                          className={`text-sm truncate ${!message.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}
                        >
                          {message.subject}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">{message.preview}</p>
                        {message.hasAttachment && (
                          <div className="flex items-center gap-1 mt-2 text-gray-400">
                            <Paperclip size={12} />
                            <span className="text-xs">{copy.attachmentLabel}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          {selectedMessage && (
            <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-3 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold ${
                      selectedMessage.avatar === 'AI'
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                        : selectedMessage.avatar === 'DK'
                          ? 'bg-gradient-to-br from-dk-red to-dk-red-strong'
                          : selectedMessage.avatar === 'DS'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                            : selectedMessage.avatar === 'SY'
                              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                              : 'bg-gradient-to-br from-gray-500 to-gray-700'
                    }`}
                  >
                    {selectedMessage.avatar === 'AI' ? (
                      <Sparkles size={24} />
                    ) : (
                      selectedMessage.avatar
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-bold text-gray-900">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-600">{selectedMessage.from}</p>
                      {selectedMessage.isFromAdmin && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                          <Shield size={10} />
                          {copy.officialBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {selectedMessage.time}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Star
                      size={20}
                      className={
                        selectedMessage.starred ? 'text-amber-500 fill-amber-500' : 'text-gray-400'
                      }
                    />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-sm">
                  {selectedMessage.content}
                </div>

                {selectedMessage.hasAttachment && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <Paperclip size={16} />
                      {copy.attachments}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-red-300 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <FileText size={20} className="text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {selectedMessage.avatar === 'AI'
                                ? 'ai_valuation_report.pdf'
                                : 'approval_certificate.pdf'}
                            </p>
                            <p className="text-xs text-gray-500">PDF • 1.2 MB</p>
                          </div>
                        </div>
                        <button className="px-3 py-1.5 bg-dk-red hover:bg-dk-red-strong text-white text-xs font-semibold rounded-lg transition-colors">
                          {copy.download}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply */}
              <div className="p-6 border-t border-gray-200 bg-gray-50">
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-dk-red hover:bg-dk-red-strong text-white rounded-xl font-semibold transition-colors">
                    <Reply size={16} />
                    {copy.reply}
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors">
                    <CheckCircle2 size={16} />
                    {copy.markRead}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
