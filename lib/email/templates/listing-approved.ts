/**
 * @file lib/email/templates/listing-approved.ts
 * @purpose Sahibkara elan təsdiqlənmə bildirişi (showcase_ready statusu)
 */

interface ListingApprovedEmailParams {
  ownerName: string;
  listingTitle: string;
  trackingCode: string;
  listingUrl: string;
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

export function buildListingApprovedEmail(
  params: ListingApprovedEmailParams,
): { subject: string; html: string } {
  const { ownerName, listingTitle, trackingCode, listingUrl } = params;

  const subject = `Elanınız təsdiqləndi — ${listingTitle}`;

  const html = wrapEmail(`
    <div style="text-align:center;margin-bottom:28px;">
      <div style="display:inline-block;background:#f0fdf4;border:1px solid #86efac;border-radius:50%;width:56px;height:56px;line-height:56px;font-size:28px;">
        &#10003;
      </div>
    </div>

    <h2 style="margin:0 0 8px;color:#1a1a2e;font-size:20px;font-weight:700;text-align:center;">Elanınız Vitrində!</h2>
    <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.6;text-align:center;">
      Salam, ${ownerName}! Elanınız komandamız tərəfindən nəzərdən keçirildi və vitrində yayımlandı.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:28px;">
      <tr style="background:#f8fafc;">
        <td colspan="2" style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
          <span style="color:#1a1a2e;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Elan Məlumatı</span>
        </td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;width:40%;">Elan adı</td>
        <td style="padding:12px 16px;color:#1a1a2e;font-size:14px;font-weight:600;border-bottom:1px solid #f1f5f9;">${listingTitle}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#64748b;font-size:14px;border-bottom:1px solid #f1f5f9;">Tracking kodu</td>
        <td style="padding:12px 16px;color:#C9A227;font-size:14px;font-weight:700;font-family:monospace;border-bottom:1px solid #f1f5f9;">${trackingCode}</td>
      </tr>
      <tr>
        <td style="padding:12px 16px;color:#64748b;font-size:14px;">Status</td>
        <td style="padding:12px 16px;">
          <span style="display:inline-block;background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:999px;font-size:12px;font-weight:700;">Vitrin</span>
        </td>
      </tr>
    </table>

    <p style="text-align:center;margin:0;">
      <a href="${listingUrl}"
         style="display:inline-block;background:#1a1a2e;color:#C9A227;padding:14px 32px;border-radius:999px;text-decoration:none;font-weight:700;font-size:15px;border:2px solid #C9A227;">
        Elanı Vitrinddə Gör
      </a>
    </p>
  `);

  return { subject, html };
}
