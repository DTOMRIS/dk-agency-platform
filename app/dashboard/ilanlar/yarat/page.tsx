'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import CreateListingForm from '@/components/listings/CreateListingForm';

export default function AdminCreateListingPage() {
  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center gap-4">
          <Link
            href="/dashboard/ilanlar"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[var(--dk-red)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        </div>
        <div className="mb-8">
          <span className="inline-flex rounded-full bg-amber-500 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            Admin
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-[var(--dk-navy)]">
            Yeni elan yarat
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Admin olaraq elan limit olmadan birbaşa vitrinə yerləşdirə bilərsiniz.
          </p>
        </div>
        <CreateListingForm
          isAdmin
          session={{ name: 'DK Agency Admin', email: 'info@dkagency.com.tr' }}
        />
      </div>
    </div>
  );
}
