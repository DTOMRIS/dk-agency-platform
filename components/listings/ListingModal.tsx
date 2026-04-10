'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, Copy, MapPin, MessageCircle, Share2, X } from 'lucide-react';
import LeadForm from '@/components/listings/LeadForm';
import { getCategoryById } from '@/lib/data/listingCategories';
import { getFieldsForType } from '@/lib/data/listingFieldConfig';
import { MockListing } from '@/lib/data/mockListings';

interface ListingModalProps {
  listing: MockListing | null;
  onClose: () => void;
}

function formatPrice(listing: MockListing) {
  if (listing.priceLabel) return listing.priceLabel;
  return `${new Intl.NumberFormat('az-AZ').format(listing.price)} ${listing.currency}`;
}

function renderFieldValue(value: string | number | boolean | undefined) {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') {
    return value ? '✅ Bəli' : '❌ Xeyr';
  }
  return String(value);
}

export default function ListingModal({ listing, onClose }: ListingModalProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [toast, setToast] = useState('');
  const category = listing ? getCategoryById(listing.type) : null;

  useEffect(() => {
    if (!listing) return;
    const timer = window.setTimeout(() => setActiveImage(0), 0);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previous;
    };
  }, [listing]);

  const typeFields = useMemo(
    () => (listing ? getFieldsForType(listing.type) : []),
    [listing]
  );

  if (!listing) return null;

  const shareLink =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}/ilanlar?tracking=${listing.trackingCode}`;
  const whatsappMessage = `Salam! DK Agency-dən ${listing.trackingCode} nömrəli "${listing.title}" elanı haqqında məlumat almaq istəyirəm.`;

  const handleCopy = async () => {
    if (!shareLink || !navigator.clipboard) return;
    await navigator.clipboard.writeText(shareLink);
    setToast('Link kopyalandı!');
    setTimeout(() => setToast(''), 2400);
  };

  const handleWhatsapp = () => {
    window.open(
      `https://wa.me/${listing.phone}?text=${encodeURIComponent(whatsappMessage)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleShareWhatsapp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${listing.title} — ${shareLink}`)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-[rgba(15,23,42,0.72)] p-0 md:p-6">
      <div className="relative h-full overflow-y-auto bg-white md:mx-auto md:h-auto md:max-w-6xl md:rounded-[32px]">
        <button
          type="button"
          onClick={onClose}
          className="sticky right-0 top-0 z-20 ml-auto mr-4 mt-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 p-4 pb-8 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="space-y-5">
            <div className="overflow-hidden rounded-[28px] border border-slate-200">
              <div className="relative aspect-[16/10]">
                <Image
                  src={listing.images[activeImage]?.url ?? listing.images[0].url}
                  alt={listing.images[activeImage]?.alt ?? listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 66vw"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${category?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
                  {category?.label ?? listing.type}
                </span>
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500">
                  {listing.trackingCode}
                </span>
              </div>

              <h2 className="font-display text-3xl font-black text-[var(--dk-navy)]">{listing.title}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[var(--dk-gold)]" />
                  {listing.city}{listing.district ? `, ${listing.district}` : ''}
                </span>
                <span className="text-xl font-black text-[var(--dk-gold)]">{formatPrice(listing)}</span>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">{listing.description}</p>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6">
              <h3 className="font-display text-2xl font-black text-[var(--dk-navy)]">Tipə görə detallar</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {typeFields.map((field) => (
                  <div key={field.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{field.label}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-700">
                      {renderFieldValue(listing.typeSpecificData[field.key])}
                      {field.suffix && listing.typeSpecificData[field.key] !== undefined && typeof listing.typeSpecificData[field.key] !== 'boolean'
                        ? ` ${field.suffix}`
                        : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <LeadForm trackingCode={listing.trackingCode} title={listing.title} />

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-display text-2xl font-black text-[var(--dk-navy)]">Sürətli əlaqə</h3>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleWhatsapp}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp ilə yaz
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]"
                >
                  <Copy className="h-4 w-4" />
                  Linki kopyala
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsapp}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]"
                >
                  <Share2 className="h-4 w-4" />
                  WhatsApp-da paylaş
                </button>
              </div>
              {toast ? (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
                  <Check className="h-4 w-4" />
                  {toast}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
