import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: 'Addım Xərci Kalkulyatoru — Boş Yola Ödənən Maaş',
  description:
    'Aşpaz və ofisiantın gündə boş yola sərf etdiyi vaxtı aylıq və illik əmək haqqı itkisinə çevir. Spagetti diaqramı ilə ölç, öz rəqəmlərinlə hesabla.',
};

export default function ToolkitAddimXerciLayout({ children }: { children: ReactNode }) {
  return children;
}
