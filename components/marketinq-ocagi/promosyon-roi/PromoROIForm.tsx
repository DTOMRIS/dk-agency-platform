'use client';

import { useState } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface FormData {
  promoName: string;
  promoDurationDays: number;
  baseline: { totalSales: number; transactionCount: number; grossMarginPercent: number };
  promo: { totalSales: number; transactionCount: number; grossMarginPercent: number; promoCost: number; marketingSpend: number };
  fixedCosts: { rentPercent: number; royaltyPercent: number; adPoolPercent: number; serviceFeePercent: number };
}

const DEFAULTS: FormData = {
  promoName: '',
  promoDurationDays: 7,
  baseline: { totalSales: 0, transactionCount: 0, grossMarginPercent: 65 },
  promo: { totalSales: 0, transactionCount: 0, grossMarginPercent: 58, promoCost: 0, marketingSpend: 0 },
  fixedCosts: { rentPercent: 15, royaltyPercent: 0, adPoolPercent: 5, serviceFeePercent: 5 },
};

const copy: Record<Locale, {
  step1: string; step2: string; step2base: string; step2promo: string;
  promoName: string; duration: string; days: string;
  sales: string; tc: string; margin: string; promoCost: string; marketingSpend: string;
  fixedToggle: string; rent: string; royalty: string; adPool: string; serviceFee: string;
  submit: string; submitting: string;
  avgTicket: string;
}> = {
  az: {
    step1: 'Promo haqqında', step2: 'Rəqəmlər', step2base: 'Baz Həftə', step2promo: 'Promo Həftə',
    promoName: 'Kampaniya adı', duration: 'Müddət', days: 'gün',
    sales: 'Satış (AZN)', tc: 'Hesab sayı (TC)', margin: 'Gross Margin %', promoCost: 'Promo xərci (AZN)', marketingSpend: 'Marketinq xərci (AZN)',
    fixedToggle: 'Sabit xərclər (dəyiş)', rent: 'Kira %', royalty: 'Royalti %', adPool: 'Reklam fondu %', serviceFee: 'Servis haqqı %',
    submit: 'ROI Hesabla', submitting: 'Hesablanır...',
    avgTicket: 'Ort. hesab',
  },
  en: {
    step1: 'About Promo', step2: 'Numbers', step2base: 'Base Week', step2promo: 'Promo Week',
    promoName: 'Campaign name', duration: 'Duration', days: 'days',
    sales: 'Sales (AZN)', tc: 'Transaction Count', margin: 'Gross Margin %', promoCost: 'Promo cost (AZN)', marketingSpend: 'Marketing spend (AZN)',
    fixedToggle: 'Fixed costs (edit)', rent: 'Rent %', royalty: 'Royalty %', adPool: 'Ad pool %', serviceFee: 'Service fee %',
    submit: 'Calculate ROI', submitting: 'Calculating...',
    avgTicket: 'Avg ticket',
  },
  tr: {
    step1: 'Promo hakkında', step2: 'Rakamlar', step2base: 'Baz Hafta', step2promo: 'Promo Hafta',
    promoName: 'Kampanya adı', duration: 'Süre', days: 'gün',
    sales: 'Satış (AZN)', tc: 'İşlem sayısı', margin: 'Brüt Marj %', promoCost: 'Promo maliyeti (AZN)', marketingSpend: 'Pazarlama harcaması (AZN)',
    fixedToggle: 'Sabit giderler (düzenle)', rent: 'Kira %', royalty: 'Royalti %', adPool: 'Reklam fonu %', serviceFee: 'Servis ücreti %',
    submit: 'ROI Hesapla', submitting: 'Hesaplanıyor...',
    avgTicket: 'Ort. hesap',
  },
  ru: {
    step1: 'О промо', step2: 'Цифры', step2base: 'Базовая неделя', step2promo: 'Промо неделя',
    promoName: 'Название кампании', duration: 'Длительность', days: 'дней',
    sales: 'Продажи (AZN)', tc: 'Кол-во чеков', margin: 'Валовая маржа %', promoCost: 'Промо расход (AZN)', marketingSpend: 'Маркетинг расход (AZN)',
    fixedToggle: 'Постоянные расходы (изменить)', rent: 'Аренда %', royalty: 'Роялти %', adPool: 'Рекламный фонд %', serviceFee: 'Сервисный сбор %',
    submit: 'Рассчитать ROI', submitting: 'Расчёт...',
    avgTicket: 'Ср. чек',
  },
};

