export type EmailLocale = 'az' | 'tr' | 'en';

export type EmailTemplateKey =
  | 'member_welcome'
  | 'member_verification'
  | 'listing_published'
  | 'consulting_follow_up';

export interface EmailTemplatePayload {
  subject: string;
  preview: string;
  text: string;
  html: string;
}

type TemplateCopy = {
  subject: Record<EmailLocale, string>;
  preview: Record<EmailLocale, string>;
  body: Record<EmailLocale, string[]>;
  ctaLabel?: Record<EmailLocale, string>;
  ctaUrl?: string;
};

const EMAIL_TEMPLATE_LIBRARY: Record<EmailTemplateKey, TemplateCopy> = {
  member_welcome: {
    subject: {
      az: 'DK Agency-yə xoş gəlmisiniz',
      tr: 'DK Agency’ye hoş geldiniz',
      en: 'Welcome to DK Agency',
    },
    preview: {
      az: 'Hesabınız aktivdir, indi alətlərə və panelə keçə bilərsiniz.',
      tr: 'Hesabınız aktif, artık araçlara ve panele geçebilirsiniz.',
      en: 'Your account is active and ready for the toolkit.',
    },
    body: {
      az: [
        'Salam {{name}},',
        'Qeydiyyatınız tamamlandı. İndi DK Agency alətlərindən, bələdçilərdən və elan axınından istifadə edə bilərsiniz.',
        'Əgər restoranınız üçün sürətli analiz lazımdırsa, Food Cost, PnL və KAZAN AI ilə başlaya bilərsiniz.',
      ],
      tr: [
        'Merhaba {{name}},',
        'Kaydınız tamamlandı. Artık DK Agency araçlarını, rehberlerini ve ilan akışını kullanabilirsiniz.',
        'Restoranınız için hızlı analiz gerekiyorsa Food Cost, PnL ve KAZAN AI ile başlayabilirsiniz.',
      ],
      en: [
        'Hello {{name}},',
        'Your registration is complete. You can now use DK Agency tools, guides, and listings.',
        'For a quick restaurant analysis, start with Food Cost, PnL, and KAZAN AI.',
      ],
    },
    ctaLabel: {
      az: 'Panelə keç',
      tr: 'Panele geç',
      en: 'Open dashboard',
    },
    ctaUrl: '/settings',
  },
  member_verification: {
    subject: {
      az: 'Email ünvanınızı təsdiqləyin',
      tr: 'E-posta adresinizi doğrulayın',
      en: 'Verify your email address',
    },
    preview: {
      az: 'Aktivləşdirmə linki ilə hesabınızı tamamlayın.',
      tr: 'Aktivasyon bağlantısıyla hesabınızı tamamlayın.',
      en: 'Complete your account with the activation link.',
    },
    body: {
      az: [
        'Salam {{name}},',
        'Hesabınızı tam açmaq üçün email ünvanınızı təsdiqləməlisiniz.',
        'Linkə daxil olduqdan sonra üzv paneli və elan idarəsini aktivləşdirəcəyik.',
      ],
      tr: [
        'Merhaba {{name}},',
        'Hesabınızı tam açmak için e-posta adresinizi doğrulamanız gerekiyor.',
        'Bağlantıyı açtıktan sonra üye paneli ve ilan yönetimi aktifleşecek.',
      ],
      en: [
        'Hello {{name}},',
        'To fully unlock your account, please verify your email address.',
        'Once you open the link, the member dashboard and listing tools will activate.',
      ],
    },
    ctaLabel: {
      az: 'Təsdiqi tamamla',
      tr: 'Doğrulamayı tamamla',
      en: 'Complete verification',
    },
    ctaUrl: '{{verifyUrl}}',
  },
  listing_published: {
    subject: {
      az: 'Elanınız yayımlandı',
      tr: 'İlanınız yayında',
      en: 'Your listing is live',
    },
    preview: {
      az: 'İndi elanınıza baxa və sorğuları izləyə bilərsiniz.',
      tr: 'Artık ilanınızı görüntüleyebilir ve talepleri takip edebilirsiniz.',
      en: 'You can now review the listing and track inquiries.',
    },
    body: {
      az: [
        'Salam {{name}},',
        'Elanınız uğurla yayımlandı.',
        'İndi baxış sayını, sorğuları və status yeniliklərini izləyə bilərsiniz.',
      ],
      tr: [
        'Merhaba {{name}},',
        'İlanınız başarıyla yayına alındı.',
        'Artık görüntülenmeleri, talepleri ve durum güncellemelerini takip edebilirsiniz.',
      ],
      en: [
        'Hello {{name}},',
        'Your listing has been published successfully.',
        'You can now track views, inquiries, and status updates.',
      ],
    },
    ctaLabel: {
      az: 'Elanlarıma bax',
      tr: 'İlanlarımı gör',
      en: 'View my listings',
    },
    ctaUrl: '/b2b-panel/ilanlarim',
  },
  consulting_follow_up: {
    subject: {
      az: 'Restoranınız üçün növbəti addım hazırdır',
      tr: 'Restoranınız için sonraki adım hazır',
      en: 'Your next restaurant growth step is ready',
    },
    preview: {
      az: 'Kalkulyator nəticələrinə əsasən consultinq təklifini göndəririk.',
      tr: 'Kalkülatör sonucuna göre danışmanlık teklifini iletiyoruz.',
      en: 'We are sending the consulting offer based on your calculator results.',
    },
    body: {
      az: [
        'Salam {{name}},',
        'Qısa analizə görə texniki tərəf yox, satış və marja tərəfi də optimallaşdırılmalıdır.',
        'KAZAN AI, Food Cost və PnL nəticələrinə baxaraq sizin üçün danışmanlıq planı hazırlaya bilərik.',
      ],
      tr: [
        'Merhaba {{name}},',
        'Kısa analize göre sadece operasyon değil, satış ve marj tarafı da optimize edilmeli.',
        'KAZAN AI, Food Cost ve PnL sonuçlarına bakarak sizin için danışmanlık planı hazırlayabiliriz.',
      ],
      en: [
        'Hello {{name}},',
        'The analysis shows both operations and margin need optimization.',
        'We can build a consulting plan based on KAZAN AI, Food Cost, and PnL results.',
      ],
    },
    ctaLabel: {
      az: 'Məsləhət al',
      tr: 'Danışmanlık al',
      en: 'Book consulting',
    },
    ctaUrl: '/kazan-ai',
  },
};

