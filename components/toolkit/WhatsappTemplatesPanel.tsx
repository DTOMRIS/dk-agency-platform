'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check, Lock } from 'lucide-react';
import { WHATSAPP_TEMPLATES, getFreeTemplates, getGatedTemplates } from '@/lib/data/whatsappTemplates';
import LeadForm from '@/components/franchise/LeadForm';

export default function WhatsappTemplatesPanel() {
  const t = useTranslations('whatsappTemplates');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [unlocked, setUnlocked] = useState(false);

  const freeTemplates = getFreeTemplates();
  const gatedTemplates = getGatedTemplates();

  async function copyTemplate(id: string, copyKey: string) {
    try {
      const text = t(copyKey.replace('whatsappTemplates.', ''));
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* clipboard not available */ }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <span className="mb-3 inline-block rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700">
          {t('meta.badge')}
        </span>
        <h1 className="mb-3 font-display text-3xl font-extrabold text-slate-900">{t('intro.heading')}</h1>
        <p className="mb-2 text-base text-slate-500">{t('intro.subheading')}</p>
        <p className="text-sm text-slate-400">{t('intro.instruction')}</p>
      </div>

      {/* Free templates */}
      <div className="space-y-3">
        {freeTemplates.map((tmpl) => (
          <div key={tmpl.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t(tmpl.titleKey.replace('whatsappTemplates.', ''))}</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-600">PULSUZ</span>
            </div>
            <p className="mb-3 text-xs text-slate-500">{t(tmpl.descriptionKey.replace('whatsappTemplates.', ''))}</p>
            <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
              {t(tmpl.copyKey.replace('whatsappTemplates.', ''))}
            </div>
            <button onClick={() => copyTemplate(tmpl.id, tmpl.copyKey)}
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200">
              {copiedId === tmpl.id ? <><Check className="h-3.5 w-3.5 text-emerald-600" />{t('actions.copiedConfirmation')}</> : <><Copy className="h-3.5 w-3.5" />{t('actions.copyButton')}</>}
            </button>
          </div>
        ))}
      </div>

      {/* Gated section */}
      {!unlocked ? (
        <div className="rounded-2xl border-2 border-dashed border-[var(--dk-gold)]/40 bg-[var(--dk-gold)]/5 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-[var(--dk-gold)]" />
            <h3 className="font-display text-lg font-bold text-slate-900">{t('leadCta.heading')}</h3>
          </div>
          <p className="mb-4 text-sm text-slate-600">{t('leadCta.body')}</p>
          <div className="space-y-2 mb-4">
            {gatedTemplates.map((tmpl) => (
              <div key={tmpl.id} className="flex items-center gap-2 text-sm text-slate-400">
                <Lock className="h-3.5 w-3.5" />
                {t(tmpl.titleKey.replace('whatsappTemplates.', ''))}
              </div>
            ))}
          </div>
          <LeadForm toolSource="whatsapp_templates_kit" score={{ tool: 'whatsapp-templates' }} />
          <button onClick={() => setUnlocked(true)} className="mt-3 w-full rounded-xl bg-[var(--dk-gold)] py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:bg-amber-400">
            {t('leadCta.buttonText')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {gatedTemplates.map((tmpl) => (
            <div key={tmpl.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-2 text-sm font-bold text-slate-900">{t(tmpl.titleKey.replace('whatsappTemplates.', ''))}</h3>
              <p className="mb-3 text-xs text-slate-500">{t(tmpl.descriptionKey.replace('whatsappTemplates.', ''))}</p>
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                {t(tmpl.copyKey.replace('whatsappTemplates.', ''))}
              </div>
              <button onClick={() => copyTemplate(tmpl.id, tmpl.copyKey)}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                {copiedId === tmpl.id ? <><Check className="h-3.5 w-3.5 text-emerald-600" />{t('actions.copiedConfirmation')}</> : <><Copy className="h-3.5 w-3.5" />{t('actions.copyButton')}</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