function NumberInput({ label, value, onChange, suffix, disabled }: { label: string; value: number; onChange: (v: number) => void; suffix?: string; disabled?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          disabled={disabled}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20"
        />
        {suffix && <span className="text-xs text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

interface Props { locale: Locale; onResult: (data: unknown) => void; onError: (msg: string) => void }

export default function PromoROIForm({ locale, onResult, onError }: Props) {
  const [form, setForm] = useState<FormData>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [showFixed, setShowFixed] = useState(false);
  const t = copy[locale];

  function setBaseline<K extends keyof FormData['baseline']>(k: K, v: FormData['baseline'][K]) {
    setForm((p) => ({ ...p, baseline: { ...p.baseline, [k]: v } }));
  }
  function setPromo<K extends keyof FormData['promo']>(k: K, v: FormData['promo'][K]) {
    setForm((p) => ({ ...p, promo: { ...p.promo, [k]: v } }));
  }
  function setFixed<K extends keyof FormData['fixedCosts']>(k: K, v: FormData['fixedCosts'][K]) {
    setForm((p) => ({ ...p, fixedCosts: { ...p.fixedCosts, [k]: v } }));
  }

  const baseAvg = form.baseline.transactionCount > 0 ? (form.baseline.totalSales / form.baseline.transactionCount).toFixed(2) : '—';
  const promoAvg = form.promo.transactionCount > 0 ? (form.promo.totalSales / form.promo.transactionCount).toFixed(2) : '—';

  const isValid = form.promoName.length >= 2 && form.baseline.totalSales > 0 && form.baseline.transactionCount > 0 && form.promo.totalSales > 0 && form.promo.transactionCount > 0;

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing-tools/promosyon-roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      });
      const data = await res.json();
      if (!res.ok) { onError(data.error ?? 'unknown'); return; }
      onResult(data.data);
    } catch { onError('network'); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Meta */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{t.step1}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="mb-1 block text-xs font-semibold text-slate-600">{t.promoName}</label>
            <input type="text" value={form.promoName} onChange={(e) => setForm((p) => ({ ...p, promoName: e.target.value }))} disabled={loading}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">{t.duration}</label>
            <div className="flex items-center gap-1">
              <input type="number" value={form.promoDurationDays} onChange={(e) => setForm((p) => ({ ...p, promoDurationDays: parseInt(e.target.value) || 7 }))} disabled={loading}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20" />
              <span className="text-xs text-slate-400">{t.days}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Numbers (2 columns) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Baseline */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{t.step2base}</h3>
          <div className="space-y-3">
            <NumberInput label={t.sales} value={form.baseline.totalSales} onChange={(v) => setBaseline('totalSales', v)} disabled={loading} />
            <NumberInput label={t.tc} value={form.baseline.transactionCount} onChange={(v) => setBaseline('transactionCount', v)} disabled={loading} />
            <NumberInput label={t.margin} value={form.baseline.grossMarginPercent} onChange={(v) => setBaseline('grossMarginPercent', v)} suffix="%" disabled={loading} />
            <p className="text-xs text-slate-400">{t.avgTicket}: {baseAvg} AZN</p>
          </div>
        </div>

        {/* Promo */}
        <div className="rounded-2xl border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-5">
          <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{t.step2promo}</h3>
          <div className="space-y-3">
            <NumberInput label={t.sales} value={form.promo.totalSales} onChange={(v) => setPromo('totalSales', v)} disabled={loading} />
            <NumberInput label={t.tc} value={form.promo.transactionCount} onChange={(v) => setPromo('transactionCount', v)} disabled={loading} />
            <NumberInput label={t.margin} value={form.promo.grossMarginPercent} onChange={(v) => setPromo('grossMarginPercent', v)} suffix="%" disabled={loading} />
            <NumberInput label={t.promoCost} value={form.promo.promoCost} onChange={(v) => setPromo('promoCost', v)} disabled={loading} />
            <NumberInput label={t.marketingSpend} value={form.promo.marketingSpend} onChange={(v) => setPromo('marketingSpend', v)} disabled={loading} />
            <p className="text-xs text-slate-400">{t.avgTicket}: {promoAvg} AZN</p>
          </div>
        </div>
      </div>

      {/* Fixed costs toggle */}
      <button type="button" onClick={() => setShowFixed(!showFixed)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-500 transition hover:border-[var(--dk-navy)]">
        {t.fixedToggle}
        <ChevronDown size={14} className={`transition-transform ${showFixed ? 'rotate-180' : ''}`} />
      </button>
      {showFixed && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
          <NumberInput label={t.rent} value={form.fixedCosts.rentPercent} onChange={(v) => setFixed('rentPercent', v)} suffix="%" disabled={loading} />
          <NumberInput label={t.royalty} value={form.fixedCosts.royaltyPercent} onChange={(v) => setFixed('royaltyPercent', v)} suffix="%" disabled={loading} />
          <NumberInput label={t.adPool} value={form.fixedCosts.adPoolPercent} onChange={(v) => setFixed('adPoolPercent', v)} suffix="%" disabled={loading} />
          <NumberInput label={t.serviceFee} value={form.fixedCosts.serviceFeePercent} onChange={(v) => setFixed('serviceFeePercent', v)} suffix="%" disabled={loading} />
        </div>
      )}

      {/* Submit */}
      <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />{t.submitting}</> : t.submit}
      </button>
    </div>
  );
}
