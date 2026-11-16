/**
 * @file MessageFormModal.tsx
 * @purpose TASK-0558: every WhatsApp contact on the public site opens this form first. The visitor's text goes
 *          to POST /api/leads/message → owner's Telegram + e-mail + KAZAN leads panel, so a message is never
 *          lost because the visitor did not press «Send» in WhatsApp. WhatsApp stays one click away (the counting
 *          redirect, unchanged). Mounted once in PublicChrome; catches clicks on `/api/leads/whatsapp` links and
 *          the `dk:message-form` event (`openContact` in lib/contact/message-form).
 * @pattern A (useTranslations) — messageForm
 * @task TASK-0558
 */

'use client';

import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { whatsappHref as contactHref } from '@/lib/contact-channels';
import { captureContext } from '@/lib/contact/capture';
import {
  isSiteWhatsappHref,
  MESSAGE_FORM_EVENT,
  MESSAGE_FORM_SKIP_ATTR,
  prefillFromWhatsappHref,
  type MessageFormRequest,
  type ContactContext,
  type SavedContact,
} from '@/lib/contact/message-form';

type Status = 'idle' | 'sending' | 'sent' | 'error';
type ErrorKey = 'errorFields' | 'errorRate' | 'errorGeneric';

const inputClass =
  'mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-slate-900 placeholder:text-slate-500 focus:border-[var(--dk-red)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-red)]/20';

