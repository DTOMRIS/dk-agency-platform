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
          className="fixed bottom-6 left-6 z-[60] max-w-[420px] rounded-2xl bg-white border border-gray-100 p-6"
          style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.12)' }}
        >
          {!settingsOpen ? (
            /* ---- Main Banner ---- */
            <div>
              <Image
                src="/cookies.png"
                width={120}
                height={80}
                alt="Cookies"
                className="mx-auto mb-4"
              />
              <h3 className="text-lg font-bold text-slate-900 text-center mb-2">
                Kim dedi ki cookies saglam deyil?
              </h3>
              <p className="text-sm text-gray-500 text-center mb-2">
                Biz restoranlari sevdiyimiz qeder cookileri de sevirik. Bu saytda
                cookilerden istifade edirik.
              </p>
              <Link
                href="/privacy"
                className="block text-sm text-amber-600 hover:underline text-center mb-1"
              >
                Mexfilik siyasetimizi buradan oxuyun.
              </Link>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleReject}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Yox, sag ol
                </button>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="text-sm font-medium border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Secim et
                </button>
                <button
                  type="button"
                  onClick={handleAccept}
                  className="text-sm font-medium bg-[#1A1A2E] text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Qebul et
                </button>
              </div>
            </div>
          ) : (
            /* ---- Settings Panel ---- */
            <div>
              {/* Toggle all */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-medium text-slate-900">
                  Butun cookileri ac/bagla
                </span>
                <Toggle checked={allOn} onChange={handleToggleAll} />
              </div>

              <div className="space-y-4">
                {/* Facebook Ads */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Facebook Ads</p>
                    <p className="text-xs text-gray-400">
                      Reklam kampaniyalarinin effektivliyini olcur
                    </p>
                  </div>
                  <Toggle checked={facebook} onChange={setFacebook} />
                </div>

                {/* Google Ads */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Google Ads</p>
                    <p className="text-xs text-gray-400">
                      Axtaris reklamlarinin effektivliyini olcur
                    </p>
                  </div>
                  <Toggle checked={google} onChange={setGoogle} />
                </div>

                {/* Hotjar */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Hotjar</p>
                    <p className="text-xs text-gray-400">
                      Istifadeci davranisini izleyir
                    </p>
                  </div>
                  <Toggle checked={hotjar} onChange={setHotjar} />
                </div>
              </div>

              {/* Settings buttons */}
              <div className="flex gap-2 mt-5">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Geri
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="text-sm font-medium bg-[#1A1A2E] text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Hamisini qebul et
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="text-sm font-medium border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Secimi saxla
                </button>
              </div>

              <p className="text-[10px] text-gray-300 text-center mt-3">
                Consent certified by Axeptio
              </p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
