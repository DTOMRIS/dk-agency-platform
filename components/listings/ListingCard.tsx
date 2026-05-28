'use client';

import Image from 'next/image';
import { MapPin, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { MockListing } from '@/lib/data/mockListings';
import { getCategoryById } from '@/lib/data/listingCategories';

interface ListingCardProps {
  listing: MockListing;
  onOpen: (listing: MockListing) => void;
}

function formatPrice(listing: MockListing) {
  if (listing.priceLabel) return listing.priceLabel;
  return `${new Intl.NumberFormat('az-AZ').format(listing.price)} ${listing.currency}`;
}

export default function ListingCard({ listing, onOpen }: ListingCardProps) {
  const t = useTranslations('devir');
  const category = getCategoryById(listing.type);

  return (
    <button
      type="button"
      onClick={() => onOpen(listing)}
      className="group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ring-1 ring-slate-100"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={listing.images[0]?.url ?? '/images/listings/placeholder-1.svg'}
          alt={listing.images[0]?.alt ?? listing.title}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(26,26,46,0.55)] via-transparent to-transparent" />

        {/* Category badge — sol üst */}
        <div className="absolute left-3 top-3">
          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${category?.badgeClass ?? 'bg-white text-slate-700'}`}>
            {category?.label ?? listing.type}
          </span>
        </div>

        {/* Status / Featured badge — sağ üst */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 items-end">
          {listing.isFeatured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black text-[var(--dk-gold)] shadow-sm backdrop-blur-sm">
              ⭐ {t('featured')}
            </span>
          )}
          {/* DK Onaylı badge (statik — M5-də real verification) */}
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
            <ShieldCheck size={10} />
            {t('dkVerified')}
          </span>
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className="truncate font-display text-xl font-black text-[var(--dk-navy)]">{listing.title}</h3>
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 text-[var(--dk-gold)]" />
            {listing.city}{listing.district ? `, ${listing.district}` : ''}
          </div>
        </div>

        <div className="text-2xl font-black text-[var(--dk-gold)]">{formatPrice(listing)}</div>

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{listing.description}</p>

        <div className="inline-flex items-center gap-1.5 text-sm font-bold text-[var(--dk-red)] transition-colors group-hover:text-[var(--dk-red-hover)]">
          {t('viewDetails')} →
        </div>
      </div>
    </button>
  );
}
