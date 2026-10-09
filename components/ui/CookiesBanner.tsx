'use client';

/**
 * Cookie notice — slim bottom bar (TASK-0514, owner-approved mockup 09.10.2026).
 * Consent logic and storage are unchanged: key `dk-cookie-consent`, value
 * { accepted, settings: { facebook, google, yandex_metrica }, date }.
 * Below lg the bar sits above MobileBottomNav (64px).
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import s from '@/components/inner/inner.module.css';

const STORAGE_KEY = 'dk-cookie-consent';

interface CookieSettings {
  facebook: boolean;
  google: boolean;
  yandex_metrica: boolean;
}

interface CookieConsent {
  accepted: boolean;
  settings: CookieSettings;
  date: string;
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (val: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={s.ckSwitch}
    />
  );
}

export default function CookiesBanner() {
  const t = useTranslations('innerV2.cookie');
  const locale = normalizeLocale(useLocale());
  const [visible, setVisible] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [facebook, setFacebook] = useState(false);
  const [google, setGoogle] = useState(false);
  const [yandex_metrica, setYandexMetrica] = useState(false);

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

  // TASK-0516: publish the bar's height as --dk-cookie-bar-h so floating buttons (WhatsApp, KAZAN)
  // can sit above it instead of covering it; 0 / unset when the bar is gone.
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = barRef.current;
    const root = document.documentElement;
    if (!visible || !el) {
      root.style.removeProperty('--dk-cookie-bar-h');
      return;
    }
    const publish = () => root.style.setProperty('--dk-cookie-bar-h', `${el.offsetHeight}px`);
    publish();
    if (typeof ResizeObserver === 'undefined') return () => root.style.removeProperty('--dk-cookie-bar-h');
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty('--dk-cookie-bar-h');
    };
  }, [visible]);

  const saveAndHide = (consent: CookieConsent) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {
      // localStorage unavailable
    }
    setVisible(false);
    setSettingsOpen(false);
  };

  const all = (on: boolean): CookieSettings => ({ facebook: on, google: on, yandex_metrica: on });

  const handleAccept = () =>
    saveAndHide({ accepted: true, settings: all(true), date: new Date().toISOString() });

  const handleReject = () =>
    saveAndHide({ accepted: false, settings: all(false), date: new Date().toISOString() });

  const handleSaveCustom = () =>
    saveAndHide({
      accepted: facebook || google || yandex_metrica,
      settings: { facebook, google, yandex_metrica },
      date: new Date().toISOString(),
    });

  const handleToggleAll = (val: boolean) => {
    setFacebook(val);
    setGoogle(val);
    setYandexMetrica(val);
  };

  if (!visible) return null;
  const allOn = facebook && google && yandex_metrica;

  return (
    <div ref={barRef} className={s.ck} role="region" aria-label={t('region')}>
      <div className={s.ckWrap}>
        {/* TASK-0519: phones get one short line (≤640px) so the bar stays ≤72px tall. */}
        <p>
          <span className={s.ckLong}>{t('text')}</span>
          <span className={s.ckShort}>{t('textShort')}</span>{' '}
          <Link href={withLocale(locale, '/privacy')} aria-label={t('privacy')}>
            <span className={s.ckLong}>{t('privacy')}</span>
            <span className={s.ckShort}>{t('privacyShort')}</span>
          </Link>
        </p>
        {settingsOpen ? (
          <div className={s.ckSettings}>
            <div className={s.ckRow}>
              <span>{t('all')}</span>
              <Switch checked={allOn} onChange={handleToggleAll} label={t('all')} />
            </div>
            <div className={s.ckRow}>
              <span>
                {t('facebook')}
                <small>{t('facebookDesc')}</small>
              </span>
              <Switch checked={facebook} onChange={setFacebook} label={t('facebook')} />
            </div>
            <div className={s.ckRow}>
              <span>
                {t('google')}
                <small>{t('googleDesc')}</small>
              </span>
              <Switch checked={google} onChange={setGoogle} label={t('google')} />
            </div>
            <div className={s.ckRow}>
              <span>
                {t('yandex')}
                <small>{t('yandexDesc')}</small>
              </span>
              <Switch checked={yandex_metrica} onChange={setYandexMetrica} label={t('yandex')} />
            </div>
            <div className={s.ckBtns}>
              <button type="button" onClick={() => setSettingsOpen(false)}>
                {t('back')}
              </button>
              <button type="button" onClick={handleSaveCustom}>
                {t('save')}
              </button>
              <button type="button" className={s.ckOk} onClick={handleAccept}>
                {t('acceptAll')}
              </button>
            </div>
          </div>
        ) : (
          <div className={s.ckBtns}>
            <button type="button" onClick={handleReject}>
              {t('reject')}
            </button>
            <button type="button" onClick={() => setSettingsOpen(true)}>
              {t('choose')}
            </button>
            <button type="button" className={s.ckOk} onClick={handleAccept}>
              {t('accept')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
