'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface SektorHeroProps {
  namespace: string;
  headlineKey: string;
  sublineKey: string;
  statBadgeKey: string;
  primaryCta: { key: string; href: string };
  secondaryCta: { key: string; href: string };
  heroImage?: string;
}

export default function SektorHero({
  namespace,
  headlineKey,
  sublineKey,
  statBadgeKey,
  primaryCta,
  secondaryCta,
  heroImage,
}: SektorHeroProps) {
  const t = useTranslations(namespace);

  return (
    <section className="relative overflow-hidden bg-[#1A1A2E] py-20 sm:py-28 lg:py-36">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,var(--dk-gold)_0%,transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 sm:px-6 lg:flex-row lg:gap-20 lg:px-8">
        <div className="flex-1 text-center lg:text-left">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C5A022]/30 bg-[#C5A022]/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.25em] text-[#C5A022]">
            {t(statBadgeKey)}
          </div>

          <h1 className="font-display text-4xl font-black leading-tight tracking-tighter text-white sm:text-5xl lg:text-6xl">
            {t(headlineKey)}
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            {t(sublineKey)}
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <Link
              href={primaryCta.href}
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--dk-red)] px-8 py-4 text-sm font-bold text-white shadow-xl shadow-[var(--dk-red)]/20 transition hover:brightness-110"
            >
              {t(primaryCta.key)} →
            </Link>
            <Link
              href={secondaryCta.href}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-sm font-bold text-white transition hover:bg-white/10"
            >
              {t(secondaryCta.key)}
            </Link>
          </div>
        </div>

        {heroImage && (
          <div className="flex-shrink-0 lg:w-[480px]">
            <Image
              src={heroImage}
              alt=""
              width={960}
              height={640}
              className="rounded-3xl shadow-2xl"
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}
