"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { normalizeLocale, type Locale } from "@/i18n/config";
import { formatAzDate } from "@/lib/i18n/format";

type FilterStatus = "all" | "fetched" | "translated" | "approved" | "rejected";
/** List tab: a status, or the showcase view (manşet / top / gündəm / editor pick). */
type ListFilter = FilterStatus | "showcase";
type BulkAction = "delete" | "approve" | "reject";

// Lightweight list row — the list API no longer ships content/summary (TASK-0490).
interface AdminNewsRow {
  id: number;
  sourceName: string | null;
  externalUrl: string | null;
  slug: string | null;
  title: string;
  titleAz: string | null;
  category: string;
  imageUrl: string | null;
  author: string | null;
  origin: string | null;
  newsType: string | null;
  status: FilterStatus;
  isEditorPick: boolean;
  isManset: boolean;
  isTop: boolean;
  isGundem: boolean;
  publishedAt: string;
}

const PAGE_SIZE = 50;

/** Ingesters store the source in `author` and the link in `externalUrl` (no news_sources row). */
function sourceLabel(item: AdminNewsRow): string | null {
  if (item.sourceName?.trim()) return item.sourceName.trim();
  if (item.author?.trim()) return item.author.trim();
  if (item.externalUrl && /^https?:\/\//i.test(item.externalUrl)) {
    try {
      return new URL(item.externalUrl).hostname.replace(/^www\./, "");
    } catch {
      return null;
    }
  }
  return null;
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
    filterShowcase: string;
    badgeManset: string;
    badgeTop: string;
    badgeGundem: string;
    badgePhoto: string;
    badgeVideo: string;
    selectAllOnPage: string;
    selectRow: string;
    selectedCount: (n: number) => string;
    bulkApprove: string;
    bulkReject: string;
    bulkDelete: string;
    bulkClear: string;
    bulkWorking: string;
    confirmBulkDelete: (n: number) => string;
    confirmDeletePublished: (n: number) => string;
    bulkResult: (done: number, skipped: number) => string;
    toastDeleted: string;
    loadFailed: string;
    loading: string;
    pagePrev: string;
    pageNext: string;
    pageInfo: (page: number, pages: number, total: number) => string;
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
    filterShowcase: 'Vitrində',
    badgeManset: 'Manşet',
    badgeTop: 'Top',
    badgeGundem: 'Gündəm',
    badgePhoto: 'Foto',
    badgeVideo: 'Video',
    selectAllOnPage: 'Bu səhifədəkilərin hamısını seç',
    selectRow: 'Xəbəri seç',
    selectedCount: (n) => `${n} xəbər seçildi`,
    bulkApprove: 'Təsdiqlə',
    bulkReject: 'Rədd et',
    bulkDelete: 'Sil',
    bulkClear: 'Seçimi təmizlə',
    bulkWorking: 'İcra olunur...',
    confirmBulkDelete: (n) => `${n} xəbəri silmək istədiyinizdən əminsiniz? Bu geri qaytarılmır.`,
    confirmDeletePublished: (n) => `Seçimdə ${n} DƏRC OLUNMUŞ (saytda görünən) xəbər var. Onları da silmək üçün OK, yalnız dərc olunmamışları silmək üçün Cancel basın.`,
    bulkResult: (done, skipped) => `${done} xəbər icra olundu${skipped ? `, ${skipped} ötürüldü` : ''}.`,
    toastDeleted: 'Xəbər silindi.',
    loadFailed: 'Xəbərlər yüklənmədi',
    loading: 'Yüklənir...',
    pagePrev: '← Əvvəlki',
    pageNext: 'Növbəti →',
    pageInfo: (page, pages, total) => `Səhifə ${page} / ${pages} · ${total} xəbər`,
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
    filterShowcase: 'На витрине',
    badgeManset: 'Главная',
    badgeTop: 'Топ',
    badgeGundem: 'Повестка',
    badgePhoto: 'Фото',
    badgeVideo: 'Видео',
    selectAllOnPage: 'Выбрать все на странице',
    selectRow: 'Выбрать новость',
    selectedCount: (n) => `Выбрано: ${n}`,
    bulkApprove: 'Одобрить',
    bulkReject: 'Отклонить',
    bulkDelete: 'Удалить',
    bulkClear: 'Снять выбор',
    bulkWorking: 'Выполняется...',
    confirmBulkDelete: (n) => `Удалить выбранные новости (${n})? Это действие необратимо.`,
    confirmDeletePublished: (n) => `В выборе ${n} ОПУБЛИКОВАННЫХ (видимых на сайте) новостей. OK — удалить и их, Cancel — удалить только неопубликованные.`,
    bulkResult: (done, skipped) => `Выполнено: ${done}${skipped ? `, пропущено: ${skipped}` : ''}.`,
    toastDeleted: 'Новость удалена.',
    loadFailed: 'Новости не загружены',
    loading: 'Загрузка...',
    pagePrev: '← Назад',
    pageNext: 'Вперёд →',
    pageInfo: (page, pages, total) => `Страница ${page} / ${pages} · новостей: ${total}`,
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
    filterShowcase: 'In showcase',
    badgeManset: 'Headline',
    badgeTop: 'Top',
    badgeGundem: 'Agenda',
    badgePhoto: 'Photo',
    badgeVideo: 'Video',
    selectAllOnPage: 'Select all on this page',
    selectRow: 'Select article',
    selectedCount: (n) => `${n} selected`,
    bulkApprove: 'Approve',
    bulkReject: 'Reject',
    bulkDelete: 'Delete',
    bulkClear: 'Clear selection',
    bulkWorking: 'Working...',
    confirmBulkDelete: (n) => `Delete ${n} article(s)? This cannot be undone.`,
    confirmDeletePublished: (n) => `${n} selected article(s) are PUBLISHED on the site. OK = delete them too, Cancel = delete only unpublished ones.`,
    bulkResult: (done, skipped) => `${done} done${skipped ? `, ${skipped} skipped` : ''}.`,
    toastDeleted: 'Article deleted.',
    loadFailed: 'News failed to load',
    loading: 'Loading...',
    pagePrev: '← Previous',
    pageNext: 'Next →',
    pageInfo: (page, pages, total) => `Page ${page} / ${pages} · ${total} articles`,
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
    filterShowcase: 'Vitrinde',
    badgeManset: 'Manşet',
    badgeTop: 'Top',
    badgeGundem: 'Gündem',
    badgePhoto: 'Foto',
    badgeVideo: 'Video',
    selectAllOnPage: 'Bu sayfadakilerin tümünü seç',
    selectRow: 'Haberi seç',
    selectedCount: (n) => `${n} haber seçildi`,
    bulkApprove: 'Onayla',
    bulkReject: 'Reddet',
    bulkDelete: 'Sil',
    bulkClear: 'Seçimi temizle',
    bulkWorking: 'İşleniyor...',
    confirmBulkDelete: (n) => `${n} haberi silmek istediğinizden emin misiniz? Bu geri alınamaz.`,
    confirmDeletePublished: (n) => `Seçimde ${n} YAYINDA (sitede görünen) haber var. Onları da silmek için OK, sadece yayında olmayanları silmek için Cancel.`,
    bulkResult: (done, skipped) => `${done} haber işlendi${skipped ? `, ${skipped} atlandı` : ''}.`,
    toastDeleted: 'Haber silindi.',
    loadFailed: 'Haberler yüklenemedi',
    loading: 'Yükleniyor...',
    pagePrev: '← Önceki',
    pageNext: 'Sonraki →',
    pageInfo: (page, pages, total) => `Sayfa ${page} / ${pages} · ${total} haber`,
  },
};

