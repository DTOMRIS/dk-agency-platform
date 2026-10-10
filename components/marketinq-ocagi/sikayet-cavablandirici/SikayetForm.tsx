'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import type { Locale } from '@/i18n/config';
import { COMPENSATION_OPTIONS, type CompensationOption } from '@/lib/ai/complaint-prompt-builder';

const COMPLAINT_TYPES = ['food', 'service', 'price', 'cleanliness', 'other'] as const;
const LANGS = ['az', 'en', 'tr', 'ru'] as const;

const copy: Record<Locale, {
  complaintText: string;
  complaintTextPlaceholder: string;
  complaintLanguage: string;
  responseLanguage: string;
  restaurantName: string;
  complaintType: string;
  submitButton: string;
  submitting: string;
  minLength: string;
  maxLength: string;
  types: Record<string, string>;
  langs: Record<string, string>;
  compensation: string;
  compensationHint: string;
  compensationDetail: string;
  compensationDetailPlaceholder: string;
  compensations: Record<CompensationOption, string>;
}> = {
  az: {
    complaintText: 'Şikayət mətni',
    complaintTextPlaceholder: 'Müştərinin şikayətini buraya yapışdırın...',
    complaintLanguage: 'Şikayət dili',
    responseLanguage: 'Cavab dili',
    restaurantName: 'Restoran adı (opsional)',
    complaintType: 'Şikayət növü',
    submitButton: 'Cavab Yarat',
    submitting: 'AI cavab yaradır...',
    minLength: 'Şikayət ən az 10 simvol olmalıdır',
    maxLength: 'Şikayət maksimum 2000 simvol ola bilər',
    types: { food: 'Yemək', service: 'Xidmət', price: 'Qiymət', cleanliness: 'Təmizlik', other: 'Digər' },
    langs: { az: 'Azərbaycan', en: 'English', tr: 'Türkçe', ru: 'Русский' },
    compensation: 'Nə təklif edirsiniz?',
    compensationHint: 'Seçməsəniz, cavab yalnız üzr və həll yazır — heç bir endirim və ya hədiyyə vəd etmir.',
    compensationDetail: 'Təklifin dəqiq mətni (opsional)',
    compensationDetailPlaceholder: 'məs. növbəti sifarişə 10% endirim',
    compensations: { none: 'Heç nə — yalnız üzr və həll', discount: 'Növbəti gəlişə endirim', treat: 'İkram (desert, içki)', redo: 'Yeməyi yenidən hazırlamaq', refund: 'Pulu geri qaytarmaq' },
  },
  en: {
    complaintText: 'Complaint text',
    complaintTextPlaceholder: 'Paste the customer complaint here...',
    complaintLanguage: 'Complaint language',
    responseLanguage: 'Response language',
    restaurantName: 'Restaurant name (optional)',
    complaintType: 'Complaint type',
    submitButton: 'Generate Response',
    submitting: 'AI is generating responses...',
    minLength: 'Complaint must be at least 10 characters',
    maxLength: 'Complaint cannot exceed 2000 characters',
    types: { food: 'Food', service: 'Service', price: 'Price', cleanliness: 'Cleanliness', other: 'Other' },
    langs: { az: 'Azərbaycan', en: 'English', tr: 'Türkçe', ru: 'Русский' },
    compensation: 'What do you offer?',
    compensationHint: 'If you pick nothing, the reply only apologises and explains the fix — no discount or gift is promised.',
    compensationDetail: 'Exact wording of the offer (optional)',
    compensationDetailPlaceholder: 'e.g. 10% off the next order',
    compensations: { none: 'Nothing — apology and fix only', discount: 'Discount on next visit', treat: 'A treat (dessert, drink)', redo: 'Remake the dish', refund: 'Refund' },
  },
  tr: {
    complaintText: 'Şikayet metni',
    complaintTextPlaceholder: 'Müşteri şikayetini buraya yapıştırın...',
    complaintLanguage: 'Şikayet dili',
    responseLanguage: 'Yanıt dili',
    restaurantName: 'Restoran adı (isteğe bağlı)',
    complaintType: 'Şikayet türü',
    submitButton: 'Yanıt Oluştur',
    submitting: 'AI yanıt oluşturuyor...',
    minLength: 'Şikayet en az 10 karakter olmalıdır',
    maxLength: 'Şikayet en fazla 2000 karakter olabilir',
    types: { food: 'Yemek', service: 'Hizmet', price: 'Fiyat', cleanliness: 'Temizlik', other: 'Diğer' },
    langs: { az: 'Azərbaycan', en: 'English', tr: 'Türkçe', ru: 'Русский' },
    compensation: 'Ne teklif ediyorsunuz?',
    compensationHint: 'Seçmezseniz yanıt yalnız özür ve çözüm yazar — indirim ya da hediye vaat etmez.',
    compensationDetail: 'Teklifin tam metni (isteğe bağlı)',
    compensationDetailPlaceholder: 'örn. sonraki siparişe %10 indirim',
    compensations: { none: 'Hiçbir şey — yalnız özür ve çözüm', discount: 'Sonraki ziyarete indirim', treat: 'İkram (tatlı, içecek)', redo: 'Yemeği yeniden hazırlamak', refund: 'Parayı iade etmek' },
  },
  ru: {
    complaintText: 'Текст жалобы',
    complaintTextPlaceholder: 'Вставьте жалобу клиента сюда...',
    complaintLanguage: 'Язык жалобы',
    responseLanguage: 'Язык ответа',
    restaurantName: 'Название ресторана (необязательно)',
    complaintType: 'Тип жалобы',
    submitButton: 'Создать ответ',
    submitting: 'AI создаёт ответы...',
    minLength: 'Жалоба должна содержать минимум 10 символов',
    maxLength: 'Жалоба не может превышать 2000 символов',
    types: { food: 'Еда', service: 'Обслуживание', price: 'Цена', cleanliness: 'Чистота', other: 'Другое' },
    langs: { az: 'Azərbaycan', en: 'English', tr: 'Türkçe', ru: 'Русский' },
    compensation: 'Что вы предлагаете?',
    compensationHint: 'Если ничего не выбрать, ответ только извиняется и объясняет решение — без скидок и подарков.',
    compensationDetail: 'Точная формулировка предложения (необязательно)',
    compensationDetailPlaceholder: 'напр. скидка 10% на следующий заказ',
    compensations: { none: 'Ничего — только извинение и решение', discount: 'Скидка на следующий визит', treat: 'Угощение (десерт, напиток)', redo: 'Приготовить блюдо заново', refund: 'Вернуть деньги' },
  },
};

