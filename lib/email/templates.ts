import { type Locale, defaultLocale } from '@/i18n/config';

type EmailTemplate = {
  subject: string;
  html: string;
};

function resolveLocale(locale?: Locale | string): Locale {
  if (locale === 'az' || locale === 'ru' || locale === 'en' || locale === 'tr') return locale;
  return defaultLocale;
}

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
        &copy; 2026 DK Agency
      </div>
    </div>
  `;
}

const ctaStyle = 'display:inline-block;background:#E94560;color:#fff;padding:12px 28px;border-radius:999px;text-decoration:none;font-weight:700;';

export const emailTemplates = {
  emailVerification: (verifyUrl: string, userName: string, locale?: Locale | string): EmailTemplate => {
    const loc = resolveLocale(locale);
    const t: Record<Locale, { subject: string; greeting: string; body: string; cta: string }> = {
      az: {
        subject: 'DK Agency — Email T\u0259sdiqi',
        greeting: `Salam ${userName},`,
        body: 'Hesab\u0131n\u0131z\u0131 aktivl\u0259\u015Fdirm\u0259k \u00FC\u00E7\u00FCn email \u00FCnvan\u0131n\u0131z\u0131 t\u0259sdiql\u0259yin.',
        cta: 'Email-i t\u0259sdiql\u0259',
      },
      ru: {
        subject: 'DK Agency \u2014 \u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 email',
        greeting: `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, ${userName}!`,
        body: '\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u0435 \u0432\u0430\u0448 email \u0434\u043B\u044F \u0430\u043A\u0442\u0438\u0432\u0430\u0446\u0438\u0438 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430.',
        cta: '\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u0442\u044C email',
      },
      en: {
        subject: 'DK Agency \u2014 Email Verification',
        greeting: `Hello ${userName},`,
        body: 'Please verify your email address to activate your account.',
        cta: 'Verify email',
      },
      tr: {
        subject: 'DK Agency \u2014 Email Do\u011Frulama',
        greeting: `Merhaba ${userName},`,
        body: 'Hesab\u0131n\u0131z\u0131 aktifle\u015Ftirmek i\u00E7in email adresinizi do\u011Frulay\u0131n.',
        cta: 'Email-i do\u011Frula',
      },
    };
    const c = t[loc];
    return {
      subject: c.subject,
      html: wrapEmail(`
        <p>${c.greeting}</p>
        <p>${c.body}</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="${ctaStyle}">${c.cta}</a>
        </p>
      `),
    };
  },

  welcome: (userName: string, baseUrl: string, locale?: Locale | string): EmailTemplate => {
    const loc = resolveLocale(locale);
    const t: Record<Locale, {
      subject: string;
      title: string;
      intro: string;
      listLabel: string;
      philosophy: string;
      cta: string;
    }> = {
      az: {
        subject: `DK Agency-y\u0259 xo\u015F g\u0259ldin, ${userName}!`,
        title: `Salam ${userName}, xo\u015F g\u0259ldin!`,
        intro: '<strong>DK Agency</strong> Az\u0259rbaycan\u0131n ilk AI-d\u0259st\u0259kli HoReCa B2B platformas\u0131d\u0131r. Biznes t\u0259r\u0259fda\u015Flar\u0131na, investorlara v\u0259 sektor pe\u015F\u0259karlar\u0131na r\u0259q\u0259msal al\u0259tl\u0259r v\u0259 konsaltinq xidm\u0259tl\u0259ri t\u0259qdim edirik.',
        listLabel: 'S\u0259nin \u00FC\u00E7\u00FCn n\u0259 var:',
        philosophy: 'DK Agency \u018Fxilik \u0259n\u0259n\u0259sini \u2014 usta\u00E7\u0131l\u0131q, d\u00FCr\u00FCstl\u00FCk v\u0259 keyfiyy\u0259t d\u0259y\u0259rl\u0259rini \u2014 r\u0259q\u0259msal d\u00FCnyaya da\u015F\u0131y\u0131r.',
        cta: '\u0130dar\u0259 panelin\u0259 ke\u00E7',
      },
      ru: {
        subject: `\u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 DK Agency, ${userName}!`,
        title: `\u041F\u0440\u0438\u0432\u0435\u0442, ${userName}!`,
        intro: '<strong>DK Agency</strong> \u2014 \u043F\u0435\u0440\u0432\u0430\u044F B2B-\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0434\u043B\u044F HoReCa \u0441 \u043F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u043E\u0439 \u0418\u0418. \u041C\u044B \u043F\u0440\u0435\u0434\u043E\u0441\u0442\u0430\u0432\u043B\u044F\u0435\u043C \u0446\u0438\u0444\u0440\u043E\u0432\u044B\u0435 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u044B \u0438 \u043A\u043E\u043D\u0441\u0430\u043B\u0442\u0438\u043D\u0433.',
        listLabel: '\u0427\u0442\u043E \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E:',
        philosophy: 'DK Agency \u043F\u0435\u0440\u0435\u043D\u043E\u0441\u0438\u0442 \u0442\u0440\u0430\u0434\u0438\u0446\u0438\u0438 \u043C\u0430\u0441\u0442\u0435\u0440\u0441\u0442\u0432\u0430 \u0438 \u043A\u0430\u0447\u0435\u0441\u0442\u0432\u0430 \u0432 \u0446\u0438\u0444\u0440\u043E\u0432\u043E\u0439 \u043C\u0438\u0440.',
        cta: '\u041F\u0435\u0440\u0435\u0439\u0442\u0438 \u0432 \u043F\u0430\u043D\u0435\u043B\u044C',
      },
      en: {
        subject: `Welcome to DK Agency, ${userName}!`,
        title: `Hello ${userName}, welcome!`,
        intro: '<strong>DK Agency</strong> is the first AI-powered B2B platform for HoReCa. We provide digital tools and consulting services for business partners and industry professionals.',
        listLabel: 'What\'s available:',
        philosophy: 'DK Agency brings the traditions of craftsmanship, integrity, and quality into the digital world.',
        cta: 'Go to dashboard',
      },
      tr: {
        subject: `DK Agency'ye ho\u015F geldin, ${userName}!`,
        title: `Merhaba ${userName}, ho\u015F geldin!`,
        intro: '<strong>DK Agency</strong> HoReCa sekt\u00F6r\u00FCn\u00FCn ilk yapay zek\u00E2 destekli B2B platformudur. \u0130\u015F ortaklar\u0131na, yat\u0131r\u0131mc\u0131lara ve sekt\u00F6r profesyonellerine dijital ara\u00E7lar ve dan\u0131\u015Fmanl\u0131k hizmetleri sunar.',
        listLabel: 'Senin i\u00E7in ne var:',
        philosophy: 'DK Agency Ahilik gelene\u011Fini \u2014 ustal\u0131k, d\u00FCr\u00FCstl\u00FCk ve kalite de\u011Ferlerini \u2014 dijital d\u00FCnyaya ta\u015F\u0131r.',
        cta: 'Y\u00F6netim paneline ge\u00E7',
      },
    };
    const features: Record<Locale, Array<{ name: string; desc: string }>> = {
      az: [
        { name: 'KAZAN AI', desc: 'S\u00FCni intellekt k\u00F6m\u0259k\u00E7in, suallr\u0131na aninda cavab' },
        { name: 'Toolkit', desc: '9 pe\u015F\u0259kar al\u0259t: food cost, meny\u00FC, audit v\u0259 daha \u00E7ox' },
        { name: 'Devir & Sat\u0131\u015F', desc: 'Restoran, kafe, otel alq\u0131-satq\u0131 marketplace' },
        { name: 'Sektor N\u0259bzi', desc: 'HoReCa x\u0259b\u0259rl\u0259ri, trendl\u0259r, analitika' },
        { name: 'Bloq', desc: 'Ekspert m\u0259zmun, praktiki b\u0259l\u0259d\u00E7il\u0259r' },
      ],
      ru: [
        { name: 'KAZAN AI', desc: 'AI-\u043F\u043E\u043C\u043E\u0449\u043D\u0438\u043A, \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u044B\u0435 \u043E\u0442\u0432\u0435\u0442\u044B \u043D\u0430 \u0432\u0430\u0448\u0438 \u0432\u043E\u043F\u0440\u043E\u0441\u044B' },
        { name: 'Toolkit', desc: '9 \u043F\u0440\u043E\u0444\u0435\u0441\u0441\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u0432: food cost, \u043C\u0435\u043D\u044E, \u0430\u0443\u0434\u0438\u0442' },
        { name: '\u041F\u0440\u043E\u0434\u0430\u0436\u0430 \u0431\u0438\u0437\u043D\u0435\u0441\u0430', desc: '\u041C\u0430\u0440\u043A\u0435\u0442\u043F\u043B\u0435\u0439\u0441 \u043A\u0443\u043F\u043B\u0438-\u043F\u0440\u043E\u0434\u0430\u0436\u0438 \u0440\u0435\u0441\u0442\u043E\u0440\u0430\u043D\u043E\u0432, \u043A\u0430\u0444\u0435, \u043E\u0442\u0435\u043B\u0435\u0439' },
        { name: '\u041F\u0443\u043B\u044C\u0441 \u0441\u0435\u043A\u0442\u043E\u0440\u0430', desc: 'HoReCa \u043D\u043E\u0432\u043E\u0441\u0442\u0438, \u0442\u0440\u0435\u043D\u0434\u044B, \u0430\u043D\u0430\u043B\u0438\u0442\u0438\u043A\u0430' },
        { name: '\u0411\u043B\u043E\u0433', desc: '\u042D\u043A\u0441\u043F\u0435\u0440\u0442\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u043D\u0442, \u043F\u0440\u0430\u043A\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0433\u0430\u0439\u0434\u044B' },
      ],
      en: [
        { name: 'KAZAN AI', desc: 'AI assistant, instant answers to your questions' },
        { name: 'Toolkit', desc: '9 professional tools: food cost, menu, audit and more' },
        { name: 'Listings', desc: 'Restaurant, cafe, hotel buy & sell marketplace' },
        { name: 'Sector Pulse', desc: 'HoReCa news, trends, analytics' },
        { name: 'Blog', desc: 'Expert content, practical guides' },
      ],
      tr: [
        { name: 'KAZAN AI', desc: 'Yapay zek\u00E2 yard\u0131mc\u0131n, sorular\u0131na anl\u0131k cevap' },
        { name: 'Toolkit', desc: '9 profesyonel ara\u00E7: food cost, men\u00FC, denetim ve daha fazlas\u0131' },
        { name: 'Devir & Sat\u0131\u015F', desc: 'Restoran, kafe, otel al\u0131m-sat\u0131m pazar yeri' },
        { name: 'Sekt\u00F6r Nabz\u0131', desc: 'HoReCa haberleri, trendler, analitik' },
        { name: 'Blog', desc: 'Uzman i\u00E7erik, pratik rehberler' },
      ],
    };
    const c = t[loc];
    const featureRows = features[loc]
      .map(
        (f) =>
          `<tr><td style="padding:8px 0;color:#1F2937;font-size:14px;line-height:1.6;"><span style="color:#E94560;font-weight:700;">${f.name}</span> \u2014 ${f.desc}</td></tr>`,
      )
      .join('');

    return {
      subject: c.subject,
      html: `
<!DOCTYPE html>
<html lang="${loc}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;box-shadow:0 2px 12px rgba(0,0,0,0.08);overflow:hidden;">

  <!-- Header -->
  <tr><td style="background:#1A1A2E;padding:28px 32px;text-align:center;">
    <div style="font-family:'Playfair Display',Georgia,serif;color:#C5A022;font-size:28px;font-weight:800;letter-spacing:1px;">DK Agency</div>
    <div style="color:#ffffff80;font-size:12px;margin-top:4px;letter-spacing:2px;">USTALI\u011eIN N\u0130\u015eANI, D\u0130J\u0130TALIN \u015eEDD\u0130</div>
  </td></tr>

  <!-- Body -->
  <tr><td style="padding:36px 32px;">
    <h1 style="font-family:'Playfair Display',Georgia,serif;color:#1F2937;font-size:24px;margin:0 0 20px;">${c.title}</h1>
    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 16px;">${c.intro}</p>
    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 16px;">${c.listLabel}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">${featureRows}</table>
    <p style="color:#1F2937;font-size:15px;line-height:1.7;margin:0 0 28px;">${c.philosophy}</p>

    <!-- CTA -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:0 0 28px;">
        <a href="${baseUrl}/dashboard" style="display:inline-block;background:#E94560;color:#ffffff;padding:14px 32px;border-radius:9999px;text-decoration:none;font-weight:700;font-size:15px;">${c.cta}</a>
      </td></tr>
    </table>

    <!-- Quick Links -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E5E7EB;padding-top:20px;">
      <tr>
        <td align="center" style="padding:8px;"><a href="${baseUrl}/kazan" style="color:#E94560;font-size:13px;text-decoration:none;font-weight:600;">KAZAN AI</a></td>
        <td align="center" style="padding:8px;"><a href="${baseUrl}/toolkit" style="color:#E94560;font-size:13px;text-decoration:none;font-weight:600;">Toolkit</a></td>
        <td align="center" style="padding:8px;"><a href="${baseUrl}/devir" style="color:#E94560;font-size:13px;text-decoration:none;font-weight:600;">Devir & Sat\u0131\u015F</a></td>
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
    <p style="margin:0;color:#94a3b8;font-size:11px;">&copy; 2026 DK Agency</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`,
    };
  },

  passwordReset: (resetUrl: string, userName: string, locale?: Locale | string): EmailTemplate => {
    const loc = resolveLocale(locale);
    const t: Record<Locale, { subject: string; greeting: string; body: string; cta: string; expiry: string }> = {
      az: {
        subject: 'DK Agency \u2014 \u015eifr\u0259 S\u0131f\u0131rlama',
        greeting: `Salam ${userName},`,
        body: '\u015eifr\u0259nizi s\u0131f\u0131rlamaq \u00FC\u00E7\u00FCn a\u015Fa\u011F\u0131dak\u0131 d\u00FCym\u0259y\u0259 klik edin.',
        cta: '\u015eifr\u0259ni s\u0131f\u0131rla',
        expiry: 'Bu link 1 saat \u0259rzind\u0259 etibarlid\u0131r.',
      },
      ru: {
        subject: 'DK Agency \u2014 \u0421\u0431\u0440\u043E\u0441 \u043F\u0430\u0440\u043E\u043B\u044F',
        greeting: `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, ${userName}!`,
        body: '\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043A\u043D\u043E\u043F\u043A\u0443 \u043D\u0438\u0436\u0435, \u0447\u0442\u043E\u0431\u044B \u0441\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C.',
        cta: '\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C',
        expiry: '\u042D\u0442\u0430 \u0441\u0441\u044B\u043B\u043A\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430 \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 1 \u0447\u0430\u0441\u0430.',
      },
      en: {
        subject: 'DK Agency \u2014 Password Reset',
        greeting: `Hello ${userName},`,
        body: 'Click the button below to reset your password.',
        cta: 'Reset password',
        expiry: 'This link is valid for 1 hour.',
      },
      tr: {
        subject: 'DK Agency \u2014 \u015eifre S\u0131f\u0131rlama',
        greeting: `Merhaba ${userName},`,
        body: '\u015eifrenizi s\u0131f\u0131rlamak i\u00E7in a\u015Fa\u011F\u0131daki butona t\u0131klay\u0131n.',
        cta: '\u015eifreyi s\u0131f\u0131rla',
        expiry: 'Bu link 1 saat boyunca ge\u00E7erlidir.',
      },
    };
    const c = t[loc];
    return {
      subject: c.subject,
      html: wrapEmail(`
        <p>${c.greeting}</p>
        <p>${c.body}</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="${ctaStyle}">${c.cta}</a>
        </p>
        <p style="color:#64748b;font-size:14px;">${c.expiry}</p>
      `),
    };
  },

  adminInvite: (setPasswordUrl: string, userName: string, adminEmail: string, locale?: Locale | string): EmailTemplate => {
    const loc = resolveLocale(locale);
    const t: Record<Locale, { subject: string; greeting: string; body: string; cta: string; expiry: string; fallback: string }> = {
      az: {
        subject: 'DK Agency \u2014 Hesab\u0131n\u0131z yarad\u0131ld\u0131',
        greeting: `Salam ${userName},`,
        body: `<strong>${adminEmail}</strong> sizi DK Agency platformas\u0131na \u0259lav\u0259 etdi. Hesab\u0131n\u0131za daxil olmaq \u00FC\u00E7\u00FCn \u015Fifr\u0259nizi t\u0259yin edin.`,
        cta: '\u015eifr\u0259mi T\u0259yin Et',
        expiry: 'Bu link 24 saat \u0259rzind\u0259 etibarlid\u0131r.',
        fallback: 'Link i\u015Fl\u0259m\u0259zs\u0259 bu URL-i brauzer\u0259 yap\u0131\u015Fd\u0131r\u0131n:',
      },
      ru: {
        subject: 'DK Agency \u2014 \u0412\u0430\u0448 \u0430\u043A\u043A\u0430\u0443\u043D\u0442 \u0441\u043E\u0437\u0434\u0430\u043D',
        greeting: `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, ${userName}!`,
        body: `<strong>${adminEmail}</strong> \u0434\u043E\u0431\u0430\u0432\u0438\u043B \u0432\u0430\u0441 \u043D\u0430 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0443 DK Agency. \u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C \u0434\u043B\u044F \u0432\u0445\u043E\u0434\u0430 \u0432 \u0430\u043A\u043A\u0430\u0443\u043D\u0442.`,
        cta: '\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C',
        expiry: '\u0421\u0441\u044B\u043B\u043A\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430 24 \u0447\u0430\u0441\u0430.',
        fallback: '\u0415\u0441\u043B\u0438 \u043A\u043D\u043E\u043F\u043A\u0430 \u043D\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442, \u0432\u0441\u0442\u0430\u0432\u044C\u0442\u0435 URL \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440:',
      },
      en: {
        subject: 'DK Agency \u2014 Your account was created',
        greeting: `Hello ${userName},`,
        body: `<strong>${adminEmail}</strong> added you to DK Agency platform. Set your password to access your account.`,
        cta: 'Set My Password',
        expiry: 'This link expires in 24 hours.',
        fallback: 'If the button doesn\u2019t work, paste this URL into your browser:',
      },
      tr: {
        subject: 'DK Agency \u2014 Hesab\u0131n\u0131z olu\u015Fturuldu',
        greeting: `Merhaba ${userName},`,
        body: `<strong>${adminEmail}</strong> sizi DK Agency platformuna ekledi. Hesab\u0131n\u0131za eri\u015Fmek i\u00E7in \u015Fifrenizi belirleyin.`,
        cta: '\u015eifremi Belirle',
        expiry: 'Bu ba\u011Flant\u0131 24 saat ge\u00E7erlidir.',
        fallback: 'Buton \u00E7al\u0131\u015Fmazsa bu URL\u2019yi taray\u0131c\u0131ya yap\u0131\u015Ft\u0131r\u0131n:',
      },
    };
    const c = t[loc];
    return {
      subject: c.subject,
      html: wrapEmail(`
        <p>${c.greeting}</p>
        <p>${c.body}</p>
        <p style="margin: 24px 0;">
          <a href="${setPasswordUrl}" style="${ctaStyle}">${c.cta}</a>
        </p>
        <p style="color:#64748b;font-size:14px;">${c.expiry}</p>
        <p style="color:#94a3b8;font-size:12px;word-break:break-all;">${c.fallback}<br/>${setPasswordUrl}</p>
      `),
    };
  },

  adminPasswordReset: (resetUrl: string, userName: string, locale?: Locale | string): EmailTemplate => {
    const loc = resolveLocale(locale);
    const t: Record<Locale, { subject: string; greeting: string; body: string; cta: string; expiry: string; ignore: string }> = {
      az: {
        subject: 'DK Agency \u2014 \u015eifr\u0259nizi s\u0131f\u0131rlay\u0131n',
        greeting: `Salam ${userName},`,
        body: 'Hesab\u0131n\u0131z\u0131n \u015Fifr\u0259si administrator t\u0259r\u0259find\u0259n s\u0131f\u0131rlanmaq \u00FC\u00E7\u00FCn sor\u011Fu g\u00F6nd\u0259rildi.',
        cta: '\u015eifr\u0259mi S\u0131f\u0131rla',
        expiry: 'Bu link 1 saat \u0259rzind\u0259 etibarlid\u0131r.',
        ignore: 'Bu sor\u011Funu siz g\u00F6nd\u0259rm\u0259misinizsiz, bu emaili n\u0259z\u0259r\u0259 almay\u0131n.',
      },
      ru: {
        subject: 'DK Agency \u2014 \u0421\u0431\u0440\u043E\u0441\u044C\u0442\u0435 \u043F\u0430\u0440\u043E\u043B\u044C',
        greeting: `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, ${userName}!`,
        body: '\u0410\u0434\u043C\u0438\u043D\u0438\u0441\u0442\u0440\u0430\u0442\u043E\u0440 \u0438\u043D\u0438\u0446\u0438\u0438\u0440\u043E\u0432\u0430\u043B \u0441\u0431\u0440\u043E\u0441 \u043F\u0430\u0440\u043E\u043B\u044F \u0432\u0430\u0448\u0435\u0433\u043E \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430.',
        cta: '\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C',
        expiry: '\u0421\u0441\u044B\u043B\u043A\u0430 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430 1 \u0447\u0430\u0441.',
        ignore: '\u0415\u0441\u043B\u0438 \u0432\u044B \u043D\u0435 \u0437\u0430\u043F\u0440\u0430\u0448\u0438\u0432\u0430\u043B\u0438 \u0441\u0431\u0440\u043E\u0441, \u043F\u0440\u043E\u0438\u0433\u043D\u043E\u0440\u0438\u0440\u0443\u0439\u0442\u0435 \u044D\u0442\u043E \u043F\u0438\u0441\u044C\u043C\u043E.',
      },
      en: {
        subject: 'DK Agency \u2014 Reset your password',
        greeting: `Hello ${userName},`,
        body: 'Your account password reset was initiated by an administrator.',
        cta: 'Reset My Password',
        expiry: 'This link expires in 1 hour.',
        ignore: 'If you didn\u2019t request this, please ignore this email.',
      },
      tr: {
        subject: 'DK Agency \u2014 \u015eifrenizi s\u0131f\u0131rlay\u0131n',
        greeting: `Merhaba ${userName},`,
        body: 'Hesab\u0131n\u0131z\u0131n \u015Fifresi y\u00F6netici taraf\u0131ndan s\u0131f\u0131rlanmak \u00FCzere talep edildi.',
        cta: '\u015eifremi S\u0131f\u0131rla',
        expiry: 'Bu ba\u011Flant\u0131 1 saat ge\u00E7erlidir.',
        ignore: 'Bu talebi siz yapmad\u0131ysan\u0131z, bu e-postay\u0131 g\u00F6rmezden gelin.',
      },
    };
    const c = t[loc];
    return {
      subject: c.subject,
      html: wrapEmail(`
        <p>${c.greeting}</p>
        <p>${c.body}</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="${ctaStyle}">${c.cta}</a>
        </p>
        <p style="color:#64748b;font-size:14px;">${c.expiry}</p>
        <p style="color:#94a3b8;font-size:12px;">${c.ignore}</p>
      `),
    };
  },

  listingSubmitted: (trackingCode: string, userName: string, locale?: Locale | string): EmailTemplate => {
    const loc = resolveLocale(locale);
    const t: Record<Locale, { subject: string; greeting: string; body: string; review: string }> = {
      az: {
        subject: `DK Agency \u2014 Elan\u0131n\u0131z q\u0259bul olundu (${trackingCode})`,
        greeting: `Salam ${userName},`,
        body: `Elan\u0131n\u0131z q\u0259bul olundu. Tracking kodunuz: <strong>${trackingCode}</strong>.`,
        review: 'Komit\u0259miz 24 saat \u0259rzind\u0259 inc\u0259l\u0259y\u0259c\u0259k.',
      },
      ru: {
        subject: `DK Agency \u2014 \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u0438\u043D\u044F\u0442\u043E (${trackingCode})`,
        greeting: `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, ${userName}!`,
        body: `\u0412\u0430\u0448\u0435 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u0438\u043D\u044F\u0442\u043E. \u041A\u043E\u0434 \u043E\u0442\u0441\u043B\u0435\u0436\u0438\u0432\u0430\u043D\u0438\u044F: <strong>${trackingCode}</strong>.`,
        review: '\u041D\u0430\u0448\u0430 \u043A\u043E\u043C\u0430\u043D\u0434\u0430 \u0440\u0430\u0441\u0441\u043C\u043E\u0442\u0440\u0438\u0442 \u0435\u0433\u043E \u0432 \u0442\u0435\u0447\u0435\u043D\u0438\u0435 24 \u0447\u0430\u0441\u043E\u0432.',
      },
      en: {
        subject: `DK Agency \u2014 Listing received (${trackingCode})`,
        greeting: `Hello ${userName},`,
        body: `Your listing has been received. Tracking code: <strong>${trackingCode}</strong>.`,
        review: 'Our team will review it within 24 hours.',
      },
      tr: {
        subject: `DK Agency \u2014 \u0130lan\u0131n\u0131z al\u0131nd\u0131 (${trackingCode})`,
        greeting: `Merhaba ${userName},`,
        body: `\u0130lan\u0131n\u0131z al\u0131nd\u0131. Takip kodunuz: <strong>${trackingCode}</strong>.`,
        review: 'Ekibimiz 24 saat i\u00E7inde inceleyecektir.',
      },
    };
    const c = t[loc];
    return {
      subject: c.subject,
      html: wrapEmail(`
        <p>${c.greeting}</p>
        <p>${c.body}</p>
        <p>${c.review}</p>
      `),
    };
  },

  listingApproved: (trackingCode: string, title: string, userName: string, locale?: Locale | string): EmailTemplate => {
    const loc = resolveLocale(locale);
    const t: Record<Locale, { subject: string; greeting: string; body: string }> = {
      az: {
        subject: `DK Agency \u2014 Elan\u0131n\u0131z vitrin\u0259 \u00E7\u0131xd\u0131 (${trackingCode})`,
        greeting: `Salam ${userName},`,
        body: `<strong>${title}</strong> adl\u0131 elan\u0131n\u0131z vitrind\u0259 yay\u0131mland\u0131. Tracking kodu: <strong>${trackingCode}</strong>.`,
      },
      ru: {
        subject: `DK Agency \u2014 \u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u043E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u043E (${trackingCode})`,
        greeting: `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, ${userName}!`,
        body: `\u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 <strong>${title}</strong> \u043E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u043E \u043D\u0430 \u0432\u0438\u0442\u0440\u0438\u043D\u0435. \u041A\u043E\u0434: <strong>${trackingCode}</strong>.`,
      },
      en: {
        subject: `DK Agency \u2014 Listing published (${trackingCode})`,
        greeting: `Hello ${userName},`,
        body: `Your listing <strong>${title}</strong> is now published. Tracking code: <strong>${trackingCode}</strong>.`,
      },
      tr: {
        subject: `DK Agency \u2014 \u0130lan\u0131n\u0131z yay\u0131nland\u0131 (${trackingCode})`,
        greeting: `Merhaba ${userName},`,
        body: `<strong>${title}</strong> ba\u015Fl\u0131kl\u0131 ilan\u0131n\u0131z vitrine \u00E7\u0131kt\u0131. Takip kodu: <strong>${trackingCode}</strong>.`,
      },
    };
    const c = t[loc];
    return {
      subject: c.subject,
      html: wrapEmail(`
        <p>${c.greeting}</p>
        <p>${c.body}</p>
      `),
    };
  },

  listingRejected: (trackingCode: string, reason: string, userName: string, locale?: Locale | string): EmailTemplate => {
    const loc = resolveLocale(locale);
    const t: Record<Locale, { subject: string; greeting: string; body: string; reasonLabel: string }> = {
      az: {
        subject: `DK Agency \u2014 Elan statusu (${trackingCode})`,
        greeting: `Salam ${userName},`,
        body: 'Elan\u0131n\u0131z haz\u0131rda vitrin\u0259 \u00E7\u0131xar\u0131lmad\u0131.',
        reasonLabel: 'S\u0259b\u0259b',
      },
      ru: {
        subject: `DK Agency \u2014 \u0421\u0442\u0430\u0442\u0443\u0441 \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u044F (${trackingCode})`,
        greeting: `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, ${userName}!`,
        body: '\u041E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435 \u043D\u0435 \u0431\u044B\u043B\u043E \u043E\u043F\u0443\u0431\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u043E.',
        reasonLabel: '\u041F\u0440\u0438\u0447\u0438\u043D\u0430',
      },
      en: {
        subject: `DK Agency \u2014 Listing status (${trackingCode})`,
        greeting: `Hello ${userName},`,
        body: 'Your listing was not published at this time.',
        reasonLabel: 'Reason',
      },
      tr: {
        subject: `DK Agency \u2014 \u0130lan durumu (${trackingCode})`,
        greeting: `Merhaba ${userName},`,
        body: '\u0130lan\u0131n\u0131z \u015Fu anda vitrine al\u0131nmad\u0131.',
        reasonLabel: 'Sebep',
      },
    };
    const c = t[loc];
    return {
      subject: c.subject,
      html: wrapEmail(`
        <p>${c.greeting}</p>
        <p>${c.body}</p>
        <p>${c.reasonLabel}: <strong>${reason}</strong></p>
        <p>Tracking kodu: <strong>${trackingCode}</strong>.</p>
      `),
    };
  },

  newLead: (trackingCode: string, leadName: string, ownerName: string, locale?: Locale | string): EmailTemplate => {
    const loc = resolveLocale(locale);
    const t: Record<Locale, { subject: string; greeting: string; body: string }> = {
      az: {
        subject: `DK Agency \u2014 Yeni maraq bildiri\u015Fi (${trackingCode})`,
        greeting: `Salam ${ownerName},`,
        body: `<strong>${leadName}</strong> sizin elan\u0131n\u0131zla maraqland\u0131. Tracking kodu: <strong>${trackingCode}</strong>.`,
      },
      ru: {
        subject: `DK Agency \u2014 \u041D\u043E\u0432\u044B\u0439 \u0438\u043D\u0442\u0435\u0440\u0435\u0441 (${trackingCode})`,
        greeting: `\u0417\u0434\u0440\u0430\u0432\u0441\u0442\u0432\u0443\u0439\u0442\u0435, ${ownerName}!`,
        body: `<strong>${leadName}</strong> \u0437\u0430\u0438\u043D\u0442\u0435\u0440\u0435\u0441\u043E\u0432\u0430\u043B\u0441\u044F \u0432\u0430\u0448\u0438\u043C \u043E\u0431\u044A\u044F\u0432\u043B\u0435\u043D\u0438\u0435\u043C. \u041A\u043E\u0434: <strong>${trackingCode}</strong>.`,
      },
      en: {
        subject: `DK Agency \u2014 New interest (${trackingCode})`,
        greeting: `Hello ${ownerName},`,
        body: `<strong>${leadName}</strong> showed interest in your listing. Tracking code: <strong>${trackingCode}</strong>.`,
      },
      tr: {
        subject: `DK Agency \u2014 Yeni ilgi bildirimi (${trackingCode})`,
        greeting: `Merhaba ${ownerName},`,
        body: `<strong>${leadName}</strong> ilan\u0131n\u0131zla ilgilendi. Takip kodu: <strong>${trackingCode}</strong>.`,
      },
    };
    const c = t[loc];
    return {
      subject: c.subject,
      html: wrapEmail(`
        <p>${c.greeting}</p>
        <p>${c.body}</p>
      `),
    };
  },

  // Admin-only notifications — always AZ
  kazanLeadAdmin: (leadName: string, phone: string, businessType: string, intent: string): EmailTemplate => ({
    subject: `KAZAN AI \u2014 Yeni lead: ${leadName}`,
    html: wrapEmail(`
      <h2 style="color:#1A1A2E;font-size:20px;margin:0 0 16px;">KAZAN AI Lead</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#64748b;">Ad</td><td style="padding:8px 0;font-weight:600;">${leadName}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Telefon</td><td style="padding:8px 0;font-weight:600;">${phone}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Biznes tipi</td><td style="padding:8px 0;font-weight:600;">${businessType}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Maraq</td><td style="padding:8px 0;font-weight:600;">${intent}</td></tr>
      </table>
      <p style="margin-top:20px;">
        <a href="https://dkagency.com.tr/dashboard/kazan-leads" style="${ctaStyle}font-size:14px;">Lead-\u0259 bax</a>
      </p>
    `),
  }),

  listingLeadAdmin: (trackingCode: string, listingTitle: string, leadName: string, phone: string, message: string): EmailTemplate => ({
    subject: `Elan Lead \u2014 ${listingTitle} (${trackingCode})`,
    html: wrapEmail(`
      <h2 style="color:#1A1A2E;font-size:20px;margin:0 0 16px;">Yeni Elan Maraq\u0131</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#64748b;">Elan</td><td style="padding:8px 0;font-weight:600;">${listingTitle} (${trackingCode})</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Maraq bildir\u0259n</td><td style="padding:8px 0;font-weight:600;">${leadName}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Telefon</td><td style="padding:8px 0;font-weight:600;">${phone}</td></tr>
        <tr><td style="padding:8px 0;color:#64748b;">Mesaj</td><td style="padding:8px 0;">${message || 'Mesaj yoxdur'}</td></tr>
      </table>
      <p style="margin-top:20px;">
        <a href="https://dkagency.com.tr/dashboard/ilanlar" style="${ctaStyle}font-size:14px;">Dashboard-a ke\u00E7</a>
      </p>
    `),
  }),
};

export async function sendEmail(to: string, template: EmailTemplate) {
  const { sendSmtpEmail } = await import('./smtp');
  return sendSmtpEmail(to, template.subject, template.html);
}
