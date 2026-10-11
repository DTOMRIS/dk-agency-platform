'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Check, Copy, MapPin, MessageCircle, Share2, X } from 'lucide-react';
import LeadForm from '@/components/listings/LeadForm';
import { getCategoryById } from '@/lib/data/listingCategories';
import { getFieldsForType } from '@/lib/data/listingFieldConfig';
import type { MockListing } from '@/lib/data/mockListings';
import { useTranslations } from 'next-intl';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import { LISTING_MODAL_TONES, type ListingTone } from '@/components/listings/listing-tones';

interface ListingModalProps {
  listing: MockListing | null;
  onClose: () => void;
  /** `v2` on the public /ilanlar showcase; `panel` (default) keeps the member-panel look. */
  tone?: ListingTone;
}

function formatPrice(listing: MockListing) {
  if (listing.priceLabel) return listing.priceLabel;
  return `${new Intl.NumberFormat(AZ_NUMBER_LOCALE).format(listing.price)} ${listing.currency}`;
}

function renderFieldValue(value: string | number | boolean | undefined, yes: string, no: string) {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') {
    return value ? `✅ ${yes}` : `❌ ${no}`;
  }
  return String(value);
}

export default function ListingModal({ listing, onClose, tone = 'panel' }: ListingModalProps) {
  const t = useTranslations('listingsV2.detail');
  const ui = LISTING_MODAL_TONES[tone];
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
    setToast(t('linkCopied'));
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
      <div className={ui.sheet}>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('close')}
          className="sticky right-0 top-0 z-20 ml-auto mr-4 mt-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-6 p-4 pb-8 md:grid-cols-[1.2fr_0.8fr] md:p-8">
          <div className="space-y-5">
            <div className={ui.frame}>
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
                  className={`relative overflow-hidden rounded-2xl border ${activeImage === index ? ui.thumbActive : ui.thumb}`}
                >
                  <div className="relative aspect-[4/3]">
                    <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="160px" />
                  </div>
                </button>
              ))}
            </div>

            <div className={ui.infoCard}>
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${category?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
                  {category?.label ?? listing.type}
                </span>
                <span className={ui.code}>
                  {listing.trackingCode}
                </span>
              </div>

              <h2 className={ui.title}>{listing.title}</h2>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <MapPin className={ui.pin} />
                  {listing.city}{listing.district ? `, ${listing.district}` : ''}
                </span>
                <span className={ui.price}>{formatPrice(listing)}</span>
              </div>
              <p className="mt-5 text-sm leading-7 text-slate-600">{listing.description}</p>
            </div>

            <div className={ui.card}>
              <h3 className={ui.sectionTitle}>{t('details')}</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {typeFields.map((field) => (
                  <div key={field.key} className={ui.field}>
                    <div className={ui.fieldLabel}>{field.label}</div>
                    <div className={ui.fieldValue}>
                      {renderFieldValue(listing.typeSpecificData[field.key], t('yes'), t('no'))}
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
            <LeadForm trackingCode={listing.trackingCode} title={listing.title} tone={tone} />

            <div className={`${ui.card} shadow-sm`}>
              <h3 className={ui.sectionTitle}>{t('contact')}</h3>
              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={handleWhatsapp}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t('whatsapp')}
                </button>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={ui.ghostButton}
                >
                  <Copy className="h-4 w-4" />
                  {t('copyLink')}
                </button>
                <button
                  type="button"
                  onClick={handleShareWhatsapp}
                  className={ui.ghostButton}
                >
                  <Share2 className="h-4 w-4" />
                  {t('share')}
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
