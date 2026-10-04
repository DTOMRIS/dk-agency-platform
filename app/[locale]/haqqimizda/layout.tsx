import type { ReactNode } from 'react';
import AboutJsonLd from '@/components/seo/AboutJsonLd';

/** /ru|en|tr/haqqimizda — same About JSON-LD as the AZ root layout (TASK-0475). */
export default function LocalizedHaqqimizdaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AboutJsonLd />
      {children}
    </>
  );
}
