// components/news/PromoCard.tsx
// DK Agency - Promosyon Kartı (Dark Theme)

import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface PromoCardProps {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
}

export default function PromoCard({ title, description, ctaText, ctaLink }: PromoCardProps) {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-[var(--dk-surface-dark)] to-[var(--dk-surface-deep)] p-6 relative overflow-hidden border border-[color:color-mix(in_srgb,var(--dk-gold)_8%,transparent)]">
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[var(--dk-gold)]/5" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-[var(--dk-gold)]/5" />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 rounded-full bg-[var(--dk-red)]/5" />

      {/* Content */}
      <div className="relative z-10">
        <h3 className="font-black text-xl text-[var(--dk-text)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--dk-muted)] leading-relaxed mb-5">{description}</p>

        <Link
          href={ctaLink}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--dk-red)] text-white rounded-xl text-sm font-bold hover:bg-[var(--dk-gold)] transition-colors"
        >
          <Sparkles size={16} />
          {ctaText}
        </Link>
      </div>
    </div>
  );
}
