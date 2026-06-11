'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, Copy, MapPin, MessageCircle, Share2 } from 'lucide-react';
import LeadForm from '@/components/listings/LeadForm';
import { getCategoryById } from '@/lib/data/listingCategories';
import { getFieldsForType } from '@/lib/data/listingFieldConfig';
import { type MockListing } from '@/lib/data/mockListings';
import type { Locale } from '@/i18n/config';

interface Props {
  listing: MockListing;
  copy: { back: string; details: string; contact: string; whatsapp: string; leadTitle: string };
  locale: Locale;
}

function formatPrice(listing: MockListing) {
  if (listing.priceLabel) return listing.priceLabel;
  return `${new Intl.NumberFormat('az-AZ').format(listing.price)} ${listing.currency}`;
}

function renderFieldValue(value: string | number | boolean | undefined) {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? '✅ Bəli' : '❌ Xeyr';
  return String(value);
}

export default function ListingDetailClient({ listing, copy, locale }: Props) {
  const [activeImage, setActiveImage] = useState(0);
  const [toast, setToast] = useState('');
  const category = getCategoryById(listing.type);
  const typeFields = useMemo(() => getFieldsForType(listing.type), [listing.type]);

  const prefix = locale === 'az' ? '' : `/${locale}`;
  const shareLink = typeof window === 'undefined' ? '' : `${window.location.origin}${prefix}/ilanlar/${listing.slug}`;
  const whatsappMessage = `Salam! DK Agency-dən ${listing.trackingCode} nömrəli "${listing.title}" elanı haqqında məlumat almaq istəyirəm.`;

  const handleCopy = async () => {
    if (!shareLink || !navigator.clipboard) return;
    await navigator.clipboard.writeText(shareLink);
    setToast('Link kopyalandı!');
    setTimeout(() => setToast(''), 2400);
  };

  const handleWhatsapp = () => {
    window.open(`https://wa.me/${listing.phone}?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">
      <Link href={`${prefix}/ilanlar`} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[var(--dk-navy)]">
        <ArrowLeft className="h-4 w-4" /> {copy.back}
      </Link>

      <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          {/* Hero image */}
          <div className="overflow-hidden rounded-[28px] border border-slate-200">
            <div className="relative aspect-[16/10]">
              <Image
                src={listing.images[activeImage]?.url ?? listing.images[0]?.url ?? '/placeholder-listing.svg'}
                alt={listing.images[activeImage]?.alt ?? listing.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
              />
            </div>
          </div>

          {/* Thumbnail strip */}
          {listing.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {listing.images.map((image, index) => (
                <button
                  type="button"
                  key={image.id}
                  onClick={() => setActiveImage(index)}
                  className={`relative overflow-hidden rounded-2xl border ${activeImage === index ? 'border-[var(--dk-gold)] ring-2 ring-amber-100' : 'border-slate-200'}`}
                >
                  <div className="relative aspect-[4/3]">
                    <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="160px" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Info card */}
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${category?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
                {category?.label ?? listing.type}
              </span>
              {listing.sector && (
                <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700">
                  {listing.sector}
                </span>
              )}
              <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">
                {listing.trackingCode}
              </span>
            </div>

            <h1 className="font-display text-3xl font-black text-[var(--dk-navy)]">{listing.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[var(--dk-gold)]" />
                {listing.city}{listing.district ? `, ${listing.district}` : ''}
              </span>
              <span className="text-xl font-black text-[var(--dk-gold)]">{formatPrice(listing)}</span>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-600">{listing.description}</p>
          </div>

          {/* Type-specific fields */}
          {typeFields.length > 0 && (
            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">{copy.details}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {typeFields.map((field) => (
                  <div key={field.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{field.label}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-700">
                      {renderFieldValue(listing.typeSpecificData[field.key])}
                      {field.suffix && listing.typeSpecificData[field.key] !== undefined && typeof listing.typeSpecificData[field.key] !== 'boolean' ? ` ${field.suffix}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <LeadForm trackingCode={listing.trackingCode} title={listing.title} />

          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-2xl font-black text-[var(--dk-navy)]">{copy.contact}</h3>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={handleWhatsapp}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-600"
              >
                <MessageCircle className="h-5 w-5" /> {copy.whatsapp}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                {toast ? <><Check className="h-4 w-4 text-emerald-500" /> {toast}</> : <><Copy className="h-4 w-4" /> Link kopyala</>}
              </button>

              <button
                type="button"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`${listing.title} — ${shareLink}`)}`, '_blank', 'noopener,noreferrer')}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
              >
                <Share2 className="h-4 w-4" /> WhatsApp paylaş
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
