'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Copy, MapPin, MessageCircle, Share2, X } from 'lucide-react';
import LeadForm from '@/components/listings/LeadForm';
import { MockListing } from '@/lib/data/mockListings';
import { getCategoryById } from '@/lib/data/listingCategories';

interface ListingModalProps {
  listing: MockListing | null;
  onClose: () => void;
}

function formatPrice(listing: MockListing) {
  if (listing.priceLabel) return listing.priceLabel;
  return `${new Intl.NumberFormat('az-AZ').format(listing.price)} ${listing.currency}`;
}

function renderSpecs(type: MockListing['type'], data: MockListing['typeSpecificData']) {
  switch (type) {
    case 'devir':
      return [
        ['Sahə', `${data.area} m²`],
        ['Oturacaq sayı', String(data.seatCount)],
        ['Lisenziya', data.hasLicense ? 'Var' : 'Yoxdur'],
        ['Aylıq gəlir', `${new Intl.NumberFormat('az-AZ').format(Number(data.monthlyRevenue ?? 0))} AZN`],
      ];
    case 'franchise-vermek':
      return [
        ['Royalty', String(data.royaltyRate)],
        ['Başlanğıc investisiya', String(data.initialInvestment)],
        ['Dəstək paketi', String(data.supportPackage)],
      ];
    case 'franchise-almaq':
      return [
        ['Büdcə', String(data.budget)],
        ['İstiqamət', String(data.preferredSector)],
        ['Təcrübə', String(data.experience)],
      ];
    case 'ortak-tapmaq':
      return [
        ['Axtarılan sərmayə', String(data.capitalNeeded)],
        ['Təklif edilən pay', String(data.shareOffered)],
        ['Ortağın rolu', String(data.partnerRole)],
      ];
    case 'obyekt-icaresi':
      return [
        ['Sahə', `${data.area} m²`],
        ['Aylıq icarə', String(data.monthlyRent)],
        ['Mətbəx çıxışı', data.hasKitchen ? 'Var' : 'Yoxdur'],
        ['Havalandırma', data.hasExhaust ? 'Var' : 'Yoxdur'],
      ];
    case 'horeca-ekipman':
      return [
        ['Brend', String(data.brand)],
        ['Vəziyyət', String(data.condition)],
        ['Zəmanət', String(data.warranty)],
      ];
    case 'yeni-investisiya':
      return [
        ['Axtarılan investisiya', String(data.investmentAmount)],
        ['Layihə mərhələsi', String(data.projectStage)],
        ['Geri dönüş', String(data.expectedReturn)],
      ];
    default:
      return [];
  }
}

export default function ListingModal({ listing, onClose }: ListingModalProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [toast, setToast] = useState('');
  const category = listing ? getCategoryById(listing.type) : null;

  useEffect(() => {
    if (!listing) return;
    setActiveImage(0);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [listing]);

  const specs = useMemo(
    () => (listing ? renderSpecs(listing.type, listing.typeSpecificData) : []),
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
              <h3 className="font-display text-2xl font-black text-[var(--dk-navy)]">Elan detalları</h3>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {specs.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">{label}</div>
                    <div className="mt-2 text-sm font-semibold text-slate-700">{value}</div>
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
                <div className="mt-3 rounded-full bg-slate-100 px-4 py-2 text-center text-xs font-semibold text-slate-600">
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
