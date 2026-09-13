import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Haqqımızda səhifəsi 'use client'-dir və metadata ixrac edə bilmir. Bu səhifə
 * hər bloq yazısındakı Article JSON-LD-də `author.url` hədəfidir (E-E-A-T
 * siqnalı), buna baxmayaraq öz başlığı yox idi (TASK-0433). Mətn səhifənin öz
 * AZ kopyasındandır — 2010, 40 illik təcrübə, «ilk AI dəstəkli HoReCa B2B».
 */
export const metadata: Metadata = {
  title: 'Haqqımızda — DK Agency və Doğan Tomris',
  description:
    'DK Agency Azərbaycanın ilk AI dəstəkli HoReCa B2B platformasıdır. 2010-dan bəri, 40 illik sektor təcrübəsi ilə: food cost, P&L, franchise tərəfdaşlığı və sektor məsləhəti.',
};

export default function HaqqimizdaLayout({ children }: { children: ReactNode }) {
  return children;
}