function interpolate(value: string, vars: Record<string, string>) {
  return value.replace(/{{\s*([\w-]+)\s*}}/g, (_, key: string) => vars[key] ?? '');
}

function wrapHtml(subject: string, preview: string, lines: string[], ctaLabel?: string, ctaUrl?: string) {
  const bodyHtml = lines
    .map((line) => `<p style="margin:0 0 14px;line-height:1.65;color:#0f172a;">${line}</p>`)
    .join('');
  const ctaHtml = ctaLabel && ctaUrl
    ? `<p style="margin:24px 0 0;"><a href="${ctaUrl}" style="display:inline-block;background:#991b1b;color:#fff;text-decoration:none;padding:12px 18px;border-radius:9999px;font-weight:700;">${ctaLabel}</a></p>`
    : '';

  return `<!doctype html>
<html lang="az">
  <body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:640px;margin:0 auto;padding:32px 20px;">
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;padding:32px;">
        <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#9ca3af;font-weight:700;margin-bottom:10px;">DK Agency</div>
        <h1 style="margin:0 0 10px;font-size:28px;line-height:1.2;color:#0f172a;">${subject}</h1>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.65;color:#475569;">${preview}</p>
        ${bodyHtml}
        ${ctaHtml}
      </div>
    </div>
  </body>
</html>`;
}

export function buildEmailTemplate(
  key: EmailTemplateKey,
  locale: EmailLocale = 'az',
  vars: Record<string, string> = {},
): EmailTemplatePayload {
  const template = EMAIL_TEMPLATE_LIBRARY[key];
  const subject = interpolate(template.subject[locale] ?? template.subject.az, vars);
  const preview = interpolate(template.preview[locale] ?? template.preview.az, vars);
  const bodyLines = (template.body[locale] ?? template.body.az).map((line) => interpolate(line, vars));
  const ctaLabel = template.ctaLabel ? interpolate(template.ctaLabel[locale] ?? template.ctaLabel.az, vars) : undefined;
  const ctaUrl = template.ctaUrl ? interpolate(template.ctaUrl, vars) : undefined;

  const text = [
    preview,
    '',
    ...bodyLines,
    ctaLabel && ctaUrl ? `${ctaLabel}: ${ctaUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    subject,
    preview,
    text,
    html: wrapHtml(subject, preview, bodyLines, ctaLabel, ctaUrl),
  };
}

export const EMAIL_TEMPLATE_SEEDS = Object.entries(EMAIL_TEMPLATE_LIBRARY).map(([templateKey, template]) => ({
  templateKey,
  audience: 'member' as const,
  subjectAz: template.subject.az,
  subjectTr: template.subject.tr,
  subjectEn: template.subject.en,
  previewAz: template.preview.az,
  previewTr: template.preview.tr,
  previewEn: template.preview.en,
  bodyAz: template.body.az.join('\n'),
  bodyTr: template.body.tr.join('\n'),
  bodyEn: template.body.en.join('\n'),
  status: 'active' as const,
}));