interface SikayetFormProps {
  locale: Locale;
  onResult: (data: { formal: string; friendly: string; short: string }) => void;
  onError: (msg: string) => void;
}

export default function SikayetForm({ locale, onResult, onError }: SikayetFormProps) {
  const c = copy[locale];
  const [complaintText, setComplaintText] = useState('');
  const [complaintType, setComplaintType] = useState<string>('food');
  const [complaintLang, setComplaintLang] = useState<string>(locale);
  const [responseLang, setResponseLang] = useState<string>(locale);
  const [restaurantName, setRestaurantName] = useState('');
  const [compensation, setCompensation] = useState<CompensationOption>('none');
  const [compensationDetail, setCompensationDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const charCount = complaintText.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (charCount < 10) { setValidationError(c.minLength); return; }
    if (charCount > 2000) { setValidationError(c.maxLength); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/complaint-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaintText,
          complaintType,
          complaintLang,
          responseLang,
          ...(restaurantName ? { restaurantName } : {}),
          compensation,
          ...(compensation !== 'none' && compensationDetail.trim() ? { compensationDetail: compensationDetail.trim() } : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 429) onError(copy[locale].maxLength.includes('2000') ? 'rate-limit' : data.error || 'rate-limit');
        else onError(data.error || 'unknown');
        return;
      }

      const data = await res.json();
      onResult(data.responses);
    } catch {
      onError('network-error');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20';
  const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Complaint text */}
      <div>
        <label className={labelCls}>{c.complaintText}</label>
        <textarea
          value={complaintText}
          onChange={(e) => setComplaintText(e.target.value)}
          placeholder={c.complaintTextPlaceholder}
          rows={5}
          maxLength={2000}
          className={`${inputCls} resize-none`}
          required
        />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          {validationError && <span className="text-red-500">{validationError}</span>}
          <span className="ml-auto">{charCount}/2000</span>
        </div>
      </div>

      {/* Complaint type */}
      <div>
        <label className={labelCls}>{c.complaintType}</label>
        <select value={complaintType} onChange={(e) => setComplaintType(e.target.value)} className={inputCls}>
          {COMPLAINT_TYPES.map((t) => (
            <option key={t} value={t}>{c.types[t]}</option>
          ))}
        </select>
      </div>

      {/* Language selectors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>{c.complaintLanguage}</label>
          <select value={complaintLang} onChange={(e) => setComplaintLang(e.target.value)} className={inputCls}>
            {LANGS.map((l) => (
              <option key={l} value={l}>{c.langs[l]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>{c.responseLanguage}</label>
          <select value={responseLang} onChange={(e) => setResponseLang(e.target.value)} className={inputCls}>
            {LANGS.map((l) => (
              <option key={l} value={l}>{c.langs[l]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Restaurant name */}
      <div>
        <label className={labelCls}>{c.restaurantName}</label>
        <input
          type="text"
          value={restaurantName}
          onChange={(e) => setRestaurantName(e.target.value)}
          className={inputCls}
          maxLength={100}
        />
      </div>

      {/* Compensation — opt-in (TASK-0523) */}
      <div>
        <label className={labelCls}>{c.compensation}</label>
        <select value={compensation} onChange={(e) => setCompensation(e.target.value as CompensationOption)} className={inputCls} data-testid="complaint-compensation">
          {COMPENSATION_OPTIONS.map((option) => (
            <option key={option} value={option}>{c.compensations[option]}</option>
          ))}
        </select>
        <p className="mt-1 text-xs text-slate-500">{c.compensationHint}</p>
        {compensation !== 'none' && (
          <input
            type="text"
            value={compensationDetail}
            onChange={(e) => setCompensationDetail(e.target.value)}
            placeholder={c.compensationDetailPlaceholder}
            aria-label={c.compensationDetail}
            className={`${inputCls} mt-2`}
            maxLength={120}
          />
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || charCount < 10}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-dk-red-strong px-6 py-3 text-sm font-bold text-white transition hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>{c.submitting}</>
        ) : (
          <><Send size={16} />{c.submitButton}</>
        )}
      </button>
    </form>
  );
}
