'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { formatAzDate } from '@/lib/i18n/format';

type FilterStatus = 'all' | 'fetched' | 'translated' | 'approved' | 'rejected';

interface AdminNewsRow {
  id: number;
  sourceName: string | null;
  externalUrl: string | null;
  slug: string | null;
  title: string;
  summary: string | null;
  titleAz: string | null;
  summaryAz: string | null;
  category: string;
  imageUrl: string | null;
  author: string | null;
  status: FilterStatus;
  isEditorPick: boolean;
  publishedAt: string;
}

const pageCopy: Record<
  Locale,
  {
    pageTitle: string;
    pageSubtitle: string;
    newArticle: string;
    filterAll: string;
    filterFetched: string;
    filterTranslated: string;
    filterApproved: string;
    filterRejected: string;
    errorPrefix: string;
    colOriginal: string;
    colAzTranslation: string;
    colSource: string;
    colStatus: string;
    colDate: string;
    colActions: string;
    pendingTranslation: string;
    noSource: string;
    editorPick: string;
    actionEdit: string;
    actionApprove: string;
    actionReject: string;
    actionEditorPick: string;
    actionDelete: string;
    confirmDelete: string;
    emptyState: string;
    editorTitle: string;
    editorSubtitle: string;
    editorClose: string;
    originalTitle: string;
    originalSummary: string;
    originalSource: string;
    noSummary: string;
    goToSource: string;
    noLink: string;
    draftFromOriginal: string;
    azTitle: string;
    azSummary: string;
    characters: string;
    titlePlaceholder: string;
    summaryPlaceholder: string;
    imageSection: string;
    imageNote: string;
    uploadingImage: string;
    addImage: string;
    imagePublicNote: string;
    removeImage: string;
    noImageYet: string;
    editorRule: string;
    saveTranslated: string;
    saving: string;
    approving: string;
    approveAndPublish: string;
    toastUpdated: string;
    toastApproved: string;
    toastSaved: string;
    toastImageUploaded: (reduction: string) => string;
  }
