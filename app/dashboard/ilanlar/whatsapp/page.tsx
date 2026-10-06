'use client';

/**
 * TASK-0497 — "WhatsApp-dan elan": paste listings from WhatsApp groups → AI preview → drafts.
 * Preview never writes; "create" sends the edited items to the same server-side creation path
 * the admin "Yeni elan yarat" form uses (lib/listings/create-listing.ts), status 'submitted'.
 */

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

import { normalizeLocale, type Locale } from '@/i18n/config';
import { getFieldsForType } from '@/lib/data/listingFieldConfig';
import type { ListingCategory } from '@/lib/data/listingCategories';
import type {
  ImportCurrency,
  ImportedListing,
  SkippedMessage,
} from '@/lib/listings/whatsapp-import';

const MAX_ITEMS = 30;
const TYPES: ListingCategory[] = [
  'devir',
  'franchise-vermek',
  'franchise-almaq',
  'ortak-tapmaq',
  'yeni-investisiya',
  'obyekt-icaresi',
  'horeca-ekipman',
];
const CURRENCIES: ImportCurrency[] = ['AZN', 'USD', 'EUR', 'TRY', 'RUB'];

interface DuplicateHit {
  id: number;
  trackingCode: string;
  title: string;
  reason: 'phone' | 'title';
}

type PreviewItem = ImportedListing & { duplicate: DuplicateHit | null };

interface CreatedDraft {
  id: number;
  trackingCode: string;
  title: string;
}

interface Copy {
  back: string;
  title: string;
  subtitle: string;
  textareaLabel: string;
  placeholder: string;
  hint: string;
  imagesNote: string;
  analyze: string;
  analyzing: string;
  clear: string;
  summary: (found: number, skipped: number, messages: number) => string;
  truncated: string;
  selectAll: string;
  typeLabel: string;
  titleLabel: string;
  cityLabel: string;
  cityPlaceholder: string;
  priceLabel: string;
  descriptionLabel: string;
  fieldsLabel: string;
  equipmentLabel: string;
  contactLabel: string;
  contactHint: string;
  noContact: string;
  original: string;
  confidence: Record<'high' | 'medium' | 'low', string>;
  duplicate: (code: string, reason: 'phone' | 'title') => string;
  missing: string;
  skippedTitle: string;
  create: (n: number) => string;
  creating: string;
  createdTitle: (n: number) => string;
  createdHint: string;
  openDraft: string;
  newImport: string;
  backToList: string;
  errorGeneric: string;
  aiErrors: string;
  types: Record<ListingCategory, string>;
}

