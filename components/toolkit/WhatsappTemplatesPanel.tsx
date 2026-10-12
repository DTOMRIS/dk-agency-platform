'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check, Lock } from 'lucide-react';
import { getFreeTemplates, getGatedTemplates } from '@/lib/data/whatsappTemplates';
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
      <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
        <span className="mb-3 inline-block rounded-full bg-[#FDECEF] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#BE2F47]">
          {t('meta.badge')}
        </span>
        <h1 className="mb-3 text-3xl font-black tracking-[-0.035em] text-[#0F172A]">{t('intro.heading')}</h1>
        <p className="mb-2 text-base text-[#5B6474]">{t('intro.subheading')}</p>
        <p className="text-sm text-[#334155]">{t('intro.instruction')}</p>
      </div>

      {/* Free templates */}
      <div className="space-y-3">
        {freeTemplates.map((tmpl) => (
          <div key={tmpl.id} className="rounded-[22px] border border-[#E4DCCD] bg-white p-5">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F172A]">{t(tmpl.titleKey.replace('whatsappTemplates.', ''))}</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-800">{t('freeTag')}</span>
            </div>
            <p className="mb-3 text-xs text-[#5B6474]">{t(tmpl.descriptionKey.replace('whatsappTemplates.', ''))}</p>
            <div className="whitespace-pre-wrap rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] p-4 text-sm text-[#334155]">
              {t(tmpl.copyKey.replace('whatsappTemplates.', ''))}
            </div>
            <button type="button" onClick={() => copyTemplate(tmpl.id, tmpl.copyKey)}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-4 py-2 text-xs font-bold text-[#0F172A] transition hover:border-[#0F172A]">
              {copiedId === tmpl.id ? <><Check className="h-3.5 w-3.5 text-emerald-600" />{t('actions.copiedConfirmation')}</> : <><Copy className="h-3.5 w-3.5" />{t('actions.copyButton')}</>}
            </button>
          </div>
        ))}
      </div>

      {/* Gated section */}
      {!unlocked ? (
        <div className="rounded-[22px] border-2 border-dashed border-[#F4B8C3] bg-[#FDECEF]/40 p-6">
          <div className="mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-[#BE2F47]" />
            <h3 className="text-lg font-black tracking-[-0.02em] text-[#0F172A]">{t('leadCta.heading')}</h3>
          </div>
          <p className="mb-4 text-sm text-[#5B6474]">{t('leadCta.body')}</p>
          <div className="space-y-2 mb-4">
            {gatedTemplates.map((tmpl) => (
              <div key={tmpl.id} className="flex items-center gap-2 text-sm text-[#5B6474]">
                <Lock className="h-3.5 w-3.5" />
                {t(tmpl.titleKey.replace('whatsappTemplates.', ''))}
              </div>
            ))}
          </div>
          <LeadForm toolSource="whatsapp_templates_kit" score={{ tool: 'whatsapp-templates' }} />
          <button type="button" onClick={() => setUnlocked(true)} className="mt-3 w-full rounded-full border border-[#E4DCCD] bg-white py-3 text-sm font-bold text-[#0F172A] transition hover:border-[#0F172A]">
            {t('leadCta.buttonText')}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {gatedTemplates.map((tmpl) => (
            <div key={tmpl.id} className="rounded-[22px] border border-[#E4DCCD] bg-white p-5">
              <h3 className="mb-2 text-sm font-bold text-[#0F172A]">{t(tmpl.titleKey.replace('whatsappTemplates.', ''))}</h3>
              <p className="mb-3 text-xs text-[#5B6474]">{t(tmpl.descriptionKey.replace('whatsappTemplates.', ''))}</p>
              <div className="whitespace-pre-wrap rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] p-4 text-sm text-[#334155]">
                {t(tmpl.copyKey.replace('whatsappTemplates.', ''))}
              </div>
              <button type="button" onClick={() => copyTemplate(tmpl.id, tmpl.copyKey)}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-4 py-2 text-xs font-bold text-[#0F172A] transition hover:border-[#0F172A]">
                {copiedId === tmpl.id ? <><Check className="h-3.5 w-3.5 text-emerald-600" />{t('actions.copiedConfirmation')}</> : <><Copy className="h-3.5 w-3.5" />{t('actions.copyButton')}</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
