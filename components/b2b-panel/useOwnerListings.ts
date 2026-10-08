'use client';

import { useEffect, useState } from 'react';

/** GET /api/listings?scope=owner cavabının bu səhifələrə lazım olan hissəsi (mapDbListing). */
export interface OwnerLead {
  name: string;
  phone: string;
  email: string;
  message: string;
  status: 'new' | 'contacted';
  createdAt: string;
}

export interface OwnerListing {
  id: number;
  slug: string;
  title: string;
  status: string;
  rejectedReason?: string | null;
  leads?: OwnerLead[];
  createdAt: string;
  updatedAt?: string;
}

/**
 * Üzvün öz elanları (təkliflər və elan statusu bunun içindədir).
 * TASK-0507: `source: 'mock'` (DB yoxdur) gələndə boş siyahı qaytarılır — repository mock rejimində
 * hamıya eyni demo elanları verir, üzvə saxta təklif göstərmək olmaz.
 */
export function useOwnerListings() {
  const [listings, setListings] = useState<OwnerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/listings?scope=owner')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { data?: OwnerListing[]; source?: string }) => {
        if (cancelled) return;
        setListings(data.source === 'db' && Array.isArray(data.data) ? data.data : []);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { listings, loading, failed };
}

/** dd.mm.yyyy — `toLocaleDateString('az-AZ')` Chromium-da «2026 M10 7» verir, ona görə əl ilə. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}
