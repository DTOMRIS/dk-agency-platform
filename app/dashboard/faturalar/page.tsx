'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Loader2,
  Pencil,
  Receipt,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

// ── i18n ────────────────────────────────────────────────────────────

const pageCopy: Record<Locale, {
  // Page header
  pageTitle: string;
  pageSubtitle: string;
  // Header buttons
  btnCamera: string;
  btnCameraShort: string;
  btnManual: string;
  btnManualShort: string;
  btnImport: string;
  // Stats
  statTotal: string;
  statAmount: string;
  statAvg: string;
  statPending: string;
  statConfirmed: string;
  // Filters
  searchPlaceholder: string;
  // Bulk actions
  selectedCount: string;
  btnDelete: string;
  // Table headers
  thSupplier: string;
  thDate: string;
  thTotal: string;
  thSource: string;
  thConfidence: string;
  thStatus: string;
  // Table states
  loading: string;
  empty: string;
  // Pagination
  paginationOf: string;
  // Bulk delete confirm
  confirmDelete: string;
  // Source filter labels
  filterAll: string;
  srcCamera: string;
  srcOcr: string;
  srcManual: string;
  srcExcel: string;
  srcPdf: string;
  // Status labels
  statusDraft: string;
  statusConfirmed: string;
  statusDisputed: string;
  statusArchived: string;
  // OCR Modal
  ocrModalTitle: string;
  ocrCamera: string;
  ocrGallery: string;
  ocrFileHint: string;
  ocrCompressing: string;
  ocrCompressionLabel: string;
  ocrCompressionSuffix: string;
  ocrSuccess: string;
  ocrReselect: string;
  ocrReading: string;
  ocrReadBtn: string;
  ocrClose: string;
  ocrFailed: string;
  // Manual Modal
  manualModalTitle: string;
  manualSupplierLabel: string;
  manualSupplierPlaceholder: string;
  manualVoenLabel: string;
  manualVoenPlaceholder: string;
  manualInvoiceNoLabel: string;
  manualDateLabel: string;
  manualItemsLabel: string;
  manualItemNamePlaceholder: string;
  manualItemQtyPlaceholder: string;
  manualTotalLabel: string;
  manualSaving: string;
  manualSave: string;
  manualErrSupplier: string;
  manualErrItems: string;
  manualSavedOk: string;
  manualSavedLocal: string;
  // Manual units
  unitKg: string;
  unitLitre: string;
  unitPcs: string;
  unitBox: string;
  unitPack: string;
  // Import Modal
  importModalTitle: string;
  importExcelLabel: string;
  importPdfLabel: string;
  importPdfHint: string;
  importParsingPdf: string;
  importParsingExcel: string;
  importErrorsLabel: string;
  importRowLabel: string;
  importPreviewSupplier: string;
  importPreviewProduct: string;
  importPreviewQty: string;
  importPreviewPrice: string;
  importMoreRows: string;
  importSuccess: string;
  importBtn: string;
  importClose: string;
  importReselect: string;
  importCancel: string;
  importScannedPdf: string;
  importRowsFound: string;
  importErrors: string;
}> = {
  az: {
    pageTitle: 'Faturalar',
    pageSubtitle: 'Fatura OCR, manual giriş və import idarəsi',
    btnCamera: 'Kamera / Yüklə',
    btnCameraShort: 'Yüklə',
    btnManual: 'Əl ilə daxil et',
    btnManualShort: 'Manual',
    btnImport: 'Import',
    statTotal: 'Cəmi fatura',
    statAmount: 'Ümumi məbləğ',
    statAvg: 'Ortalama',
    statPending: 'Gözləyən',
    statConfirmed: 'təsdiqlənib',
    searchPlaceholder: 'Tədarükçü axtar...',
    selectedCount: 'seçilib',
    btnDelete: 'Sil',
    thSupplier: 'Tədarükçü',
    thDate: 'Tarix',
    thTotal: 'Yekun',
    thSource: 'Mənbə',
    thConfidence: 'Dəqiqlik',
    thStatus: 'Status',
    loading: 'Yüklənir...',
    empty: 'Fatura tapılmadı',
    paginationOf: 'faturadan',
    confirmDelete: 'fatura silinsin?',
    filterAll: 'Hamısı',
    srcCamera: 'Kamera',
    srcOcr: 'OCR',
    srcManual: 'Əl ilə',
    srcExcel: 'Excel',
    srcPdf: 'PDF',
    statusDraft: 'Qaralama',
    statusConfirmed: 'Təsdiqlənib',
    statusDisputed: 'Mübahisəli',
    statusArchived: 'Arxiv',
    ocrModalTitle: 'Fatura Yüklə / Kamera',
    ocrCamera: 'Kamera ilə çək',
    ocrGallery: 'Qaleriya / Fayl seç',
    ocrFileHint: 'JPEG, PNG, WebP · Maks 5MB',
    ocrCompressing: 'Şəkil sıxılır...',
    ocrCompressionLabel: 'Sıxılma:',
    ocrCompressionSuffix: 'azalma',
    ocrSuccess: 'OCR uğurlu!',
    ocrReselect: 'Yenidən seç',
    ocrReading: 'Oxunur...',
    ocrReadBtn: 'AI ilə Oxu',
    ocrClose: 'Bağla',
    ocrFailed: 'OCR uğursuz oldu',
    manualModalTitle: 'Əl ilə Fatura Daxil Et',
    manualSupplierLabel: 'Tədarükçü *',
    manualSupplierPlaceholder: 'Metro, Bravo...',
    manualVoenLabel: 'VÖEN',
    manualVoenPlaceholder: '10 rəqəm',
    manualInvoiceNoLabel: 'Faktura No',
    manualDateLabel: 'Tarix *',
    manualItemsLabel: 'Məhsullar *',
    manualItemNamePlaceholder: 'Məhsul adı',
    manualItemQtyPlaceholder: 'Miq.',
    manualTotalLabel: 'Yekun:',
    manualSaving: 'Saxlanılır...',
    manualSave: 'Təsdiqlə və Saxla',
    manualErrSupplier: 'Tədarükçü adı daxil edin',
    manualErrItems: 'Ən azı 1 məhsul daxil edin',
    manualSavedOk: 'Fatura saxlanıldı!',
    manualSavedLocal: 'Fatura saxlanıldı (lokal)!',
    unitKg: 'kq',
    unitLitre: 'litr',
    unitPcs: 'əd',
    unitBox: 'qutu',
    unitPack: 'paket',
    importModalTitle: 'Fatura Import',
    importExcelLabel: 'Excel / CSV Import',
    importPdfLabel: 'PDF Fatura Import',
    importPdfHint: '.pdf (digital və ya skan)',
    importParsingPdf: 'PDF oxunur...',
    importParsingExcel: 'Excel oxunur...',
    importErrorsLabel: 'Xətalar:',
    importRowLabel: 'Sətir',
    importPreviewSupplier: 'Tədarükçü',
    importPreviewProduct: 'Məhsul',
    importPreviewQty: 'Miq.',
    importPreviewPrice: 'Qiy.',
    importMoreRows: 'sətir daha',
    importSuccess: 'sətir import edildi!',
    importBtn: 'sətri import et',
    importClose: 'Bağla',
    importReselect: 'Yenidən seç',
    importCancel: 'Ləğv et',
    importScannedPdf: 'skan edilmiş PDF-dir — text tapılmadı. Şəkil kimi OCR yükləyin.',
    importRowsFound: 'sətir tapıldı,',
    importErrors: 'xəta',
  },
  ru: {
    pageTitle: 'Счета-фактуры',
    pageSubtitle: 'Управление OCR, ручным вводом и импортом счетов',
    btnCamera: 'Камера / Загрузить',
    btnCameraShort: 'Загрузить',
    btnManual: 'Ввести вручную',
    btnManualShort: 'Вручную',
    btnImport: 'Импорт',
    statTotal: 'Всего счетов',
    statAmount: 'Общая сумма',
    statAvg: 'Среднее',
    statPending: 'Ожидающие',
    statConfirmed: 'подтверждено',
    searchPlaceholder: 'Поиск поставщика...',
    selectedCount: 'выбрано',
    btnDelete: 'Удалить',
    thSupplier: 'Поставщик',
    thDate: 'Дата',
    thTotal: 'Итого',
    thSource: 'Источник',
    thConfidence: 'Точность',
    thStatus: 'Статус',
    loading: 'Загрузка...',
    empty: 'Счета не найдены',
    paginationOf: 'из',
    confirmDelete: 'счетов будет удалено?',
    filterAll: 'Все',
    srcCamera: 'Камера',
    srcOcr: 'OCR',
    srcManual: 'Вручную',
    srcExcel: 'Excel',
    srcPdf: 'PDF',
    statusDraft: 'Черновик',
    statusConfirmed: 'Подтверждён',
    statusDisputed: 'Спорный',
    statusArchived: 'Архив',
    ocrModalTitle: 'Загрузить счёт / Камера',
    ocrCamera: 'Сфотографировать',
    ocrGallery: 'Галерея / Выбрать файл',
    ocrFileHint: 'JPEG, PNG, WebP · Макс 5МБ',
    ocrCompressing: 'Сжатие изображения...',
    ocrCompressionLabel: 'Сжатие:',
    ocrCompressionSuffix: 'уменьшение',
    ocrSuccess: 'OCR успешно!',
    ocrReselect: 'Выбрать снова',
    ocrReading: 'Чтение...',
    ocrReadBtn: 'Читать с ИИ',
    ocrClose: 'Закрыть',
    ocrFailed: 'OCR не удался',
    manualModalTitle: 'Ввести счёт вручную',
    manualSupplierLabel: 'Поставщик *',
    manualSupplierPlaceholder: 'Metro, Bravo...',
    manualVoenLabel: 'ИНН',
    manualVoenPlaceholder: '10 цифр',
    manualInvoiceNoLabel: 'Номер счёта',
    manualDateLabel: 'Дата *',
    manualItemsLabel: 'Товары *',
    manualItemNamePlaceholder: 'Название товара',
    manualItemQtyPlaceholder: 'Кол.',
    manualTotalLabel: 'Итого:',
    manualSaving: 'Сохранение...',
    manualSave: 'Подтвердить и сохранить',
    manualErrSupplier: 'Введите название поставщика',
    manualErrItems: 'Добавьте хотя бы 1 товар',
    manualSavedOk: 'Счёт сохранён!',
    manualSavedLocal: 'Счёт сохранён (локально)!',
    unitKg: 'кг',
    unitLitre: 'литр',
    unitPcs: 'шт',
    unitBox: 'коробка',
    unitPack: 'пакет',
    importModalTitle: 'Импорт счетов',
    importExcelLabel: 'Импорт Excel / CSV',
    importPdfLabel: 'Импорт PDF счёта',
    importPdfHint: '.pdf (цифровой или скан)',
    importParsingPdf: 'Чтение PDF...',
    importParsingExcel: 'Чтение Excel...',
    importErrorsLabel: 'Ошибки:',
    importRowLabel: 'Строка',
    importPreviewSupplier: 'Поставщик',
    importPreviewProduct: 'Товар',
    importPreviewQty: 'Кол.',
    importPreviewPrice: 'Цена',
    importMoreRows: 'строк ещё',
    importSuccess: 'строк импортировано!',
    importBtn: 'импортировать строк',
    importClose: 'Закрыть',
    importReselect: 'Выбрать снова',
    importCancel: 'Отмена',
    importScannedPdf: 'является сканом — текст не найден. Загрузите как изображение через OCR.',
    importRowsFound: 'строк найдено,',
    importErrors: 'ошибок',
  },
  en: {
    pageTitle: 'Invoices',
    pageSubtitle: 'Manage OCR, manual entry and import of invoices',
    btnCamera: 'Camera / Upload',
    btnCameraShort: 'Upload',
    btnManual: 'Enter manually',
    btnManualShort: 'Manual',
    btnImport: 'Import',
    statTotal: 'Total invoices',
    statAmount: 'Total amount',
    statAvg: 'Average',
    statPending: 'Pending',
    statConfirmed: 'confirmed',
    searchPlaceholder: 'Search supplier...',
    selectedCount: 'selected',
    btnDelete: 'Delete',
    thSupplier: 'Supplier',
    thDate: 'Date',
    thTotal: 'Total',
    thSource: 'Source',
    thConfidence: 'Confidence',
    thStatus: 'Status',
    loading: 'Loading...',
    empty: 'No invoices found',
    paginationOf: 'of',
    confirmDelete: 'invoices will be deleted?',
    filterAll: 'All',
    srcCamera: 'Camera',
    srcOcr: 'OCR',
    srcManual: 'Manual',
    srcExcel: 'Excel',
    srcPdf: 'PDF',
    statusDraft: 'Draft',
    statusConfirmed: 'Confirmed',
    statusDisputed: 'Disputed',
    statusArchived: 'Archived',
    ocrModalTitle: 'Upload Invoice / Camera',
    ocrCamera: 'Take a photo',
    ocrGallery: 'Gallery / Choose file',
    ocrFileHint: 'JPEG, PNG, WebP · Max 5MB',
    ocrCompressing: 'Compressing image...',
    ocrCompressionLabel: 'Compressed:',
    ocrCompressionSuffix: 'reduction',
    ocrSuccess: 'OCR successful!',
    ocrReselect: 'Choose again',
    ocrReading: 'Reading...',
    ocrReadBtn: 'Read with AI',
    ocrClose: 'Close',
    ocrFailed: 'OCR failed',
    manualModalTitle: 'Enter Invoice Manually',
    manualSupplierLabel: 'Supplier *',
    manualSupplierPlaceholder: 'Metro, Bravo...',
    manualVoenLabel: 'Tax ID',
    manualVoenPlaceholder: '10 digits',
    manualInvoiceNoLabel: 'Invoice No.',
    manualDateLabel: 'Date *',
    manualItemsLabel: 'Items *',
    manualItemNamePlaceholder: 'Item name',
    manualItemQtyPlaceholder: 'Qty.',
    manualTotalLabel: 'Total:',
    manualSaving: 'Saving...',
    manualSave: 'Confirm & Save',
    manualErrSupplier: 'Enter supplier name',
    manualErrItems: 'Add at least 1 item',
    manualSavedOk: 'Invoice saved!',
    manualSavedLocal: 'Invoice saved (local)!',
    unitKg: 'kg',
    unitLitre: 'litre',
    unitPcs: 'pcs',
    unitBox: 'box',
    unitPack: 'pack',
    importModalTitle: 'Import Invoices',
    importExcelLabel: 'Excel / CSV Import',
    importPdfLabel: 'PDF Invoice Import',
    importPdfHint: '.pdf (digital or scanned)',
    importParsingPdf: 'Reading PDF...',
    importParsingExcel: 'Reading Excel...',
    importErrorsLabel: 'Errors:',
    importRowLabel: 'Row',
    importPreviewSupplier: 'Supplier',
    importPreviewProduct: 'Product',
    importPreviewQty: 'Qty.',
    importPreviewPrice: 'Price',
    importMoreRows: 'more rows',
    importSuccess: 'rows imported!',
    importBtn: 'Import rows',
    importClose: 'Close',
    importReselect: 'Choose again',
    importCancel: 'Cancel',
    importScannedPdf: 'is a scanned PDF — no text found. Upload as image via OCR.',
    importRowsFound: 'rows found,',
    importErrors: 'errors',
  },
  tr: {
    pageTitle: 'Faturalar',
    pageSubtitle: 'Fatura OCR, manuel giriş ve içe aktarma yönetimi',
    btnCamera: 'Kamera / Yükle',
    btnCameraShort: 'Yükle',
    btnManual: 'Manuel gir',
    btnManualShort: 'Manuel',
    btnImport: 'İçe Aktar',
    statTotal: 'Toplam fatura',
    statAmount: 'Toplam tutar',
    statAvg: 'Ortalama',
    statPending: 'Bekleyen',
    statConfirmed: 'onaylandı',
    searchPlaceholder: 'Tedarikçi ara...',
    selectedCount: 'seçildi',
    btnDelete: 'Sil',
    thSupplier: 'Tedarikçi',
    thDate: 'Tarih',
    thTotal: 'Toplam',
    thSource: 'Kaynak',
    thConfidence: 'Doğruluk',
    thStatus: 'Durum',
    loading: 'Yükleniyor...',
    empty: 'Fatura bulunamadı',
    paginationOf: 'faturadan',
    confirmDelete: 'fatura silinsin mi?',
    filterAll: 'Tümü',
    srcCamera: 'Kamera',
    srcOcr: 'OCR',
    srcManual: 'Manuel',
    srcExcel: 'Excel',
    srcPdf: 'PDF',
    statusDraft: 'Taslak',
    statusConfirmed: 'Onaylandı',
    statusDisputed: 'İtirazlı',
    statusArchived: 'Arşiv',
    ocrModalTitle: 'Fatura Yükle / Kamera',
    ocrCamera: 'Kamerayla çek',
    ocrGallery: 'Galeri / Dosya seç',
    ocrFileHint: 'JPEG, PNG, WebP · Maks 5MB',
    ocrCompressing: 'Görüntü sıkıştırılıyor...',
    ocrCompressionLabel: 'Sıkıştırma:',
    ocrCompressionSuffix: 'azalma',
    ocrSuccess: 'OCR başarılı!',
    ocrReselect: 'Yeniden seç',
    ocrReading: 'Okunuyor...',
    ocrReadBtn: 'AI ile Oku',
    ocrClose: 'Kapat',
    ocrFailed: 'OCR başarısız',
    manualModalTitle: 'Manuel Fatura Gir',
    manualSupplierLabel: 'Tedarikçi *',
    manualSupplierPlaceholder: 'Metro, Bravo...',
    manualVoenLabel: 'Vergi No',
    manualVoenPlaceholder: '10 rakam',
    manualInvoiceNoLabel: 'Fatura No',
    manualDateLabel: 'Tarih *',
    manualItemsLabel: 'Ürünler *',
    manualItemNamePlaceholder: 'Ürün adı',
    manualItemQtyPlaceholder: 'Mik.',
    manualTotalLabel: 'Toplam:',
    manualSaving: 'Kaydediliyor...',
    manualSave: 'Onayla ve Kaydet',
    manualErrSupplier: 'Tedarikçi adı girin',
    manualErrItems: 'En az 1 ürün girin',
    manualSavedOk: 'Fatura kaydedildi!',
    manualSavedLocal: 'Fatura kaydedildi (yerel)!',
    unitKg: 'kg',
    unitLitre: 'litre',
    unitPcs: 'adet',
    unitBox: 'kutu',
    unitPack: 'paket',
    importModalTitle: 'Fatura İçe Aktar',
    importExcelLabel: 'Excel / CSV İçe Aktar',
    importPdfLabel: 'PDF Fatura İçe Aktar',
    importPdfHint: '.pdf (dijital veya tarama)',
    importParsingPdf: 'PDF okunuyor...',
    importParsingExcel: 'Excel okunuyor...',
    importErrorsLabel: 'Hatalar:',
    importRowLabel: 'Satır',
    importPreviewSupplier: 'Tedarikçi',
    importPreviewProduct: 'Ürün',
    importPreviewQty: 'Mik.',
    importPreviewPrice: 'Fiy.',
    importMoreRows: 'satır daha',
    importSuccess: 'satır içe aktarıldı!',
    importBtn: 'satırı içe aktar',
    importClose: 'Kapat',
    importReselect: 'Yeniden seç',
    importCancel: 'İptal',
    importScannedPdf: 'taranmış PDF — metin bulunamadı. Görüntü olarak OCR ile yükleyin.',
    importRowsFound: 'satır bulundu,',
    importErrors: 'hata',
  },
};

