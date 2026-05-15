'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import type { Locale } from '@/i18n/config';

const PLATFORMS = ['instagram', 'facebook', 'tiktok', 'google_ads'] as const;
const AUDIENCES = ['youth_18_30', 'family', 'corporate', 'all'] as const;
const STYLES = ['discount', 'new_product', 'brand_awareness', 'event'] as const;
const LANGS = ['az', 'en', 'tr', 'ru'] as const;

interface AdVariant { tone: string; headline: string; body: string; hashtags: string[] }

const copy: Record<Locale, {
  platform: string; restaurantName: string; campaignDescription: string;
  campaignDescriptionPlaceholder: string; targetAudience: string; callStyle: string;
  language: string; submit: string; submitting: string;
  minLength: string; maxLength: string;
  platforms: Record<string, string>; audiences: Record<string, string>;
  styles: Record<string, string>; langs: Record<string, string>;
}> = {
  az: {
    platform: 'Platform', restaurantName: 'Restoran adı (opsional)',
    campaignDescription: 'Kampaniya təsviri', campaignDescriptionPlaceholder: 'Məs: Yeni dolma menyusu, 30 May açılışı',
    targetAudience: 'Hədəf auditoriya', callStyle: 'Çağırış stili', language: 'Reklam dili',
    submit: 'Reklam Yarat', submitting: 'AI yazır...',
    minLength: 'Kampaniya təsviri ən az 20 simvol olmalıdır', maxLength: 'Kampaniya təsviri maksimum 500 simvol',
    platforms: { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', google_ads: 'Google Ads' },
    audiences: { youth_18_30: 'Gənclər (18-30)', family: 'Ailə', corporate: 'Korporativ', all: 'Hamısı' },
    styles: { discount: 'Endirim', new_product: 'Yeni məhsul', brand_awareness: 'Brand tanınma', event: 'Event' },
    langs: { az: 'Azərbaycan', en: 'English', tr: 'Türkçe', ru: 'Русский' },
  },
  en: {
    platform: 'Platform', restaurantName: 'Restaurant name (optional)',
    campaignDescription: 'Campaign description', campaignDescriptionPlaceholder: 'E.g.: New dolma menu, May 30 launch',
    targetAudience: 'Target audience', callStyle: 'Call style', language: 'Ad language',
    submit: 'Generate Ad', submitting: 'AI is writing...',
    minLength: 'Campaign description must be at least 20 characters', maxLength: 'Campaign description max 500 characters',
    platforms: { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', google_ads: 'Google Ads' },
    audiences: { youth_18_30: 'Youth (18-30)', family: 'Family', corporate: 'Corporate', all: 'All' },
    styles: { discount: 'Discount', new_product: 'New product', brand_awareness: 'Brand awareness', event: 'Event' },
    langs: { az: 'Azərbaycan', en: 'English', tr: 'Türkçe', ru: 'Русский' },
  },
  tr: {
    platform: 'Platform', restaurantName: 'Restoran adı (isteğe bağlı)',
    campaignDescription: 'Kampanya açıklaması', campaignDescriptionPlaceholder: 'Örn: Yeni dolma menüsü, 30 Mayıs açılışı',
    targetAudience: 'Hedef kitle', callStyle: 'Çağrı stili', language: 'Reklam dili',
    submit: 'Reklam Oluştur', submitting: 'AI yazıyor...',
    minLength: 'Kampanya açıklaması en az 20 karakter olmalı', maxLength: 'Kampanya açıklaması maksimum 500 karakter',
    platforms: { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', google_ads: 'Google Ads' },
    audiences: { youth_18_30: 'Gençler (18-30)', family: 'Aile', corporate: 'Kurumsal', all: 'Hepsi' },
    styles: { discount: 'İndirim', new_product: 'Yeni ürün', brand_awareness: 'Marka bilinirliği', event: 'Etkinlik' },
    langs: { az: 'Azərbaycan', en: 'English', tr: 'Türkçe', ru: 'Русский' },
  },
  ru: {
    platform: 'Платформа', restaurantName: 'Название ресторана (необязательно)',
    campaignDescription: 'Описание кампании', campaignDescriptionPlaceholder: 'Напр.: Новое меню долмы, открытие 30 мая',
    targetAudience: 'Целевая аудитория', callStyle: 'Стиль призыва', language: 'Язык рекламы',
    submit: 'Создать рекламу', submitting: 'AI пишет...',
    minLength: 'Описание кампании минимум 20 символов', maxLength: 'Описание кампании максимум 500 символов',
    platforms: { instagram: 'Instagram', facebook: 'Facebook', tiktok: 'TikTok', google_ads: 'Google Ads' },
    audiences: { youth_18_30: 'Молодёжь (18-30)', family: 'Семья', corporate: 'Корпоратив', all: 'Все' },
    styles: { discount: 'Скидка', new_product: 'Новый продукт', brand_awareness: 'Узнаваемость', event: 'Мероприятие' },
    langs: { az: 'Azərbaycan', en: 'English', tr: 'Türkçe', ru: 'Русский' },
  },
};

interface ReklamFormProps {
  locale: Locale;
  onResult: (data: AdVariant[]) => void;
  onError: (msg: string) => void;
}

export default function ReklamForm({ locale, onResult, onError }: ReklamFormProps) {
  const c = copy[locale];
  const [platform, setPlatform] = useState<string>('instagram');
  const [restaurantName, setRestaurantName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState<string>('all');
  const [callStyle, setCallStyle] = useState<string>('brand_awareness');
  const [language, setLanguage] = useState<string>(locale);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const charCount = campaignDescription.length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);
    if (charCount < 20) { setValidationError(c.minLength); return; }
    if (charCount > 500) { setValidationError(c.maxLength); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/ai/ad-writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform, campaignDescription, targetAudience, callStyle, language,
          ...(restaurantName ? { restaurantName } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        onError(data.error || 'unknown');
        return;
      }
      const data = await res.json();
      onResult(data.variants);
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
      <div>
        <label className={labelCls}>{c.platform}</label>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className={inputCls}>
          {PLATFORMS.map((p) => <option key={p} value={p}>{c.platforms[p]}</option>)}
        </select>
      </div>

      <div>
        <label className={labelCls}>{c.campaignDescription}</label>
        <textarea value={campaignDescription} onChange={(e) => setCampaignDescription(e.target.value)}
          placeholder={c.campaignDescriptionPlaceholder} rows={4} maxLength={500} className={`${inputCls} resize-none`} required />
        <div className="mt-1 flex justify-between text-xs text-slate-400">
          {validationError && <span className="text-red-500">{validationError}</span>}
          <span className="ml-auto">{charCount}/500</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>{c.targetAudience}</label>
          <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} className={inputCls}>
            {AUDIENCES.map((a) => <option key={a} value={a}>{c.audiences[a]}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{c.callStyle}</label>
          <select value={callStyle} onChange={(e) => setCallStyle(e.target.value)} className={inputCls}>
            {STYLES.map((s) => <option key={s} value={s}>{c.styles[s]}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>{c.language}</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} className={inputCls}>
            {LANGS.map((l) => <option key={l} value={l}>{c.langs[l]}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>{c.restaurantName}</label>
          <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} className={inputCls} maxLength={80} />
        </div>
      </div>

      <button type="submit" disabled={loading || charCount < 20}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-navy)] px-6 py-3 text-sm font-bold text-white transition hover:bg-[var(--dk-navy)]/90 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <>{c.submitting}</> : <><Send size={16} />{c.submit}</>}
      </button>
    </form>
  );
}
