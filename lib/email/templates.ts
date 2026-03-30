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
};

export async function sendEmail(to: string, template: EmailTemplate) {
  console.log('=== EMAİL GÖNDƏRİLƏCƏKDİ ===');
  console.log('To:', to);
  console.log('Subject:', template.subject);
  console.log('Resend/SendGrid bağlananda real göndəriləcək');
  console.log(template.html);
  // TODO: Resend və ya SendGrid provider-i bağlanacaq.
}