// ── Types ───────────────────────────────────────────────────────────

interface InvoiceRow {
  id: number;
  supplierName: string;
  supplierVoen: string | null;
  invoiceNumber: string | null;
  invoiceDate: string;
  grandTotal: number;
  currency: string;
  status: string;
  source: string;
  ocrConfidence: number | null;
  createdAt: string;
}

interface InvoiceStats {
  totalCount: number;
  totalAmount: number;
  avgAmount: number;
  draftCount: number;
  confirmedCount: number;
}

interface ManualItem {
  name: string;
  quantity: string;
  unit: string;
  unitPrice: string;
}

type ModalType = null | 'ocr' | 'manual' | 'import';

// ── Mock Data ───────────────────────────────────────────────────────

const MOCK_INVOICES: InvoiceRow[] = [
  { id: 1, supplierName: 'Metro Cash & Carry', supplierVoen: '1234567890', invoiceNumber: 'FC-004521', invoiceDate: '2026-04-27', grandTotal: 24580, currency: 'AZN', status: 'confirmed', source: 'ocr_upload', ocrConfidence: 0.92, createdAt: '2026-04-27T10:00:00Z' },
  { id: 2, supplierName: 'Bravo Supermarket', supplierVoen: '9876543210', invoiceNumber: 'BRV-00891', invoiceDate: '2026-04-26', grandTotal: 8920, currency: 'AZN', status: 'draft', source: 'ocr_camera', ocrConfidence: 0.78, createdAt: '2026-04-26T14:30:00Z' },
  { id: 3, supplierName: 'Bazarstore', supplierVoen: null, invoiceNumber: null, invoiceDate: '2026-04-25', grandTotal: 15600, currency: 'AZN', status: 'confirmed', source: 'manual', ocrConfidence: null, createdAt: '2026-04-25T09:15:00Z' },
  { id: 4, supplierName: 'Araz Supermarket', supplierVoen: '5678901234', invoiceNumber: 'ARZ-2204', invoiceDate: '2026-04-24', grandTotal: 124000, currency: 'AZN', status: 'confirmed', source: 'excel', ocrConfidence: null, createdAt: '2026-04-24T11:00:00Z' },
  { id: 5, supplierName: 'Şirin Çörək', supplierVoen: null, invoiceNumber: 'SC-055', invoiceDate: '2026-04-23', grandTotal: 4500, currency: 'AZN', status: 'draft', source: 'ocr_camera', ocrConfidence: 0.65, createdAt: '2026-04-23T08:00:00Z' },
  { id: 6, supplierName: 'Qafqaz Distribusiya', supplierVoen: '1122334455', invoiceNumber: 'QD-10042', invoiceDate: '2026-04-22', grandTotal: 67800, currency: 'AZN', status: 'confirmed', source: 'pdf', ocrConfidence: 0.88, createdAt: '2026-04-22T16:45:00Z' },
];

