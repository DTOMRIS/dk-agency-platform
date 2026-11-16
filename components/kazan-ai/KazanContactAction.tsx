'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { openContact, type ContactContext, type SavedContact } from '@/lib/contact/message-form';
import { whatsappHref } from '@/lib/contact-channels';

export default function KazanContactAction({ messages, source, onSaved, contactSaved = false }: {
  messages: ContactContext['messages']; source: ContactContext['source']; onSaved?: (contact: SavedContact) => void; contactSaved?: boolean;
}) {
  const t = useTranslations('contactCapture');
  const [saved, setSaved] = useState(false);
  const request = () => openContact(whatsappHref(messages.filter(m => m.role === 'user').at(-1)?.content || t('requestText')), {
    source, messages,
    onSaved: contact => { setSaved(true); onSaved?.(contact); },
  });
  return <div className="rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] p-3" data-testid="kazan-contact-action">
    <p className="text-sm font-semibold text-slate-900">{saved || contactSaved ? t('saved') : t('title')}</p>
    {!saved && !contactSaved && <><p className="mt-1 text-xs leading-5 text-slate-700">{t('description')}</p>
      <button type="button" onClick={request} className="mt-2 inline-flex min-h-11 items-center justify-center rounded-lg bg-dk-red-strong px-4 text-sm font-bold text-white hover:bg-dk-red-deep" data-testid="kazan-contact-request">{t('request')}</button></>}
  </div>;
}
