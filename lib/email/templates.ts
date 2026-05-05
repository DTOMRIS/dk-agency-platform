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
        <a href="https://dkagency.com.tr/dashboard/kazan-leads" style="display:inline-block;background:#E94560;color:#fff;padding:10px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
          Lead-ə bax
        </a>
      </p>
    `),
  }),
  welcome: (userName: string, baseUrl: string): EmailTemplate => ({
    subject: `DK Agency-yə xoş gəldin, ${userName}!`,
    html: `
<!DOCTYPE html>
<html lang="az">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">

  <!-- Header -->
  <tr><td style="background:#1A1A2E;padding:28px 32px;text-align:center;">
    <div style="font-family:'Playfair Display',Georgia,serif;color:#C5A022;font-size:28px;font-weight:800;letter-spacing:1px;">DK Agency</div>
    <div style="color:#ffffff80;font-size:12px;margin-top:4px;letter-spacing:2px;">USTALIĞIN NİŞANI, DİJİTALIN ŞEDDİ</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 32px;">

    <h1 style="font-family:'Playfair Display',Georgia,serif;color:#1F2937;font-size:24px;margin:0 0 20px;">Salam ${userName}, xoş gəldin!</h1>

    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 16px;">
      <strong>DK Agency</strong> Azərbaycanın ilk AI-dəstəkli HoReCa B2B platformasıdır. Biznes tərəfdaşlarına, investorlara və sektor peşəkarlarına rəqəmsal alətlər və konsaltinq xidmətləri təqdim edirik.
    </p>

    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 16px;">
      Sənin üçün nə var:
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr><td style="padding:8px 0;color:#1F2937;font-size:14px;line-height:1.6;">
        <span style="color:#E94560;font-weight:700;">KAZAN AI</span> — Süni intellekt köməkçin, suallarına anında cavab
      </td></tr>
      <tr><td style="padding:8px 0;color:#1F2937;font-size:14px;line-height:1.6;">
        <span style="color:#E94560;font-weight:700;">Toolkit</span> — 9 peşəkar alət: food cost, menyu, audit və daha çox
      </td></tr>
      <tr><td style="padding:8px 0;color:#1F2937;font-size:14px;line-height:1.6;">
        <span style="color:#E94560;font-weight:700;">Devir & Satış</span> — Restoran, kafe, otel alqı-satqı marketplace
      </td></tr>
      <tr><td style="padding:8px 0;color:#1F2937;font-size:14px;line-height:1.6;">
        <span style="color:#E94560;font-weight:700;">Sektor Nəbzi</span> — HoReCa xəbərləri, trendlər, analitika
      </td></tr>
      <tr><td style="padding:8px 0;color:#1F2937;font-size:14px;line-height:1.6;">
        <span style="color:#E94560;font-weight:700;">Bloq</span> — Ekspert məzmun, praktiki bələdçilər
      </td></tr>
    </table>

    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 28px;">
      DK Agency Əxilik ənənəsini — ustaçılıq, dürüstlük və keyfiyyət dəyərlərini — rəqəmsal dünyaya daşıyır. Hər alətimiz, hər xidmətimiz bu fəlsəfənin davamıdır.
    </p>

    <!-- CTA Button -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:0 0 28px;">
        <a href="${baseUrl}/dashboard" style="display:inline-block;background:#E94560;color:#ffffff;padding:14px 32px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:15px;">
          İdarə panelinə keç
        </a>
      </td></tr>
    </table>

    <!-- Quick Links -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E5E7EB;padding-top:20px;">
      <tr>
        <td align="center" style="padding:8px;">
          <a href="${baseUrl}/kazan" style="color:#E94560;font-size:13px;text-decoration:none;font-weight:600;">KAZAN AI</a>
        </td>
        <td align="center" style="padding:8px;">
          <a href="${baseUrl}/toolkit" style="color:#E94560;font-size:13px;text-decoration:none;font-weight:600;">Toolkit</a>
        </td>
        <td align="center" style="padding:8px;">
          <a href="${baseUrl}/devir" style="color:#E94560;font-size:13px;text-decoration:none;font-weight:600;">Devir & Satış</a>
        </td>
      </tr>
    </table>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #E5E7EB;">
    <p style="margin:0 0 8px;color:#64748b;font-size:13px;">
      <a href="mailto:info@dkagency.com.tr" style="color:#64748b;text-decoration:none;">info@dkagency.com.tr</a>
      &nbsp;&middot;&nbsp;
      <a href="https://wa.me/994507001636" style="color:#64748b;text-decoration:none;">WhatsApp</a>
    </p>
    <p style="margin:0;color:#94a3b8;font-size:11px;">
      &copy; 2026 DK Agency — Ustalığın Nişanı, Dijitalın Şeddi
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
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
        <a href="https://dkagency.com.tr/dashboard/ilanlar" style="display:inline-block;background:#E94560;color:#fff;padding:10px 24px;border-radius:999px;text-decoration:none;font-weight:700;font-size:14px;">
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
