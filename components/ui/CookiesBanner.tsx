'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { trackCookieConsent, type ConsentValue } from '@/lib/analytics/cookieConsentEvents';
import {
  readConsentFromCookies,
  writeConsentToCookies,
  type ConsentPrefs,
} from '@/lib/cookies/consent';

const CONSENT_KEY = 'dk_cookie_consent';
const PREFS_KEY = 'dk_cookie_prefs';
const LEGACY_KEY = 'dk-cookies-accepted';

const DEFAULT_DENIED: ConsentPrefs = { essential: true, analytics: false, marketing: false };
const DEFAULT_ACCEPTED: ConsentPrefs = { essential: true, analytics: true, marketing: true };

function clearLegacyStorage() {
  localStorage.removeItem(CONSENT_KEY);
  localStorage.removeItem(PREFS_KEY);
  localStorage.removeItem(LEGACY_KEY);
}

function migrateFromLocalStorageOnce() {
  const lsConsent = localStorage.getItem(CONSENT_KEY);
  const lsPrefs = localStorage.getItem(PREFS_KEY);
  const legacy = localStorage.getItem(LEGACY_KEY);

  let mappedConsent: ConsentValue | undefined;

  if (lsConsent === 'yes' || lsConsent === 'no' || lsConsent === 'custom') {
    mappedConsent = lsConsent;
  } else if (legacy) {
    mappedConsent = legacy === 'true' ? 'yes' : legacy === 'false' ? 'no' : 'custom';
  }

  if (!mappedConsent) {
    return false;
  }

  let prefs: ConsentPrefs =
    mappedConsent === 'yes' ? DEFAULT_ACCEPTED : mappedConsent === 'no' ? DEFAULT_DENIED : DEFAULT_DENIED;

  if (lsPrefs) {
    try {
      const parsed = JSON.parse(lsPrefs) as Partial<ConsentPrefs>;
      prefs = {
        essential: true,
        analytics: Boolean(parsed.analytics),
        marketing: Boolean(parsed.marketing),
      };
    } catch {
      // keep fallback prefs
    }
  }

  writeConsentToCookies(mappedConsent, prefs);
  clearLegacyStorage();
  return true;
}

