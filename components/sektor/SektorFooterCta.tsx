'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface SektorFooterCtaProps {
  namespace: string;
  headlineKey: string;
  ctaKey: string;
  href: string;
}

export default function SektorFooterCta({ namespace, headlineKey, ctaKey, href }: SektorFooterCtaProps) {
  const t = useTranslations(namespace);

  return (
    <section className="bg-slate-900 py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-black tracking-tighter text-white sm:text-4xl">
          {t(headlineKey)}
        </h2>
        <div className="mt-8">
          <Link
            href={href}
            className="inline-flex items-center gap-2 rounded-2xl bg-[var(--dk-red)] px-10 py-4 text-sm font-bold text-white shadow-xl shadow-[var(--dk-red)]/20 transition hover:brightness-110"
          >
            {t(ctaKey)}
          </Link>
        </div>
      </div>
    </section>
  );
}
