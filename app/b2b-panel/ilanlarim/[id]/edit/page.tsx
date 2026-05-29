// app/b2b-panel/ilanlarim/[id]/edit/page.tsx
// Owner listing edit page — reuses ListingForm with prefilled data

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import ListingForm from '@/components/listings/ListingForm';
import { normalizeLocale, type Locale } from '@/i18n/config';
import type { ListingCategory } from '@/lib/data/listingCategories';
import type { ListingWorkflowStatus } from '@/lib/utils/listingStatus';

interface ListingData {
  id: number;
  trackingCode: string;
  type: string;
  status: ListingWorkflowStatus;
  title: string;
  description: string;
  price: number;
  priceLabel?: string;
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
}

const EDITABLE_STATUSES: ListingWorkflowStatus[] = ['submitted', 'docs_requested'];

const pageCopy: Record<Locale, {
  back: string;
  editing: string;
  notEditable: string;
  notEditableHint: string;
  saving: string;
  saved: string;
  saveError: string;
  save: string;
  loading: string;
  notFound: string;
}> = {
  az: {
    back: 'Elana qayıt',
    editing: 'Elanı Redaktə Et',
    notEditable: 'Redaktə mümkün deyil',
    notEditableHint: 'Bu elan hal-hazırda redaktə oluna bilmir. Status: ',
    saving: 'Saxlanılır...',
    saved: 'Dəyişikliklər saxlanıldı!',
    saveError: 'Saxlama zamanı xəta baş verdi.',
    save: 'Dəyişiklikləri Saxla',
    loading: 'Yüklənir...',
    notFound: 'Elan tapılmadı',
  },
  en: {
    back: 'Back to Listing',
    editing: 'Edit Listing',
    notEditable: 'Cannot Edit',
    notEditableHint: 'This listing cannot be edited at this time. Status: ',
    saving: 'Saving...',
    saved: 'Changes saved!',
    saveError: 'An error occurred while saving.',
    save: 'Save Changes',
    loading: 'Loading...',
    notFound: 'Listing not found',
  },
  ru: {
    back: 'К объявлению',
    editing: 'Редактировать объявление',
    notEditable: 'Редактирование невозможно',
    notEditableHint: 'Это объявление сейчас нельзя редактировать. Статус: ',
    saving: 'Сохранение...',
    saved: 'Изменения сохранены!',
    saveError: 'Ошибка при сохранении.',
    save: 'Сохранить изменения',
    loading: 'Загрузка...',
    notFound: 'Объявление не найдено',
  },
  tr: {
    back: 'İlana Dön',
    editing: 'İlanı Düzenle',
    notEditable: 'Düzenlenemez',
    notEditableHint: 'Bu ilan şu an düzenlenemiyor. Durum: ',
    saving: 'Kaydediliyor...',
    saved: 'Değişiklikler kaydedildi!',
    saveError: 'Kaydetme sırasında bir hata oluştu.',
    save: 'Değişiklikleri Kaydet',
    loading: 'Yükleniyor...',
    notFound: 'İlan bulunamadı',
  },
};

export default function OwnerListingEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [listing, setListing] = useState<ListingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [listingId, setListingId] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => {
      setListingId(id);
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
        <Loader2 size={24} className="animate-spin text-dk-red" />
        <span className="ml-3 text-gray-500">{copy.loading}</span>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">{copy.notFound}</p>
      </div>
    );
  }

  // Status guard on client side
  if (!EDITABLE_STATUSES.includes(listing.status)) {
    return (
      <div className="p-8 text-center">
        <AlertTriangle size={48} className="mx-auto text-amber-400 mb-4" />
        <p className="text-lg font-semibold text-gray-900">{copy.notEditable}</p>
        <p className="text-gray-500 mt-2">{copy.notEditableHint}{listing.status}</p>
        <Link
          href={`/b2b-panel/ilanlarim/${listingId}`}
          className="text-dk-red hover:underline mt-4 inline-block"
        >
          {copy.back}
        </Link>
      </div>
    );
  }

  // Build initialData from listing for ListingForm
  const initialData: Record<string, unknown> = {
    // Standard fields that ListingForm renders from category fields
    ...listing.typeSpecificData,
    // Core fields
    description: listing.description,
    price: listing.price,
    priceLabel: listing.priceLabel,
    currency: listing.currency,
    city: listing.city,
    district: listing.district,
    phone: listing.phone,
    email: listing.email,
    contactName: listing.contactName,
    contactPhone: listing.contactPhone,
    contactEmail: listing.contactEmail,
    equipment: listing.equipment,
    title: listing.title,
    // Images as URL list for the form
    images: listing.images?.map((img) => img.url),
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setSaveMsg(null);

    // Separate core editable fields from type-specific data
    const {
      description, price, priceLabel, currency, city, district,
      phone, email, contactName, contactPhone, contactEmail,
      equipment, images,
      // Rest goes to typeSpecificData
      title: _title, // Not editable, stripped
      ...typeSpecificData
    } = data;

    const payload = {
      description,
      price,
      priceLabel,
      currency,
      city,
      district,
      phone,
      email,
      contactName,
      contactPhone,
      contactEmail,
      equipment,
      images,
      typeSpecificData,
    };

    const res = await fetch(`/api/listings/${listingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await res.json();

    if (result.success) {
      setSaveMsg({ type: 'success', text: copy.saved });
      // Navigate back to detail after short delay
      setTimeout(() => router.push(`/b2b-panel/ilanlarim/${listingId}`), 1200);
    } else {
      setSaveMsg({ type: 'error', text: result.error || copy.saveError });
      throw new Error(result.error || 'Save failed');
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <Link
        href={`/b2b-panel/ilanlarim/${listingId}`}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4"
      >
        <ArrowLeft size={16} />
        {copy.back}
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{copy.editing}</h1>
        <p className="text-sm text-gray-500 mt-1">
          #{listing.trackingCode} &middot; {listing.title}
        </p>
      </div>

      {/* Save message */}
      {saveMsg && (
        <div className={`mb-4 p-3 rounded-xl text-sm font-medium ${
          saveMsg.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {saveMsg.text}
        </div>
      )}

      {/* ListingForm in edit mode */}
      <ListingForm
        categoryId={listing.type as ListingCategory}
        initialData={initialData}
        submitLabel={copy.save}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/b2b-panel/ilanlarim/${listingId}`)}
      />
    </div>
  );
}
