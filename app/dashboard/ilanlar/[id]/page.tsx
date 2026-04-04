'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Check, Copy, Mail, MessageCircle, Phone, Star } from 'lucide-react';
import { getCategoryById } from '@/lib/data/listingCategories';
import { getFieldsForType } from '@/lib/data/listingFieldConfig';
import { MOCK_LISTINGS, type MockListing } from '@/lib/data/mockListings';
import { emailTemplates, sendEmail } from '@/lib/email/templates';
import { canTransition, getAvailableTransitions, getStatusBadge, type ListingWorkflowStatus } from '@/lib/utils/listingStatus';

function formatPrice(price: number, currency: string, priceLabel?: string) {
  if (priceLabel) return priceLabel;
  return `${new Intl.NumberFormat('az-AZ').format(price)} ${currency}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('az-AZ', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function renderFieldValue(value: string | number | boolean | undefined) {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? '✅ Bəli' : '❌ Xeyr';
  return String(value);
}

export default function DashboardIlanDetailPage() {
  const params = useParams<{ id: string }>();
  const [listing, setListing] = useState<MockListing | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [status, setStatus] = useState<ListingWorkflowStatus>('submitted');
  const [nextStatus, setNextStatus] = useState<ListingWorkflowStatus>('submitted');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isShowcase, setIsShowcase] = useState(false);
  const [note, setNote] = useState('');
  const [score, setScore] = useState(4);
  const [toast, setToast] = useState('');
  const [notes, setNotes] = useState<MockListing['reviewNotes']>([]);
  const [leads, setLeads] = useState<MockListing['leads']>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      try {
        const response = await fetch(`/api/listings/${params.id}`);
        if (!response.ok) throw new Error('load failed');
        const payload = (await response.json()) as { data?: MockListing };
        const nextListing = payload.data ?? null;
        if (!cancelled && nextListing) {
          setListing(nextListing);
          setStatus(nextListing.status);
          setNextStatus(nextListing.status);
          setIsFeatured(Boolean(nextListing.isFeatured));
          setIsShowcase(Boolean(nextListing.isShowcase));
          setNotes(nextListing.reviewNotes ?? []);
          setLeads(nextListing.leads ?? []);
        }
      } catch {
        const fallback = MOCK_LISTINGS.find((item) => item.id === Number(params.id)) ?? null;
        if (!cancelled && fallback) {
          setListing(fallback);
          setStatus(fallback.status);
          setNextStatus(fallback.status);
          setIsFeatured(Boolean(fallback.isFeatured));
          setIsShowcase(Boolean(fallback.isShowcase));
          setNotes(fallback.reviewNotes ?? []);
          setLeads(fallback.leads ?? []);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadListing();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const category = listing ? getCategoryById(listing.type) : null;
  const badge = listing ? getStatusBadge(status) : null;
  const fields = useMemo(() => (listing ? getFieldsForType(listing.type) : []), [listing]);
  const transitions = useMemo(() => getAvailableTransitions(status), [status]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm text-slate-500">Elan yüklənir...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-white p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="font-display text-3xl font-black text-[var(--dk-navy)]">Elan tapılmadı</h1>
          <p className="mt-3 text-sm text-slate-500">Bu ID ilə uyğun elan yoxdur.</p>
          <Link
            href="/dashboard/ilanlar"
            className="mt-6 inline-flex rounded-full bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white"
          >
            Elan siyahısına qayıt
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async () => {
    if (!listing) return;
    if (status !== nextStatus && !canTransition(status, nextStatus)) return;
    if (nextStatus === 'showcase_ready') {
      await sendEmail(
        listing.email,
        emailTemplates.listingApproved(listing.trackingCode, listing.title, listing.ownerName),
      );
    }
    if (nextStatus === 'rejected') {
      await sendEmail(
        listing.email,
        emailTemplates.listingRejected(listing.trackingCode, 'Admin qərarı ilə rədd edildi', listing.ownerName),
      );
    }
    const response = await fetch(`/api/listings/${listing.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: nextStatus,
        isFeatured,
        isShowcase,
      }),
    }).catch(() => null);
    console.log('listing_status_update', {
      id: listing.id,
      trackingCode: listing.trackingCode,
      from: status,
      to: nextStatus,
      isFeatured,
      isShowcase,
      responseOk: response?.ok,
    });
    setStatus(nextStatus);
    setToast('Status yeniləndi.');
    setTimeout(() => setToast(''), 2400);
  };

  const handleSaveNote = async () => {
    const response = await fetch(`/api/listings/${listing.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: note.trim() || 'Qeyd elave edilmedi.',
        score,
        decision:
          nextStatus === 'showcase_ready'
            ? 'approve'
            : nextStatus === 'rejected'
              ? 'reject'
              : 'conditional',
      }),
    }).catch(() => null);

    const payload = await response?.json().catch(() => null);
    const next = payload?.data ?? {
      reviewer: 'Admin',
      note: note.trim() || 'Qeyd elave edilmedi.',
      score,
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [next, ...prev]);
    setNote('');
    setToast('Qeyd saxlanildi.');
    setTimeout(() => setToast(''), 2400);
  };

  const handleLeadStatus = (index: number) => {
    setLeads((prev) =>
      prev.map((lead, idx) => (idx === index ? { ...lead, status: 'contacted' as const } : lead))
    );
    console.log('lead_contacted', { listingId: listing.id, leadIndex: index });
    setToast('Lead statusu yeniləndi.');
    setTimeout(() => setToast(''), 2400);
  };

  const handleCopyTracking = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(listing.trackingCode);
    setToast('Tracking code kopyalandı.');
    setTimeout(() => setToast(''), 2400);
  };

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link href="/dashboard/ilanlar" className="text-sm font-semibold text-slate-500 hover:text-[var(--dk-red)]">
              ← Elan siyahısına qayıt
            </Link>
            <h1 className="mt-3 font-display text-4xl font-black text-[var(--dk-navy)]">{listing.title}</h1>
          </div>
          {toast ? (
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              {toast}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
              <div className="relative aspect-[16/9]">
                <Image
                  src={listing.images[activeImage]?.url ?? listing.images[0].url}
                  alt={listing.images[activeImage]?.alt ?? listing.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1280px) 100vw, 66vw"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
                {listing.images.map((image, index) => (
                  <button
                    type="button"
                    key={image.id}
                    onClick={() => setActiveImage(index)}
                    className={`relative overflow-hidden rounded-2xl border ${activeImage === index ? 'border-[var(--dk-gold)] ring-2 ring-amber-100' : 'border-slate-200'}`}
                  >
                    <div className="relative aspect-[4/3]">
                      <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="200px" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600"
                >
                  {listing.trackingCode}
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${category?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
                  {category?.label ?? listing.type}
                </span>
              </div>
              <p className="text-sm leading-7 text-slate-600">{listing.description}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Qiymət</div>
                  <div className="mt-2 text-2xl font-black text-[var(--dk-gold)]">
                    {formatPrice(listing.price, listing.currency, listing.priceLabel)}
                  </div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Tarix</div>
                  <div className="mt-2 text-base font-semibold text-slate-700">{formatDate(listing.createdAt)}</div>
                </div>
              </div>
              <div className="mt-5 text-sm text-slate-500">
                {listing.city}{listing.district ? `, ${listing.district}` : ''} • {listing.currency}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Tipə görə məlumatlar</h2>
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${category?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
                  {category?.label ?? listing.type}
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{field.label}</div>
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

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Sahibkar</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div><strong>Ad:</strong> {listing.ownerName}</div>
                <div><strong>Telefon:</strong> +{listing.phone}</div>
                <div><strong>Email:</strong> {listing.email}</div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={`tel:+${listing.phone}`} className="rounded-full bg-[var(--dk-red)] px-5 py-2.5 text-sm font-bold text-white">
                  <Phone className="mr-2 inline h-4 w-4" />
                  Zəng et
                </a>
                <a href={`https://wa.me/${listing.phone}`} target="_blank" rel="noreferrer" className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white">
                  <MessageCircle className="mr-2 inline h-4 w-4" />
                  WhatsApp
                </a>
                <a href={`mailto:${listing.email}`} className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700">
                  <Mail className="mr-2 inline h-4 w-4" />
                  Email
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Status idarəsi</h2>
              {badge ? (
                <div className={`mt-4 inline-flex rounded-full border px-4 py-2 text-sm font-bold ${badge.color}`}>
                  {badge.label}
                </div>
              ) : null}
              <div className="mt-4 space-y-4">
                <select
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as ListingWorkflowStatus)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                >
                  <option value={status}>Hazırkı status</option>
                  {transitions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[var(--dk-red)]" />
                  Seçilmiş elan
                </label>
                <label className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={isShowcase} onChange={(e) => setIsShowcase(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-[var(--dk-red)]" />
                  Vitrində göstər
                </label>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  className="w-full rounded-2xl bg-[var(--dk-red)] px-5 py-3.5 text-sm font-bold text-white"
                >
                  Dəyiş
                </button>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">İncələmə qeydləri</h2>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder="Qeyd yaz..."
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
              />
              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setScore(index + 1)}
                    className={index < score ? 'text-[var(--dk-gold)]' : 'text-slate-300'}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSaveNote}
                className="mt-4 w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700"
              >
                Saxla
              </button>
              <div className="mt-5 space-y-3">
                {notes.map((item, index) => (
                  <div key={`${item.createdAt}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-bold text-slate-800">{item.reviewer}</div>
                      <div className="text-xs text-slate-400">{formatDate(item.createdAt)}</div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">{item.note}</div>
                    <div className="mt-2 text-xs font-semibold text-[var(--dk-gold)]">{item.score}/5 bal</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Maraq bildirişləri</h2>
              <div className="mt-4 space-y-3">
                {leads.length ? (
                  leads.map((item, index) => (
                    <div key={`${item.phone}-${index}`} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-bold text-slate-800">{item.name}</div>
                        <div className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-slate-600">
                          {item.status === 'new' ? 'Yeni' : 'Əlaqə saxlanıldı'}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-slate-600">{item.phone}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.message}</div>
                      <div className="mt-2 text-xs text-slate-400">{formatDate(item.createdAt)}</div>
                      {item.status === 'new' ? (
                        <button
                          type="button"
                          onClick={() => handleLeadStatus(index)}
                          className="mt-3 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700"
                        >
                          Əlaqə saxlanıldı
                        </button>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    Hələ maraq bildirişi yoxdur.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