> = {
  az: {
    pageTitle: 'Xəbərlər idarəsi',
    pageSubtitle: 'Xəbərləri idarə edin: təsdiqlə, redaktə et, rədd et.',
    newArticle: '+ Yeni Xəbər',
    filterAll: 'Hamısı',
    filterFetched: 'Gözləyən',
    filterTranslated: 'Tərcümə olunmuş',
    filterApproved: 'Təsdiqlənmiş',
    filterRejected: 'Rədd edilmiş',
    errorPrefix: 'Xəbər siyahısı yüklənmədi',
    colOriginal: 'Original',
    colAzTranslation: 'AZ tərcümə',
    colSource: 'Mənbə',
    colStatus: 'Status',
    colDate: 'Tarix',
    colActions: 'Əməliyyat',
    pendingTranslation: 'Tərcümə gözləyir',
    noSource: 'Mənbə yoxdur',
    editorPick: 'Editor pick',
    actionEdit: 'Düzəliş et',
    actionApprove: 'Təsdiqlə',
    actionReject: 'Rədd et',
    actionEditorPick: 'Editor Pick',
    actionDelete: 'Sil',
    confirmDelete: 'Bu xəbəri silmək istədiyinizdən əminsiniz?',
    emptyState: 'Bu filtrə görə xəbər tapılmadı.',
    editorTitle: 'Xəbər redaktoru',
    editorSubtitle: 'Orijinal məzmundan AZ versiya hazırla, şəkil əlavə et, sonra translated və ya approved et.',
    editorClose: 'Bağla',
    originalTitle: 'Original başlıq',
    originalSummary: 'Original xülasə',
    originalSource: 'Orijinal mənbə',
    noSummary: 'Xülasə yoxdur.',
    goToSource: 'Mənbəyə keç',
    noLink: 'Link yoxdur.',
    draftFromOriginal: 'Originaldan draft yarat',
    azTitle: 'AZ başlıq',
    azSummary: 'AZ xülasə',
    characters: 'simvol',
    titlePlaceholder: 'Tərcümə olunmuş başlıq daxil edin',
    summaryPlaceholder: 'Xəbərin qısa AZ xülasəsini burada redaktə edin',
    imageSection: 'Şəkil',
    imageNote: 'Şəkil seçilir, brauzerdə kiçildilir, sonra yüklənir. Beləcə həm oxunaqlı qalır həm də yer tutmur.',
    uploadingImage: 'Yüklənir...',
    addImage: 'Şəkil əlavə et',
    imagePublicNote: 'Bu şəkil public kartda və detail səhifədə göstəriləcək.',
    removeImage: 'Şəkli sil',
    noImageYet: 'Hələ şəkil əlavə olunmayıb. Kart daha güclü görünsün deyə burada cover şəkil seçmək yaxşıdır.',
    editorRule: 'Qısaca redaktor qaydası: başlıq qısa və aydın olsun, xülasə 2-4 cümləlik qalsın, şəkil varsa yemək və ya brend vizualı kimi güclü kadr seçilsin.',
    saveTranslated: 'Translated kimi saxla',
    saving: 'Saxlanılır...',
    approving: 'Təsdiqlənir...',
    approveAndPublish: 'Yayına hazırla və təsdiqlə',
    toastUpdated: 'Xəbər yeniləndi.',
    toastApproved: 'Xəbər düzəlişdən sonra təsdiqləndi.',
    toastSaved: 'Xəbər düzəlişi saxlanıldı.',
    toastImageUploaded: (reduction) => `Şəkil yükləndi və kiçildi: ${reduction}`,
  },
  ru: {
    pageTitle: 'Управление новостями',
    pageSubtitle: 'Панель просмотра питается из таблиц `news_articles` и `news_sources`.',
    newArticle: '+ Новая новость',
    filterAll: 'Все',
    filterFetched: 'Ожидающие',
    filterTranslated: 'Переведённые',
    filterApproved: 'Одобренные',
    filterRejected: 'Отклонённые',
    errorPrefix: 'Список новостей не загружен',
    colOriginal: 'Оригинал',
    colAzTranslation: 'Перевод AZ',
    colSource: 'Источник',
    colStatus: 'Статус',
    colDate: 'Дата',
    colActions: 'Действия',
    pendingTranslation: 'Ожидает перевода',
    noSource: 'Нет источника',
    editorPick: 'Выбор редактора',
    actionEdit: 'Редактировать',
    actionApprove: 'Одобрить',
    actionReject: 'Отклонить',
    actionEditorPick: 'Выбор редактора',
    actionDelete: 'Удалить',
    confirmDelete: 'Вы уверены, что хотите удалить эту новость?',
    emptyState: 'По данному фильтру новости не найдены.',
    editorTitle: 'Редактор новостей',
    editorSubtitle: 'Подготовьте AZ-версию из оригинала, добавьте изображение, затем переведите или одобрите.',
    editorClose: 'Закрыть',
    originalTitle: 'Оригинальный заголовок',
    originalSummary: 'Оригинальная сводка',
    originalSource: 'Оригинальный источник',
    noSummary: 'Нет сводки.',
    goToSource: 'Перейти к источнику',
    noLink: 'Ссылка отсутствует.',
    draftFromOriginal: 'Создать черновик из оригинала',
    azTitle: 'Заголовок AZ',
    azSummary: 'Сводка AZ',
    characters: 'симв.',
    titlePlaceholder: 'Введите переведённый заголовок',
    summaryPlaceholder: 'Редактируйте краткую AZ-сводку новости здесь',
    imageSection: 'Изображение',
    imageNote: 'Изображение выбирается, сжимается в браузере, затем загружается. Так оно остаётся читаемым и не занимает много места.',
    uploadingImage: 'Загружается...',
    addImage: 'Добавить изображение',
    imagePublicNote: 'Это изображение будет показано в публичной карточке и на странице деталей.',
    removeImage: 'Удалить изображение',
    noImageYet: 'Изображение ещё не добавлено. Для большей привлекательности карточки рекомендуется выбрать обложку.',
    editorRule: 'Краткое правило редактора: заголовок должен быть коротким и ясным, сводка — 2–4 предложения, изображение — сильный кадр блюда или бренда.',
    saveTranslated: 'Сохранить как Translated',
    saving: 'Сохранение...',
    approving: 'Одобрение...',
    approveAndPublish: 'Подготовить к публикации и одобрить',
    toastUpdated: 'Новость обновлена.',
    toastApproved: 'Новость одобрена после редактирования.',
    toastSaved: 'Правки новости сохранены.',
    toastImageUploaded: (reduction) => `Изображение загружено и сжато: ${reduction}`,
  },
  en: {
    pageTitle: 'News management',
    pageSubtitle: 'The review panel feeds from `news_articles` and `news_sources` tables.',
    newArticle: '+ New article',
    filterAll: 'All',
    filterFetched: 'Pending',
    filterTranslated: 'Translated',
    filterApproved: 'Approved',
    filterRejected: 'Rejected',
    errorPrefix: 'News list failed to load',
    colOriginal: 'Original',
    colAzTranslation: 'AZ translation',
    colSource: 'Source',
    colStatus: 'Status',
    colDate: 'Date',
    colActions: 'Actions',
    pendingTranslation: 'Awaiting translation',
    noSource: 'No source',
    editorPick: 'Editor pick',
    actionEdit: 'Edit',
    actionApprove: 'Approve',
    actionReject: 'Reject',
    actionEditorPick: 'Editor Pick',
    actionDelete: 'Delete',
    confirmDelete: 'Are you sure you want to delete this article?',
    emptyState: 'No news found for this filter.',
    editorTitle: 'News editor',
    editorSubtitle: 'Prepare the AZ version from the original, add an image, then mark as translated or approved.',
    editorClose: 'Close',
    originalTitle: 'Original title',
    originalSummary: 'Original summary',
    originalSource: 'Original source',
    noSummary: 'No summary.',
    goToSource: 'Go to source',
    noLink: 'No link.',
    draftFromOriginal: 'Create draft from original',
    azTitle: 'AZ title',
    azSummary: 'AZ summary',
    characters: 'chars',
    titlePlaceholder: 'Enter the translated title',
    summaryPlaceholder: 'Edit the short AZ summary of the news here',
    imageSection: 'Image',
    imageNote: 'The image is selected, compressed in the browser, then uploaded. This keeps it readable and compact.',
    uploadingImage: 'Uploading...',
    addImage: 'Add image',
    imagePublicNote: 'This image will be shown on the public card and detail page.',
    removeImage: 'Remove image',
    noImageYet: 'No image added yet. Selecting a cover image here will make the card much more impactful.',
    editorRule: 'Quick editor rule: title should be short and clear, summary 2–4 sentences, image should be a strong shot of food or brand visuals.',
    saveTranslated: 'Save as Translated',
    saving: 'Saving...',
    approving: 'Approving...',
    approveAndPublish: 'Prepare for publishing and approve',
    toastUpdated: 'News updated.',
    toastApproved: 'News approved after editing.',
    toastSaved: 'News edits saved.',
    toastImageUploaded: (reduction) => `Image uploaded and compressed: ${reduction}`,
  },
  tr: {
    pageTitle: 'Haber yönetimi',
    pageSubtitle: 'İnceleme paneli `news_articles` ve `news_sources` tablolarından beslenmektedir.',
    newArticle: '+ Yeni Haber',
    filterAll: 'Tümü',
    filterFetched: 'Bekleyen',
    filterTranslated: 'Çevrilen',
    filterApproved: 'Onaylanan',
    filterRejected: 'Reddedilen',
    errorPrefix: 'Haber listesi yüklenemedi',
    colOriginal: 'Orijinal',
    colAzTranslation: 'AZ çeviri',
    colSource: 'Kaynak',
    colStatus: 'Durum',
    colDate: 'Tarih',
    colActions: 'İşlemler',
    pendingTranslation: 'Çeviri bekliyor',
    noSource: 'Kaynak yok',
    editorPick: 'Editör seçimi',
    actionEdit: 'Düzenle',
    actionApprove: 'Onayla',
    actionReject: 'Reddet',
    actionEditorPick: 'Editör Seçimi',
    actionDelete: 'Sil',
    confirmDelete: 'Bu haberi silmek istediğinizden emin misiniz?',
    emptyState: 'Bu filtreye göre haber bulunamadı.',
    editorTitle: 'Haber editörü',
    editorSubtitle: 'Orijinalden AZ versiyonu hazırla, görsel ekle, ardından translated veya approved yap.',
    editorClose: 'Kapat',
    originalTitle: 'Orijinal başlık',
    originalSummary: 'Orijinal özet',
    originalSource: 'Orijinal kaynak',
    noSummary: 'Özet yok.',
    goToSource: 'Kaynağa git',
    noLink: 'Link yok.',
    draftFromOriginal: 'Orijinalden taslak oluştur',
    azTitle: 'AZ başlık',
    azSummary: 'AZ özet',
    characters: 'karakter',
    titlePlaceholder: 'Çevrilmiş başlığı girin',
    summaryPlaceholder: 'Haberin kısa AZ özetini burada düzenleyin',
    imageSection: 'Görsel',
    imageNote: 'Görsel seçilir, tarayıcıda küçültülür, ardından yüklenir. Böylece hem okunabilir kalır hem de yer kaplamaz.',
    uploadingImage: 'Yükleniyor...',
    addImage: 'Görsel ekle',
    imagePublicNote: 'Bu görsel public kartta ve detay sayfasında gösterilecek.',
    removeImage: 'Görseli sil',
    noImageYet: 'Henüz görsel eklenmedi. Kartın daha güçlü görünmesi için burada kapak görseli seçmek iyi olur.',
    editorRule: 'Kısaca editör kuralı: başlık kısa ve net olsun, özet 2-4 cümle kalsın, görsel varsa yemek veya marka visueli gibi güçlü bir kare seçilsin.',
    saveTranslated: 'Translated olarak kaydet',
    saving: 'Kaydediliyor...',
    approving: 'Onaylanıyor...',
    approveAndPublish: 'Yayına hazırla ve onayla',
    toastUpdated: 'Haber güncellendi.',
    toastApproved: 'Haber düzenleme sonrası onaylandı.',
    toastSaved: 'Haber düzenlemesi kaydedildi.',
    toastImageUploaded: (reduction) => `Görsel yüklendi ve küçültüldü: ${reduction}`,
  },
};