const COPY: Record<Locale, Copy> = {
  az: {
    back: 'Elanlara qayıt',
    title: 'WhatsApp-dan elan əlavə et',
    subtitle:
      'Qruplardakı devir, franchise, icarə və ekipman elanlarını yapışdırın — AI qaralama hazırlayır, siz yoxlayıb təsdiqləyirsiniz.',
    textareaLabel: 'WhatsApp mətni',
    placeholder:
      '[06.10.26, 14:05] +994 51 444 55 66: Xırdalanda 60 yerlik kafe devir olunur…\n\nvə ya bir neçə mesajı sadəcə yapışdırın',
    hint: 'Söhbət ixracı ("Export chat") və ya kopyalanmış mesajlar. Bir dəfəyə maksimum 30 mesaj. Salamlaşma və suallar avtomatik keçilir.',
    imagesNote: 'Şəkil (screenshot) dəstəyi hələ yoxdur — mesaj mətnini kopyalayın.',
    analyze: 'Təhlil et',
    analyzing: 'Təhlil edilir…',
    clear: 'Təmizlə',
    summary: (found, skipped, messages) =>
      `${messages} mesajdan ${found} elan tapıldı, ${skipped} keçildi`,
    truncated: 'Mətn 30 mesajdan uzundur — yalnız ilk 30 mesaj təhlil olundu.',
    selectAll: 'Hamısını seç',
    typeLabel: 'Növ',
    titleLabel: 'Başlıq',
    cityLabel: 'Şəhər',
    cityPlaceholder: 'Göstərilməyib',
    priceLabel: 'Qiymət',
    descriptionLabel: 'Təsvir',
    fieldsLabel: 'Tanınan sahələr',
    equipmentLabel: 'Avadanlıq',
    contactLabel: 'Gizli əlaqə',
    contactHint: 'Saytda göstərilmir, yalnız admin görür',
    noContact: 'Əlaqə tapılmadı',
    original: 'Orijinal mesaj',
    confidence: { high: 'Dəqiq', medium: 'Orta', low: 'Şübhəli' },
    duplicate: (code, reason) =>
      reason === 'phone'
        ? `Ola bilər təkrardır: ${code} eyni telefonla`
        : `Ola bilər təkrardır: ${code} oxşar başlıqla`,
    missing: 'Tələb olunan, amma mesajda olmayan:',
    skippedTitle: 'Keçilən mesajlar',
    create: (n) => `Seçilənləri qaralama kimi yarat (${n})`,
    creating: 'Yaradılır…',
    createdTitle: (n) => `${n} qaralama yaradıldı`,
    createdHint: 'Status «Göndərildi». Heç biri avtomatik yayımlanmır — hər birini açıb yoxlayın.',
    openDraft: 'Aç →',
    newImport: 'Yeni idxal',
    backToList: 'Elan siyahısı',
    errorGeneric: 'Xəta baş verdi. Yenidən cəhd edin.',
    aiErrors: 'Bəzi mesajlar AI ilə təhlil olunmadı:',
    types: {
      devir: 'Devir',
      'franchise-vermek': 'Franchise vermək',
      'franchise-almaq': 'Franchise almaq',
      'ortak-tapmaq': 'Ortaq tapmaq',
      'yeni-investisiya': 'Yeni investisiya',
      'obyekt-icaresi': 'Obyekt icarəsi',
      'horeca-ekipman': 'HoReCa ekipman',
    },
  },
  ru: {
    back: 'К объявлениям',
    title: 'Добавить из WhatsApp',
    subtitle:
      'Вставьте объявления из групп (передача бизнеса, франшиза, аренда, оборудование) — AI готовит черновики, вы проверяете и подтверждаете.',
    textareaLabel: 'Текст из WhatsApp',
    placeholder:
      '[06.10.26, 14:05] +994 51 444 55 66: Продаётся кафе на 60 мест…\n\nили просто вставьте несколько сообщений',
    hint: 'Экспорт чата («Export chat») или скопированные сообщения. Не более 30 сообщений за раз. Приветствия и вопросы пропускаются автоматически.',
    imagesNote: 'Скриншоты пока не поддерживаются — скопируйте текст сообщения.',
    analyze: 'Анализировать',
    analyzing: 'Анализ…',
    clear: 'Очистить',
    summary: (found, skipped, messages) =>
      `Из ${messages} сообщений найдено объявлений: ${found}, пропущено: ${skipped}`,
    truncated: 'Текст длиннее 30 сообщений — проанализированы только первые 30.',
    selectAll: 'Выбрать все',
    typeLabel: 'Тип',
    titleLabel: 'Заголовок',
    cityLabel: 'Город',
    cityPlaceholder: 'Не указан',
    priceLabel: 'Цена',
    descriptionLabel: 'Описание',
    fieldsLabel: 'Распознанные поля',
    equipmentLabel: 'Оборудование',
    contactLabel: 'Скрытый контакт',
    contactHint: 'Не показывается на сайте, видит только админ',
    noContact: 'Контакт не найден',
    original: 'Исходное сообщение',
    confidence: { high: 'Точно', medium: 'Средне', low: 'Сомнительно' },
    duplicate: (code, reason) =>
      reason === 'phone'
        ? `Возможный дубль: ${code} с тем же телефоном`
        : `Возможный дубль: ${code} с похожим заголовком`,
    missing: 'Обязательные, но не указанные:',
    skippedTitle: 'Пропущенные сообщения',
    create: (n) => `Создать выбранные как черновики (${n})`,
    creating: 'Создание…',
    createdTitle: (n) => `Создано черновиков: ${n}`,
    createdHint:
      'Статус «Отправлено». Ничего не публикуется автоматически — откройте и проверьте каждый.',
    openDraft: 'Открыть →',
    newImport: 'Новый импорт',
    backToList: 'Список объявлений',
    errorGeneric: 'Произошла ошибка. Попробуйте ещё раз.',
    aiErrors: 'Некоторые сообщения AI не обработал:',
    types: {
      devir: 'Передача бизнеса',
      'franchise-vermek': 'Продажа франшизы',
      'franchise-almaq': 'Покупка франшизы',
      'ortak-tapmaq': 'Поиск партнёра',
      'yeni-investisiya': 'Новая инвестиция',
      'obyekt-icaresi': 'Аренда помещения',
      'horeca-ekipman': 'HoReCa оборудование',
    },
  },
  en: {
    back: 'Back to listings',
    title: 'Add from WhatsApp',
    subtitle:
      'Paste business-transfer, franchise, rental and equipment listings from groups — AI drafts them, you review and confirm.',
    textareaLabel: 'WhatsApp text',
    placeholder:
      '[06.10.26, 14:05] +994 51 444 55 66: 60-seat cafe for transfer in Khirdalan…\n\nor just paste several messages',
    hint: 'A chat export ("Export chat") or copied messages. Up to 30 messages at a time. Greetings and questions are skipped automatically.',
    imagesNote: 'Screenshots are not supported yet — copy the message text.',
    analyze: 'Analyze',
    analyzing: 'Analyzing…',
    clear: 'Clear',
    summary: (found, skipped, messages) =>
      `${found} listings found in ${messages} messages, ${skipped} skipped`,
    truncated: 'The text has more than 30 messages — only the first 30 were analyzed.',
    selectAll: 'Select all',
    typeLabel: 'Type',
    titleLabel: 'Title',
    cityLabel: 'City',
    cityPlaceholder: 'Not stated',
    priceLabel: 'Price',
    descriptionLabel: 'Description',
    fieldsLabel: 'Recognised fields',
    equipmentLabel: 'Equipment',
    contactLabel: 'Private contact',
    contactHint: 'Not shown on the site, admins only',
    noContact: 'No contact found',
    original: 'Original message',
    confidence: { high: 'Confident', medium: 'Medium', low: 'Uncertain' },
    duplicate: (code, reason) =>
      reason === 'phone'
        ? `Possible duplicate: ${code} has the same phone`
        : `Possible duplicate: ${code} has a similar title`,
    missing: 'Required but not in the message:',
    skippedTitle: 'Skipped messages',
    create: (n) => `Create selected as drafts (${n})`,
    creating: 'Creating…',
    createdTitle: (n) => `${n} drafts created`,
    createdHint:
      'Status "Submitted". Nothing is published automatically — open and review each one.',
    openDraft: 'Open →',
    newImport: 'New import',
    backToList: 'Listings',
    errorGeneric: 'Something went wrong. Please try again.',
    aiErrors: 'Some messages could not be analyzed:',
    types: {
      devir: 'Business transfer',
      'franchise-vermek': 'Franchise offer',
      'franchise-almaq': 'Franchise wanted',
      'ortak-tapmaq': 'Partner wanted',
      'yeni-investisiya': 'New investment',
      'obyekt-icaresi': 'Premises for rent',
      'horeca-ekipman': 'HoReCa equipment',
    },
  },
  tr: {
    back: 'İlanlara dön',
    title: 'WhatsApp’tan ilan ekle',
    subtitle:
      'Gruplardaki devir, franchise, kiralık ve ekipman ilanlarını yapıştırın — AI taslak hazırlar, siz kontrol edip onaylarsınız.',
    textareaLabel: 'WhatsApp metni',
    placeholder:
      '[06.10.26, 14:05] +994 51 444 55 66: Xırdalan’da 60 kişilik devren kafe…\n\nveya birkaç mesajı doğrudan yapıştırın',
    hint: 'Sohbet dışa aktarımı ("Export chat") veya kopyalanan mesajlar. Tek seferde en fazla 30 mesaj. Selamlaşma ve sorular otomatik atlanır.',
    imagesNote: 'Ekran görüntüsü desteği henüz yok — mesaj metnini kopyalayın.',
    analyze: 'Analiz et',
    analyzing: 'Analiz ediliyor…',
    clear: 'Temizle',
    summary: (found, skipped, messages) =>
      `${messages} mesajda ${found} ilan bulundu, ${skipped} atlandı`,
    truncated: 'Metin 30 mesajdan uzun — yalnızca ilk 30 mesaj analiz edildi.',
    selectAll: 'Tümünü seç',
    typeLabel: 'Tür',
    titleLabel: 'Başlık',
    cityLabel: 'Şehir',
    cityPlaceholder: 'Belirtilmemiş',
    priceLabel: 'Fiyat',
    descriptionLabel: 'Açıklama',
    fieldsLabel: 'Tanınan alanlar',
    equipmentLabel: 'Ekipman',
    contactLabel: 'Gizli iletişim',
    contactHint: 'Sitede gösterilmez, yalnızca admin görür',
    noContact: 'İletişim bulunamadı',
    original: 'Orijinal mesaj',
    confidence: { high: 'Kesin', medium: 'Orta', low: 'Şüpheli' },
    duplicate: (code, reason) =>
      reason === 'phone'
        ? `Tekrar olabilir: ${code} aynı telefonla`
        : `Tekrar olabilir: ${code} benzer başlıkla`,
    missing: 'Zorunlu ama mesajda olmayan:',
    skippedTitle: 'Atlanan mesajlar',
    create: (n) => `Seçilenleri taslak olarak oluştur (${n})`,
    creating: 'Oluşturuluyor…',
    createdTitle: (n) => `${n} taslak oluşturuldu`,
    createdHint: 'Durum «Gönderildi». Hiçbiri otomatik yayınlanmaz — her birini açıp kontrol edin.',
    openDraft: 'Aç →',
    newImport: 'Yeni içe aktarım',
    backToList: 'İlan listesi',
    errorGeneric: 'Bir hata oluştu. Tekrar deneyin.',
    aiErrors: 'Bazı mesajlar AI ile analiz edilemedi:',
    types: {
      devir: 'Devir',
      'franchise-vermek': 'Franchise verme',
      'franchise-almaq': 'Franchise alma',
      'ortak-tapmaq': 'Ortak arama',
      'yeni-investisiya': 'Yeni yatırım',
      'obyekt-icaresi': 'Kiralık mekân',
      'horeca-ekipman': 'HoReCa ekipman',
    },
  },
};

