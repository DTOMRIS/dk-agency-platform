// app/b2b-panel/ilanlarim/[id]/page.tsx
// Owner listing detail view

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft, Pencil, Eye, MessageSquare, Calendar,
  MapPin, Phone, Mail, User, Package, Clock, CheckCircle,
  AlertTriangle, XCircle, Star, Bot, FileText, TimerOff,
  BadgeCheck,
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import type { ListingWorkflowStatus } from '@/lib/utils/listingStatus';

interface ListingDetail {
  id: number;
  trackingCode: string;
  type: string;
  status: ListingWorkflowStatus;
  title: string;
  description: string;
  price: number;
  currency: string;
  city: string;
  district?: string;
  ownerName: string;
  phone: string;
  email: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  images: Array<{ id: string; url: string; alt: string }>;
  typeSpecificData: Record<string, unknown>;
  equipment?: unknown[];
  isShowcase: boolean;
  isFeatured: boolean;
  reviewNotes: Array<{ reviewer: string; note: string; score: number; createdAt: string }>;
  leads: Array<{ name: string; phone: string; email: string; message: string; status: string; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  submitted: { label: 'Göndərilib', icon: Clock, color: 'bg-[#F3EEE5] text-[#334155]' },
  ai_checked: { label: 'AI Yoxlanılıb', icon: Bot, color: 'bg-blue-50 text-blue-700' },
  committee_review: { label: 'İncələnir', icon: Eye, color: 'bg-amber-50 text-amber-700' },
  shortlisted: { label: 'Qısa siyahıda', icon: Star, color: 'bg-purple-50 text-purple-700' },
  docs_requested: { label: 'Sənəd İstənib', icon: FileText, color: 'bg-orange-50 text-orange-700' },
  showcase_ready: { label: 'Vitrində', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rədd edilib', icon: XCircle, color: 'bg-rose-50 text-rose-700' },
  sold: { label: 'Satıldı', icon: BadgeCheck, color: 'bg-teal-50 text-teal-700' },
  expired: { label: 'Müddəti bitdi', icon: TimerOff, color: 'bg-[#F3EEE5] text-[#5B6474]' },
};

const EDITABLE_STATUSES: ListingWorkflowStatus[] = ['submitted', 'docs_requested'];

const pageCopy: Record<Locale, {
  back: string;
  edit: string;
  details: string;
  contact: string;
  leads: string;
  reviews: string;
  noLeads: string;
  noReviews: string;
  editNotAllowed: string;
  loading: string;
  error: string;
}> = {
  az: {
    back: 'Elanlarıma qayıt',
    edit: 'Redaktə et',
    details: 'Elan Detalları',
    contact: 'Əlaqə Məlumatları',
    leads: 'Sorğular',
    reviews: 'Rəylər',
    noLeads: 'Hələ sorğu yoxdur',
    noReviews: 'Hələ rəy yoxdur',
    editNotAllowed: 'Bu statusda redaktə mümkün deyil',
    loading: 'Yüklənir...',
    error: 'Elan tapılmadı',
  },
  en: {
    back: 'Back to My Listings',
    edit: 'Edit',
    details: 'Listing Details',
    contact: 'Contact Information',
    leads: 'Inquiries',
    reviews: 'Reviews',
    noLeads: 'No inquiries yet',
    noReviews: 'No reviews yet',
    editNotAllowed: 'Editing not allowed in this status',
    loading: 'Loading...',
    error: 'Listing not found',
  },
  ru: {
    back: 'К моим объявлениям',
    edit: 'Редактировать',
    details: 'Детали объявления',
    contact: 'Контактная информация',
    leads: 'Запросы',
    reviews: 'Отзывы',
    noLeads: 'Пока запросов нет',
    noReviews: 'Пока отзывов нет',
    editNotAllowed: 'Редактирование недоступно в этом статусе',
    loading: 'Загрузка...',
    error: 'Объявление не найдено',
  },
  tr: {
    back: 'İlanlarıma Dön',
    edit: 'Düzenle',
    details: 'İlan Detayları',
    contact: 'İletişim Bilgileri',
    leads: 'Talepler',
    reviews: 'Değerlendirmeler',
    noLeads: 'Henüz talep yok',
    noReviews: 'Henüz değerlendirme yok',
    editNotAllowed: 'Bu durumda düzenleme yapılamaz',
    loading: 'Yükleniyor...',
    error: 'İlan bulunamadı',
  },
};

export default function OwnerListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/listings/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) setListing(data.data);
          else setError(true);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#F6F1E9] p-8">
        <div className="animate-spin w-8 h-8 border-2 border-[#0F172A] border-t-transparent rounded-full" />
        <span className="ml-3 text-[#5B6474]">{copy.loading}</span>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-full bg-[#F6F1E9] p-8 text-center">
        <AlertTriangle size={48} className="mx-auto text-[#5B6474] mb-4" />
        <p className="text-[#5B6474]">{copy.error}</p>
        <Link href="/b2b-panel/ilanlarim" className="mt-4 inline-flex h-10 items-center rounded-full border border-[#E4DCCD] bg-white px-4 text-sm font-bold text-[#0F172A] hover:border-[#0F172A]">
          {copy.back}
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_CONFIG[listing.status] || STATUS_CONFIG.submitted;
  const StatusIcon = statusMeta.icon;
  const canEdit = EDITABLE_STATUSES.includes(listing.status);

  return (
    <div className="min-h-full bg-[#F6F1E9]">
    <div className="max-w-4xl p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/b2b-panel/ilanlarim"
          data-back-button
          className="mb-4 inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#E4DCCD] bg-white px-3.5 text-[13px] font-semibold text-[#334155] transition hover:border-[#0F172A] hover:text-[#0F172A]"
        >
          <ArrowLeft size={16} />
          {copy.back}
        </Link>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold tracking-tight text-[#0F172A] sm:text-3xl">{listing.title}</h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${statusMeta.color}`}>
                <StatusIcon size={14} />
                {statusMeta.label}
              </span>
            </div>
            <p className="text-sm text-[#5B6474]">
              #{listing.trackingCode} &middot; {new Date(listing.createdAt).toLocaleDateString()}
            </p>
          </div>
          {canEdit ? (
            <Link
              href={`/b2b-panel/ilanlarim/${listing.id}/edit`}
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-dk-red-strong px-5 text-sm font-bold text-white transition-colors hover:bg-dk-red-deep"
            >
              <Pencil size={16} />
              {copy.edit}
            </Link>
          ) : (
            <span className="rounded-full border border-[#E4DCCD] bg-white px-3 py-2 text-xs font-semibold text-[#5B6474]">
              {copy.editNotAllowed}
            </span>
          )}
        </div>
      </div>

      {/* Images */}
      {listing.images.length > 0 && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {listing.images.map((img) => (
            <div key={img.id} className="aspect-video overflow-hidden rounded-[18px] border border-[#E4DCCD] bg-[#F3EEE5]">
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="mb-6 rounded-[22px] border border-[#E4DCCD] bg-white p-5 sm:p-6">
        <h2 className="mb-4 border-b border-[#EFE9DE] pb-3 text-lg font-extrabold text-[#0F172A]">{copy.details}</h2>
        <p className="mb-4 whitespace-pre-wrap leading-relaxed text-[#334155]">{listing.description}</p>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div className="flex items-center gap-2 text-[#5B6474]">
            <Package size={16} className="text-[#5B6474]" />
            <span className="font-medium">{listing.price?.toLocaleString()} {listing.currency}</span>
          </div>
          <div className="flex items-center gap-2 text-[#5B6474]">
            <MapPin size={16} className="text-[#5B6474]" />
            <span>{listing.city}{listing.district ? `, ${listing.district}` : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-[#5B6474]">
            <Eye size={16} className="text-[#5B6474]" />
            <span>{listing.isShowcase ? 'Vitrində' : 'Gizli'}</span>
          </div>
          <div className="flex items-center gap-2 text-[#5B6474]">
            <Calendar size={16} className="text-[#5B6474]" />
            <span>{new Date(listing.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="mb-6 rounded-[22px] border border-[#E4DCCD] bg-white p-5 sm:p-6">
        <h2 className="mb-4 border-b border-[#EFE9DE] pb-3 text-lg font-extrabold text-[#0F172A]">{copy.contact}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-[#5B6474]">
            <User size={16} className="text-[#5B6474]" />
            <span>{listing.ownerName}</span>
          </div>
          <div className="flex items-center gap-2 text-[#5B6474]">
            <Phone size={16} className="text-[#5B6474]" />
            <span>{listing.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-[#5B6474]">
            <Mail size={16} className="text-[#5B6474]" />
            <span>{listing.email}</span>
          </div>
        </div>
      </div>

      {/* Leads */}
      <div className="mb-6 rounded-[22px] border border-[#E4DCCD] bg-white p-5 sm:p-6">
        <h2 className="mb-4 border-b border-[#EFE9DE] pb-3 text-lg font-extrabold text-[#0F172A]">
          {copy.leads} ({listing.leads.length})
        </h2>
        {listing.leads.length === 0 ? (
          <p className="text-sm text-[#5B6474]">{copy.noLeads}</p>
        ) : (
          <div className="space-y-3">
            {listing.leads.map((lead, i) => (
              <div key={i} className="flex items-start gap-3 rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] p-3">
                <MessageSquare size={16} className="text-[#5B6474] mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0F172A]">{lead.name}</p>
                  <p className="text-sm text-[#5B6474] mt-0.5">{lead.message || '-'}</p>
                  <p className="text-xs text-[#5B6474] mt-1">{new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      {listing.reviewNotes.length > 0 && (
        <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-5 sm:p-6">
          <h2 className="mb-4 border-b border-[#EFE9DE] pb-3 text-lg font-extrabold text-[#0F172A]">{copy.reviews}</h2>
          <div className="space-y-3">
            {listing.reviewNotes.map((review, i) => (
              <div key={i} className="rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-[#334155]">{review.reviewer}</span>
                  {review.score > 0 && (
                    <span className="rounded-full bg-[#0F172A] px-2 py-0.5 text-xs font-bold text-white">
                      {review.score}/5
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#5B6474]">{review.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
