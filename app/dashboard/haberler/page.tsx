// app/dashboard/haberler/page.tsx
// DK Agency Dashboard - Haberler Yönetimi
// Kaynak: egitim-sistemi/portal/admin/xeberler mimarisi

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Newspaper, Plus, Trash2, Edit3, Search,
  RefreshCw, Eye, ChevronLeft, ChevronRight,
  ToggleLeft, ToggleRight, Loader2
} from 'lucide-react';
import { getAllNews, NewsArticle } from '@/lib/data/mockNewsDB';
import { normalizeLocale, type Locale } from '@/i18n/config';

const pageCopy: Record<
  Locale,
  {
    pageTitle: string;
    pageSubtitle: (total: number) => string;
    newNews: string;
    statTotal: string;
    statPremium: string;
    statPublic: string;
    searchPlaceholder: string;
    categoryAll: string;
    categoryHoreca: string;
    categoryYatirim: string;
    categoryEgitim: string;
    categoryOperasyon: string;
    refresh: string;
    colNews: string;
    colCategory: string;
    colStatus: string;
    colDate: string;
    colActions: string;
    premium: string;
    publicLabel: string;
    emptyState: string;
    paginationSummary: (total: number) => string;
    deleteConfirm: string;
  }
> = {
  az: {
    pageTitle: 'Xəbərlər & Analizlər',
    pageSubtitle: (total) => `Məzmun idarəsi və xəbər redaktoru (${total} xəbər)`,
    newNews: 'Yeni Xəbər',
    statTotal: 'Ümumi Xəbər',
    statPremium: 'Premium Məzmun',
    statPublic: 'Hamıya Açıq',
    searchPlaceholder: 'Xəbər axtar...',
    categoryAll: 'Hamısı',
    categoryHoreca: 'HORECA',
    categoryYatirim: 'İnvestisiya',
    categoryEgitim: 'Təhsil',
    categoryOperasyon: 'Əməliyyat',
    refresh: 'Yenilə',
    colNews: 'Xəbər',
    colCategory: 'Kateqoriya',
    colStatus: 'Status',
    colDate: 'Tarix',
    colActions: 'Əməliyyatlar',
    premium: 'Premium',
    publicLabel: 'Hamıya Açıq',
    emptyState: 'Hələ xəbər tapılmadı',
    paginationSummary: (total) => `Cəmi ${total} xəbər göstərilir`,
    deleteConfirm: 'Bu xəbəri silmək istədiyinizə əminsiniz?',
  },
  ru: {
    pageTitle: 'Новости & Аналитика',
    pageSubtitle: (total) => `Управление контентом и редактор новостей (${total} новостей)`,
    newNews: 'Новая новость',
    statTotal: 'Всего новостей',
    statPremium: 'Premium контент',
    statPublic: 'Открытый доступ',
    searchPlaceholder: 'Поиск новостей...',
    categoryAll: 'Все',
    categoryHoreca: 'HORECA',
    categoryYatirim: 'Инвестиции',
    categoryEgitim: 'Образование',
    categoryOperasyon: 'Операции',
    refresh: 'Обновить',
    colNews: 'Новость',
    colCategory: 'Категория',
    colStatus: 'Статус',
    colDate: 'Дата',
    colActions: 'Действия',
    premium: 'Premium',
    publicLabel: 'Открытый доступ',
    emptyState: 'Новости не найдены',
    paginationSummary: (total) => `Всего показано ${total} новостей`,
    deleteConfirm: 'Вы уверены, что хотите удалить эту новость?',
  },
  en: {
    pageTitle: 'News & Analysis',
    pageSubtitle: (total) => `Content management and news editor (${total} news)`,
    newNews: 'New News',
    statTotal: 'Total News',
    statPremium: 'Premium Content',
    statPublic: 'Public Access',
    searchPlaceholder: 'Search news...',
    categoryAll: 'All',
    categoryHoreca: 'HORECA',
    categoryYatirim: 'Investment',
    categoryEgitim: 'Education',
    categoryOperasyon: 'Operations',
    refresh: 'Refresh',
    colNews: 'News',
    colCategory: 'Category',
    colStatus: 'Status',
    colDate: 'Date',
    colActions: 'Actions',
    premium: 'Premium',
    publicLabel: 'Public',
    emptyState: 'No news found yet',
    paginationSummary: (total) => `Showing ${total} news total`,
    deleteConfirm: 'Are you sure you want to delete this news?',
  },
  tr: {
    pageTitle: 'Haberler & Analizler',
    pageSubtitle: (total) => `İçerik yönetimi ve haber editörü (${total} haber)`,
    newNews: 'Yeni Haber',
    statTotal: 'Toplam Haber',
    statPremium: 'Premium İçerik',
    statPublic: 'Herkese Açık',
    searchPlaceholder: 'Haber ara...',
    categoryAll: 'Tümü',
    categoryHoreca: 'HORECA',
    categoryYatirim: 'Yatırım',
    categoryEgitim: 'Eğitim',
    categoryOperasyon: 'Operasyon',
    refresh: 'Yenile',
    colNews: 'Haber',
    colCategory: 'Kategori',
    colStatus: 'Durum',
    colDate: 'Tarih',
    colActions: 'İşlemler',
    premium: 'Premium',
    publicLabel: 'Herkese Açık',
    emptyState: 'Henüz haber bulunamadı',
    paginationSummary: (total) => `Toplam ${total} haber gösteriliyor`,
    deleteConfirm: 'Bu haberi silmek istediğinize emin misiniz?',
  },
};

