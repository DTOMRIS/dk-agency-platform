'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Check, Copy, MapPin, MessageCircle, Share2 } from 'lucide-react';
import LeadForm from '@/components/listings/LeadForm';
import { getCategoryById } from '@/lib/data/listingCategories';
import { getFieldsForType } from '@/lib/data/listingFieldConfig';
import { type MockListing } from '@/lib/data/mockListings';
import type { Locale } from '@/i18n/config';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import home from '@/components/home/v2/homeV2.module.css';
import { Crumbs } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';

interface Props {
  listing: MockListing;
  copy: {
    details: string;
    contact: string;
    whatsapp: string;
    leadTitle: string;
    share: string;
    shareLead: string;
    copyLink: string;
    linkCopied: string;
    yes: string;
    no: string;
  };
  locale: Locale;
  /** Canonical public URL (https://dkagency.com.tr[/locale]/ilanlar/<slug>), built on the server. */
  canonicalUrl: string;
}

function formatPrice(listing: MockListing) {
  if (listing.priceLabel) return listing.priceLabel;
  return `${new Intl.NumberFormat(AZ_NUMBER_LOCALE).format(listing.price)} ${listing.currency}`;
}

function renderFieldValue(value: string | number | boolean | undefined, yes: string, no: string) {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? `✅ ${yes}` : `❌ ${no}`;
  return String(value);
}

/** TASK-0497: localized WhatsApp share text — title, city, price (if any) and the tracked canonical URL. */
export function buildWhatsappShareText(listing: MockListing, lead: string, canonicalUrl: string): string {
  const place = [listing.city, listing.district].filter(Boolean).join(', ');
  const price = listing.priceLabel || listing.price > 0 ? formatPrice(listing) : '';
  const url = `${canonicalUrl}?utm_source=whatsapp&utm_medium=share`;
  return [`${lead}: ${listing.title}`, [place && `📍 ${place}`, price && `💰 ${price}`].filter(Boolean).join(' · '), url]
    .filter(Boolean)
    .join('\n');
}

export default function ListingDetailClient({ listing, copy, locale, canonicalUrl }: Props) {
  const tBack = useTranslations('pageBack');
  const [activeImage, setActiveImage] = useState(0);
  const [toast, setToast] = useState('');
  const category = getCategoryById(listing.type);
  const typeFields = useMemo(() => getFieldsForType(listing.type), [listing.type]);

  const prefix = locale === 'az' ? '' : `/${locale}`;
  const shareLink = canonicalUrl;
  const whatsappMessage = `Salam! DK Agency-dən ${listing.trackingCode} nömrəli "${listing.title}" elanı haqqında məlumat almaq istəyirəm.`;

  const handleCopy = async () => {
    if (!shareLink || !navigator.clipboard) return;
    await navigator.clipboard.writeText(shareLink);
    setToast(copy.linkCopied);
    setTimeout(() => setToast(''), 2400);
  };

  const handleWhatsapp = () => {
    window.open(`https://wa.me/${listing.phone}?text=${encodeURIComponent(whatsappMessage)}`, '_blank', 'noopener,noreferrer');
  };

  const ghostButton =
    'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-5 py-3 text-sm font-bold text-[#0F172A] transition hover:border-[#0F172A]';

  return (
    <main className={s.page}>
      <div className={home.wrap}>
        <Crumbs backHref={`${prefix}/ilanlar`} backLabel={tBack('listings')} trail={listing.trackingCode} />

        <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:gap-8">
          <div className="min-w-0 space-y-5">
            {/* Hero image */}
            <div className="overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-white">
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
                    aria-pressed={activeImage === index}
                    className={`relative overflow-hidden rounded-2xl border bg-white ${activeImage === index ? 'border-[#0F172A] ring-2 ring-[#F4B8C3]' : 'border-[#E4DCCD]'}`}
                  >
                    <div className="relative aspect-[4/3]">
                      <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="160px" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Info card */}
            <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
              <div className="mb-4 flex flex-wrap items-center gap-2.5">
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${category?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
                  {category?.label ?? listing.type}
                </span>
                {listing.sector && (
                  <span className="inline-flex rounded-full border border-[#E4DCCD] bg-[#FBF8F3] px-3 py-1 text-[11px] font-bold text-[#0F172A]">
                    {listing.sector}
                  </span>
                )}
                <span className="inline-flex rounded-full border border-[#E4DCCD] bg-[#FBF8F3] px-3 py-1 text-[11px] font-semibold text-slate-600">
                  {listing.trackingCode}
                </span>
              </div>

              <h1 className="text-[clamp(28px,3.6vw,42px)] font-black leading-[1.05] tracking-[-0.04em] text-[#0F172A]">{listing.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#BE2F47]" />
                  {listing.city}{listing.district ? `, ${listing.district}` : ''}
                </span>
                <span className="text-xl font-black tabular-nums text-[#0F172A]">{formatPrice(listing)}</span>
              </div>
              <p className="mt-5 text-[15px] leading-7 text-slate-700">{listing.description}</p>
            </div>

            {/* Type-specific fields */}
            {typeFields.length > 0 && (
              <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
                <h2 className="text-[20px] font-black tracking-[-0.02em] text-[#0F172A]">{copy.details}</h2>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {typeFields.map((field) => (
                    <div key={field.key} className="rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] p-4">
                      <div className="text-[11.5px] font-black uppercase tracking-[0.14em] text-slate-500">{field.label}</div>
                      <div className="mt-2 text-sm font-semibold text-[#0F172A]">
                        {renderFieldValue(listing.typeSpecificData[field.key], copy.yes, copy.no)}
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
            <LeadForm trackingCode={listing.trackingCode} title={listing.title} tone="v2" />

            <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-5 sm:p-6">
              <h2 className="text-[20px] font-black tracking-[-0.02em] text-[#0F172A]">{copy.contact}</h2>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleWhatsapp}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  <MessageCircle className="h-5 w-5" /> {copy.whatsapp}
                </button>

                <button type="button" onClick={handleCopy} className={ghostButton}>
                  {toast ? <><Check className="h-4 w-4 text-emerald-600" /> {toast}</> : <><Copy className="h-4 w-4" /> {copy.copyLink}</>}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(buildWhatsappShareText(listing, copy.shareLead, canonicalUrl))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="listing-whatsapp-share"
                  className={ghostButton}
                >
                  <Share2 className="h-4 w-4" /> {copy.share}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
