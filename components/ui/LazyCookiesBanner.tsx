'use client';

import dynamic from 'next/dynamic';

const CookiesBanner = dynamic(() => import('./CookiesBanner'), { ssr: false });

export default function LazyCookiesBanner() {
  return <CookiesBanner />;
}