const MOCK_STATS: InvoiceStats = { totalCount: 6, totalAmount: 245400, avgAmount: 40900, draftCount: 2, confirmedCount: 4 };

// ── Helpers ─────────────────────────────────────────────────────────

function formatMoney(qepik: number, currency = 'AZN') {
  return `${(qepik / 100).toFixed(2)} ${currency}`;
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
}

function sourceLabel(s: string, copy: (typeof pageCopy)[Locale]) {
  const map: Record<string, { label: string; icon: string }> = {
    ocr_camera: { label: copy.srcCamera, icon: '📷' },
    ocr_upload: { label: copy.srcOcr, icon: '🔍' },
    manual: { label: copy.srcManual, icon: '✏️' },
    excel: { label: copy.srcExcel, icon: '📊' },
    pdf: { label: copy.srcPdf, icon: '📄' },
  };
  return map[s] ?? { label: s, icon: '📎' };
}

function statusBadge(s: string, copy: (typeof pageCopy)[Locale]) {
  const map: Record<string, { label: string; cls: string }> = {
    draft: { label: copy.statusDraft, cls: 'bg-amber-100 text-amber-700' },
    confirmed: { label: copy.statusConfirmed, cls: 'bg-emerald-100 text-emerald-700' },
    disputed: { label: copy.statusDisputed, cls: 'bg-red-100 text-red-700' },
    archived: { label: copy.statusArchived, cls: 'bg-slate-100 text-slate-600' },
  };
  const b = map[s] ?? { label: s, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${b.cls}`}>{b.label}</span>;
}

function confidenceBadge(c: number | null) {
  if (c === null) return null;
  const pct = Math.round(c * 100);
  const cls = pct >= 85 ? 'text-emerald-600' : pct >= 70 ? 'text-amber-600' : 'text-red-500';
  return <span className={`text-xs font-medium ${cls}`}>{pct}%</span>;
}

const EMPTY_ITEM: ManualItem = { name: '', quantity: '', unit: 'kq', unitPrice: '' };

// Lazy imports (client-only)
const compressImage = async (file: File) => {
  const { compressInvoiceImage } = await import('@/lib/invoice-ocr/image-compress');
  return compressInvoiceImage(file);
};

const parseExcel = async (buffer: ArrayBuffer) => {
  const { parseExcelFile } = await import('@/lib/invoice-ocr/excel-parser');
  return parseExcelFile(buffer);
};

// ── Overlay / Modal Shell ───────────────────────────────────────────

function ModalShell({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── OCR Upload Modal ────────────────────────────────────────────────

function OcrUploadModal({ open, onClose, onSuccess, copy }: {
  open: boolean;
  onClose: () => void;
  onSuccess: (inv: InvoiceRow) => void;
  copy: (typeof pageCopy)[Locale];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setFile(null);
    setPreview(null);
    setUploading(false);
    setCompressing(false);
    setCompressionInfo(null);
    setResult(null);
    setError(null);
  };

  const handleFile = async (f: File) => {
    setError(null);
    setResult(null);
    setCompressionInfo(null);

    // Client-side sıxılma
    if (f.size > 1 * 1024 * 1024) {
      setCompressing(true);
      try {
        const compressed = await compressImage(f);
        setFile(compressed.file);
        setCompressionInfo(`${(compressed.originalSize / 1024 / 1024).toFixed(1)}MB → ${(compressed.compressedSize / 1024 / 1024).toFixed(1)}MB (${compressed.reductionPercent}% ${copy.ocrCompressionSuffix})`);
      } catch {
        setFile(f); // sıxılma uğursuz, orijinalı istifadə et
      }
      setCompressing(false);
    } else {
      setFile(f);
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/invoice-ocr', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success && data.data) {
        setResult(data.data);
        // Listeye əlavə et (mock mode)
        const parsed = data.data as { supplier?: string; grandTotal?: number; date?: string; confidence?: number };
        onSuccess({
          id: Date.now(),
          supplierName: (parsed.supplier as string) || 'OCR Fatura',
          supplierVoen: null,
          invoiceNumber: null,
          invoiceDate: (parsed.date as string) || new Date().toISOString().slice(0, 10),
          grandTotal: Math.round(((parsed.grandTotal as number) || 0) * 100),
          currency: 'AZN',
          status: 'draft',
          source: 'ocr_upload',
          ocrConfidence: (parsed.confidence as number) || 0,
          createdAt: new Date().toISOString(),
        });
      } else {
        setError(data.error || copy.ocrFailed);
      }
    } catch (err) {
      setError(`Xəta: ${String(err)}`);
    }
    setUploading(false);
  };

  return (
    <ModalShell open={open} onClose={() => { reset(); onClose(); }} title={copy.ocrModalTitle}>
      {!file ? (
        <div className="flex flex-col gap-3">
          {/* Kamera — mobil-də arxa kamera açılır */}
          <button
            onClick={() => cameraRef.current?.click()}
            className="flex h-32 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#E11D48]/30 bg-red-50 text-[#E11D48] hover:border-[#E11D48] hover:bg-red-100 active:scale-[0.98]"
          >
            <Camera className="h-8 w-8" />
            <span className="text-sm font-medium">{copy.ocrCamera}</span>
          </button>
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />

          {/* Qaleriya / Fayl */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex h-20 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:bg-slate-50"
          >
            <Upload className="h-5 w-5" />
            <span className="text-sm">{copy.ocrGallery}</span>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />

          <p className="text-center text-xs text-slate-400">{copy.ocrFileHint}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Compressing */}
          {compressing && (
            <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
              <Loader2 className="h-4 w-4 animate-spin" /> {copy.ocrCompressing}
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="relative overflow-hidden rounded-xl border border-slate-200">
              {/* eslint-disable-next-line @next/next/no-img-element -- base64 preview, next/image not applicable */}
              <img src={preview} alt="Fatura" className="max-h-64 w-full object-contain" />
              {file && (
                <div className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-1 text-xs text-white">
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </div>
              )}
            </div>
          )}

          {/* Compression info */}
          {compressionInfo && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-700">
              {copy.ocrCompressionLabel} {compressionInfo}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          {/* OCR Result */}
          {result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <div className="mb-1 flex items-center gap-1 text-sm font-medium text-emerald-700">
                <Check className="h-4 w-4" /> {copy.ocrSuccess}
              </div>
              <pre className="max-h-40 overflow-auto text-xs text-emerald-800">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button onClick={() => { reset(); }} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">
              {copy.ocrReselect}
            </button>
            {!result && (
              <button
                onClick={() => void handleUpload()}
                disabled={uploading}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#E11D48] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#BE123C] disabled:opacity-60"
              >
                {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> {copy.ocrReading}</> : copy.ocrReadBtn}
              </button>
            )}
            {result && (
              <button
                onClick={() => { reset(); onClose(); }}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                {copy.ocrClose}
              </button>
            )}
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ── Manual Entry Modal ──────────────────────────────────────────────

function ManualEntryModal({ open, onClose, onSuccess, copy }: {
  open: boolean;
  onClose: () => void;
  onSuccess: (inv: InvoiceRow) => void;
  copy: (typeof pageCopy)[Locale];
}) {
  const [supplier, setSupplier] = useState('');
  const [voen, setVoen] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<ManualItem[]>([{ ...EMPTY_ITEM }]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const reset = () => {
    setSupplier('');
    setVoen('');
    setInvoiceNo('');
    setInvoiceDate(new Date().toISOString().slice(0, 10));
    setItems([{ ...EMPTY_ITEM }]);
    setSaving(false);
    setFeedback(null);
  };

  const updateItem = (idx: number, field: keyof ManualItem, val: string) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const addRows = (count: number) => {
    setItems((prev) => [...prev, ...Array.from({ length: count }, () => ({ ...EMPTY_ITEM }))]);
  };

  const grandTotal = items.reduce((sum, it) => {
    const qty = parseFloat(it.quantity) || 0;
    const price = parseFloat(it.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const handleSave = async () => {
    if (!supplier.trim()) { setFeedback(copy.manualErrSupplier); return; }
    const validItems = items.filter((it) => it.name.trim());
    if (validItems.length === 0) { setFeedback(copy.manualErrItems); return; }

    setSaving(true);
    setFeedback(null);

    const body = {
      supplierName: supplier.trim(),
      supplierVoen: voen.trim() || null,
      invoiceNumber: invoiceNo.trim() || null,
      invoiceDate,
      subtotal: Math.round(grandTotal * 100),
      vatAmount: 0,
      grandTotal: Math.round(grandTotal * 100),
      source: 'manual' as const,
      items: validItems.map((it, i) => ({
        name: it.name,
        quantity: parseFloat(it.quantity) || 0,
        unit: it.unit,
        unitPrice: Math.round((parseFloat(it.unitPrice) || 0) * 100),
        totalPrice: Math.round((parseFloat(it.quantity) || 0) * (parseFloat(it.unitPrice) || 0) * 100),
        sortOrder: i,
      })),
    };

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      // UI-ya əlavə et (DB əlçatan olmasa da)
      onSuccess({
        id: data.data?.id ?? Date.now(),
        supplierName: supplier.trim(),
        supplierVoen: voen.trim() || null,
        invoiceNumber: invoiceNo.trim() || null,
        invoiceDate,
        grandTotal: Math.round(grandTotal * 100),
        currency: 'AZN',
        status: 'draft',
        source: 'manual',
        ocrConfidence: null,
        createdAt: new Date().toISOString(),
      });

      setFeedback(copy.manualSavedOk);
      setTimeout(() => { reset(); onClose(); }, 800);
    } catch {
      // Offline/mock mode — yenə listeye əlavə et
      onSuccess({
        id: Date.now(),
        supplierName: supplier.trim(),
        supplierVoen: voen.trim() || null,
        invoiceNumber: invoiceNo.trim() || null,
        invoiceDate,
        grandTotal: Math.round(grandTotal * 100),
        currency: 'AZN',
        status: 'draft',
        source: 'manual',
        ocrConfidence: null,
        createdAt: new Date().toISOString(),
      });
      setFeedback(copy.manualSavedLocal);
      setTimeout(() => { reset(); onClose(); }, 800);
    }
    setSaving(false);
  };

  return (
    <ModalShell open={open} onClose={() => { reset(); onClose(); }} title={copy.manualModalTitle}>
      <div className="flex flex-col gap-4">
        {/* Supplier info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">{copy.manualSupplierLabel}</label>
            <input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder={copy.manualSupplierPlaceholder} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{copy.manualVoenLabel}</label>
            <input value={voen} onChange={(e) => setVoen(e.target.value)} placeholder={copy.manualVoenPlaceholder} maxLength={10} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#E11D48]" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">{copy.manualInvoiceNoLabel}</label>
            <input value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} placeholder="FC-001" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#E11D48]" />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-medium text-slate-500">{copy.manualDateLabel}</label>
            <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#E11D48]" />
          </div>
        </div>

        {/* Items */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-500">{copy.manualItemsLabel}</label>
            <div className="flex gap-1">
              <button onClick={() => addRows(1)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">+1</button>
              <button onClick={() => addRows(5)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">+5</button>
              <button onClick={() => addRows(10)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50">+10</button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2">
                <input value={item.name} onChange={(e) => updateItem(idx, 'name', e.target.value)} placeholder={copy.manualItemNamePlaceholder} className="h-9 min-w-0 flex-[3] rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-[#E11D48]" />
                <input value={item.quantity} onChange={(e) => updateItem(idx, 'quantity', e.target.value)} placeholder={copy.manualItemQtyPlaceholder} type="number" step="0.1" className="h-9 w-16 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-[#E11D48]" />
                <select value={item.unit} onChange={(e) => updateItem(idx, 'unit', e.target.value)} className="h-9 w-14 rounded-lg border border-slate-200 bg-white px-1 text-xs outline-none">
                  <option value="kq">{copy.unitKg}</option>
                  <option value="litr">{copy.unitLitre}</option>
                  <option value="əd">{copy.unitPcs}</option>
                  <option value="qutu">{copy.unitBox}</option>
                  <option value="paket">{copy.unitPack}</option>
                </select>
                <input value={item.unitPrice} onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)} placeholder="0.00" type="number" step="0.01" className="h-9 w-20 rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-[#E11D48]" />
                <button onClick={() => removeItem(idx)} className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500" title={copy.btnDelete}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <span className="text-sm font-medium text-slate-600">{copy.manualTotalLabel}</span>
          <span className="text-lg font-bold text-slate-900">{grandTotal.toFixed(2)} AZN</span>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`rounded-xl p-3 text-sm ${feedback.includes('saxlanıldı') || feedback.includes('saved') || feedback.includes('сохранён') || feedback.includes('kaydedildi') ? 'border border-emerald-200 bg-emerald-50 text-emerald-700' : 'border border-red-200 bg-red-50 text-red-700'}`}>
            {feedback}
          </div>
        )}

        {/* Save */}
        <button
          onClick={() => void handleSave()}
          disabled={saving}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#E11D48] text-sm font-medium text-white hover:bg-[#BE123C] disabled:opacity-60 active:scale-[0.98]"
        >
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> {copy.manualSaving}</> : <><Check className="h-4 w-4" /> {copy.manualSave}</>}
        </button>
      </div>
    </ModalShell>
  );
}

// ── Import Modal ────────────────────────────────────────────────────

interface ExcelPreviewRow {
  supplier?: string;
  productName?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
}

function ImportModal({ open, onClose, onSuccess, copy }: {
  open: boolean;
  onClose: () => void;
  onSuccess: (inv: InvoiceRow) => void;
  copy: (typeof pageCopy)[Locale];
}) {
  const excelRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ExcelPreviewRow[]>([]);
  const [parseErrors, setParseErrors] = useState<Array<{ row: number; field: string; error: string }>>([]);
  const [parseSummary, setParseSummary] = useState<string | null>(null);
  const [imported, setImported] = useState(false);
  const [importSource, setImportSource] = useState<'excel' | 'pdf'>('excel');

  const reset = () => { setParsing(false); setParsedRows([]); setParseErrors([]); setParseSummary(null); setImported(false); setImportSource('excel'); };

  const handleExcel = async (f: File) => {
    setImportSource('excel');
    setParsing(true);
    setParsedRows([]);
    setParseErrors([]);
    setParseSummary(null);

    try {
      const buffer = await f.arrayBuffer();
      const result = await parseExcel(buffer);

      setParsedRows(result.rows.slice(0, 20) as ExcelPreviewRow[]); // önizləmə: ilk 20
      setParseErrors(result.errors.slice(0, 10));
      setParseSummary(`${result.successRows} ${copy.importRowsFound} ${result.failedRows} ${copy.importErrors} · "${f.name}"`);
    } catch (err) {
      setParseSummary(`Xəta: ${String(err)}`);
    }
    setParsing(false);
  };

  const handleImport = () => {
    // Hər unikal tədarükçü üçün fatura yarat
    const supplierGroups = new Map<string, ExcelPreviewRow[]>();
    for (const row of parsedRows) {
      const key = row.supplier || 'Naməlum tədarükçü';
      const group = supplierGroups.get(key) ?? [];
      group.push(row);
      supplierGroups.set(key, group);
    }

    for (const [supplier, items] of supplierGroups) {
      const total = items.reduce((s, it) => s + ((it.quantity ?? 0) * (it.unitPrice ?? 0)), 0);
      onSuccess({
        id: Date.now() + Math.random(),
        supplierName: supplier,
        supplierVoen: null,
        invoiceNumber: null,
        invoiceDate: new Date().toISOString().slice(0, 10),
        grandTotal: Math.round(total * 100),
        currency: 'AZN',
        status: 'draft',
        source: importSource,
        ocrConfidence: null,
        createdAt: new Date().toISOString(),
      });
    }
    setImported(true);
  };

  const handlePdf = async (f: File) => {
    setImportSource('pdf');
    setParsing(true);
    setParsedRows([]);
    setParseErrors([]);
    setParseSummary(null);

    try {
      const formData = new FormData();
      formData.append('file', f);

      const res = await fetch('/api/invoice-pdf', { method: 'POST', body: formData });
      const json = (await res.json()) as {
        success: boolean;
        type?: string;
        error?: string;
        rows?: Array<{ supplier: string; productName: string; quantity: number | null; unit: string; unitPrice: number | null; date: string | null }>;
        errors?: Array<{ row: number; field: string; error: string }>;
        successRows?: number;
        failedRows?: number;
        pageCount?: number;
      };

      if (!json.success) {
        if (json.type === 'scanned') {
          setParseSummary(`"${f.name}" ${copy.importScannedPdf}`);
        } else {
          setParseSummary(`Xəta: ${json.error ?? 'PDF oxunmadı'}`);
        }
        setParsing(false);
        return;
      }

      const rows: ExcelPreviewRow[] = (json.rows ?? []).map((r) => ({
        supplier: r.supplier,
        productName: r.productName,
        quantity: r.quantity ?? undefined,
        unit: r.unit,
        unitPrice: r.unitPrice ?? undefined,
      }));

      setParsedRows(rows.slice(0, 20));
      setParseErrors((json.errors ?? []).slice(0, 10));
      setParseSummary(`${json.successRows ?? rows.length} ${copy.importRowsFound} ${json.failedRows ?? 0} ${copy.importErrors} · "${f.name}" (${json.pageCount ?? 1} səhifə)`);
    } catch (err) {
      setParseSummary(`Xəta: ${String(err)}`);
    }
    setParsing(false);
  };

  return (
    <ModalShell open={open} onClose={() => { reset(); onClose(); }} title={copy.importModalTitle}>
      <div className="flex flex-col gap-3">
        {!parseSummary && !parsing && (
          <>
            {/* Excel */}
            <button
              onClick={() => excelRef.current?.click()}
              className="flex h-20 items-center gap-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50 px-4 text-left hover:border-emerald-400 hover:bg-emerald-100 active:scale-[0.98]"
            >
              <FileSpreadsheet className="h-8 w-8 text-emerald-600" />
              <div>
                <div className="text-sm font-medium text-emerald-800">{copy.importExcelLabel}</div>
                <div className="text-xs text-emerald-600">.xlsx, .xls, .csv</div>
              </div>
            </button>
            <input ref={excelRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleExcel(f); }} />

            {/* PDF */}
            <button
              onClick={() => pdfRef.current?.click()}
              className="flex h-20 items-center gap-4 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50 px-4 text-left hover:border-blue-400 hover:bg-blue-100 active:scale-[0.98]"
            >
              <Receipt className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-800">{copy.importPdfLabel}</div>
                <div className="text-xs text-blue-600">{copy.importPdfHint}</div>
              </div>
            </button>
            <input ref={pdfRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handlePdf(f); }} />
          </>
        )}

        {/* Parsing */}
        {parsing && (
          <div className="flex items-center gap-2 py-8 justify-center text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" /> {importSource === 'pdf' ? copy.importParsingPdf : copy.importParsingExcel}
          </div>
        )}

        {/* Summary */}
        {parseSummary && (
          <div className={`rounded-xl border p-3 text-sm ${parsedRows.length > 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
            {parseSummary}
          </div>
        )}

        {/* Errors */}
        {parseErrors.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
            <div className="mb-1 text-xs font-medium text-amber-700">{copy.importErrorsLabel}</div>
            {parseErrors.map((e, i) => (
              <div key={i} className="text-xs text-amber-600">{copy.importRowLabel} {e.row}: {e.field} — {e.error}</div>
            ))}
          </div>
        )}

        {/* Preview table */}
        {parsedRows.length > 0 && !imported && (
          <>
            <div className="max-h-48 overflow-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-2 py-1.5 font-medium text-slate-500">{copy.importPreviewSupplier}</th>
                    <th className="px-2 py-1.5 font-medium text-slate-500">{copy.importPreviewProduct}</th>
                    <th className="px-2 py-1.5 font-medium text-slate-500">{copy.importPreviewQty}</th>
                    <th className="px-2 py-1.5 font-medium text-slate-500">{copy.importPreviewPrice}</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-2 py-1 text-slate-700">{row.supplier || '—'}</td>
                      <td className="px-2 py-1 text-slate-900">{row.productName || '—'}</td>
                      <td className="px-2 py-1 text-slate-600">{row.quantity ?? '—'} {row.unit ?? ''}</td>
                      <td className="px-2 py-1 text-slate-600">{row.unitPrice?.toFixed(2) ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedRows.length > 10 && (
              <div className="text-center text-xs text-slate-400">+ {parsedRows.length - 10} {copy.importMoreRows}</div>
            )}
          </>
        )}

        {/* Imported success */}
        {imported && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <Check className="mr-1 inline h-4 w-4" /> {parsedRows.length} {copy.importSuccess}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {parsedRows.length > 0 && !imported && (
            <button
              onClick={handleImport}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 active:scale-[0.98]"
            >
              <Check className="h-4 w-4" /> {parsedRows.length} {copy.importBtn}
            </button>
          )}
          <button
            onClick={() => { reset(); if (imported) onClose(); }}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {imported ? copy.importClose : parseSummary ? copy.importReselect : copy.importCancel}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function DashboardFaturalarPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const SOURCE_FILTERS = [
    { key: 'all', label: copy.filterAll },
    { key: 'ocr_camera', label: `📷 ${copy.srcCamera}` },
    { key: 'ocr_upload', label: `🔍 ${copy.srcOcr}` },
    { key: 'manual', label: `✏️ ${copy.srcManual}` },
    { key: 'excel', label: `📊 ${copy.srcExcel}` },
    { key: 'pdf', label: `📄 ${copy.srcPdf}` },
  ] as const;

  const STATUS_FILTERS = [
    { key: 'all', label: copy.filterAll },
    { key: 'draft', label: copy.statusDraft },
    { key: 'confirmed', label: copy.statusConfirmed },
    { key: 'disputed', label: copy.statusDisputed },
    { key: 'archived', label: copy.statusArchived },
  ] as const;

  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [modal, setModal] = useState<ModalType>(null);
  const router = { push: (url: string) => window.location.href = url };

  // loadData removed — inlined into useEffect to avoid setState-in-effect lint error

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String((page - 1) * PAGE_SIZE),
        });
        if (statusFilter !== 'all') params.set('status', statusFilter);
        if (sourceFilter !== 'all') params.set('source', sourceFilter);
        if (search.trim()) params.set('q', search.trim());

        const [invRes, statsRes] = await Promise.all([
          fetch(`/api/invoices?${params}`),
          fetch('/api/invoices?stats=1'),
        ]);

        const invData = await invRes.json();
        const statsData = await statsRes.json();

        if (cancelled) return;

        if (invData.data && invData.data.length > 0) {
          setInvoices(invData.data);
          setTotal(invData.total ?? invData.data.length);
        } else {
          setInvoices(MOCK_INVOICES);
          setTotal(MOCK_INVOICES.length);
        }

        if (statsData.data && statsData.data.totalCount > 0) {
          setStats(statsData.data);
        } else {
          setStats(MOCK_STATS);
        }
      } catch {
        if (!cancelled) {
          setInvoices(MOCK_INVOICES);
          setTotal(MOCK_INVOICES.length);
          setStats(MOCK_STATS);
        }
      }
      if (!cancelled) {
        setSelected(new Set());
        setLoading(false);
      }
    }
    void fetchData();
    return () => { cancelled = true; };
  }, [page, statusFilter, sourceFilter, search]);

  const handleNewInvoice = (inv: InvoiceRow) => {
    setInvoices((prev) => [inv, ...prev]);
    setTotal((t) => t + 1);
    if (stats) {
      setStats({
        ...stats,
        totalCount: stats.totalCount + 1,
        totalAmount: stats.totalAmount + inv.grandTotal,
        avgAmount: Math.round((stats.totalAmount + inv.grandTotal) / (stats.totalCount + 1)),
        draftCount: inv.status === 'draft' ? stats.draftCount + 1 : stats.draftCount,
      });
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected(selected.size === invoices.length ? new Set() : new Set(invoices.map((i) => i.id)));
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`${selected.size} ${copy.confirmDelete}`)) return;

    try {
      await fetch('/api/invoices', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids: [...selected] }),
      });
    } catch { /* mock mode */ }

    setInvoices((prev) => prev.filter((i) => !selected.has(i.id)));
    setTotal((t) => t - selected.size);
    setSelected(new Set());
  };

  const handleExportSelected = async () => {
    const { exportInvoicesToCsv } = await import('@/lib/invoice-ocr/export-utils');
    const selectedInvoices = invoices.filter((i) => selected.has(i.id));
    exportInvoicesToCsv(selectedInvoices, `faturalar-secilmis-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportSelectedExcel = async () => {
    const { exportInvoicesToExcel } = await import('@/lib/invoice-ocr/export-utils');
    const selectedInvoices = invoices.filter((i) => selected.has(i.id));
    exportInvoicesToExcel(selectedInvoices, `faturalar-secilmis-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-4 lg:p-8">
      {/* Modals */}
      <OcrUploadModal open={modal === 'ocr'} onClose={() => setModal(null)} onSuccess={handleNewInvoice} copy={copy} />
      <ManualEntryModal open={modal === 'manual'} onClose={() => setModal(null)} onSuccess={handleNewInvoice} copy={copy} />
      <ImportModal open={modal === 'import'} onClose={() => setModal(null)} onSuccess={handleNewInvoice} copy={copy} />

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Receipt className="h-7 w-7 text-[#E11D48]" />
            {copy.pageTitle}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{copy.pageSubtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setModal('ocr')} className="inline-flex items-center gap-2 rounded-xl bg-[#E11D48] px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#BE123C] active:scale-[0.98]">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">{copy.btnCamera}</span>
            <span className="sm:hidden">{copy.btnCameraShort}</span>
          </button>
          <button onClick={() => setModal('manual')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">{copy.btnManual}</span>
            <span className="sm:hidden">{copy.btnManualShort}</span>
          </button>
          <button onClick={() => setModal('import')} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 active:scale-[0.98]">
            <Upload className="h-4 w-4" />
            {copy.btnImport}
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500">{copy.statTotal}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{stats.totalCount}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500">{copy.statAmount}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(stats.totalAmount)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500">{copy.statAvg}</div>
            <div className="mt-1 text-2xl font-bold text-slate-900">{formatMoney(stats.avgAmount)}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs font-medium text-slate-500">{copy.statPending}</div>
            <div className="mt-1 text-2xl font-bold text-amber-600">{stats.draftCount}</div>
            <div className="text-xs text-slate-400">{stats.confirmedCount} {copy.statConfirmed}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder={copy.searchPlaceholder} value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]" />
        </div>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none">
            {STATUS_FILTERS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
          <select value={sourceFilter} onChange={(e) => { setSourceFilter(e.target.value); setPage(1); }} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none">
            {SOURCE_FILTERS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
          <span className="text-sm font-medium text-amber-800">{selected.size} {copy.selectedCount}</span>
          <button onClick={() => void handleBulkDelete()} className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
            <Trash2 className="h-3.5 w-3.5" /> {copy.btnDelete}
          </button>
          <button onClick={() => void handleExportSelected()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
          <button onClick={() => void handleExportSelectedExcel()} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
            <FileSpreadsheet className="h-3.5 w-3.5" /> Excel
          </button>
        </div>
      )}

      {/* Table — Desktop */}
      <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-3"><input type="checkbox" checked={selected.size === invoices.length && invoices.length > 0} onChange={toggleSelectAll} className="h-4 w-4 rounded border-slate-300" /></th>
              <th className="px-4 py-3 font-medium text-slate-500">{copy.thSupplier}</th>
              <th className="px-4 py-3 font-medium text-slate-500">{copy.thDate}</th>
              <th className="px-4 py-3 font-medium text-slate-500 text-right">{copy.thTotal}</th>
              <th className="px-4 py-3 font-medium text-slate-500">{copy.thSource}</th>
              <th className="px-4 py-3 font-medium text-slate-500">{copy.thConfidence}</th>
              <th className="px-4 py-3 font-medium text-slate-500">{copy.thStatus}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">{copy.loading}</td></tr>
            ) : invoices.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">{copy.empty}</td></tr>
            ) : invoices.map((inv) => {
              const src = sourceLabel(inv.source, copy);
              return (
                <tr key={inv.id} className={`border-b border-slate-50 transition-colors hover:bg-slate-50 cursor-pointer ${selected.has(inv.id) ? 'bg-amber-50/50' : ''}`} onClick={() => router.push(`/dashboard/faturalar/${inv.id}`)}>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selected.has(inv.id)} onChange={() => toggleSelect(inv.id)} className="h-4 w-4 rounded border-slate-300" /></td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{inv.supplierName}</div>
                    <div className="text-xs text-slate-400">{inv.invoiceNumber ?? '—'}{inv.supplierVoen ? ` · VÖEN: ${inv.supplierVoen}` : ''}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(inv.invoiceDate)}</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900">{formatMoney(inv.grandTotal, inv.currency)}</td>
                  <td className="px-4 py-3"><span className="text-sm">{src.icon} {src.label}</span></td>
                  <td className="px-4 py-3">{confidenceBadge(inv.ocrConfidence)}</td>
                  <td className="px-4 py-3">{statusBadge(inv.status, copy)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Cards — Mobile */}
      <div className="flex flex-col gap-3 sm:hidden">
        {loading ? (
          <div className="py-12 text-center text-slate-400">{copy.loading}</div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center text-slate-400">{copy.empty}</div>
        ) : invoices.map((inv) => {
          const src = sourceLabel(inv.source, copy);
          return (
            <div key={inv.id} onClick={() => router.push(`/dashboard/faturalar/${inv.id}`)} className={`cursor-pointer rounded-2xl border bg-white p-4 shadow-sm active:scale-[0.99] ${selected.has(inv.id) ? 'border-amber-300 bg-amber-50/50' : 'border-slate-200'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selected.has(inv.id)} onChange={() => toggleSelect(inv.id)} onClick={(e) => e.stopPropagation()} className="mt-0.5 h-4 w-4 rounded border-slate-300" />
                  <div>
                    <div className="font-medium text-slate-900">{inv.supplierName}</div>
                    <div className="text-xs text-slate-400">{inv.invoiceNumber ?? '—'} · {formatDate(inv.invoiceDate)}</div>
                  </div>
                </div>
                <div className="font-semibold text-slate-900">{formatMoney(inv.grandTotal, inv.currency)}</div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{src.icon} {src.label}</span>
                  {confidenceBadge(inv.ocrConfidence)}
                </div>
                {statusBadge(inv.status, copy)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">{total} {copy.paginationOf} {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</div>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            <span className="px-3 text-sm font-medium text-slate-700">{page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
