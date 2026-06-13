'use client';

import { useEffect, useRef } from 'react';

export interface PublicAd {
  id: number;
  format: string;
  mediaUrl: string;
  targetUrl: string;
  altText: string | null;
  placement: string;
}

// Renders a single ad creative and tracks impression (on mount) + click
// (via the /api/ads/[id]/click redirect). Discloses "Reklam" for transparency.
export default function AdView({ ad, className }: { ad: PublicAd; className?: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(`/api/ads/${ad.id}/impression`, { method: 'POST', keepalive: true }).catch(() => {});
  }, [ad.id]);

  return (
    <a
      href={`/api/ads/${ad.id}/click`}
      target="_blank"
      rel="noopener noreferrer sponsored"
      aria-label={ad.altText || 'Reklam'}
      className={`relative block overflow-hidden rounded-2xl border border-slate-200 ${className ?? ''}`}
    >
      <span className="absolute right-2 top-2 z-10 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
        Reklam
      </span>
      {ad.format === 'video' ? (
        <video
          src={ad.mediaUrl}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={ad.mediaUrl}
          alt={ad.altText || 'Reklam'}
          className="h-full w-full object-cover"
        />
      )}
    </a>
  );
}