export default function DashboardHaberlerPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const CATEGORIES = [
    { value: '', label: copy.categoryAll },
    { value: 'horeca', label: copy.categoryHoreca },
    { value: 'yatirim', label: copy.categoryYatirim },
    { value: 'egitim', label: copy.categoryEgitim },
    { value: 'operasyon', label: copy.categoryOperasyon },
  ];

  const [posts, setPosts] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingPost, setEditingPost] = useState<NewsArticle | null>(null);

  // Haberleri yükle
  const fetchPosts = useCallback(() => {
    setLoading(true);
    // Mock data - ileride API'ye bağlanacak
    setTimeout(() => {
      let filtered = getAllNews();

      if (categoryFilter) {
        filtered = filtered.filter(p => p.category === categoryFilter);
      }

      if (search) {
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.summary.toLowerCase().includes(search.toLowerCase())
        );
      }

      setPosts(filtered);
      setLoading(false);
    }, 500);
  }, [categoryFilter, search]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPosts();
  }, [fetchPosts]);

  // Silme işlemi
  const handleDelete = (id: string) => {
    if (confirm(copy.deleteConfirm)) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  // Premium toggle
  const togglePremium = (id: string) => {
    setPosts(posts.map(p =>
      p.id === id ? { ...p, isPremium: !p.isPremium } : p
    ));
  };

  const stats = {
    total: posts.length,
    premium: posts.filter(p => p.isPremium).length,
    public: posts.filter(p => !p.isPremium).length,
  };

  // suppress unused variable warning for editingPost
  void editingPost;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Newspaper size={28} className="text-dk-red" />
            {copy.pageTitle}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {copy.pageSubtitle(stats.total)}
          </p>
        </div>
        <Link
          href="/dashboard/haberler/yeni"
          className="flex items-center gap-2 bg-dk-red hover:bg-dk-red-strong text-white px-5 py-2.5 rounded-xl font-bold transition-colors"
        >
          <Plus size={18} />
          {copy.newNews}
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">{copy.statTotal}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-yellow-600">{stats.premium}</p>
          <p className="text-sm text-gray-500">{copy.statPremium}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-green-600">{stats.public}</p>
          <p className="text-sm text-gray-500">{copy.statPublic}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={copy.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          {/* Refresh */}
          <button
            onClick={fetchPosts}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {copy.refresh}
          </button>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-dk-red" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <Newspaper size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">{copy.emptyState}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {copy.colNews}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {copy.colCategory}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {copy.colStatus}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {copy.colDate}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {copy.colActions}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                          <Newspaper size={20} className="text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate max-w-md">{post.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{post.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2.5 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                        {post.category.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => togglePremium(post.id)}
                        className="flex items-center gap-2"
                      >
                        {post.isPremium ? (
                          <>
                            <ToggleRight size={20} className="text-yellow-500" />
                            <span className="text-xs font-medium text-yellow-600">{copy.premium}</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={20} className="text-gray-400" />
                            <span className="text-xs font-medium text-gray-500">{copy.publicLabel}</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-gray-500">
                        {new Date(post.publishDate).toLocaleDateString('tr-TR')}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/haberler/${post.slug}`}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          target="_blank"
                        >
                          <Eye size={16} />
                        </Link>
                        <Link
                          href={`/dashboard/haberler/${post.id}/duzenle`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit3 size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {posts.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              {copy.paginationSummary(posts.length)}
            </p>
            <div className="flex items-center gap-2">
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                <ChevronLeft size={16} />
              </button>
              <span className="px-3 py-1 text-sm font-medium">{page}</span>
              <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
