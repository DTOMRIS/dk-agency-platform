import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import ListingSubmissionPage from '@/components/listings/ListingSubmissionPage';
import { getServerMemberSession } from '@/lib/members/server-session';

export const metadata: Metadata = {
  title: 'Elan ver',
  description: 'HoReCa üçün restoran devri, franchise, obyekt və ekipman elanı göndər.',
};

export default async function IlanVerPage() {
  const session = await getServerMemberSession();

  if (!session.loggedIn) {
    redirect('/auth/login?next=/ilan-ver');
  }

  return <ListingSubmissionPage />;
}