const card =
  'rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]';
const input =
  'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-[14px] text-slate-900 outline-none transition focus:border-[#0A5BD6] focus:ring-2 focus:ring-[#0A5BD6]/15';
const label = 'mb-1 block text-[12px] font-semibold uppercase tracking-wide text-slate-600';
/** Same as `input` but without w-full, for inputs sized inside a flex row. */
const inputNoWidth = input.replace('w-full ', '');

function fieldLabel(type: ListingCategory, key: string): string {
  return getFieldsForType(type).find((f) => f.key === key)?.label ?? key;
}

function fieldValue(value: string | number | boolean): string {
  if (typeof value === 'boolean') return value ? '✓' : '✗';
  return String(value);
}

export default function WhatsAppImportPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = COPY[locale];
  const base = locale === 'az' ? '' : `/${locale}`;

  const [rawText, setRawText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [items, setItems] = useState<PreviewItem[] | null>(null);
  const [skipped, setSkipped] = useState<SkippedMessage[]>([]);
  const [meta, setMeta] = useState<{ candidates: number; truncated: boolean; errors: string[] }>({
    candidates: 0,
    truncated: false,
    errors: [],
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [created, setCreated] = useState<CreatedDraft[] | null>(null);

  const selectedItems = useMemo(
    () => (items ?? []).filter((item) => selected.has(item.key)),
    [items, selected]
  );

  function reset() {
    setRawText('');
    setItems(null);
    setSkipped([]);
    setSelected(new Set());
    setCreated(null);
    setError('');
  }

  function updateItem(key: string, patch: Partial<PreviewItem>) {
    setItems((prev) =>
      (prev ?? []).map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  }

  function toggle(key: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function analyze() {
    if (rawText.trim().length < 10) return;
    setAnalyzing(true);
    setError('');
    setCreated(null);
    try {
      const response = await fetch('/api/listings/admin/whatsapp-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText, preview: true }),
      });
      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        error?: string;
        items?: PreviewItem[];
        skipped?: SkippedMessage[];
        candidates?: number;
        truncated?: boolean;
        errors?: string[];
      } | null;
      if (!response.ok || !payload?.success) throw new Error(payload?.error || copy.errorGeneric);
      const nextItems = payload.items ?? [];
      setItems(nextItems);
      setSkipped(payload.skipped ?? []);
      setMeta({
        candidates: payload.candidates ?? 0,
        truncated: Boolean(payload.truncated),
        errors: payload.errors ?? [],
      });
      // Duplicates start unchecked so the owner decides consciously.
      setSelected(new Set(nextItems.filter((item) => !item.duplicate).map((item) => item.key)));
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errorGeneric);
    } finally {
      setAnalyzing(false);
    }
  }

  async function createDrafts() {
    if (!selectedItems.length) return;
    setCreating(true);
    setError('');
    try {
      const response = await fetch('/api/listings/admin/whatsapp-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirm: true,
          items: selectedItems.slice(0, MAX_ITEMS).map((item) => ({
            type: item.type,
            title: item.title,
            description: item.description,
            city: item.city,
            district: item.district,
            price: item.price,
            currency: item.currency,
            typeSpecificData: item.typeSpecificData,
            equipment: item.equipment,
            contactName: item.contactName,
            contactPhone: item.contactPhone,
            contactEmail: item.contactEmail,
          })),
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        created?: CreatedDraft[];
        failed?: Array<{ title: string; error: string }>;
        error?: string;
      } | null;
      if (!payload?.created?.length) throw new Error(payload?.error || copy.errorGeneric);
      setCreated(payload.created);
      if (payload.failed?.length)
        setError(`${copy.errorGeneric} (${payload.failed.map((f) => f.title).join(', ')})`);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.errorGeneric);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-full bg-[#F2F2F7] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1100px] space-y-6">
        <div>
          <Link
            href={`${base}/dashboard/ilanlar`}
            className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </Link>
          <h1 className="mt-3 flex items-center gap-3 text-[28px] font-bold tracking-tight text-slate-900 sm:text-[36px]">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <MessageCircle className="h-5 w-5" />
            </span>
            {copy.title}
          </h1>
          <p className="mt-2 max-w-3xl text-[15px] text-slate-600">{copy.subtitle}</p>
        </div>

        {error && (
          <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-800">
            {error}
          </div>
        )}

        {created ? (
          <div className={`${card} p-6`} data-testid="wa-created">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              <h2 className="text-[20px] font-bold text-slate-900">
                {copy.createdTitle(created.length)}
              </h2>
            </div>
            <p className="mt-1 text-[14px] text-slate-600">{copy.createdHint}</p>
            <ul className="mt-4 divide-y divide-slate-100">
              {created.map((draft) => (
                <li
                  key={draft.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <div className="text-[12px] font-semibold text-slate-500">
                      {draft.trackingCode}
                    </div>
                    <div className="truncate text-[15px] font-semibold text-slate-900">
                      {draft.title}
                    </div>
                  </div>
                  <Link
                    href={`${base}/dashboard/ilanlar/${draft.id}`}
                    className="inline-flex h-8 items-center rounded-full bg-[#EEF4FF] px-3 text-[12px] font-semibold text-[#0A5BD6] hover:bg-[#E0EBFF]"
                  >
                    {copy.openDraft}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={reset}
                className="inline-flex h-10 items-center rounded-full bg-[#E11D48] px-5 text-[14px] font-semibold text-white hover:bg-[#BE123C]"
              >
                {copy.newImport}
              </button>
              <Link
                href={`${base}/dashboard/ilanlar`}
                className="inline-flex h-10 items-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                {copy.backToList}
              </Link>
            </div>
          </div>
        ) : (
          <div className={`${card} p-5 sm:p-6`}>
            <label htmlFor="wa-raw" className={label}>
              {copy.textareaLabel}
            </label>
            <textarea
              id="wa-raw"
              value={rawText}
              onChange={(event) => setRawText(event.target.value)}
              placeholder={copy.placeholder}
              rows={items ? 5 : 11}
              maxLength={60000}
              className="w-full resize-y rounded-2xl border border-slate-200 bg-[#FAFAFC] px-4 py-3 font-mono text-[13px] leading-6 text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#0A5BD6] focus:ring-2 focus:ring-[#0A5BD6]/15"
            />
            <p className="mt-2 text-[13px] text-slate-600">{copy.hint}</p>
            <p className="mt-1 text-[13px] text-slate-500">{copy.imagesNote}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={analyze}
                disabled={analyzing || rawText.trim().length < 10}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-[#E11D48] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#BE123C] disabled:opacity-50"
              >
                {analyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {analyzing ? copy.analyzing : copy.analyze}
              </button>
              {(rawText || items) && (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex h-11 items-center rounded-full border border-slate-200 bg-white px-5 text-[14px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copy.clear}
                </button>
              )}
            </div>
          </div>
        )}

        {items && !created && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[15px] font-semibold text-slate-900" data-testid="wa-summary">
                {copy.summary(items.length, skipped.length, meta.candidates)}
              </p>
              {items.length > 0 && (
                <label className="inline-flex cursor-pointer items-center gap-2 text-[14px] font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#0A5BD6]"
                    checked={selected.size === items.length}
                    onChange={() =>
                      setSelected(
                        selected.size === items.length
                          ? new Set()
                          : new Set(items.map((item) => item.key))
                      )
                    }
                  />
                  {copy.selectAll}
                </label>
              )}
            </div>
            {meta.truncated && (
              <div className="rounded-[16px] border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-900">
                {copy.truncated}
              </div>
            )}
            {meta.errors.length > 0 && (
              <div className="rounded-[16px] border border-amber-200 bg-amber-50 px-5 py-3 text-sm font-medium text-amber-900">
                {copy.aiErrors} {meta.errors.join('; ')}
              </div>
            )}

            <div className="space-y-4" data-testid="wa-items">
              {items.map((item) => {
                const isSelected = selected.has(item.key);
                const fieldEntries = Object.entries(item.typeSpecificData);
                return (
                  <div
                    key={item.key}
                    className={`${card} p-5 transition ${isSelected ? 'ring-2 ring-[#0A5BD6]/40' : ''}`}
                    data-testid="wa-item"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        aria-label={item.title}
                        className="mt-2.5 h-5 w-5 shrink-0 cursor-pointer accent-[#0A5BD6]"
                        checked={isSelected}
                        onChange={() => toggle(item.key)}
                      />
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-semibold ${
                              item.confidence === 'high'
                                ? 'bg-emerald-50 text-emerald-800'
                                : item.confidence === 'medium'
                                  ? 'bg-sky-50 text-sky-800'
                                  : 'bg-amber-50 text-amber-900'
                            }`}
                          >
                            {copy.confidence[item.confidence]}
                          </span>
                          {item.duplicate && (
                            <Link
                              href={`${base}/dashboard/ilanlar/${item.duplicate.id}`}
                              className="inline-flex h-6 items-center gap-1 rounded-full bg-rose-50 px-2.5 text-[12px] font-semibold text-rose-800 hover:bg-rose-100"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {copy.duplicate(item.duplicate.trackingCode, item.duplicate.reason)}
                            </Link>
                          )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-[200px_1fr]">
                          <div>
                            <label className={label} htmlFor={`${item.key}-type`}>
                              {copy.typeLabel}
                            </label>
                            <select
                              id={`${item.key}-type`}
                              value={item.type}
                              onChange={(event) =>
                                updateItem(item.key, {
                                  type: event.target.value as ListingCategory,
                                })
                              }
                              className={input}
                            >
                              {TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {copy.types[type]}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className={label} htmlFor={`${item.key}-title`}>
                              {copy.titleLabel}
                            </label>
                            <input
                              id={`${item.key}-title`}
                              value={item.title}
                              maxLength={200}
                              onChange={(event) =>
                                updateItem(item.key, { title: event.target.value })
                              }
                              className={`${input} font-semibold`}
                            />
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className={label} htmlFor={`${item.key}-city`}>
                              {copy.cityLabel}
                            </label>
                            <input
                              id={`${item.key}-city`}
                              value={item.city ?? ''}
                              placeholder={copy.cityPlaceholder}
                              onChange={(event) =>
                                updateItem(item.key, { city: event.target.value || null })
                              }
                              className={`${input} placeholder:text-slate-500`}
                            />
                          </div>
                          <div>
                            <label className={label} htmlFor={`${item.key}-price`}>
                              {copy.priceLabel}
                            </label>
                            <div className="flex gap-2">
                              <input
                                id={`${item.key}-price`}
                                inputMode="numeric"
                                value={item.price ?? ''}
                                onChange={(event) => {
                                  const digits = event.target.value.replace(/\D/g, '');
                                  updateItem(item.key, { price: digits ? Number(digits) : null });
                                }}
                                className={`${inputNoWidth} min-w-0 flex-1`}
                              />
                              <select
                                id={`${item.key}-currency`}
                                aria-label={copy.priceLabel}
                                value={item.currency}
                                onChange={(event) =>
                                  updateItem(item.key, {
                                    currency: event.target.value as ImportCurrency,
                                  })
                                }
                                className={`${inputNoWidth} w-[96px] shrink-0`}
                              >
                                {CURRENCIES.map((currency) => (
                                  <option key={currency} value={currency}>
                                    {currency}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className={label} htmlFor={`${item.key}-desc`}>
                            {copy.descriptionLabel}
                          </label>
                          <textarea
                            id={`${item.key}-desc`}
                            value={item.description}
                            rows={3}
                            onChange={(event) =>
                              updateItem(item.key, { description: event.target.value })
                            }
                            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-[14px] leading-6 text-slate-800 outline-none focus:border-[#0A5BD6] focus:ring-2 focus:ring-[#0A5BD6]/15"
                          />
                        </div>

                        {(fieldEntries.length > 0 || item.equipment.length > 0) && (
                          <div>
                            <div className={label}>{copy.fieldsLabel}</div>
                            <div className="flex flex-wrap gap-1.5">
                              {fieldEntries.map(([key, value]) => (
                                <span
                                  key={key}
                                  className="inline-flex items-center rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[12px] text-slate-800"
                                >
                                  <span className="font-semibold text-slate-600">
                                    {fieldLabel(item.type, key)}:
                                  </span>
                                  &nbsp;{fieldValue(value)}
                                </span>
                              ))}
                              {item.equipment.length > 0 && (
                                <span className="inline-flex items-center rounded-full bg-[#F2F2F7] px-2.5 py-1 text-[12px] text-slate-800">
                                  <span className="font-semibold text-slate-600">
                                    {copy.equipmentLabel}:
                                  </span>
                                  &nbsp;
                                  {item.equipment
                                    .map((e) => (e.count ? `${e.name} ×${e.count}` : e.name))
                                    .join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {item.missingRequired.length > 0 && (
                          <p className="text-[12px] text-amber-900">
                            {copy.missing}{' '}
                            {item.missingRequired
                              .map((key) => fieldLabel(item.type, key))
                              .join(', ')}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-dashed border-amber-300 bg-amber-50/60 px-3 py-2 text-[13px] text-slate-800">
                          <span className="font-semibold text-amber-900">{copy.contactLabel}:</span>
                          {item.contactName || item.contactPhone || item.contactEmail ? (
                            <span className="break-all">
                              {[item.contactName, item.contactPhone, item.contactEmail]
                                .filter(Boolean)
                                .join(' · ')}
                            </span>
                          ) : (
                            <span className="text-slate-600">{copy.noContact}</span>
                          )}
                          <span className="text-[12px] text-slate-600">({copy.contactHint})</span>
                        </div>

                        <details className="text-[13px] text-slate-700">
                          <summary className="cursor-pointer font-semibold text-slate-700">
                            {copy.original}
                          </summary>
                          <p className="mt-2 whitespace-pre-wrap rounded-xl bg-[#FAFAFC] p-3 font-mono text-[12px] leading-5 text-slate-700">
                            {item.sourceExcerpt}
                          </p>
                        </details>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {skipped.length > 0 && (
              <div className="space-y-2" data-testid="wa-skipped">
                <h2 className="text-[14px] font-semibold uppercase tracking-wide text-slate-600">
                  {copy.skippedTitle}
                </h2>
                {skipped.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-[18px] border border-slate-200 bg-white/60 px-4 py-3"
                  >
                    <div className="text-[13px] font-semibold text-slate-700">{item.reason}</div>
                    <p className="mt-1 line-clamp-2 text-[13px] text-slate-500">
                      {item.sourceExcerpt}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="sticky bottom-[84px] z-20 lg:bottom-3 flex flex-wrap items-center justify-end gap-3 rounded-[18px] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
                <button
                  type="button"
                  onClick={createDrafts}
                  disabled={
                    creating || selectedItems.length === 0 || selectedItems.length > MAX_ITEMS
                  }
                  className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#E11D48] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#BE123C] disabled:opacity-50 sm:w-auto"
                >
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {creating ? copy.creating : copy.create(selectedItems.length)}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
