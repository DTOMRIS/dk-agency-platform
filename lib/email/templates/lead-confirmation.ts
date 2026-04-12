/**
 * @file lib/email/templates/lead-confirmation.ts
 * @purpose Müraciət edənə avtomatik təsdiq emaili
 */

interface LeadConfirmationEmailParams {
  leadName: string;
  listingTitle: string;
  trackingCode: string;
  whatsAppUrl?: string;
}

function wrapEmail(content: string): string {
  return `<!DOCTYPE html>
<html lang="az">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#1a1a2e;padding:24px 32px;border-radius:12px 12px 0 0;">
            <span style="color:#C9A227;font-size:22px;font-weight:800;letter-spacing:-0.5px;">DK Agency</span>
            <span style="color:#94a3b8;font-size:13px;display:block;margin-top:4px;">HoReCa Biznes Platforması</span>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:36px 32px;">
            ${content}
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-radius:0 0 12px 12px;border-top:1px solid #e2e8f0;">
            <p style="margin:0;color:#94a3b8;font-size:12px;text-align:center;">
              &copy; 2026 DK Agency &mdash; Ustalığın Nişanı, Dijitalın Şeddi
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildLeadConfirmationEmail(
  params: LeadConfirmationEmailParams,
): { subject: string; html: string } {
  const {
    leadName,
    listingTitle,
    trackingCode,
    whatsAppUrl = 'https://wa.me/994503660619',
  } = params;

  const subject = 'Müraciətiniz qəbul edildi — DK Agency';

  const html = wrapEmail(`
    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;font-weight:700;">Salam, ${leadName}!</h2>
    <p style="margin:0 0 24px;color:#64748b;font-size:15px;line-height:1.6;">
      Müraciətiniz uğurla qəbul edildi. Komandamız ən qısa zamanda sizinlə əlaqə saxlayacaq.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
      <tr style="background:#f8fafc;">
        <td colspan="2" style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
          <span style="color:#1a1a2e;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Müraciət Məlumatı</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;width:45%;">Elan</td>
        <td style="padding:12px 16px;color:#1a1a2e;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">${listingTitle}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#64748b;font-size:14px;">Tracking kodu</td>
        <td style="padding:12px 16px;color:#C9A227;font-size:14px;font-weight:700;font-family:monospace;">${trackingCode}</td>
      </tr>
    </table>

    <div style="background:#fefce8;border:1px solid #fef08a;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
      <p style="margin:0;color:#713f12;font-size:14px;line-height:1.5;">
        <strong>Vaxt çərçivəsi:</strong> Komandamız <strong>24 saat</strong> ərzində sizinlə əlaqə saxlayacaq.
        Daha sürətli cavab almaq üçün WhatsApp-dan əlaqə saxlaya bilərsiniz.
      </p>
    </div>

    <p style="text-align:center;margin:0;">
      <a href="${whatsAppUrl}"
         style="display:inline-block;background:#25D366;color:#ffffff;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px;">
        WhatsApp ilə Əlaqə
      </a>
    </p>
  `);

  return { subject, html };
}
