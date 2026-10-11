import { WHATSAPP_NUMBER } from '@/lib/contact-channels';

type LeadForWhatsapp = {
  name?: string | null;
  businessType?: string | null;
};


export function buildWhatsappLink(lead: LeadForWhatsapp, lastMessages: string[]) {
  const question = lastMessages.find(Boolean) || 'KAZAN AI danisigi';
  const text = encodeURIComponent(
    `Salam, KAZAN AI vasitəsilə yazıram.\n\n` +
      `Ad: ${lead.name || 'Qeyd edilməyib'}\n` +
      `İşletmə: ${lead.businessType || 'Qeyd edilməyib'}\n\n` +
      `Sual: ${question}`,
  );
  // TASK-0540: one number for the whole site (lib/contact-channels), not an env override.
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}
