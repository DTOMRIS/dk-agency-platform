type EmailTemplate = {
  subject: string;
  html: string;
};

function wrapEmail(content: string) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc;">
      <div style="background: #1A1A2E; padding: 24px; text-align: center;">
        <div style="color: #C5A022; font-size: 24px; font-weight: 800;">DK Agency</div>
      </div>
      <div style="background: #ffffff; padding: 32px;">
        ${content}
      </div>
      <div style="padding: 16px 24px; color: #64748b; font-size: 12px; text-align: center;">
        © 2026 DK Agency — Ustalığın Nişanı, Dijitalın Şeddi
      </div>
    </div>
  `;
}

export const emailTemplates = {
  passwordReset: (resetUrl: string, userName: string): EmailTemplate => ({
    subject: 'DK Agency — Şifrə Sıfırlama',
    html: wrapEmail(`
      <p>Salam ${userName},</p>
      <p>Şifrənizi sıfırlamaq üçün aşağıdakı düyməyə klik edin.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#E94560;color:#fff;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:700;">
          Şifrəni sıfırla
        </a>
      </p>
      <p style="color:#64748b;font-size:14px;">Bu link 1 saat ərzində etibarlıdır.</p>
    `),
  }),
  emailVerification: (verifyUrl: string, userName: string): EmailTemplate => ({
    subject: 'DK Agency — Email Təsdiqi',
    html: wrapEmail(`
      <p>Salam ${userName},</p>
      <p>Hesabınızı aktivləşdirmək üçün email ünvanınızı təsdiqləyin.</p>
      <p style="margin: 24px 0;">
        <a href="${verifyUrl}" style="display:inline-block;background:#E94560;color:#fff;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:700;">
          Email-i təsdiqlə
        </a>
      </p>
    `),
  }),
  listingSubmitted: (trackingCode: string, userName: string): EmailTemplate => ({
    subject: `DK Agency — Elanınız qəbul olundu (${trackingCode})`,
    html: wrapEmail(`
      <p>Salam ${userName},</p>
      <p>Elanınız qəbul olundu. Tracking kodunuz: <strong>${trackingCode}</strong>.</p>
      <p>Komitəmiz 24 saat ərzində incələyəcək.</p>
    `),
  }),
  listingApproved: (trackingCode: string, title: string, userName: string): EmailTemplate => ({
    subject: `DK Agency — Elanınız vitrinə çıxdı (${trackingCode})`,
    html: wrapEmail(`
      <p>Salam ${userName},</p>
      <p><strong>${title}</strong> adlı elanınız vitrində yayımlandı.</p>
      <p>Tracking kodu: <strong>${trackingCode}</strong>.</p>
    `),
  }),
  listingRejected: (trackingCode: string, reason: string, userName: string): EmailTemplate => ({
    subject: `DK Agency — Elan statusu (${trackingCode})`,
    html: wrapEmail(`
      <p>Salam ${userName},</p>
      <p>Elanınız hazırda vitrinə çıxarılmadı.</p>
      <p>Səbəb: <strong>${reason}</strong></p>
      <p>Tracking kodu: <strong>${trackingCode}</strong>.</p>
    `),
  }),
  newLead: (trackingCode: string, leadName: string, ownerName: string): EmailTemplate => ({
    subject: `DK Agency — Yeni maraq bildirişi (${trackingCode})`,
    html: wrapEmail(`
      <p>Salam ${ownerName},</p>
      <p><strong>${leadName}</strong> sizin elanınızla maraqlandı.</p>
      <p>Tracking kodu: <strong>${trackingCode}</strong>.</p>
    `),
  }),
  kazanLeadAdmin: (leadName: string, phone: string, businessType: string, intent: string): EmailTemplate => ({
    subject: `KAZAN AI — Yeni lead: ${leadName}`,
    html: wrapEmail(`
      <h2 style="color:#1A1A2E;font-size:20px;margin:0 0 16px;">KAZAN AI Lead</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#64748b;">Ad</td><td style="padding:8px 0;font-weight:600;">${leadName}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Telefon</td><td style="padding:8px 0;font-weight:600;">${phone}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Biznes tipi</td><td style="padding:8px 0;font-weight:600;">${businessType}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Maraq</td><td style="padding:8px 0;font-weight:600;">${intent}</td></tr>
      </table>
      <p style="margin-top:20px;">
        <a href="https://dkagency.az/dashboard/kazan-leads" style="display:inline-block;background:#E94560;color:#fff;padding:10px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
          Lead-ə bax
        </a>
      </p>
    `),
  }),
  listingLeadAdmin: (trackingCode: string, listingTitle: string, leadName: string, phone: string, message: string): EmailTemplate => ({
    subject: `Elan Lead — ${listingTitle} (${trackingCode})`,
    html: wrapEmail(`
      <h2 style="color:#1A1A2E;font-size:20px;margin:0 0 16px;">Yeni Elan Marağı</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#64748b;">Elan</td><td style="padding:8px 0;font-weight:600;">${listingTitle} (${trackingCode})</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Maraq bildirən</td><td style="padding:8px 0;font-weight:600;">${leadName}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Telefon</td><td style="padding:8px 0;font-weight:600;">${phone}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Mesaj</td><td style="padding:8px 0;">${message || 'Mesaj yoxdur'}</td></tr>
      </table>
      <p style="margin-top:20px;">
        <a href="https://dkagency.az/dashboard/ilanlar" style="display:inline-block;background:#E94560;color:#fff;padding:10px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
          Dashboard-a keç
        </a>
      </p>
    `),
  }),
};

export async function sendEmail(to: string, template: EmailTemplate) {
  const { sendSmtpEmail } = await import('./smtp');
  return sendSmtpEmail(to, template.subject, template.html);
}
