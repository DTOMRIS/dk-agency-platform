'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CheckCircle, Lock, LogIn, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ReadingProgress from './ReadingProgress';
import { getGuestSession, hasFullArticleAccess, readMemberSession } from '@/lib/member-access';

interface BlogContentWrapperProps {
  children: React.ReactNode;
  articleTitle: string;
  isPremium?: boolean;
}

export default function BlogContentWrapper({
  children,
  articleTitle,
  isPremium = true,
}: BlogContentWrapperProps) {
  const pathname = usePathname();
  const t = useTranslations('registrationGate');
  const [showPaywall, setShowPaywall] = useState(false);
  const [isScrollLocked, setIsScrollLocked] = useState(false);
  const [session, setSession] = useState(getGuestSession());

  const fullAccess = hasFullArticleAccess(session);
  const shouldGate = isPremium && !fullAccess;
  const nextUrl = pathname || '/haberler';
  const loginHref = `/auth/login?next=${encodeURIComponent(nextUrl)}`;
  const registerHref = `/auth/register?next=${encodeURIComponent(nextUrl)}&source=registration-gate`;

  useEffect(() => {
    const syncSession = () => {
      const nextSession = readMemberSession();
      setSession(nextSession);

      if (hasFullArticleAccess(nextSession)) {
        setShowPaywall(false);
        setIsScrollLocked(false);
      }
    };

    syncSession();
    window.addEventListener('storage', syncSession);
    window.addEventListener('member-session-updated', syncSession);

    return () => {
      window.removeEventListener('storage', syncSession);
      window.removeEventListener('member-session-updated', syncSession);
    };
  }, []);

  useEffect(() => {
    const handlePaywallTrigger = () => {
      if (!shouldGate) {
        return;
      }

      setShowPaywall(true);
      setIsScrollLocked(true);
    };

    window.addEventListener('paywallTrigger', handlePaywallTrigger);
    return () => window.removeEventListener('paywallTrigger', handlePaywallTrigger);
  }, [shouldGate]);

  useEffect(() => {
    document.body.style.overflow = isScrollLocked ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isScrollLocked]);

  return (
    <>
      <ReadingProgress
        showPercentage
        color="bg-red-600"
        paywallThreshold={shouldGate ? 40 : undefined}
        onPaywallTrigger={
          shouldGate
            ? () => {
                setShowPaywall(true);
                setIsScrollLocked(true);
              }
            : undefined
        }
      />

      <div className={`relative ${showPaywall && shouldGate ? 'max-h-screen overflow-hidden' : ''}`}>
        {children}

        {showPaywall && shouldGate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/80" />

            <div className="relative z-10 mx-4 w-full max-w-lg">
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-5 text-center text-white">
                  <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/15">
                    <Lock className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold">{t('title')}</h3>
                  <p className="mt-1 text-sm text-emerald-100">
                    {t('readPreview', { title: articleTitle })}
                  </p>
                </div>

                <div className="px-6 py-6">
                  <div className="mb-6 rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-sm leading-relaxed text-emerald-800">
                      {t('description')}
                    </p>
                  </div>

                  <div className="mb-6 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                    <div className="relative h-12 w-12">
                      <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
                        <circle className="text-slate-200" stroke="currentColor" strokeWidth="3" fill="none" cx="18" cy="18" r="15.9" />
                        <circle
                          className="text-emerald-600"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          fill="none"
                          strokeDasharray="40, 100"
                          cx="18"
                          cy="18"
                          r="15.9"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-700">40%</span>
                    </div>
                    <div className="flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-slate-800">{articleTitle}</p>
                    </div>
                  </div>

                  <div className="mb-6 space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{t('benefit1Title')}</p>
                        <p className="text-xs text-slate-500">{t('benefit1Desc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{t('benefit2Title')}</p>
                        <p className="text-xs text-slate-500">{t('benefit2Desc')}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                      <div>
                        <p className="text-sm font-medium text-slate-800">{t('benefit3Title')}</p>
                        <p className="text-xs text-slate-500">{t('benefit3Desc')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Link href={registerHref} className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3.5 font-bold text-white transition hover:bg-emerald-700">
                      <Sparkles className="h-5 w-5" />
                      {t('registerCta')}
                    </Link>
                    <Link href={loginHref} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-100 py-3 font-medium text-slate-700 transition hover:bg-slate-200">
                      <LogIn className="h-4 w-4" />
                      {t('loginCta')}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 border-t border-slate-100 bg-slate-50 px-6 py-4 text-xs text-slate-500">
                  {t('footer').split('·').map((part, i, arr) => (
                    <span key={part.trim()}>
                      {part.trim()}
                      {i < arr.length - 1 && <span className="ml-4">·</span>}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
