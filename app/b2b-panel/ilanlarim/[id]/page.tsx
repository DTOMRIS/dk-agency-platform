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
  submitted: { label: 'Göndərilib', icon: Clock, color: 'bg-slate-100 text-slate-700' },
  ai_checked: { label: 'AI Yoxlanılıb', icon: Bot, color: 'bg-blue-50 text-blue-700' },
  committee_review: { label: 'İncələnir', icon: Eye, color: 'bg-amber-50 text-amber-700' },
  shortlisted: { label: 'Qısa siyahıda', icon: Star, color: 'bg-purple-50 text-purple-700' },
  docs_requested: { label: 'Sənəd İstənib', icon: FileText, color: 'bg-orange-50 text-orange-700' },
  showcase_ready: { label: 'Vitrində', icon: CheckCircle, color: 'bg-emerald-50 text-emerald-700' },
  rejected: { label: 'Rədd edilib', icon: XCircle, color: 'bg-rose-50 text-rose-700' },
  sold: { label: 'Satıldı', icon: BadgeCheck, color: 'bg-teal-50 text-teal-700' },
  expired: { label: 'Müddəti bitdi', icon: TimerOff, color: 'bg-gray-100 text-gray-600' },
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
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-dk-red border-t-transparent rounded-full" />
        <span className="ml-3 text-gray-500">{copy.loading}</span>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">{copy.error}</p>
        <Link href="/b2b-panel/ilanlarim" className="text-dk-red hover:underline mt-2 inline-block">
          {copy.back}
        </Link>
      </div>
    );
  }

  const statusMeta = STATUS_CONFIG[listing.status] || STATUS_CONFIG.submitted;
  const StatusIcon = statusMeta.icon;
  const canEdit = EDITABLE_STATUSES.includes(listing.status);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/b2b-panel/ilanlarim"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft size={16} />
          {copy.back}
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg ${statusMeta.color}`}>
                <StatusIcon size={14} />
                {statusMeta.label}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              #{listing.trackingCode} &middot; {new Date(listing.createdAt).toLocaleDateString()}
            </p>
          </div>
          {canEdit ? (
            <Link
              href={`/b2b-panel/ilanlarim/${listing.id}/edit`}
              className="inline-flex items-center gap-2 bg-dk-red hover:bg-dk-red-strong text-white px-5 py-2.5 rounded-xl font-semibold transition-colors text-sm"
            >
              <Pencil size={16} />
              {copy.edit}
            </Link>
          ) : (
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-lg">
              {copy.editNotAllowed}
            </span>
          )}
        </div>
      </div>

      {/* Images */}
      {listing.images.length > 0 && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {listing.images.map((img) => (
            <div key={img.id} className="aspect-video rounded-xl overflow-hidden bg-gray-100">
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{copy.details}</h2>
        <p className="text-gray-700 whitespace-pre-wrap mb-4">{listing.description}</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Package size={16} className="text-gray-400" />
            <span className="font-medium">{listing.price?.toLocaleString()} {listing.currency}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={16} className="text-gray-400" />
            <span>{listing.city}{listing.district ? `, ${listing.district}` : ''}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Eye size={16} className="text-gray-400" />
            <span>{listing.isShowcase ? 'Vitrində' : 'Gizli'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={16} className="text-gray-400" />
            <span>{new Date(listing.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{copy.contact}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User size={16} className="text-gray-400" />
            <span>{listing.ownerName}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Phone size={16} className="text-gray-400" />
            <span>{listing.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={16} className="text-gray-400" />
            <span>{listing.email}</span>
          </div>
        </div>
      </div>

      {/* Leads */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {copy.leads} ({listing.leads.length})
        </h2>
        {listing.leads.length === 0 ? (
          <p className="text-sm text-gray-400">{copy.noLeads}</p>
        ) : (
          <div className="space-y-3">
            {listing.leads.map((lead, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <MessageSquare size={16} className="text-gray-400 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{lead.message || '-'}</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(lead.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews */}
      {listing.reviewNotes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{copy.reviews}</h2>
          <div className="space-y-3">
            {listing.reviewNotes.map((review, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{review.reviewer}</span>
                  {review.score > 0 && (
                    <span className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
                      {review.score}/5
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{review.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