export default function DashboardXeberlerPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split("/")[1]);
  const copy = pageCopy[locale];

  const [filter, setFilter] = useState<ListFilter>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<AdminNewsRow[]>([]);
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  async function loadNews(nextFilter: ListFilter, nextPage: number) {
    // TASK-0493: never carry a selection over to another tab/page while it loads.
    setSelected(new Set());
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nextFilter === "showcase") params.set("showcase", "1");
      else if (nextFilter !== "all") params.set("status", nextFilter);
      params.set("page", String(nextPage));
      params.set("pageSize", String(PAGE_SIZE));

      const response = await fetch(`/api/news/admin?${params.toString()}`);
      const payload = (await response.json()) as {
        data?: AdminNewsRow[];
        error?: string;
        total?: number;
      };

      if (!response.ok) {
        throw new Error(payload.error || `load failed (${response.status})`);
      }

      setItems(payload.data || []);
      setTotal(payload.total ?? 0);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : copy.loadFailed,
      );
      setItems([]);
      setTotal(0);
    } finally {
      setSelected(new Set());
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNews(filter, page);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when the tab or page changes
  }, [filter, page]);

  function changeFilter(next: ListFilter) {
    setFilter(next);
    setPage(1);
  }

  async function deleteItem(id: number) {
    if (!window.confirm(copy.confirmDelete)) return;
    setError(null);
    setToast(null);
    try {
      const response = await fetch(`/api/news/admin/${id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
      };
      if (!response.ok)
        throw new Error(payload.error || `delete failed (${response.status})`);
      setToast(copy.toastDeleted);
      await loadNews(filter, page);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : `delete failed`,
      );
    }
  }

  async function updateItem(
    id: number,
    body: { status?: FilterStatus; isEditorPick?: boolean },
  ) {
    setError(null);
    setToast(null);
    try {
      const response = await fetch(`/api/news/admin/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        source?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error || `update failed (${response.status})`);
      }

      setToast(copy.toastUpdated);
      await loadNews(filter, page);
    } catch (updateError) {
      setError(
        updateError instanceof Error ? updateError.message : `update failed`,
      );
    }
  }

  async function runBulk(action: BulkAction) {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (
      action === "delete" &&
      !window.confirm(copy.confirmBulkDelete(ids.length))
    )
      return;
    // TASK-0493: published articles need a separate, explicit confirmation.
    const publishedCount = items.filter(
      (item) => selected.has(item.id) && item.status === "approved",
    ).length;
    const includeApproved =
      action === "delete" &&
      publishedCount > 0 &&
      window.confirm(copy.confirmDeletePublished(publishedCount));

    setBulkBusy(true);
    setError(null);
    setToast(null);
    try {
      const response = await fetch("/api/news/admin/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, action, includeApproved }),
      });
      const payload = (await response.json()) as {
        success?: boolean;
        error?: string;
        processed?: number[];
        skipped?: Array<{ id: number; reason: string }>;
      };
      if (!response.ok)
        throw new Error(
          payload.error || `bulk ${action} failed (${response.status})`,
        );
      setToast(
        copy.bulkResult(
          payload.processed?.length ?? 0,
          payload.skipped?.length ?? 0,
        ),
      );
      // Deleting the last rows of the last page → step back one page.
      const remaining =
        total - (action === "delete" ? (payload.processed?.length ?? 0) : 0);
      const lastPage = Math.max(1, Math.ceil(remaining / PAGE_SIZE));
      if (page > lastPage) setPage(lastPage);
      else await loadNews(filter, page);
    } catch (bulkError) {
      setError(
        bulkError instanceof Error
          ? bulkError.message
          : `bulk ${action} failed`,
      );
    } finally {
      setBulkBusy(false);
    }
  }

  function toggleRow(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const allOnPageSelected =
    items.length > 0 && items.every((item) => selected.has(item.id));
  function toggleAllOnPage() {
    setSelected(
      allOnPageSelected ? new Set() : new Set(items.map((item) => item.id)),
    );
  }

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const filterButtons: [ListFilter, string][] = [
    ["all", copy.filterAll],
    ["fetched", copy.filterFetched],
    ["translated", copy.filterTranslated],
    ["approved", copy.filterApproved],
    ["rejected", copy.filterRejected],
    ["showcase", copy.filterShowcase],
  ];

  const statusLabel: Record<FilterStatus, string> = {
    all: copy.filterAll,
    fetched: copy.filterFetched,
    translated: copy.filterTranslated,
    approved: copy.filterApproved,
    rejected: copy.filterRejected,
  };

  const statusTone: Record<FilterStatus, string> = {
    all: "bg-slate-100 text-slate-700",
    fetched: "bg-amber-50 text-amber-800",
    translated: "bg-[#EEF4FF] text-[#0A5BD6]",
    approved: "bg-emerald-50 text-emerald-700",
    rejected: "bg-rose-50 text-rose-700",
  };

  function rowBadges(item: AdminNewsRow): Array<[string, string]> {
    const badges: Array<[string, string]> = [];
    if (item.isManset)
      badges.push([copy.badgeManset, "bg-rose-50 text-rose-800 ring-rose-200"]);
    if (item.isTop)
      badges.push([
        copy.badgeTop,
        "bg-violet-50 text-violet-800 ring-violet-200",
      ]);
    if (item.isGundem)
      badges.push([copy.badgeGundem, "bg-sky-50 text-sky-800 ring-sky-200"]);
    if (item.newsType === "photo")
      badges.push([
        copy.badgePhoto,
        "bg-slate-100 text-slate-800 ring-slate-200",
      ]);
    if (item.newsType === "video")
      badges.push([
        copy.badgeVideo,
        "bg-slate-100 text-slate-800 ring-slate-200",
      ]);
    if (item.isEditorPick)
      badges.push([
        copy.editorPick,
        "bg-amber-50 text-amber-900 ring-amber-200",
      ]);
    return badges;
  }

  const actionBtn =
    "inline-flex h-7 items-center whitespace-nowrap rounded-full px-2.5 text-[12px] font-semibold transition-colors";
  const bulkBtn =
    "inline-flex h-9 items-center whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <div className="min-h-full bg-[#F2F2F7] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[32px] font-bold tracking-tight text-slate-900 sm:text-[38px]">
              {copy.pageTitle}
            </h1>
            <p className="mt-1 text-[15px] text-slate-600">
              {copy.pageSubtitle}
            </p>
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
                onClick={() => changeFilter(value)}
                aria-pressed={filter === value}
                className={`h-9 whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${
                  filter === value
                    ? "bg-[#EEF4FF] text-slate-900"
                    : "text-slate-700 hover:bg-slate-50"
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

        {selected.size > 0 ? (
          <div
            role="toolbar"
            aria-label={copy.selectedCount(selected.size)}
            className="sticky top-2 z-20 flex flex-wrap items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
          >
            <span className="mr-auto text-[14px] font-semibold text-slate-900">
              {bulkBusy ? copy.bulkWorking : copy.selectedCount(selected.size)}
            </span>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => void runBulk("approve")}
              className={`${bulkBtn} bg-emerald-50 text-emerald-800 hover:bg-emerald-100`}
            >
              {copy.bulkApprove} ({selected.size})
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => void runBulk("reject")}
              className={`${bulkBtn} bg-rose-50 text-rose-800 hover:bg-rose-100`}
            >
              {copy.bulkReject} ({selected.size})
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => void runBulk("delete")}
              className={`${bulkBtn} bg-red-600 text-white hover:bg-red-700`}
            >
              {copy.bulkDelete} ({selected.size})
            </button>
            <button
              type="button"
              disabled={bulkBusy}
              onClick={() => setSelected(new Set())}
              className={`${bulkBtn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
            >
              {copy.bulkClear}
            </button>
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] table-fixed text-sm">
              <colgroup>
                <col className="w-11" />
                <col />
                <col />
                <col className="w-[150px]" />
                <col className="w-[150px]" />
                <col className="w-[100px]" />
                <col className="w-[196px]" />
              </colgroup>
              <thead className="text-left text-[12px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-4">
                    <input
                      type="checkbox"
                      checked={allOnPageSelected}
                      onChange={toggleAllOnPage}
                      disabled={loading || items.length === 0}
                      aria-label={copy.selectAllOnPage}
                      title={copy.selectAllOnPage}
                      className="h-4 w-4 cursor-pointer accent-[#0A5BD6]"
                    />
                  </th>
                  <th className="px-3 py-4 font-semibold">
                    {copy.colOriginal}
                  </th>
                  <th className="px-3 py-4 font-semibold">
                    {copy.colAzTranslation}
                  </th>
                  <th className="px-3 py-4 font-semibold">{copy.colSource}</th>
                  <th className="px-3 py-4 font-semibold">{copy.colStatus}</th>
                  <th className="px-3 py-4 font-semibold">{copy.colDate}</th>
                  <th className="px-3 py-4 font-semibold">{copy.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const source = sourceLabel(item);
                  const badges = rowBadges(item);
                  const isSelected = selected.has(item.id);
                  return (
                    <tr
                      key={item.id}
                      className={`border-t border-slate-100 align-top transition-colors ${
                        isSelected ? "bg-[#F5F8FF]" : "hover:bg-[#F9F9FB]"
                      }`}
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(item.id)}
                          disabled={loading}
                          aria-label={`${copy.selectRow} #${item.id}`}
                          className="mt-0.5 h-4 w-4 cursor-pointer accent-[#0A5BD6]"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div
                          className="line-clamp-2 break-words font-medium text-slate-900"
                          title={item.title}
                        >
                          {item.title}
                        </div>
                        <div className="mt-1 text-[12px] text-slate-500">
                          {item.category}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-slate-700">
                        {item.titleAz ? (
                          <div
                            className="line-clamp-2 break-words"
                            title={item.titleAz}
                          >
                            {item.titleAz}
                          </div>
                        ) : (
                          <span className="text-slate-500">
                            {copy.pendingTranslation}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div
                          className="truncate text-slate-700"
                          title={source ?? undefined}
                        >
                          {source || (
                            <span className="text-slate-500">
                              {copy.noSource}
                            </span>
                          )}
                        </div>
                        {item.origin ? (
                          <span className="mt-1 inline-flex rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                            {item.origin}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                            statusTone[item.status] || statusTone.all
                          }`}
                        >
                          {statusLabel[item.status] || item.status}
                        </span>
                        {badges.length > 0 ? (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {badges.map(([label, tone]) => (
                              <span
                                key={label}
                                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tone}`}
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 text-[13px] text-slate-600 tabular-nums">
                        {formatAzDate(item.publishedAt)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          <Link
                            href={`/dashboard/xeberler/${item.id}`}
                            className={`${actionBtn} bg-[#EEF4FF] text-[#0A5BD6] hover:bg-[#E0EBFF]`}
                          >
                            {copy.actionEdit}
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              void updateItem(item.id, { status: "approved" })
                            }
                            className={`${actionBtn} bg-emerald-50 text-emerald-700 hover:bg-emerald-100`}
                          >
                            {copy.actionApprove}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void updateItem(item.id, {
                                status: "rejected",
                                isEditorPick: false,
                              })
                            }
                            className={`${actionBtn} bg-rose-50 text-rose-700 hover:bg-rose-100`}
                          >
                            {copy.actionReject}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void updateItem(item.id, {
                                isEditorPick: !item.isEditorPick,
                              })
                            }
                            aria-pressed={item.isEditorPick}
                            className={`${actionBtn} ${
                              item.isEditorPick
                                ? "bg-amber-100 text-amber-900"
                                : "bg-slate-100 text-slate-700 hover:bg-amber-50"
                            }`}
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
                  );
                })}
              </tbody>
            </table>
          </div>

          {loading && items.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-600">
              {copy.loading}
            </div>
          ) : null}

          {!loading && items.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-slate-600">
              {copy.emptyState}
            </div>
          ) : null}

          {total > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-3">
              <span className="text-[13px] text-slate-700 tabular-nums">
                {copy.pageInfo(page, pageCount, total)}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={loading || page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`${bulkBtn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
                >
                  {copy.pagePrev}
                </button>
                <button
                  type="button"
                  disabled={loading || page >= pageCount}
                  onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                  className={`${bulkBtn} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
                >
                  {copy.pageNext}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
