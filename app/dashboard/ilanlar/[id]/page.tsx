'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Check, Copy, Mail, MessageCircle, Phone, Star } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getCategoryById } from '@/lib/data/listingCategories';
import { getFieldsForType } from '@/lib/data/listingFieldConfig';
import { type MockListing } from '@/lib/data/mockListings';
import { canTransition, getAvailableTransitions, getStatusBadge, type ListingWorkflowStatus } from '@/lib/utils/listingStatus';
import { AZ_NUMBER_LOCALE, formatAzDate } from '@/lib/i18n/format';

function formatPrice(price: number, currency: string, priceLabel?: string) {
  if (priceLabel) return priceLabel;
  return `${new Intl.NumberFormat(AZ_NUMBER_LOCALE).format(price)} ${currency}`;
}

function formatDate(value: string) {
  return formatAzDate(value, {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function renderFieldValue(value: string | number | boolean | undefined) {
  if (value === undefined || value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? '✅' : '❌';
  return String(value);
}

interface PrivateContact {
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  committeeNotes: string | null;
}

export default function DashboardIlanDetailPage() {
  const params = useParams<{ id: string }>();
  const t = useTranslations('listingDetail');
  const [listing, setListing] = useState<MockListing | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [status, setStatus] = useState<ListingWorkflowStatus>('submitted');
  const [nextStatus, setNextStatus] = useState<ListingWorkflowStatus>('submitted');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isShowcase, setIsShowcase] = useState(false);
  const [note, setNote] = useState('');
  const [score, setScore] = useState(4);
  const [toast, setToast] = useState('');
  const [rejectedReason, setRejectedReason] = useState('');
  const [notes, setNotes] = useState<MockListing['reviewNotes']>([]);
  const [leads, setLeads] = useState<MockListing['leads']>([]);
  // TASK-0497: hidden poster contact (WhatsApp import) — the API returns it to admins only.
  const [privateContact, setPrivateContact] = useState<PrivateContact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadListing() {
      try {
        const response = await fetch(`/api/listings/${params.id}`);
        if (!response.ok) throw new Error('load failed');
        const payload = (await response.json()) as { data?: MockListing & { privateContact?: PrivateContact | null } };
        const nextListing = payload.data ?? null;
        if (!cancelled && nextListing) {
          setListing(nextListing);
          setStatus(nextListing.status);
          setNextStatus(nextListing.status);
          setIsFeatured(Boolean(nextListing.isFeatured));
          setIsShowcase(Boolean(nextListing.isShowcase));
          setNotes(nextListing.reviewNotes ?? []);
          setLeads(nextListing.leads ?? []);
          setPrivateContact(nextListing.privateContact ?? null);
        }
      } catch {
        // TASK-0526: no MOCK_LISTINGS fallback — on error the page shows «not found», never a fake listing.
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
      <div className="min-h-screen bg-[#F6F1E9] p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-[22px] border border-[#E4DCCD] bg-white p-8 text-center">
          <p className="text-sm text-[#5B6474]">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[#F6F1E9] p-6 lg:p-8">
        <div className="mx-auto max-w-3xl rounded-[22px] border border-[#E4DCCD] bg-white p-8 text-center">
          <h1 className="text-3xl font-black tracking-[-0.02em] text-[#0F172A]">{t('notFound')}</h1>
          <p className="mt-3 text-sm text-[#5B6474]">{t('notFoundDesc')}</p>
          <Link
            href="/dashboard/ilanlar"
            className="mt-6 inline-flex rounded-full bg-dk-red-strong px-5 py-3 text-sm font-bold text-white transition hover:bg-dk-red-deep"
          >
            {t('backToList')}
          </Link>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async () => {
    if (!listing) return;
    if (status !== nextStatus && !canTransition(status, nextStatus)) return;
    if (nextStatus === 'rejected' && !rejectedReason.trim()) {
      setToast('Rədd səbəbi yazılmalıdır!');
      setTimeout(() => setToast(''), 2400);
      return;
    }
    // Email notifications are handled server-side in /api/listings/[id]/status PATCH
    const response = await fetch(`/api/listings/${listing.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: nextStatus,
        isFeatured,
        isShowcase,
        rejectedReason: nextStatus === 'rejected' ? rejectedReason.trim() : undefined,
      }),
    }).catch(() => null);
    setStatus(nextStatus);
    if (nextStatus === 'rejected') setRejectedReason('');
    setToast(t('statusUpdated'));
    setTimeout(() => setToast(''), 2400);
  };

  const handleSaveNote = async () => {
    const response = await fetch(`/api/listings/${listing.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notes: note.trim() || t('noteNotAdded'),
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
      note: note.trim() || t('noteNotAdded'),
      score,
      createdAt: new Date().toISOString(),
    };

    setNotes((prev) => [next, ...prev]);
    setNote('');
    setToast(t('noteSaved'));
    setTimeout(() => setToast(''), 2400);
  };

  const handleLeadStatus = (index: number) => {
    setLeads((prev) =>
      prev.map((lead, idx) => (idx === index ? { ...lead, status: 'contacted' as const } : lead))
    );
    setToast(t('leadStatusUpdated'));
    setTimeout(() => setToast(''), 2400);
  };

  const handleCopyTracking = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(listing.trackingCode);
    setToast(t('trackingCopied'));
    setTimeout(() => setToast(''), 2400);
  };

  return (
    <div className="min-h-screen bg-[#F6F1E9] p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <Link href="/dashboard/ilanlar" className="text-sm font-semibold text-[#5B6474] hover:text-[var(--dk-red)]">
              ← {t('backToList')}
            </Link>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.02em] text-[#0F172A]">{listing.title}</h1>
          </div>
          {toast ? (
            <div className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              {toast}
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-white">
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
                    className={`relative overflow-hidden rounded-2xl border ${activeImage === index ? 'border-[#0F172A] ring-2 ring-[#E4DCCD]' : 'border-[#E4DCCD]'}`}
                  >
                    <div className="relative aspect-[4/3]">
                      <Image src={image.url} alt={image.alt} fill className="object-cover" sizes="200px" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopyTracking}
                  className="inline-flex items-center gap-2 rounded-full bg-[#EFE9DE] px-3 py-1 text-xs font-bold text-[#5B6474]"
                >
                  {listing.trackingCode}
                  <Copy className="h-3.5 w-3.5" />
                </button>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${category?.badgeClass ?? 'bg-[#EFE9DE] text-[#334155]'}`}>
                  {category?.label ?? listing.type}
                </span>
              </div>
              <p className="text-sm leading-7 text-[#334155]">{listing.description}</p>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#FBF8F3] p-4">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-[#5B6474]">Qiymət</div>
                  <div className="mt-2 text-2xl font-black text-[#BE2F47]">
                    {formatPrice(listing.price, listing.currency, listing.priceLabel)}
                  </div>
                </div>
                <div className="rounded-2xl bg-[#FBF8F3] p-4">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-[#5B6474]">Tarix</div>
                  <div className="mt-2 text-base font-semibold text-[#334155]">{formatDate(listing.createdAt)}</div>
                </div>
              </div>
              <div className="mt-5 text-sm text-[#5B6474]">
                {listing.city}{listing.district ? `, ${listing.district}` : ''} • {listing.currency}
              </div>
            </div>

            <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black tracking-[-0.02em] text-[#0F172A]">Tipə görə məlumatlar</h2>
                <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${category?.badgeClass ?? 'bg-[#EFE9DE] text-[#334155]'}`}>
                  {category?.label ?? listing.type}
                </span>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className="rounded-2xl border border-[#E4DCCD] bg-[#FBF8F3] p-4">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#5B6474]">{field.label}</div>
                    <div className="mt-2 text-sm font-semibold text-[#334155]">
                      {renderFieldValue(listing.typeSpecificData[field.key])}
                      {field.suffix && listing.typeSpecificData[field.key] !== undefined && typeof listing.typeSpecificData[field.key] !== 'boolean'
                        ? ` ${field.suffix}`
                        : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
              <h2 className="text-2xl font-black tracking-[-0.02em] text-[#0F172A]">Sahibkar</h2>
              <div className="mt-4 space-y-2 text-sm text-[#5B6474]">
                <div><strong>{t('labelName')}</strong> {listing.ownerName}</div>
                <div><strong>{t('labelPhone')}</strong> +{listing.phone}</div>
                <div><strong>{t('labelEmail')}</strong> {listing.email}</div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={`tel:+${listing.phone}`} className="rounded-full bg-dk-red-strong px-5 py-2.5 text-sm font-bold text-white transition hover:bg-dk-red-deep">
                  <Phone className="mr-2 inline h-4 w-4" />
                  Zəng et
                </a>
                <a href={`https://wa.me/${listing.phone}`} target="_blank" rel="noreferrer" className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white">
                  <MessageCircle className="mr-2 inline h-4 w-4" />
                  WhatsApp
                </a>
                <a href={`mailto:${listing.email}`} className="rounded-full border border-[#E4DCCD] px-5 py-2.5 text-sm font-bold text-[#334155]">
                  <Mail className="mr-2 inline h-4 w-4" />
                  Email
                </a>
              </div>
            </div>

            {privateContact && (privateContact.contactName || privateContact.contactPhone || privateContact.contactEmail || privateContact.committeeNotes) && (
              <div className="rounded-[22px] border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-xl font-black tracking-[-0.02em] text-[#0F172A]">{t('privateContactTitle')}</h2>
                <p className="mt-1 text-xs font-medium text-amber-900">{t('privateContactHint')}</p>
                <div className="mt-4 space-y-2 text-sm text-[#0F172A]">
                  {privateContact.contactName && <div><strong>{t('labelName')}</strong> {privateContact.contactName}</div>}
                  {privateContact.contactPhone && (
                    <div>
                      <strong>{t('labelPhone')}</strong>{' '}
                      <a href={`https://wa.me/${privateContact.contactPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="font-semibold text-emerald-800 underline">
                        {privateContact.contactPhone}
                      </a>
                    </div>
                  )}
                  {privateContact.contactEmail && <div><strong>{t('labelEmail')}</strong> {privateContact.contactEmail}</div>}
                  {privateContact.committeeNotes && <div className="text-[#334155]"><strong>{t('sourceNote')}</strong> {privateContact.committeeNotes}</div>}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* AI Analysis Panel */}
            {listing.aiAnalysis && (
              <div className="rounded-[22px] border border-sky-200 bg-sky-50/60 p-6">
                <h2 className="text-xl font-black tracking-[-0.02em] text-[#0F172A] flex items-center gap-2">
                  🤖 AI Analiz
                  {(listing.aiAnalysis as Record<string, unknown>).qualityScore != null && (
                    <span className={`ml-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                      Number((listing.aiAnalysis as Record<string, unknown>).qualityScore) >= 70
                        ? 'bg-emerald-100 text-emerald-700'
                        : Number((listing.aiAnalysis as Record<string, unknown>).qualityScore) >= 40
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-700'
                    }`}>
                      {String((listing.aiAnalysis as Record<string, unknown>).qualityScore)}/100
                    </span>
                  )}
                </h2>
                <p className="mt-3 text-sm text-[#5B6474]">
                  {String((listing.aiAnalysis as Record<string, unknown>).summary ?? '')}
                </p>
                {Array.isArray((listing.aiAnalysis as Record<string, unknown>).strengths) && (
                  <div className="mt-3">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600 mb-1">Güclü tərəflər</div>
                    <ul className="text-sm text-[#5B6474] space-y-1">
                      {((listing.aiAnalysis as Record<string, unknown>).strengths as string[]).map((s, i) => (
                        <li key={i} className="flex items-start gap-2"><span className="text-emerald-500">+</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {Array.isArray((listing.aiAnalysis as Record<string, unknown>).risks) && (
                  <div className="mt-3">
                    <div className="text-xs font-bold uppercase tracking-[0.16em] text-rose-600 mb-1">Risklər</div>
                    <ul className="text-sm text-[#5B6474] space-y-1">
                      {((listing.aiAnalysis as Record<string, unknown>).risks as string[]).map((r, i) => (
                        <li key={i} className="flex items-start gap-2"><span className="text-rose-500">!</span>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {(listing.aiAnalysis as Record<string, unknown>).recommendation && (
                  <div className="mt-3 text-xs">
                    <span className="font-bold text-[#5B6474]">Tövsiyə: </span>
                    <span className={`font-bold ${
                      (listing.aiAnalysis as Record<string, unknown>).recommendation === 'approve' ? 'text-emerald-600' :
                      (listing.aiAnalysis as Record<string, unknown>).recommendation === 'review' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {(listing.aiAnalysis as Record<string, unknown>).recommendation === 'approve' ? 'Təsdiq et' :
                       (listing.aiAnalysis as Record<string, unknown>).recommendation === 'review' ? 'İncələ' : 'Rədd et'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Rejection Reason (if rejected) */}
            {listing.rejectedReason && status === 'rejected' && (
              <div className="rounded-[22px] border border-rose-200 bg-rose-50 p-6">
                <h2 className="text-xl font-black tracking-[-0.02em] text-rose-700">Rədd səbəbi</h2>
                <p className="mt-2 text-sm text-rose-600">{listing.rejectedReason}</p>
              </div>
            )}

            <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
              <h2 className="text-2xl font-black tracking-[-0.02em] text-[#0F172A]">Status idarəsi</h2>
              {badge ? (
                <div className={`mt-4 inline-flex rounded-full border px-4 py-2 text-sm font-bold ${badge.color}`}>
                  {badge.label}
                </div>
              ) : null}
              <div className="mt-4 space-y-4">
                <select
                  value={nextStatus}
                  onChange={(event) => setNextStatus(event.target.value as ListingWorkflowStatus)}
                  className="w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#0F172A]"
                >
                  <option value={status}>Hazırkı status</option>
                  {transitions.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>

                {nextStatus === 'rejected' && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <label className="block text-xs font-bold uppercase tracking-[0.16em] text-rose-600 mb-2">
                      Rədd səbəbi *
                    </label>
                    <textarea
                      value={rejectedReason}
                      onChange={(e) => setRejectedReason(e.target.value)}
                      rows={3}
                      placeholder="Rədd səbəbini yazın (owner-ə göstəriləcək)..."
                      className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-rose-400"
                    />
                  </div>
                )}

                <label className="flex items-center gap-3 rounded-2xl bg-[#FBF8F3] px-4 py-3 text-sm font-semibold text-[#334155]">
                  <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="h-4 w-4 rounded border-[#E4DCCD] text-[var(--dk-red)]" />
                  Seçilmiş elan
                </label>
                <label className="flex items-center gap-3 rounded-2xl bg-[#FBF8F3] px-4 py-3 text-sm font-semibold text-[#334155]">
                  <input type="checkbox" checked={isShowcase} onChange={(e) => setIsShowcase(e.target.checked)} className="h-4 w-4 rounded border-[#E4DCCD] text-[var(--dk-red)]" />
                  Vitrində göstər
                </label>

                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  className="w-full rounded-full bg-dk-red-strong px-5 py-3.5 text-sm font-bold text-white transition hover:bg-dk-red-deep"
                >
                  Dəyiş
                </button>
              </div>
            </div>

            <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
              <h2 className="text-2xl font-black tracking-[-0.02em] text-[#0F172A]">İncələmə qeydləri</h2>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={4}
                placeholder="Qeyd yaz..."
                className="mt-4 w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-3 text-sm text-[#0F172A] outline-none focus:border-[#0F172A]"
              />
              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setScore(index + 1)}
                    className={index < score ? 'text-[#BE2F47]' : 'text-[#5B6474]'}
                  >
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleSaveNote}
                className="mt-4 w-full rounded-full border border-[#E4DCCD] bg-white px-5 py-3 text-sm font-bold text-[#0F172A] transition hover:border-[#0F172A]"
              >
                Saxla
              </button>
              <div className="mt-5 space-y-3">
                {notes.map((item, index) => (
                  <div key={`${item.createdAt}-${index}`} className="rounded-2xl bg-[#FBF8F3] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-bold text-[#0F172A]">{item.reviewer}</div>
                      <div className="text-xs text-[#5B6474]">{formatDate(item.createdAt)}</div>
                    </div>
                    <div className="mt-2 text-sm text-[#5B6474]">{item.note}</div>
                    <div className="mt-2 text-xs font-semibold text-[#BE2F47]">{item.score}/5 bal</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
              <h2 className="text-2xl font-black tracking-[-0.02em] text-[#0F172A]">Maraq bildirişləri</h2>
              <div className="mt-4 space-y-3">
                {leads.length ? (
                  leads.map((item, index) => (
                    <div key={`${item.phone}-${index}`} className="rounded-2xl bg-[#FBF8F3] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-bold text-[#0F172A]">{item.name}</div>
                        <div className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#5B6474]">
                          {item.status === 'new' ? 'Yeni' : 'Əlaqə saxlanıldı'}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-[#5B6474]">{item.phone}</div>
                      <div className="mt-1 text-sm text-[#5B6474]">{item.message}</div>
                      <div className="mt-2 text-xs text-[#5B6474]">{formatDate(item.createdAt)}</div>
                      {item.status === 'new' ? (
                        <button
                          type="button"
                          onClick={() => handleLeadStatus(index)}
                          className="mt-3 rounded-full border border-[#E4DCCD] px-4 py-2 text-xs font-bold text-[#334155]"
                        >
                          Əlaqə saxlanıldı
                        </button>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-[#FBF8F3] p-4 text-sm text-[#5B6474]">
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
