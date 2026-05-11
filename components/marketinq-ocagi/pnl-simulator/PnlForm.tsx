'use client';

import { useState } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import type { Locale } from '@/i18n/config';

const FIELDS = {
  main: ['revenue', 'foodCost', 'staffCost', 'rent'] as const,
  cogs: ['packaging'] as const,
  controllable: ['management', 'advertising', 'promo', 'outsource', 'uniform', 'supplies', 'repair', 'utilities', 'otherControllable'] as const,
  uncontrollable: ['accounting', 'insurance', 'tax', 'depreciation'] as const,
};

const labels: Record<Locale, Record<string, string>> = {
  az: {
    revenue: 'Aylıq gəlir (AZN)', foodCost: 'Qida maya dəyəri', staffCost: 'İşçi xərcləri', rent: 'İcarə',
    packaging: 'Qablaşdırma', management: 'Rəhbərlik maaşı', advertising: 'Reklam', promo: 'Promo',
    outsource: 'Kənar xidmətlər', uniform: 'Uniforma', supplies: 'Sərf materialları', repair: 'Təmir',
    utilities: 'Kommunal', otherControllable: 'Digər nəzarət edilən', accounting: 'Mühasibatlıq',
    insurance: 'Sığorta', tax: 'Vergilər', depreciation: 'Amortizasiya',
    cogsSection: 'COGS əlavə', controllableSection: 'Nəzarət edilən xərclər', uncontrollableSection: 'Sabit xərclər',
    submit: 'P&L Hesabla', submitting: 'Hesablanır...',
  },
  en: {
    revenue: 'Monthly Revenue (AZN)', foodCost: 'Food Cost', staffCost: 'Staff Cost', rent: 'Rent',
    packaging: 'Packaging', management: 'Management Salary', advertising: 'Advertising', promo: 'Promo',
    outsource: 'Outsource', uniform: 'Uniforms', supplies: 'Supplies', repair: 'Repairs',
    utilities: 'Utilities', otherControllable: 'Other controllable', accounting: 'Accounting',
    insurance: 'Insurance', tax: 'Taxes', depreciation: 'Depreciation',
    cogsSection: 'COGS additional', controllableSection: 'Controllable expenses', uncontrollableSection: 'Fixed expenses',
    submit: 'Calculate P&L', submitting: 'Calculating...',
  },
  tr: {
    revenue: 'Aylık Gelir (AZN)', foodCost: 'Gıda Maliyeti', staffCost: 'İşçilik', rent: 'Kira',
    packaging: 'Ambalaj', management: 'Yönetim Maaşı', advertising: 'Reklam', promo: 'Promosyon',
    outsource: 'Dış Hizmet', uniform: 'Üniforma', supplies: 'Sarf Malzeme', repair: 'Tamir',
    utilities: 'Faturalar', otherControllable: 'Diğer kontrol edilebilir', accounting: 'Muhasebe',
    insurance: 'Sigorta', tax: 'Vergiler', depreciation: 'Amortisman',
    cogsSection: 'COGS ek', controllableSection: 'Kontrol edilebilir giderler', uncontrollableSection: 'Sabit giderler',
    submit: 'P&L Hesapla', submitting: 'Hesaplanıyor...',
  },
  ru: {
    revenue: 'Месячная выручка (AZN)', foodCost: 'Стоимость продуктов', staffCost: 'Зарплата персонала', rent: 'Аренда',
    packaging: 'Упаковка', management: 'Зарплата руководства', advertising: 'Реклама', promo: 'Промо',
    outsource: 'Аутсорсинг', uniform: 'Униформа', supplies: 'Расходные материалы', repair: 'Ремонт',
    utilities: 'Коммунальные', otherControllable: 'Прочие контролируемые', accounting: 'Бухгалтерия',
    insurance: 'Страховка', tax: 'Налоги', depreciation: 'Амортизация',
    cogsSection: 'COGS доп.', controllableSection: 'Контролируемые расходы', uncontrollableSection: 'Постоянные расходы',
    submit: 'Рассчитать P&L', submitting: 'Расчёт...',
  },
};

const DEFAULTS: Record<string, number> = {
  revenue: 50000, foodCost: 15000, packaging: 500, staffCost: 10000, management: 2500,
  advertising: 1500, promo: 800, outsource: 600, uniform: 200, supplies: 400, repair: 300,
  utilities: 2000, otherControllable: 500, rent: 5000, accounting: 800, insurance: 400, tax: 1200, depreciation: 600,
};

function NumField({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <input type="number" value={value || ''} onChange={(e) => onChange(parseFloat(e.target.value) || 0)} disabled={disabled}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20" />
    </div>
  );
}

interface Props { locale: Locale; onResult: (data: unknown) => void; onError: (msg: string) => void }

export default function PnlForm({ locale, onResult, onError }: Props) {
  const t = labels[locale];
  const [form, setForm] = useState<Record<string, number>>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [showCogs, setShowCogs] = useState(false);
  const [showCtrl, setShowCtrl] = useState(false);
  const [showFixed, setShowFixed] = useState(false);

  function set(k: string, v: number) { setForm((p) => ({ ...p, [k]: v })); }

  const isValid = form.revenue > 0;

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing-tools/pnl-simulator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale }),
      });
      const data = await res.json();
      if (!res.ok) { onError(data.error ?? 'unknown'); return; }
      onResult(data.data);
    } catch { onError('network'); } finally { setLoading(false); }
  }

  function ToggleSection({ label, open, toggle, fields }: { label: string; open: boolean; toggle: () => void; fields: readonly string[] }) {
    return (
      <>
        <button type="button" onClick={toggle} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-500 transition hover:border-[var(--dk-navy)]">
          {label} <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {fields.map((f) => <NumField key={f} label={t[f]} value={form[f]} onChange={(v) => set(f, v)} disabled={loading} />)}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {FIELDS.main.map((f) => <NumField key={f} label={t[f]} value={form[f]} onChange={(v) => set(f, v)} disabled={loading} />)}
      </div>

      <ToggleSection label={t.cogsSection} open={showCogs} toggle={() => setShowCogs(!showCogs)} fields={FIELDS.cogs} />
      <ToggleSection label={t.controllableSection} open={showCtrl} toggle={() => setShowCtrl(!showCtrl)} fields={FIELDS.controllable} />
      <ToggleSection label={t.uncontrollableSection} open={showFixed} toggle={() => setShowFixed(!showFixed)} fields={FIELDS.uncontrollable} />

      <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />{t.submitting}</> : t.submit}
      </button>
    </div>
  );
}
