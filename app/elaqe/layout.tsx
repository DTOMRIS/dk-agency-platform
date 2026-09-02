import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Əlaqə səhifəsi 'use client'-dir və metadata ixrac edə bilmir; sitemap-da
 * olmasına baxmayaraq öz başlığı yox idi (TASK-0433). Mətn səhifənin öz
 * `contact` namespace-indəki başlıq və lead cümləsidir.
 */
export const metadata: Metadata = {
  title: 'Bizimlə əlaqə — DK Agency',
  description: 'Sual, təklif və ya əməkdaşlıq fikriniz varsa, ən doğru kanaldan başlayın.',
};

export default function ElaqeLayout({ children }: { children: ReactNode }) {
  return children;
}