export default function MessageFormModal() {
  const t = useTranslations('messageForm');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [whatsappHref, setWhatsappHref] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState<SavedContact['businessType']>('diger');
  const contextRef = useRef<ContactContext | undefined>(undefined);
  const sendingRef = useRef(false);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorKey, setErrorKey] = useState<ErrorKey | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const show = useCallback((href: string, context?: ContactContext) => {
    if (sendingRef.current) return;
    setWhatsappHref(href);
    contextRef.current = context;
    setMessage(context?.messages.filter(x => x.role === 'user').at(-1)?.content || prefillFromWhatsappHref(href));
    setStatus('idle');
    setErrorKey(null);
    setOpen(true);
  }, []);

  useEffect(() => {
    const onRequest = (event: Event) => {
      const detail = (event as CustomEvent<MessageFormRequest>).detail;
      if (!detail || !isSiteWhatsappHref(detail.whatsappHref)) return;
      event.preventDefault();
      show(detail.whatsappHref, detail.context);
    };
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!anchor || anchor.hasAttribute(MESSAGE_FORM_SKIP_ATTR)) return;
      const href = anchor.getAttribute('href');
      if (!isSiteWhatsappHref(href)) return;
      event.preventDefault();
      show(href);
    };
    window.addEventListener(MESSAGE_FORM_EVENT, onRequest);
    document.addEventListener('click', onClick, true);
    return () => {
      window.removeEventListener(MESSAGE_FORM_EVENT, onRequest);
      document.removeEventListener('click', onClick, true);
    };
  }, [show]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    nameRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !sendingRef.current) setOpen(false);
      if (event.key === 'Tab') {
        const nodes = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input:not(:disabled):not([tabindex="-1"]), textarea:not(:disabled), select:not(:disabled), summary') ?? [])].filter(n => n.getClientRects().length);
        const first = nodes[0], last = nodes.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); previous?.focus(); };
  }, [open]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sendingRef.current) return;
    sendingRef.current = true;
    setStatus('sending');
    setErrorKey(null);
    try {
      const res = await fetch('/api/leads/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, message, email, businessName, businessType, website, page: pathname,
          source: contextRef.current?.source ?? 'site_form', conversationContext: captureContext(contextRef.current?.messages) }),
      });
      const payload = await res.json() as { success?: boolean; contact?: SavedContact };
      if (res.ok && payload.success) {
        setStatus('sent');
        setWhatsappHref(contactHref(message));
        if (payload.contact) contextRef.current?.onSaved?.(payload.contact);
        setMessage('');
        return;
      }
      setErrorKey(
        res.status === 400 ? 'errorFields' : res.status === 429 ? 'errorRate' : 'errorGeneric'
      );
    } catch {
      setErrorKey('errorGeneric');
    } finally { sendingRef.current = false; }
    setStatus('error');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4"
      onClick={() => { if (!sendingRef.current) setOpen(false); }}
    >
      <div
        role="dialog"
        ref={dialogRef}
        aria-modal="true"
        aria-labelledby="dk-message-form-title"
        data-testid="message-form"
        className="relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:rounded-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => { if (!sendingRef.current) setOpen(false); }}
          disabled={status === 'sending'}
          aria-label={t('close')}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 hover:text-slate-900"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>

        {status === 'sent' ? (
          <div className="py-6 text-center" data-testid="message-form-sent">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 id="dk-message-form-title" className="mt-4 text-xl font-bold text-slate-900">
              {t('successTitle')}
            </h2>
            <p className="mt-2 text-[15px] text-slate-700">{t('successBody')}</p>
            <a href={whatsappHref} target="_blank" rel="noopener noreferrer" {...{ [MESSAGE_FORM_SKIP_ATTR]: '' }}
              className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-700 px-5 font-semibold text-emerald-800">{t('whatsappLink')}</a>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 rounded-xl bg-[var(--dk-ink)] px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <h2 id="dk-message-form-title" className="pr-10 text-xl font-bold text-slate-900">
              {t('title')}
            </h2>
            <p className="mt-1 text-sm text-slate-700">{t('subtitle')}</p>

            <fieldset disabled={status === 'sending'} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-slate-900">
                {t('name')}
                <input
                  ref={nameRef}
                  name="name"
                  autoComplete="name"
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-semibold text-slate-900">
                {t('phone')}
                <input
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  maxLength={30}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('phonePlaceholder')}
                  className={inputClass}
                />
              </label>
              <label className="block text-sm font-semibold text-slate-900">
                {t('message')}
                <textarea
                  name="message"
                  required
                  rows={4}
                  maxLength={2000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className={`${inputClass} resize-y`}
                />
              </label>
              <details className="rounded-xl border border-slate-200 p-3"><summary className="min-h-8 cursor-pointer text-sm font-semibold text-slate-800">{t('optionalDetails')}</summary><div className="mt-3 space-y-3">
              <label className="block text-sm font-semibold text-slate-900">
                {t('businessName')}
                <input name="businessName" autoComplete="organization" maxLength={100} value={businessName} onChange={e => setBusinessName(e.target.value)} className={inputClass} />
              </label>
              <label className="block text-sm font-semibold text-slate-900">
                {t('businessType')}
                <select name="businessType" value={businessType} onChange={e => setBusinessType(e.target.value as SavedContact['businessType'])} className={inputClass}>
                  {(['restoran', 'kafe', 'franchise', 'diger'] as const).map(v => <option key={v} value={v}>{t(`businessTypes.${v}`)}</option>)}
                </select>
              </label>
              <label className="block text-sm font-semibold text-slate-900">
                {t('email')}
                <input name="email" type="email" autoComplete="email" maxLength={255} value={email} onChange={e => setEmail(e.target.value)} className={inputClass} />
              </label>
              </div></details>
            </fieldset>
            {/* Honeypot — hidden from people, bots fill it. Outside space-y so it adds no gap. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />

            {errorKey ? (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                data-testid="message-form-error"
              >
                {t(errorKey)}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="mt-5 w-full rounded-xl bg-[var(--dk-red)] px-5 py-3 text-[15px] font-semibold text-white hover:bg-[var(--dk-red-hover)] disabled:opacity-60"
            >
              {status === 'sending' ? t('sending') : t('submit')}
            </button>
            <p className="mt-2 text-center text-xs text-slate-700">{t('privacy')}</p>

            <div className="mt-4 flex flex-col items-center justify-center gap-1 border-t border-slate-200 pt-4 text-center text-sm text-slate-700 sm:flex-row sm:gap-2">
              <span>{t('whatsappAlt')}</span>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                {...{ [MESSAGE_FORM_SKIP_ATTR]: '' }}
                data-testid="message-form-whatsapp"
                onClick={() => setOpen(false)}
                className="font-semibold text-emerald-700 underline-offset-2 hover:underline"
              >
                {t('whatsappLink')}
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
