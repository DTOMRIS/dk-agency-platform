'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, Mail, Rss, Package, AlertCircle } from 'lucide-react';
import PageBack from '@/components/inner/PageBack';
import home from '@/components/home/v2/homeV2.module.css';
import s from '@/components/inner/inner.module.css';

type Preferences = {
  email: string;
  newsletterSubscribed: boolean;
  blogDigestSubscribed: boolean;
  productUpdatesSubscribed: boolean;
};

type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; preferences: Preferences };

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

function Toggle({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  id: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BE2F47] focus-visible:ring-offset-2',
        checked ? 'bg-dk-red-strong' : 'bg-[#D8CFBF]',
      ].join(' ')}
    >
      <span
        className={[
          'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-6' : 'translate-x-1',
        ].join(' ')}
      />
    </button>
  );
}

export default function EmailPreferencesPage() {
  const t = useTranslations('emailPrefs');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const showSuccess = searchParams.get('success') === 'true';

  const [fetchState, setFetchState] = useState<FetchState>({ status: 'idle' });
  const [newsletter, setNewsletter] = useState(true);
  const [blogDigest, setBlogDigest] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');

  const fetchPreferences = useCallback(async (tok: string) => {
    setFetchState({ status: 'loading' });
    try {
      const res = await fetch(`/api/email/preferences?token=${encodeURIComponent(tok)}`);
      const data: unknown = await res.json();

      if (!res.ok) {
        setFetchState({ status: 'error', message: t('loadError') });
        return;
      }

      if (
        data !== null &&
        typeof data === 'object' &&
        'preferences' in data
      ) {
        const prefs = (data as { preferences: Preferences }).preferences;
        setNewsletter(prefs.newsletterSubscribed);
        setBlogDigest(prefs.blogDigestSubscribed);
        setProductUpdates(prefs.productUpdatesSubscribed);
        setFetchState({ status: 'ready', preferences: prefs });
      }
    } catch {
      setFetchState({ status: 'error', message: t('networkError') });
    }
  }, [t]);

  useEffect(() => {
    if (!token) return;
    const timer = setTimeout(() => {
      void fetchPreferences(token);
    }, 0);
    return () => clearTimeout(timer);
  }, [token, fetchPreferences]);

  async function handleSave() {
    if (!token) return;
    setSaveState('saving');

    try {
      const res = await fetch('/api/email/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newsletter, blogDigest, productUpdates }),
      });

      if (res.ok) {
        setSaveState('saved');
        setTimeout(() => setSaveState('idle'), 3000);
      } else {
        setSaveState('error');
      }
    } catch {
      setSaveState('error');
    }
  }

  if (!token) {
    return (
      <main className={`${s.page} min-h-screen pb-24`}>
        <PageBack />
        <div className={home.wrap}>
          <div className="mx-auto mt-10 max-w-md space-y-4 rounded-[22px] border border-[#E4DCCD] bg-white p-8 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-[#BE2F47]" aria-hidden="true" />
            <h1 className="text-2xl font-black tracking-[-0.02em] text-[#0F172A]">
              {t('tokenTitle')}
            </h1>
            <p className="text-sm leading-relaxed text-[#5B6474]">
              {t('tokenBody')}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`${s.page} min-h-screen pb-24`}>
      <PageBack />
      <div className={home.wrap}>
        <div className="mx-auto max-w-lg space-y-6 pt-6">
          {/* Success banner */}
          {showSuccess && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3"
            >
              <CheckCircle
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-green-800">
                {t('updated')}
              </p>
            </div>
          )}

          {/* Save success banner */}
          {saveState === 'saved' && (
            <div
              role="status"
              className="flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3"
            >
              <CheckCircle
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-green-800">{t('saved')}</p>
            </div>
          )}

          {/* Save error banner */}
          {saveState === 'error' && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3"
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-red-800">
                {t('saveError')}
              </p>
            </div>
          )}

          {/* Card */}
          <div className="space-y-6 rounded-[22px] border border-[#E4DCCD] bg-white p-6 sm:p-8">
            <div>
              <h1 className="text-[28px] font-black leading-tight tracking-[-0.03em] text-[#0F172A]">
                {t('title')}
              </h1>
              {fetchState.status === 'ready' && (
                <p className="mt-1 text-sm text-[#5B6474]">{fetchState.preferences.email}</p>
              )}
            </div>

            {/* Loading */}
            {fetchState.status === 'loading' && (
              <div className="space-y-4 animate-pulse">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-14 rounded-2xl bg-[#EFE9DE]" />
                ))}
              </div>
            )}

            {/* Fetch error */}
            {fetchState.status === 'error' && (
              <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                <AlertCircle
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600"
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-red-800">{fetchState.message}</p>
              </div>
            )}

            {/* Preference toggles */}
            {(fetchState.status === 'ready' || fetchState.status === 'idle') && (
              <fieldset className="space-y-4 border-0 p-0 m-0">
                <legend className="sr-only">{t('legend')}</legend>

                {/* Newsletter */}
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Mail
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#BE2F47]"
                      aria-hidden="true"
                    />
                    <div>
                      <label
                        htmlFor="toggle-newsletter"
                        className="block cursor-pointer text-sm font-bold text-[#0F172A]"
                      >
                        {t('newsletter')}
                      </label>
                      <p className="mt-0.5 text-xs text-[#5B6474]">
                        {t('newsletterDesc')}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    id="toggle-newsletter"
                    checked={newsletter}
                    onChange={setNewsletter}
                  />
                </div>

                {/* Blog digest */}
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Rss
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#BE2F47]"
                      aria-hidden="true"
                    />
                    <div>
                      <label
                        htmlFor="toggle-blog-digest"
                        className="block cursor-pointer text-sm font-bold text-[#0F172A]"
                      >
                        {t('blogDigest')}
                      </label>
                      <p className="mt-0.5 text-xs text-[#5B6474]">
                        {t('blogDigestDesc')}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    id="toggle-blog-digest"
                    checked={blogDigest}
                    onChange={setBlogDigest}
                  />
                </div>

                {/* Product updates */}
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Package
                      className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#BE2F47]"
                      aria-hidden="true"
                    />
                    <div>
                      <label
                        htmlFor="toggle-product-updates"
                        className="block cursor-pointer text-sm font-bold text-[#0F172A]"
                      >
                        {t('productUpdates')}
                      </label>
                      <p className="mt-0.5 text-xs text-[#5B6474]">
                        {t('productUpdatesDesc')}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    id="toggle-product-updates"
                    checked={productUpdates}
                    onChange={setProductUpdates}
                  />
                </div>
              </fieldset>
            )}

            {/* Save button */}
            {(fetchState.status === 'ready' || fetchState.status === 'idle') && (
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={saveState === 'saving'}
                className="w-full rounded-full bg-dk-red-strong px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-dk-red-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BE2F47] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saveState === 'saving' ? t('saving') : t('save')}
              </button>
            )}
          </div>

          {/* Unsubscribe all link */}
          <div className="text-center">
            <a
              href={`/api/email/unsubscribe?token=${encodeURIComponent(token)}&type=all`}
              className="text-sm text-[#5B6474] underline underline-offset-2 transition-colors hover:text-[#0F172A]"
            >
              {t('unsubscribeAll')}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
