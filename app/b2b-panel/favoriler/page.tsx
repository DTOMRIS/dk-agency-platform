'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import ListingCard from '@/components/listings/ListingCard';
import ListingModal from '@/components/listings/ListingModal';
import { type MockListing } from '@/lib/data/mockListings';

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
        // TASK-0526: no MOCK_LISTINGS — favourites are matched against real listings only.
        if (!cancelled) setListings([]);
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
    <div className="min-h-screen bg-[#F6F1E9] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <span className="inline-flex rounded-full border border-[#E4DCCD] bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#5B6474]">
            KABİNET
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0F172A] sm:text-4xl">Sevimlilər</h1>
          <p className="mt-2 text-sm text-[#5B6474]">
            Yadda saxladığınız, bəyəndiyiniz və izlədiyiniz elanlar.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-white">
                <div className="aspect-[16/9] animate-pulse bg-[#EFE9DE]" />
                <div className="space-y-3 p-5">
                  <div className="h-6 w-3/4 animate-pulse rounded-full bg-[#EFE9DE]" />
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#EFE9DE]" />
                  <div className="h-5 w-1/3 animate-pulse rounded-full bg-[#EFE9DE]" />
                </div>
              </div>
            ))}
          </div>
        ) : favoriteListings.length === 0 ? (
          /* Empty State */
          <div className="mx-auto mt-8 max-w-2xl rounded-[22px] border border-dashed border-[#E4DCCD] bg-white px-6 py-16 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#E4DCCD] bg-[#FBF8F3]">
              <Star className="h-8 w-8 text-[#0F172A]" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold text-[#0F172A]">Siyahınız boşdur</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#334155]">
              Hələ ki heç bir elanı sevimlilərə əlavə etməmisiniz. Kataloqa keçərək maraqlı təklifləri ulduz işarəsi ilə yadda saxlaya bilərsiniz.
            </p>
            <Link
              href="/listings"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-dk-red-strong px-6 text-sm font-bold text-white transition hover:opacity-90"
            >
              Elanları Kəşf Et
            </Link>
          </div>
        ) : (
          /* Grid of Favorites */
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {favoriteListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} onOpen={setActiveListing} tone="v2" />
            ))}
          </div>
        )}
      </div>

      <ListingModal listing={activeListing} onClose={() => setActiveListing(null)} tone="v2" />
    </div>
  );
}