function CookiePreferencesModal({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean;
  initial: ConsentPrefs;
  onClose: () => void;
  onSave: (prefs: ConsentPrefs) => void;
}) {
  const [analytics, setAnalytics] = useState(initial.analytics);
  const [marketing, setMarketing] = useState(initial.marketing);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Cookie preferences"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl">
        <h4 className="text-lg font-bold text-[#1a1a1a]">Cookie secimleri</h4>
        <p className="mt-1 text-sm text-gray-600">Essential cookie her zaman aktivdir. Diger secimleri idare edin.</p>

        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
            <span className="text-sm font-medium text-gray-700">Analytics</span>
            <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-gray-200 p-3">
            <span className="text-sm font-medium text-gray-700">Marketing</span>
            <input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />
          </label>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700"
          >
            Bagla
          </button>
          <button
            type="button"
            onClick={() => onSave({ essential: true, analytics, marketing })}
            className="flex-1 rounded-lg bg-[#E94560] px-3 py-2 text-sm font-semibold text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CookiesBanner() {
  const [show, setShow] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [prefsSeed, setPrefsSeed] = useState<ConsentPrefs>(DEFAULT_DENIED);

  useEffect(() => {
    const cookieState = readConsentFromCookies();
    if (cookieState.consent) {
      clearLegacyStorage();
      return;
    }

    if (migrateFromLocalStorageOnce()) {
      return;
    }

    const timer = setTimeout(() => setShow(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const saveConsent = (value: ConsentValue, prefs: ConsentPrefs) => {
    writeConsentToCookies(value, prefs);
    clearLegacyStorage();
    trackCookieConsent(value, prefs.analytics);
  };

  const handleAccept = () => {
    saveConsent('yes', DEFAULT_ACCEPTED);
    setShow(false);
  };

  const handleDecline = () => {
    saveConsent('no', DEFAULT_DENIED);
    setShow(false);
  };

  const handleCustomize = () => {
    const currentPrefs = readConsentFromCookies().prefs ?? DEFAULT_DENIED;
    setPrefsSeed(currentPrefs);
    setModalOpen(true);
  };

  const handleModalSave = (prefs: ConsentPrefs) => {
    saveConsent('custom', prefs);
    setModalOpen(false);
    setShow(false);
  };

  if (!show) {
    return (
      <CookiePreferencesModal
        key={`cookie-modal-${String(prefsSeed.analytics)}-${String(prefsSeed.marketing)}-${String(modalOpen)}`}
        open={modalOpen}
        initial={prefsSeed}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/20 backdrop-blur-sm">
        <div
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        >
          <div className="relative h-32 overflow-visible">
            <div className="absolute inset-0 bg-gradient-to-br from-[#F5E6A3] via-[#E8C840] to-[#D4AF37]">
              <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 400 50" preserveAspectRatio="none" style={{ height: '50px' }}>
                <path d="M0,25 Q100,50 200,25 T400,25 L400,50 L0,50 Z" fill="white" />
              </svg>
            </div>

            <div className="absolute -bottom-9 right-5 z-10">
              <div className="relative h-28 w-28">
                <div className="absolute inset-0 rounded-full border border-[#bb8b2f] bg-[radial-gradient(circle_at_30%_25%,#f5d488_0%,#dfb04b_50%,#bf8731_100%)] shadow-[0_14px_30px_rgba(0,0,0,0.24)]" />
                <div className="absolute right-1 top-1 h-8 w-8 rounded-full bg-white/95" />
                <div className="absolute right-5 top-1 h-6 w-6 rounded-full bg-white/95" />
                <div className="absolute left-5 top-6 h-2.5 w-2.5 rounded-full bg-[#8a4f1f]" />
                <div className="absolute left-9 top-11 h-2 w-2 rounded-full bg-[#8a4f1f]" />
                <div className="absolute left-14 top-8 h-2.5 w-2.5 rounded-full bg-[#8a4f1f]" />
                <div className="absolute left-16 top-[3.75rem] h-2 w-2 rounded-full bg-[#8a4f1f]" />
                <div className="absolute left-8 top-[4.25rem] h-2.5 w-2.5 rounded-full bg-[#8a4f1f]" />
              </div>
            </div>

            <div className="absolute top-4 left-8 w-3 h-3 bg-[#8B4513] rounded-full opacity-60" />
            <div className="absolute top-8 left-16 w-2 h-2 bg-[#8B4513] rounded-full opacity-40" />
            <div className="absolute bottom-12 left-12 w-2 h-2 bg-[#8B4513] rounded-full opacity-50" />
          </div>

          <div className="px-6 pt-6 pb-4">
            <h3 className="text-[#1a1a1a] font-bold text-xl leading-tight mb-2">Kim dedi cookies saglam deyil?</h3>
            <p className="text-[#666] text-[14px] leading-relaxed mb-3">DK Agency-de tecrubeni yaxsilasdirmag ucun cookies istifade edirik.</p>
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1 text-[#1a1a1a] text-[13px] font-semibold hover:text-[#E94560] transition-colors"
            >
              Mexfilik siyasetimizi buradan oxuyun
              <span className="text-[10px]">-&gt;</span>
            </Link>
          </div>

          <div className="px-6 py-3 border-t border-gray-100">
            <p className="text-[11px] text-gray-400 text-center">GDPR uyugunlugu temin edilir</p>
          </div>

          <div className="grid grid-cols-3 border-t border-gray-100">
            <button
              onClick={handleDecline}
              className="py-4 text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all border-r border-gray-100"
            >
              xeyr
            </button>
            <button
              onClick={handleCustomize}
              className="py-4 text-[13px] font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all border-r border-gray-100"
            >
              Secimler
            </button>
            <button
              onClick={handleAccept}
              className="py-4 text-[13px] font-bold text-white bg-[#E94560] hover:bg-[#d63d56] transition-all"
            >
              qebul et
            </button>
          </div>
        </div>
      </div>

      <CookiePreferencesModal
        key={`cookie-modal-${String(prefsSeed.analytics)}-${String(prefsSeed.marketing)}-${String(modalOpen)}`}
        open={modalOpen}
        initial={prefsSeed}
        onClose={() => setModalOpen(false)}
        onSave={handleModalSave}
      />
    </>
  );
}
