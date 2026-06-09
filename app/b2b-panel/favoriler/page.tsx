'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import ListingCard from '@/components/listings/ListingCard';
import ListingModal from '@/components/listings/ListingModal';
import { MOCK_LISTINGS, type MockListing } from '@/lib/data/mockListings';

export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [listings, setListings] = useState<MockListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeListing, setActiveListing] = useState<MockListing | null>(null);

  // Sync favorites list
  const syncFavorites = () => {
    const favorites = JSON.parse(localStorage.getItem('dk_favorites') || '[]') as number[];
    setFavoriteIds(favorites);
  };

  useEffect(() => {
    syncFavorites();
    window.addEventListener('dk_favorites_changed', syncFavorites);
    return () => {
      window.removeEventListener('dk_favorites_changed', syncFavorites);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadListings() {
      setLoading(true);
      try {
        const response = await fetch('/api/listings?showcase=true');
        if (!response.ok) throw new Error('load failed');
        const payload = (await response.json()) as { data?: MockListing[] };
        if (!cancelled && Array.isArray(payload.data) && payload.data.length > 0) {
          setListings(payload.data);
        }
      } catch {
        if (!cancelled) {
          setListings(MOCK_LISTINGS);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }
    loadListings();
    return () => {
      cancelled = true;
    };
  }, []);

  const favoriteListings = listings.filter((item) => favoriteIds.includes(item.id));

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-slate-50/30">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-flex rounded-full bg-[var(--dk-gold)]/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--dk-gold)]">
            KABİNET
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-[var(--dk-navy)]">Sevimlilər</h1>
          <p className="mt-2 text-sm text-slate-500">
            Yadda saxladığınız, bəyəndiyiniz və izlədiyiniz elanlar.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="aspect-[16/9] animate-pulse bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-6 w-3/4 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-5 w-1/3 animate-pulse rounded-full bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        ) : favoriteListings.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center max-w-2xl mx-auto mt-8">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 shadow-sm">
              <Star className="h-8 w-8 text-amber-400" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-black text-[var(--dk-navy)]">Siyahınız boşdur</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500">
              Hələ ki heç bir elanı sevimlilərə əlavə etməmisiniz. Kataloqa keçərək maraqlı təklifləri ulduz işarəsi ilə yadda saxlaya bilərsiniz.
            </p>
            <Link
              href="/listings"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--dk-gold)] px-6 py-3 text-sm font-bold text-[var(--dk-navy)] hover:opacity-95 transition"
            >
              Elanları Kəşf Et
            </Link>
          </div>
        ) : (
          /* Grid of Favorites */
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {favoriteListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onOpen={setActiveListing} />
            ))}
          </div>
        )}
      </div>

      <ListingModal listing={activeListing} onClose={() => setActiveListing(null)} />
    </div>
  );
}
