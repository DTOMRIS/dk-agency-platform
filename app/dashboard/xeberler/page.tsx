'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { compressImage, validateImage } from '@/lib/utils/imageUtils';
import { normalizeLocale, type Locale } from '@/i18n/config';

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

interface EditorDraft {
  id: number;
  title: string;
  summary: string | null;
  titleAz: string;
  summaryAz: string;
  imageUrl: string;
  externalUrl: string | null;
  status: FilterStatus;
}

const pageCopy: Record<
  Locale,
  {
    pageTitle: string;
    pageSubtitle: string;
    filterAll: string;
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
    pageSubtitle: 'Review paneli artiq `news_articles` və `news_sources` cədvəllərindən qidalanır.',
    filterAll: 'Hamısı',
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
    filterAll: 'Все',
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
    filterAll: 'All',
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
    filterAll: 'Tümü',
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
  const [savingEditor, setSavingEditor] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editorDraft, setEditorDraft] = useState<EditorDraft | null>(null);

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

  function openEditor(item: AdminNewsRow) {
    setError(null);
    setToast(null);
    setEditorDraft({
      id: item.id,
      title: item.title,
      summary: item.summary,
      titleAz: item.titleAz || '',
      summaryAz: item.summaryAz || '',
      imageUrl: item.imageUrl || '',
      externalUrl: item.externalUrl,
      status: item.status,
    });
  }

  async function handleEditorImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editorDraft) return;

    setError(null);
    setToast(null);

    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Sekil secilemedi.');
      event.target.value = '';
      return;
    }

    setUploadingImage(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1400,
        maxHeight: 1400,
        maxSizeKB: 350,
        quality: 0.82,
      });

      const formData = new FormData();
      formData.append('file', compressed.file);
      formData.append('listingId', `news-${editorDraft.id}`);
      formData.append('folder', `dk-agency/news/${editorDraft.id}`);

      const response = await fetch('/api/upload?purpose=news-admin', {
        method: 'POST',
        body: formData,
      });
      const payload = (await response.json()) as { success?: boolean; error?: string; url?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || `upload failed (${response.status})`);
      }

      setEditorDraft((prev) => (prev ? { ...prev, imageUrl: payload.url || '' } : prev));
      setToast(copy.toastImageUploaded(compressed.reduction));
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Sekil yuklenmedi';
      setError(message);
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  }

  async function saveEditor(nextStatus?: FilterStatus) {
    if (!editorDraft) return;

    setSavingEditor(true);
    setError(null);
    setToast(null);
    try {
      const payload = {
        titleAz: editorDraft.titleAz.trim(),
        summaryAz: editorDraft.summaryAz.trim(),
        imageUrl: editorDraft.imageUrl.trim() || null,
        status: nextStatus || (editorDraft.status === 'fetched' ? 'translated' : editorDraft.status),
      };

      const response = await fetch(`/api/news/admin/${editorDraft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok) {
        throw new Error(body.error || `save failed (${response.status})`);
      }

      setToast(nextStatus === 'approved' ? copy.toastApproved : copy.toastSaved);
      setEditorDraft(null);
      await loadNews(filter);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Duzelis saxlanilmadi';
      setError(message);
    } finally {
      setSavingEditor(false);
    }
  }

  const filterButtons: [FilterStatus, string][] = [
    ['all', copy.filterAll],
    ['fetched', 'Fetched'],
    ['translated', 'Translated'],
    ['approved', 'Approved'],
    ['rejected', 'Rejected'],
  ];

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">{copy.pageTitle}</h1>
          <p className="mt-3 text-sm text-slate-500">{copy.pageSubtitle}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          {filterButtons.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full px-5 py-3 text-sm font-bold ${
                filter === value ? 'bg-[var(--dk-red)] text-white' : 'border border-slate-200 text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            {copy.errorPrefix}: {error}
          </div>
        ) : null}

        {toast ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {toast}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-400">
              <tr>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colOriginal}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colAzTranslation}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colSource}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colStatus}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colDate}</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">{copy.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-4 font-semibold text-[var(--dk-navy)]">
                    <div>{item.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.category}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.titleAz || copy.pendingTranslation}</td>
                  <td className="px-5 py-4 text-slate-600">{item.sourceName || copy.noSource}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : item.status === 'translated'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.isEditorPick ? (
                      <div className="mt-2 text-[11px] font-bold text-[var(--dk-gold)]">{copy.editorPick}</div>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {new Date(item.publishedAt).toLocaleDateString('az-AZ')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEditor(item)}
                        className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                      >
                        {copy.actionEdit}
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateItem(item.id, { status: 'approved' })}
                        className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
                      >
                        {copy.actionApprove}
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateItem(item.id, { status: 'rejected', isEditorPick: false })}
                        className="rounded-full bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"
                      >
                        {copy.actionReject}
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateItem(item.id, { isEditorPick: !item.isEditorPick })}
                        className="rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700"
                      >
                        {copy.actionEditorPick}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && items.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">{copy.emptyState}</div>
          ) : null}
        </div>

        {editorDraft ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8">
            <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-black text-[var(--dk-navy)]">{copy.editorTitle}</h2>
                  <p className="mt-2 text-sm text-slate-500">{copy.editorSubtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditorDraft(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
                >
                  {copy.editorClose}
                </button>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{copy.originalTitle}</div>
                    <div className="mt-2 text-lg font-bold leading-8 text-[var(--dk-navy)]">{editorDraft.title}</div>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{copy.originalSummary}</div>
                    <div className="mt-3 max-h-[360px] overflow-y-auto pr-2 text-[15px] leading-8 text-slate-700">
                      {editorDraft.summary || copy.noSummary}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{copy.originalSource}</div>
                    {editorDraft.externalUrl ? (
                      <a
                        href={editorDraft.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex text-sm font-bold text-[var(--dk-red)] underline"
                      >
                        {copy.goToSource}
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">{copy.noLink}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditorDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              titleAz: prev.titleAz || prev.title,
                              summaryAz: prev.summaryAz || prev.summary || '',
                            }
                          : prev,
                      )
                    }
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                  >
                    {copy.draftFromOriginal}
                  </button>
                </div>

                <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-sm font-black uppercase tracking-[0.14em] text-slate-500">{copy.azTitle}</label>
                      <span className="text-xs font-semibold text-slate-400">{editorDraft.titleAz.trim().length} {copy.characters}</span>
                    </div>
                    <input
                      value={editorDraft.titleAz}
                      onChange={(event) =>
                        setEditorDraft((prev) => (prev ? { ...prev, titleAz: event.target.value } : prev))
                      }
                      placeholder={copy.titlePlaceholder}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-[15px] font-medium text-slate-900 outline-none transition focus:border-[var(--dk-gold)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-sm font-black uppercase tracking-[0.14em] text-slate-500">{copy.azSummary}</label>
                      <span className="text-xs font-semibold text-slate-400">{editorDraft.summaryAz.trim().length} {copy.characters}</span>
                    </div>
                    <textarea
                      rows={12}
                      value={editorDraft.summaryAz}
                      onChange={(event) =>
                        setEditorDraft((prev) => (prev ? { ...prev, summaryAz: event.target.value } : prev))
                      }
                      placeholder={copy.summaryPlaceholder}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-[15px] leading-8 text-slate-900 outline-none transition focus:border-[var(--dk-gold)] focus:bg-white"
                    />
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">{copy.imageSection}</div>
                        <p className="mt-1 text-xs text-slate-500">{copy.imageNote}</p>
                      </div>
                      <label className="inline-flex cursor-pointer rounded-full bg-[var(--dk-navy)] px-4 py-2 text-sm font-bold text-white">
                        {uploadingImage ? copy.uploadingImage : copy.addImage}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) => void handleEditorImage(event)}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>

                    {editorDraft.imageUrl ? (
                      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <img
                          src={editorDraft.imageUrl}
                          alt={editorDraft.titleAz || editorDraft.title}
                          className="h-48 w-full object-cover"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                          <p className="text-xs text-slate-500">{copy.imagePublicNote}</p>
                          <button
                            type="button"
                            onClick={() => setEditorDraft((prev) => (prev ? { ...prev, imageUrl: '' } : prev))}
                            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                          >
                            {copy.removeImage}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                        {copy.noImageYet}
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {copy.editorRule}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  disabled={savingEditor}
                  onClick={() => void saveEditor('translated')}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-60"
                >
                  {savingEditor ? copy.saving : copy.saveTranslated}
                </button>
                <button
                  type="button"
                  disabled={savingEditor || !editorDraft.titleAz.trim() || !editorDraft.summaryAz.trim()}
                  onClick={() => void saveEditor('approved')}
                  className="rounded-full bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {savingEditor ? copy.approving : copy.approveAndPublish}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
