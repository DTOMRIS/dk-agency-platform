import type { Metadata } from 'next';
import Link from 'next/link';
import CreateListingForm from '@/components/listings/CreateListingForm';
import { getServerMemberSession } from '@/lib/members/server-session';

export const metadata: Metadata = {
  title: 'Elan ver',
  description: 'HoReCa üçün devir, franchise, obyekt və avadanlıq elanı göndər.',
};

export default async function IlanVerPage() {
  const session = await getServerMemberSession();

  if (!session.loggedIn) {
    return (
      <div className="min-h-screen bg-white px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <span className="inline-flex rounded-full bg-[var(--dk-red)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
            Elan ver
          </span>
          <h1 className="mt-5 font-display text-4xl font-black text-[var(--dk-navy)]">
            Elan vermək üçün hesabınıza daxil olun
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">
            Elan yaratmaq, şəkil yükləmək və tracking code almaq üçün əvvəlcə üzv girişi lazımdır.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/login?next=/ilan-ver"
              className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white"
            >
              Daxil ol
            </Link>
            <Link
              href="/auth/register?next=/ilan-ver"
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700"
            >
              Hesabınız yoxdur? Qeydiyyat
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <CreateListingForm session={{ name: session.name, email: session.email }} />
      </div>
    </div>
  );
}
