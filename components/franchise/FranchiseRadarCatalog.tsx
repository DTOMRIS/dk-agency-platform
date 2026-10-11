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
    <div>
      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => selectSector('all')}
          aria-pressed={sector === 'all'}
          className={`min-h-10 rounded-full px-4 py-2 text-[13.5px] font-bold transition ${
            sector === 'all'
              ? 'bg-[#0F172A] text-white'
              : 'border border-[#E4DCCD] bg-white text-[#0F172A] hover:border-[#0F172A]'
          }`}
        >
          {t('filters.all')}
        </button>
        {ACTIVE_SECTORS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => selectSector(s)}
            aria-pressed={sector === s}
            className={`min-h-10 rounded-full px-4 py-2 text-[13.5px] font-bold transition ${
              sector === s
                ? 'bg-[#0F172A] text-white'
                : 'border border-[#E4DCCD] bg-white text-[#0F172A] hover:border-[#0F172A]'
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
              className="flex flex-col rounded-[22px] border border-[#E4DCCD] bg-white p-6 transition hover:border-[#0F172A]"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6F1E9] text-[#0F172A]">
                  <Icon size={24} aria-hidden="true" />
                </div>
                <span className="rounded-full bg-[#FDECEF] px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-[0.12em] text-[#BE2F47]">
                  {t(`status.${b.azStatus}`)}
                </span>
              </div>

              <h3 className="mt-4 text-[20px] font-black tracking-[-0.02em] text-[#0F172A]">{b.brandName}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <MapPin size={13} />
                {ORIGIN_FLAG[b.origin] ? `${ORIGIN_FLAG[b.origin]} ` : ''}
                {b.origin}
                {b.founded ? ` · ${b.founded}` : ''}
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-md border border-[#E4DCCD] bg-[#FBF8F3] px-2 py-1 text-[11px] font-bold text-slate-700">
                  {t(`sectors.${b.sector}`)}
                </span>
                <span className="rounded-md border border-[#E4DCCD] bg-[#FBF8F3] px-2 py-1 text-[11px] font-bold text-slate-700">
                  {t(`entryModel.${b.entryModel}`)}
                </span>
              </div>

              <p className="mt-3 text-[14.5px] leading-6 text-slate-600">
                {t(`brandDesc.${b.descKey}`)}
              </p>

              <div className="mt-4 border-t border-[#EFE9DE] pt-3">
                <div className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-slate-500">
                  {t('card.investment')}
                </div>
                <div className="text-[15px] font-black tabular-nums text-[#0F172A]">
                  {formatUsd(b.investmentMinUsd, b.investmentMaxUsd, t('card.notDisclosed'))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActive(b)}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-dk-red-strong px-5 text-[14px] font-bold text-white transition-colors hover:bg-dk-red-deep"
              >
                {t('card.interested')} <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <p className="mt-10 rounded-2xl border border-[#E4DCCD] bg-white px-5 py-4 text-[12.5px] leading-5 text-slate-500">
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
