type LeadForWhatsapp = {
  name?: string | null;
  businessType?: string | null;
};

function normalizeWhatsappNumber(value?: string | null) {
  return (value || '994502566279').replace(/[^\d]/g, '');
}

export function buildWhatsappLink(lead: LeadForWhatsapp, lastMessages: string[]) {
  const question = lastMessages.find(Boolean) || 'KAZAN AI danisigi';
  const text = encodeURIComponent(
    `Salam, KAZAN AI vasitəsilə yazıram.\n\n` +
      `Ad: ${lead.name || 'Qeyd edilməyib'}\n` +
      `İşletmə: ${lead.businessType || 'Qeyd edilməyib'}\n\n` +
      `Sual: ${question}`,
  );
  const number = normalizeWhatsappNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  return `https://wa.me/${number}?text=${text}`;
}
