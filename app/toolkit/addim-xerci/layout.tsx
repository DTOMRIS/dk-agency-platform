import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: 'Addım xərci kalkulyatoru — boş yola ödənən maaş',
  description:
    'Aşpaz və ofisiantın gündə boş yola sərf etdiyi vaxtı aylıq və illik maaş itkisinə çevirin. İşçinin yolunu kağızdakı planda xəttlə çəkib ölçün, öz rəqəmlərinizlə hesablayın.',
};

export default function ToolkitAddimXerciLayout({ children }: { children: ReactNode }) {
  return children;
}
