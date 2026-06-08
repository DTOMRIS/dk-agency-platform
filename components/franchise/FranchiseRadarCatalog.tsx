'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Beef,
  Coffee,
  GraduationCap,
  IceCream,
  Sandwich,
  Store,
  MapPin,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import { getAllBrands, ACTIVE_SECTORS } from '@/lib/data/franchiseDirectory';
import type { FranchiseBrand, FranchiseSector } from '@/lib/data/franchiseDirectory';
import { trackFranchiseRadar } from '@/lib/analytics/franchiseEvents';
import FranchiseLeadModal from './FranchiseLeadModal';

const ICONS: Record<string, LucideIcon> = {
  Beef,
  Sandwich,
  Coffee,
  IceCream,
  GraduationCap,
  Store,
};

const ORIGIN_FLAG: Record<string, string> = { US: '🇺🇸', TR: '🇹🇷', JP: '🇯🇵' };

function formatUsd(min: number | null, max: number | null, notDisclosed: string): string {
  if (min == null && max == null) return notDisclosed;
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`);
  if (min != null && max != null) return `${fmt(min)} – ${fmt(max)}`;
  return fmt((min ?? max) as number);
}

export default function FranchiseRadarCatalog() {
  const t = useTranslations('franchiseRadar');
  const [sector, setSector] = useState<FranchiseSector | 'all'>('all');
  const [active, setActive] = useState<FranchiseBrand | null>(null);

  useEffect(() => {
    trackFranchiseRadar({ action: 'view' });
  }, []);

  const brands = useMemo(
    () => (sector === 'all' ? getAllBrands() : getAllBrands().filter((b) => b.sector === sector)),
    [sector]
  );

  function selectSector(next: FranchiseSector | 'all') {
    setSector(next);
    if (next !== 'all') trackFranchiseRadar({ action: 'filter', sector: next });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => selectSector('all')}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
            sector === 'all'
              ? 'bg-[var(--dk-navy)] text-white'
              : 'border border-slate-200 bg-white text-slate-700 hover:border-[var(--dk-gold)]'
          }`}
        >
          {t('filters.all')}
        </button>
        {ACTIVE_SECTORS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => selectSector(s)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              sector === s
                ? 'bg-[var(--dk-navy)] text-white'
                : 'border border-slate-200 bg-white text-slate-700 hover:border-[var(--dk-gold)]'
            }`}
          >
            {t(`sectors.${s}`)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => {
          const Icon = ICONS[b.iconCategory] ?? Store;
          return (
            <div
              key={b.slug}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-[var(--dk-navy)]">
                  <Icon size={24} />
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[var(--dk-gold)]">
                  {t(`status.${b.azStatus}`)}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">{b.brandName}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <MapPin size={13} />
                {ORIGIN_FLAG[b.origin] ? `${ORIGIN_FLAG[b.origin]} ` : ''}
                {b.origin}
                {b.founded ? ` · ${b.founded}` : ''}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                  {t(`sectors.${b.sector}`)}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-600">
                  {t(`entryModel.${b.entryModel}`)}
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-700">
                {t(`brandDesc.${b.descKey}`)}
              </p>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {t('card.investment')}
                </div>
                <div className="text-sm font-black text-slate-900">
                  {formatUsd(b.investmentMinUsd, b.investmentMaxUsd, t('card.notDisclosed'))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActive(b)}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-4 text-sm font-black text-white transition hover:bg-rose-600"
              >
                {t('card.interested')} <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="mt-10 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 text-xs leading-relaxed text-slate-500">
        {t('disclaimer')}
      </p>

      {active ? (
        <FranchiseLeadModal
          brandSlug={active.slug}
          brandName={active.brandName}
          onClose={() => setActive(null)}
        />
      ) : null}
    </div>
  );
}
