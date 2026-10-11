'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { MapPin, ShieldCheck, Star } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import type { MockListing } from '@/lib/data/mockListings';
import { getCategoryById } from '@/lib/data/listingCategories';
import { getSectorLabel } from '@/lib/data/listingSectors';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import { LISTING_CARD_TONES, type ListingTone } from '@/components/listings/listing-tones';

interface ListingCardProps {
  listing: MockListing;
  onOpen: (listing: MockListing) => void;
  /** `v2` on the public /ilanlar showcase; `panel` (default) keeps the member-panel look. */
  tone?: ListingTone;
}

function formatPrice(listing: MockListing) {
  if (listing.priceLabel) return listing.priceLabel;
  return `${new Intl.NumberFormat(AZ_NUMBER_LOCALE).format(listing.price)} ${listing.currency}`;
}

export default function ListingCard({ listing, onOpen, tone = 'panel' }: ListingCardProps) {
  const t = useTranslations('devir');
  const tCard = useTranslations('listingsV2.card');
  const ui = LISTING_CARD_TONES[tone];
  const locale = useLocale() as 'az' | 'en' | 'ru' | 'tr';
  const category = getCategoryById(listing.type);

  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const favorites = JSON.parse(localStorage.getItem('dk_favorites') || '[]') as number[];
      setIsFavorite(favorites.includes(listing.id));
    }, 0);
    return () => clearTimeout(timer);
  }, [listing.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem('dk_favorites') || '[]') as number[];
    let nextFavs: number[];
    if (favorites.includes(listing.id)) {
      nextFavs = favorites.filter((id) => id !== listing.id);
      setIsFavorite(false);
    } else {
      nextFavs = [...favorites, listing.id];
      setIsFavorite(true);
    }
    localStorage.setItem('dk_favorites', JSON.stringify(nextFavs));
    window.dispatchEvent(new Event('dk_favorites_changed'));
  };

  return (
    <button
      type="button"
      onClick={() => onOpen(listing)}
      className={ui.root}
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

        {/* Category + Sector badges — sol üst */}
        <div className="absolute left-3 top-3 flex max-w-[55%] flex-col gap-1.5">
          <span className={`inline-flex truncate rounded-full px-3 py-1 text-[11px] font-bold ${category?.badgeClass ?? 'bg-white text-slate-700'}`}>
            {category?.label ?? listing.type}
          </span>
          {listing.sector ? (
            <span className="inline-flex truncate rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-slate-700 shadow-sm backdrop-blur-sm">
              {getSectorLabel(listing.sector, locale)}
            </span>
          ) : null}
        </div>

        {/* Status / Featured badge — sağ üst */}
        <div className="absolute right-3 top-3 flex max-w-[42%] flex-col items-end gap-1.5">
          {listing.isFeatured && (
            <span className={`inline-flex items-center gap-1 truncate rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-black ${ui.featured} shadow-sm backdrop-blur-sm`}>
              ⭐ {t('featured')}
            </span>
          )}
          {/* DK Onaylı badge (statik — M5-də real verification) */}
          <span className="inline-flex items-center gap-1 truncate rounded-full bg-emerald-500/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur-sm">
            <ShieldCheck size={10} />
            {t('dkVerified')}
          </span>
        </div>

        {/* Favorite overlay button — sağ alt */}
        <button
          type="button"
          onClick={toggleFavorite}
          className="absolute right-3 bottom-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm transition hover:scale-110 hover:text-amber-500 z-10"
          title={isFavorite ? tCard('favRemove') : tCard('favAdd')}
          aria-label={isFavorite ? tCard('favRemove') : tCard('favAdd')}
        >
          <Star size={16} className={isFavorite ? 'fill-amber-500 text-amber-500' : ''} />
        </button>
      </div>

      <div className="space-y-3 p-5">
        <div>
          <h3 className={ui.title}>{listing.title}</h3>
          <div className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className={ui.pin} />
            {listing.city}{listing.district ? `, ${listing.district}` : ''}
          </div>
        </div>

        <div className={ui.price}>{formatPrice(listing)}</div>

        <p className="line-clamp-2 text-sm leading-relaxed text-slate-500">{listing.description}</p>

        <div className={ui.more}>
          {t('viewDetails')} →
        </div>
      </div>
    </button>
  );
}