export default function DashboardXeberlerPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [filter, setFilter] = useState<FilterStatus>('all');
  const [items, setItems] = useState<AdminNewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function loadNews(nextFilter: FilterStatus) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nextFilter !== 'all') params.set('status', nextFilter);
      const requestUrl = `/api/news/admin?${params.toString()}`;

      const response = await fetch(requestUrl);
      const payload = (await response.json()) as { data?: AdminNewsRow[]; error?: string; total?: number; source?: string };

      if (!response.ok) {
        throw new Error(payload.error || `load failed (${response.status})`);
      }

      setItems(payload.data || []);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Xeberler yuklenmedi';
      if (process.env.NODE_ENV !== 'production') console.error('[dashboard/xeberler] load failed', {
        filter: nextFilter,
        error: message,
      });
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNews(filter);
  }, [filter]);

  async function deleteItem(id: number) {
    if (!window.confirm(copy.confirmDelete)) return;
    setError(null);
    setToast(null);
    try {
      const response = await fetch(`/api/news/admin/${id}`, { method: 'DELETE' });
      const payload = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok) throw new Error(payload.error || `delete failed (${response.status})`);
      setToast('Xəbər silindi.');
      await loadNews(filter);
    } catch (deleteError) {
      const message = deleteError instanceof Error ? deleteError.message : 'Xəbər silinmədi';
      setError(message);
    }
  }

  async function updateItem(id: number, body: { status?: FilterStatus; isEditorPick?: boolean }) {
    setError(null);
    setToast(null);
    try {
      const response = await fetch(`/api/news/admin/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { success?: boolean; error?: string; source?: string };

      if (!response.ok) {
        throw new Error(payload.error || `update failed (${response.status})`);
      }

      setToast(copy.toastUpdated);
      await loadNews(filter);
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Xeber yenilenmedi';
      if (process.env.NODE_ENV !== 'production') console.error('[dashboard/xeberler] update failed', { id, body, error: message });
      setError(message);
    }
  }

  const filterButtons: [FilterStatus, string][] = [
    ['all', copy.filterAll],
    ['fetched', copy.filterFetched],
    ['translated', copy.filterTranslated],
    ['approved', copy.filterApproved],
    ['rejected', copy.filterRejected],
  ];

  const statusLabel: Record<FilterStatus, string> = {
    all: copy.filterAll,
    fetched: copy.filterFetched,
    translated: copy.filterTranslated,
    approved: copy.filterApproved,
    rejected: copy.filterRejected,
  };

  const statusTone: Record<FilterStatus, string> = {
    all: 'bg-slate-100 text-slate-700',
    fetched: 'bg-amber-50 text-amber-800',
    translated: 'bg-[#EEF4FF] text-[#0A5BD6]',
    approved: 'bg-emerald-50 text-emerald-700',
    rejected: 'bg-rose-50 text-rose-700',
  };

  const actionBtn =
    'inline-flex h-8 items-center rounded-full px-3 text-[12px] font-semibold transition-colors';

  return (
    <div className="min-h-full bg-[#F2F2F7] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[32px] font-bold tracking-tight text-slate-900 sm:text-[38px]">{copy.pageTitle}</h1>
            <p className="mt-1 text-[15px] text-slate-600">{copy.pageSubtitle}</p>
          </div>
          <Link
            href="/dashboard/xeberler/yeni"
            className="inline-flex h-11 items-center rounded-full bg-[#E11D48] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#BE123C]"
          >
            {copy.newArticle}
          </Link>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex gap-1 rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
            {filterButtons.map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`h-9 whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${
                  filter === value ? 'bg-[#EEF4FF] text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {copy.errorPrefix}: {error}
          </div>
        ) : null}

        {toast ? (
          <div className="rounded-[16px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {toast}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full text-sm">
              <thead className="text-left text-[12px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">{copy.colOriginal}</th>
                  <th className="px-5 py-4 font-semibold">{copy.colAzTranslation}</th>
                  <th className="px-5 py-4 font-semibold">{copy.colSource}</th>
                  <th className="px-5 py-4 font-semibold">{copy.colStatus}</th>
                  <th className="px-5 py-4 font-semibold">{copy.colDate}</th>
                  <th className="px-5 py-4 font-semibold">{copy.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100 align-top transition-colors hover:bg-[#F9F9FB]">
                    <td className="max-w-[280px] px-5 py-4">
                      <div className="font-medium text-slate-900">{item.title}</div>
                      <div className="mt-1 text-[12px] text-slate-500">{item.category}</div>
                    </td>
                    <td className="max-w-[260px] px-5 py-4 text-slate-700">
                      {item.titleAz || <span className="text-slate-500">{copy.pendingTranslation}</span>}
                    </td>
                    <td className="px-5 py-4 text-slate-600">{item.sourceName || copy.noSource}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${statusTone[item.status] || statusTone.all}`}>
                        {statusLabel[item.status] || item.status}
                      </span>
                      {item.isEditorPick ? (
                        <div className="mt-2 inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                          {copy.editorPick}
                        </div>
                      ) : null}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-500 tabular-nums">
                      {formatAzDate(item.publishedAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <Link
                          href={`/dashboard/xeberler/${item.id}`}
                          className={`${actionBtn} bg-[#EEF4FF] text-[#0A5BD6] hover:bg-[#E0EBFF]`}
                        >
                          {copy.actionEdit}
                        </Link>
                        <button
                          type="button"
                          onClick={() => void updateItem(item.id, { status: 'approved' })}
                          className={`${actionBtn} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
                        >
                          {copy.actionApprove}
                        </button>
                        <button
                          type="button"
                          onClick={() => void updateItem(item.id, { status: 'rejected', isEditorPick: false })}
                          className={`${actionBtn} bg-rose-50 text-rose-700 hover:bg-rose-100`}
                        >
                          {copy.actionReject}
                        </button>
                        <button
                          type="button"
                          onClick={() => void updateItem(item.id, { isEditorPick: !item.isEditorPick })}
                          className={`${actionBtn} ${item.isEditorPick ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700 hover:bg-amber-50'}`}
                        >
                          {copy.actionEditorPick}
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteItem(item.id)}
                          className={`${actionBtn} border border-slate-200 bg-white text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700`}
                        >
                          {copy.actionDelete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && items.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-600">{copy.emptyState}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
