import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import CreateListingForm from '@/components/listings/CreateListingForm';
import { getServerMemberSession } from '@/lib/members/server-session';
import PageBack from '@/components/inner/PageBack';
import home from '@/components/home/v2/homeV2.module.css';
import s from '@/components/inner/inner.module.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('createListing.meta');
  return { title: t('title'), description: t('description') };
}

export default async function IlanVerPage() {
  const session = await getServerMemberSession();
  const t = await getTranslations('createListing');

  if (!session.loggedIn) {
    return (
      <div className={`${s.page} min-h-screen bg-[#F6F1E9]`}>
        <PageBack to="listings" />
        <section className={`${home.wrap} pb-16 pt-2 sm:pb-24`}>
          <div className="mx-auto max-w-2xl rounded-[22px] border border-[#E4DCCD] bg-white px-5 py-8 text-center sm:px-10 sm:py-12">
            <span className={home.eyebrow}>
              <span className={home.dot} />
              {t('loginRequired')}
            </span>
            <h1 className="mt-4 text-[clamp(28px,4vw,40px)] font-black leading-[1.08] tracking-[-0.04em] text-[#0F172A]">
              {t('loginTitle')}
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-[#5B6474]">
              {t('loginDesc')}
            </p>
            <div className="mt-8 flex flex-col justify-center gap-2.5 sm:flex-row">
              <Link
                href="/auth/login?next=/ilan-ver"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-dk-red-strong px-6 text-sm font-bold text-white transition hover:bg-dk-red-deep"
              >
                {t('loginButton')}
              </Link>
              <Link
                href="/auth/register?next=/ilan-ver"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#E4DCCD] bg-white px-6 text-sm font-bold text-[#0F172A] transition hover:border-[#0F172A]"
              >
                {t('registerButton')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={`${s.page} min-h-screen bg-[#F6F1E9]`}>
      <PageBack to="listings" />
      <section className={`${home.wrap} pb-16 sm:pb-24`}>
        <header className="max-w-3xl pb-6 pt-2 sm:pb-8">
          <span className={home.eyebrow}>
            <span className={home.dot} />
            {t('page.eyebrow')}
          </span>
          <h1 className="mt-4 text-[clamp(30px,4.4vw,52px)] font-black leading-[1.04] tracking-[-0.045em] text-[#0F172A]">
            {t('page.title')}
          </h1>
          <p className={`${s.lead} mt-3`}>{t('page.lead')}</p>
        </header>
        <CreateListingForm tone="v2" session={{ name: session.name, email: session.email }} />
      </section>
    </div>
  );
}
