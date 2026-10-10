'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, Mail, Rss, Package, AlertCircle } from 'lucide-react';
import PageBack from '@/components/inner/PageBack';

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
        'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dk-red)] focus-visible:ring-offset-2',
        checked ? 'bg-[var(--dk-red)]' : 'bg-slate-300',
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
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <PageBack />
        <div className="max-w-md w-full text-center space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" aria-hidden="true" />
          <h1 className="text-2xl font-semibold text-[var(--dk-navy)]">
            {t('tokenTitle')}
          </h1>
          <p className="text-slate-700 text-sm leading-relaxed">
            {t('tokenBody')}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-12">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Success banner */}
        {showSuccess && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3"
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
            className="flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3"
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
            className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3"
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
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--dk-navy)] leading-tight">
              {t('title')}
            </h1>
            {fetchState.status === 'ready' && (
              <p className="mt-1 text-sm text-slate-700">{fetchState.preferences.email}</p>
            )}
          </div>

          {/* Loading */}
          {fetchState.status === 'loading' && (
            <div className="space-y-4 animate-pulse">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 rounded-lg bg-slate-100" />
              ))}
            </div>
          )}

          {/* Fetch error */}
          {fetchState.status === 'error' && (
            <div className="flex items-start gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
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
              <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-start gap-3">
                  <Mail
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--dk-red)]"
                    aria-hidden="true"
                  />
                  <div>
                    <label
                      htmlFor="toggle-newsletter"
                      className="block text-sm font-medium text-slate-900 cursor-pointer"
                    >
                      {t('newsletter')}
                    </label>
                    <p className="text-xs text-slate-700 mt-0.5">
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
              <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-start gap-3">
                  <Rss
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--dk-red)]"
                    aria-hidden="true"
                  />
                  <div>
                    <label
                      htmlFor="toggle-blog-digest"
                      className="block text-sm font-medium text-slate-900 cursor-pointer"
                    >
                      {t('blogDigest')}
                    </label>
                    <p className="text-xs text-slate-700 mt-0.5">
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
              <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
                <div className="flex items-start gap-3">
                  <Package
                    className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--dk-red)]"
                    aria-hidden="true"
                  />
                  <div>
                    <label
                      htmlFor="toggle-product-updates"
                      className="block text-sm font-medium text-slate-900 cursor-pointer"
                    >
                      {t('productUpdates')}
                    </label>
                    <p className="text-xs text-slate-700 mt-0.5">
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
              className="w-full rounded-lg bg-dk-red-strong px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-dk-red-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--dk-red)] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saveState === 'saving' ? t('saving') : t('save')}
            </button>
          )}
        </div>

        {/* Unsubscribe all link */}
        <div className="text-center">
          <a
            href={`/api/email/unsubscribe?token=${encodeURIComponent(token)}&type=all`}
            className="text-sm text-slate-600 underline underline-offset-2 hover:text-slate-900 transition-colors"
          >
            {t('unsubscribeAll')}
          </a>
        </div>
      </div>
    </main>
  );
}
