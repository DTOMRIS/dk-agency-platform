'use client';

import { useState } from 'react';
import { Loader2, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

const FIELDS = {
  main: ['revenue', 'foodCost', 'staffCost', 'rent'] as const,
  cogs: ['packaging'] as const,
  controllable: ['management', 'advertising', 'promo', 'outsource', 'uniform', 'supplies', 'repair', 'utilities', 'otherControllable'] as const,
  uncontrollable: ['accounting', 'insurance', 'tax', 'depreciation'] as const,
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

interface Props { onResult: (data: unknown) => void; onError: (msg: string) => void }

export default function PnlForm({ onResult, onError }: Props) {
  const t = useTranslations('marketinq.plSimulator');
  const [form, setForm] = useState<Record<string, number>>(DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [showCogs, setShowCogs] = useState(false);
  const [showCtrl, setShowCtrl] = useState(false);
  const [showFixed, setShowFixed] = useState(false);

  function set(k: string, v: number) { setForm((p) => ({ ...p, [k]: v })); }

  function label(field: string) {
    return t(`pnlForm_${field}`);
  }

  const isValid = form.revenue > 0;

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing-tools/pnl-simulator', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, locale: 'az' }),
      });
      const data = await res.json();
      if (!res.ok) { onError(data.error ?? 'unknown'); return; }
      onResult(data.data);
    } catch { onError('network'); } finally { setLoading(false); }
  }

  function ToggleSection({ sectionLabel, open, toggle, fields }: { sectionLabel: string; open: boolean; toggle: () => void; fields: readonly string[] }) {
    return (
      <>
        <button type="button" onClick={toggle} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-xs font-semibold text-slate-500 transition hover:border-[var(--dk-navy)]">
          {sectionLabel} <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {fields.map((f) => <NumField key={f} label={label(f)} value={form[f]} onChange={(v) => set(f, v)} disabled={loading} />)}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {FIELDS.main.map((f) => <NumField key={f} label={label(f)} value={form[f]} onChange={(v) => set(f, v)} disabled={loading} />)}
      </div>

      <ToggleSection sectionLabel={t('pnlForm_cogsSection')} open={showCogs} toggle={() => setShowCogs(!showCogs)} fields={FIELDS.cogs} />
      <ToggleSection sectionLabel={t('pnlForm_controllableSection')} open={showCtrl} toggle={() => setShowCtrl(!showCtrl)} fields={FIELDS.controllable} />
      <ToggleSection sectionLabel={t('pnlForm_uncontrollableSection')} open={showFixed} toggle={() => setShowFixed(!showFixed)} fields={FIELDS.uncontrollable} />

      <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />{t('pnlForm_submitting')}</> : t('pnlForm_submit')}
      </button>
    </div>
  );
}
