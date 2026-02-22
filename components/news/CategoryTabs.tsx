// components/news/CategoryTabs.tsx
// DK Agency - Kategori Sekmeleri

'use client';

import { useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const TABS = [
  { value: '', label: 'TÜMÜ' },
  { value: 'horeca', label: 'HORECA' },
  { value: 'yatirim', label: 'YATIRIM' },
  { value: 'egitim', label: 'EĞİTİM' },
  { value: 'operasyon', label: 'OPERASYON' },
];

export default function CategoryTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = useMemo(
    () => searchParams.get('category') || '',
    [searchParams]
  );

  const handleTabClick = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete('category');
    else params.set('category', value);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-0 min-w-max px-4">
        {TABS.map((tab) => {
          const isActive = activeCategory === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={`px-4 py-3 text-xs font-bold tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                isActive
                  ? 'text-red-500 border-red-500'
                  : 'text-white/50 border-transparent hover:text-white/80'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
