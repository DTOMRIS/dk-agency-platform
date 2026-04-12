'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'dk-cookie-consent';

interface CookieSettings {
  facebook: boolean;
  google: boolean;
  hotjar: boolean;
}

interface CookieConsent {
  accepted: boolean;
  settings: CookieSettings;
  date: string;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 flex-shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-emerald-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-[22px]' : 'translate-x-[3px]'
        }`}
      />
    </button>
  );
}

export default function CookiesBanner() {
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [facebook, setFacebook] = useState(false);
  const [google, setGoogle] = useState(false);
  const [hotjar, setHotjar] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return;
    } catch {
      // localStorage unavailable
    }
    const timer = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const saveAndHide = (consent: CookieConsent) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // localStorage unavailable
    }
    setVisible(false);
    setSettingsOpen(false);
  };

  const handleAccept = () => {
    saveAndHide({
      accepted: true,
      settings: { facebook: true, google: true, hotjar: true },
      date: new Date().toISOString(),
    });
  };

  const handleReject = () => {
    saveAndHide({
      accepted: false,
      settings: { facebook: false, google: false, hotjar: false },
      date: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    saveAndHide({
      accepted: facebook || google || hotjar,
      settings: { facebook, google, hotjar },
      date: new Date().toISOString(),
    });
  };

  const handleAcceptAll = () => {
    setFacebook(true);
    setGoogle(true);
    setHotjar(true);
    saveAndHide({
      accepted: true,
      settings: { facebook: true, google: true, hotjar: true },
      date: new Date().toISOString(),
    });
  };

  const handleToggleAll = (val: boolean) => {
    setFacebook(val);
    setGoogle(val);
    setHotjar(val);
  };

  const allOn = facebook && google && hotjar;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-banner"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="fixed bottom-6 left-1/2 z-50 w-[90vw] max-w-[420px] -translate-x-1/2 rounded-2xl border border-gray-100 bg-white p-6"
          style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
        >
          {!settingsOpen ? (
            <div>
              <Image
                src="/images/cookies.png"
                width={120}
                height={80}
                alt="Çərəzlər"
                className="mx-auto mb-4"
              />
              <h3 className="mb-2 text-center text-lg font-bold text-slate-900">
                Bu sayt çərəzlərdən istifadə edir
              </h3>
              <p className="mb-2 text-center text-sm text-gray-500">
                Bu sayt təcrübənizi yaxşılaşdırmaq, performansı ölçmək və sizə daha uyğun məzmun
                göstərmək üçün çərəzlərdən istifadə edir.
              </p>
              <Link
                href="/privacy"
                className="mb-1 block text-center text-sm text-amber-600 hover:underline"
              >
                Məxfilik siyasətimizi buradan oxuyun.
              </Link>

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={handleReject}
                  className="text-sm text-gray-400 transition-colors hover:text-gray-600"
                >
                  İmtina edirəm
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                >
                  Seçim et
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="rounded-lg bg-[var(--dk-navy)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Qəbul edirəm
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-5 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">
                  Bütün çərəzləri aç və ya bağla
                </span>
                <Toggle checked={allOn} onChange={handleToggleAll} />
              </div>

              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Facebook Ads</p>
                    <p className="text-xs text-gray-400">
                      Reklam kampaniyalarının effektivliyini ölçür
                    </p>
                  </div>
                  <Toggle checked={facebook} onChange={setFacebook} />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Google Ads</p>
                    <p className="text-xs text-gray-400">
                      Axtarış reklamlarının effektivliyini ölçür
                    </p>
                  </div>
                  <Toggle checked={google} onChange={setGoogle} />
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Hotjar</p>
                    <p className="text-xs text-gray-400">İstifadəçi davranışını izləyir</p>
                  </div>
                  <Toggle checked={hotjar} onChange={setHotjar} />
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="text-sm text-gray-400 transition-colors hover:text-gray-600"
                >
                  Geri qayıt
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="rounded-lg bg-[var(--dk-navy)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Hamısını qəbul et
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                >
                  Seçimi saxla
                </button>
              </div>

              <p className="mt-3 text-center text-[10px] text-gray-300">
                Seçiminiz bu cihazda yadda saxlanılır.
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
