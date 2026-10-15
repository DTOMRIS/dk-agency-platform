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
    <div className="min-h-screen bg-[#F6F1E9]">
      {/* Header */}
      <div className="px-4 pt-6 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">{copy.heading}</h1>
            <p className="text-sm text-[#5B6474] mt-1">{copy.subheading}</p>
          </div>
          <button className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-dk-red-strong px-5 text-sm font-bold text-white transition-colors hover:bg-dk-red-deep sm:self-auto">
            <Plus size={18} />
            {copy.newMessage}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E4DCCD] bg-[#FBF8F3]">
                <Inbox size={20} className="text-[#0F172A]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{messages.length}</p>
                <p className="text-xs text-[#5B6474]">{copy.statTotal}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E4DCCD] bg-[#FBF8F3]">
                <Bell size={20} className="text-[#0F172A]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">{unreadCount}</p>
                <p className="text-xs text-[#5B6474]">{copy.statUnread}</p>
              </div>
            </div>
          </div>
          <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E4DCCD] bg-[#FBF8F3]">
                <Sparkles size={20} className="text-[#0F172A]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0F172A]">
                  {messages.filter((m) => m.avatar === 'AI').length}
                </p>
                <p className="text-xs text-[#5B6474]">{copy.statAiReports}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Message List */}
          <div
            className={`${selectedMessage ? 'hidden lg:block lg:w-[400px]' : 'flex-1'} overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-white`}
          >
            {/* Search & Filter */}
            <div className="border-b border-[#EFE9DE] p-4">
              <div className="relative mb-4">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5B6474]"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={copy.searchPlaceholder}
                  className="w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] py-2.5 pl-10 pr-4 text-[#0F172A] placeholder:text-[#5B6474]/70 focus:border-[#0F172A] focus:outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                    filter === 'all'
                      ? 'bg-[#0F172A] text-white'
                      : 'border border-[#E4DCCD] bg-white text-[#334155] hover:border-[#0F172A]'
                  }`}
                >
                  {copy.filterAll}
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${
                    filter === 'unread'
                      ? 'bg-[#0F172A] text-white'
                      : 'border border-[#E4DCCD] bg-white text-[#334155] hover:border-[#0F172A]'
                  }`}
                >
                  {copy.filterUnread}
                  {unreadCount > 0 && (
                    <span
                      className={`px-1.5 py-0.5 text-xs rounded-full ${
                        filter === 'unread' ? 'bg-white/20' : 'bg-dk-red-strong text-white'
                      }`}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setFilter('starred')}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors ${
                    filter === 'starred'
                      ? 'bg-[#0F172A] text-white'
                      : 'border border-[#E4DCCD] bg-white text-[#334155] hover:border-[#0F172A]'
                  }`}
                >
                  <Star size={14} className={filter === 'starred' ? 'fill-white' : ''} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="max-h-[600px] overflow-y-auto">
              {filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-[#5B6474]">
                  <Mail size={48} className="mb-4 opacity-50" />
                  <p>{copy.noMessages}</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => setSelectedMessage(message)}
                    className={`p-4 border-b border-[#EFE9DE] cursor-pointer transition-all ${
                      selectedMessage?.id === message.id
                        ? 'bg-[#FBF8F3] border-l-4 border-l-[#0F172A]'
                        : 'hover:bg-[#FBF8F3]'
                    } ${!message.read ? 'bg-[#FBF8F3]/60' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                          message.avatar === 'AI'
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                            : message.avatar === 'DK'
                              ? 'bg-gradient-to-br from-dk-red-strong to-dk-red-deep'
                              : message.avatar === 'DS'
                                ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                                : message.avatar === 'SY'
                                  ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                                  : 'bg-[#334155]'
                        }`}
                      >
                        {message.avatar === 'AI' ? <Sparkles size={18} /> : message.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p
                              className={`text-sm truncate ${!message.read ? 'font-bold text-[#0F172A]' : 'font-medium text-[#334155]'}`}
                            >
                              {message.from}
                            </p>
                            {message.isFromAdmin && <Shield size={12} className="text-dk-red-strong" />}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {message.starred && (
                              <Star size={14} className="text-amber-500 fill-amber-500" />
                            )}
                            <span className="text-xs text-[#5B6474]">{message.time}</span>
                          </div>
                        </div>
                        <p
                          className={`text-sm truncate ${!message.read ? 'font-semibold text-[#0F172A]' : 'text-[#5B6474]'}`}
                        >
                          {message.subject}
                        </p>
                        <p className="text-xs text-[#5B6474] truncate mt-1">{message.preview}</p>
                        {message.hasAttachment && (
                          <div className="flex items-center gap-1 mt-2 text-[#5B6474]">
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
            <div className="flex flex-1 flex-col overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-white">
              {/* Header */}
              <div className="border-b border-[#EFE9DE] p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="rounded-full border border-[#E4DCCD] p-3 transition-colors hover:border-[#0F172A] lg:hidden"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center text-white text-lg font-bold ${
                      selectedMessage.avatar === 'AI'
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                        : selectedMessage.avatar === 'DK'
                          ? 'bg-gradient-to-br from-dk-red-strong to-dk-red-deep'
                          : selectedMessage.avatar === 'DS'
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-600'
                            : selectedMessage.avatar === 'SY'
                              ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                              : 'bg-[#334155]'
                    }`}
                  >
                    {selectedMessage.avatar === 'AI' ? (
                      <Sparkles size={24} />
                    ) : (
                      selectedMessage.avatar
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-extrabold text-[#0F172A]">{selectedMessage.subject}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-[#5B6474]">{selectedMessage.from}</p>
                      {selectedMessage.isFromAdmin && (
                        <span className="flex items-center gap-1 rounded-full bg-[#0F172A] px-2 py-0.5 text-xs font-semibold text-white">
                          <Shield size={10} />
                          {copy.officialBadge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#5B6474] mt-1 flex items-center gap-1">
                      <Clock size={12} />
                      {selectedMessage.time}
                    </p>
                  </div>
                  <button className="rounded-full p-2 transition-colors hover:bg-[#FBF8F3]">
                    <Star
                      size={20}
                      className={
                        selectedMessage.starred ? 'text-amber-500 fill-amber-500' : 'text-[#5B6474]'
                      }
                    />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="whitespace-pre-wrap text-[#334155] leading-relaxed text-sm">
                  {selectedMessage.content}
                </div>

                {selectedMessage.hasAttachment && (
                  <div className="mt-6 rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] p-4">
                    <p className="text-sm font-semibold text-[#334155] mb-3 flex items-center gap-2">
                      <Paperclip size={16} />
                      {copy.attachments}
                    </p>
                    <div className="space-y-2">
                      <div className="flex cursor-pointer items-center justify-between rounded-xl border border-[#E4DCCD] bg-white p-3 transition-colors hover:border-[#0F172A]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F3EEE5]">
                            <FileText size={20} className="text-[#0F172A]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#0F172A]">
                              {selectedMessage.avatar === 'AI'
                                ? 'ai_valuation_report.pdf'
                                : 'approval_certificate.pdf'}
                            </p>
                            <p className="text-xs text-[#5B6474]">PDF • 1.2 MB</p>
                          </div>
                        </div>
                        <button className="rounded-full bg-dk-red-strong px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-dk-red-deep">
                          {copy.download}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply */}
              <div className="border-t border-[#EFE9DE] bg-[#FBF8F3] p-5 sm:p-6">
                <div className="flex flex-wrap gap-3">
                  <button className="flex h-11 items-center gap-2 rounded-full bg-dk-red-strong px-5 text-sm font-bold text-white transition-colors hover:bg-dk-red-deep">
                    <Reply size={16} />
                    {copy.reply}
                  </button>
                  <button className="flex h-11 items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-5 text-sm font-bold text-[#0F172A] transition-colors hover:border-[#0F172A]">
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
