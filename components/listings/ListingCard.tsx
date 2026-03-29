'use client';

import Image from 'next/image';
import { MapPin } from 'lucide-react';
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
  const category = getCategoryById(listing.type);

  return (
    <button
      type="button"
      onClick={() => onOpen(listing)}
      className="group block overflow-hidden rounded-[28px] border border-slate-200 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl"
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
        <div className="absolute left-4 top-4">
          <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${category?.badgeClass ?? 'bg-white text-slate-700'}`}>
            {category?.label ?? listing.type}
          </span>
        </div>
        {listing.isFeatured ? (
          <div className="absolute right-4 top-4">
            <span className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-black text-[var(--dk-gold)] shadow">
              ⭐ Seçilmiş
            </span>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <h3 className="truncate font-display text-2xl font-black text-[var(--dk-navy)]">{listing.title}</h3>
          <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
            <MapPin className="h-4 w-4 text-[var(--dk-gold)]" />
            {listing.city}{listing.district ? `, ${listing.district}` : ''}
          </div>
        </div>

        <div className="text-2xl font-black text-[var(--dk-gold)]">{formatPrice(listing)}</div>

        <p className="line-clamp-2 text-sm leading-6 text-slate-600">{listing.description}</p>

        <div className="inline-flex items-center gap-2 text-sm font-bold text-[var(--dk-red)]">
          Ətraflı bax →
        </div>
      </div>
    </button>
  );
}
