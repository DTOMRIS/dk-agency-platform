// app/b2b-panel/yeni-ilan/page.tsx — DK Agency B2B portal: new listing.
// TASK-0528: this page used ListingForm WITHOUT onSubmit, so «Göndər» waited 1.5 s and showed a success
// screen while nothing was saved. It now renders the one working submission form — the same
// CreateListingForm as /ilan-ver (POST /api/listings) — inside the portal.
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import CreateListingForm from '@/components/listings/CreateListingForm';
import { getServerMemberSession } from '@/lib/members/server-session';

export default async function B2BNewListingPage() {
  const session = await getServerMemberSession(); // the portal layout already requires a login
  const t = await getTranslations('b2bNewListing');

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
      <Link
        href="/b2b-panel/ilanlarim"
        className="mb-5 inline-flex h-10 items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-4 text-sm font-bold text-[#0F172A] hover:border-[#0F172A]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t('back')}
      </Link>
      <CreateListingForm session={{ name: session.name, email: session.email }} />
    </div>
  );
}
