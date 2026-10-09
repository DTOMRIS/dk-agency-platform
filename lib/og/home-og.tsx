/**
 * @file home-og.tsx
 * @purpose Saytın ümumi link önizləməsi (WhatsApp/Telegram/Facebook) — ana səhifə v2 dilində:
 *          krem fon, Inter 900 başlıq «Biz itkini tapırıq. / Siz restoranı idarə edirsiniz.»,
 *          orbit halqaları içində real DK loqosu, «siqnal → plan» nümunə kartı, alt zolaq.
 * @task TASK-0513 (TASK-0510 dizaynını əvəz edir)
 *
 * Link önizləmələri statik PNG-dir — animasiya (fırlanan loqo) mümkün deyil; loqo ana səhifədəki
 * EcoOrbit kimi konsentrik halqaların mərkəzində sabit nişandır.
 *
 * Şrift: repoda TTF/OTF yoxdur (next/font woff2 verir, satori woff2 oxumur), ona görə Inter yalnız
 * lazım olan gliflərlə Google Fonts-dan alınır. Alınmasa (şəbəkə/timeout) `fonts` ümumiyyətlə
 * ötürülmür — satori öz standart şriftinə düşür. Boş `fonts: []` satori-ni «No fonts are loaded»
 * ilə yıxır (TASK-0508). Şəkil `force-dynamic` route-lardan çağırılır, build zamanı şəbəkə tələb etmir.
 */
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { normalizeLocale } from '@/i18n/config';
import { loadGoogleFont } from '@/lib/og/load-google-font';

export const HOME_OG_SIZE = { width: 1200, height: 630 };

// Satori CSS dəyişənlərini oxumur — homeV2.module.css-dəki dəyərlərin hex surəti.
const C = {
  cream: '#F6F1E9',
  cream2: '#EEE6D8',
  line: '#E4DCCD',
  ink: '#0F172A',
  ink2: '#334155',
  muted: '#5B6474',
  red: '#E94560',
  redSoft: '#FDECEF',
  green: '#047857',
  greenSoft: '#E7F6EF',
  violet: '#8B5CF6',
  sky: '#38BDF8',
};

const DOMAIN = 'dkagency.com.tr';
const STRIP = ['Food cost', 'P&L', 'OCAQ', 'KAZAN AI'];

type OgFont = { name: string; data: ArrayBuffer; weight: 600 | 800 | 900; style: 'normal' };

/**
 * TASK-0514: Inter is bundled in lib/og/fonts (SIL OFL 1.1, rsms/inter v4.1 — full Latin-ext incl. ə and
 * Cyrillic), so the preview never depends on Google Fonts at request time. Google stays as a fallback
 * only if the files are missing from the deployment.
 */
async function loadLocalFonts(): Promise<OgFont[]> {
  const dir = path.join(process.cwd(), 'lib/og/fonts');
  const read = async (file: string) => {
    const buf = await readFile(path.join(dir, file));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  };
  const [semi, extra, black] = await Promise.all([
    read('Inter-SemiBold.ttf'),
    read('Inter-ExtraBold.ttf'),
    read('Inter-Black.ttf'),
  ]);
  return [
    { name: 'Inter', data: semi, weight: 600, style: 'normal' },
    { name: 'Inter', data: extra, weight: 800, style: 'normal' },
    { name: 'Inter', data: black, weight: 900, style: 'normal' },
  ];
}

async function loadFonts(text: string): Promise<OgFont[]> {
  try {
    return await loadLocalFonts();
  } catch {
    // fall through to Google
  }
  try {
    const [semi, extra, black] = await Promise.all([
      loadGoogleFont('Inter', 600, text),
      loadGoogleFont('Inter', 800, text),
      loadGoogleFont('Inter', 900, text),
    ]);
    return [
      { name: 'Inter', data: semi, weight: 600, style: 'normal' },
      { name: 'Inter', data: extra, weight: 800, style: 'normal' },
      { name: 'Inter', data: black, weight: 900, style: 'normal' },
    ];
  } catch {
    return [];
  }
}

/** Orbit halqaları — ana səhifə EcoOrbit-in statik variantı (eyni rənglər, eyni ştrixlər). */
function OrbitRings({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 420 420">
      <circle cx="210" cy="210" r="200" fill="none" stroke={C.line} strokeWidth="2" strokeDasharray="2 12" strokeLinecap="round" />
      <circle cx="210" cy="210" r="150" fill="none" stroke={C.cream2} strokeWidth="22" />
      <circle cx="210" cy="210" r="150" fill="none" stroke={C.red} strokeWidth="8" strokeLinecap="round" strokeDasharray="120 823" transform="rotate(-120 210 210)" />
      <circle cx="210" cy="210" r="150" fill="none" stroke={C.violet} strokeWidth="8" strokeLinecap="round" strokeDasharray="22 921" transform="rotate(10 210 210)" />
      <circle cx="210" cy="210" r="150" fill="none" stroke={C.sky} strokeWidth="7" strokeLinecap="round" strokeDasharray="12 931" transform="rotate(60 210 210)" />
      <circle cx="210" cy="210" r="104" fill="#FFFFFF" stroke={C.line} strokeWidth="2" />
      <circle cx="351" cy="69" r="9" fill={C.red} />
      <circle cx="69" cy="351" r="7" fill={C.violet} />
      <circle cx="400" cy="230" r="6" fill={C.sky} />
      <circle cx="40" cy="120" r="6" fill={C.green} />
    </svg>
  );
}

export async function renderHomeOg(rawLocale: string | null | undefined): Promise<ImageResponse> {
  const locale = normalizeLocale(rawLocale);
  const t = await getTranslations({ locale, namespace: 'ogHome' });
  const copy = {
    eyebrow: t('eyebrow'),
    line1: t('line1'),
    line2: t('line2'),
    sub: t('sub'),
    sample: t('sample'),
    signal: t('signal'),
    cardTitle: t('cardTitle'),
    cardFrom: t('cardFrom'),
    cardTo: t('cardTo'),
    plan: t('plan'),
  };

  // icon-512.png — loqonun ən yüksək keyfiyyətli faylı (logo-mobil.png 144 px-dir, böyüdəndə bulanır).
  const logo = await readFile(path.join(process.cwd(), 'public/icon-512.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  const fonts = await loadFonts(
    [...Object.values(copy), 'DK Agency', DOMAIN, ...STRIP, '→ ✓ · %0123456789'].join(' ')
  );
  const family = fonts.length ? 'Inter' : 'sans-serif';
  // Kiril başlıq daha uzundur — 4 sətrə sığsın deyə bir az kiçik.
  const headSize = locale === 'ru' ? 56 : 64;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: C.cream,
        color: C.ink,
        fontFamily: family,
      }}
    >
      <div style={{ display: 'flex', flex: 1, padding: '44px 56px 0 64px', position: 'relative' }}>
        {/* Sol: brend, başlıq, alt sətir */}
        <div style={{ display: 'flex', flexDirection: 'column', width: 660, paddingTop: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ display: 'flex', fontSize: 26, fontWeight: 900, letterSpacing: -0.5 }}>DK Agency</div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 14px',
                borderRadius: 999,
                background: '#FFFFFF',
                border: `1px solid ${C.line}`,
                fontSize: 18,
                fontWeight: 600,
                color: C.ink2,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 8, background: C.red }} />
              {copy.eyebrow}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              marginTop: 34,
              fontSize: headSize,
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: -2,
            }}
          >
            <div style={{ display: 'flex', color: C.red }}>{copy.line1}</div>
            <div style={{ display: 'flex', color: C.ink, marginTop: 6 }}>{copy.line2}</div>
          </div>

          <div style={{ display: 'flex', marginTop: 26, fontSize: 24, fontWeight: 600, lineHeight: 1.4, color: C.muted, maxWidth: 600 }}>
            {copy.sub}
          </div>
        </div>

        {/* Sağ: orbit içində loqo + nümunə siqnal kartı */}
        <div style={{ display: 'flex', position: 'absolute', right: 40, top: 22, width: 420, height: 420 }}>
          <OrbitRings size={420} />
          {/* satori yalnız <img> tanıyır — next/image burada işləmir */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            width={168}
            height={168}
            alt=""
            // PNG-nin künclərində ağ fon var — plitə formasına uyğun yuvarlaqlaşdırılır.
            style={{ position: 'absolute', left: 126, top: 126, borderRadius: 40 }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'absolute',
            right: 176,
            top: 350,
            width: 290,
            padding: '16px 18px',
            borderRadius: 22,
            background: '#FFFFFF',
            border: `1px solid ${C.line}`,
            boxShadow: '0 18px 36px -14px rgba(15,23,42,0.28)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 800, color: C.red }}>
              <div style={{ width: 8, height: 8, borderRadius: 8, background: C.red }} />
              {copy.signal}
            </div>
            <div
              style={{
                display: 'flex',
                padding: '3px 10px',
                borderRadius: 999,
                background: C.cream,
                fontSize: 13,
                fontWeight: 600,
                color: C.muted,
              }}
            >
              {copy.sample}
            </div>
          </div>
          <div style={{ display: 'flex', marginTop: 8, fontSize: 17, fontWeight: 600, color: C.ink2 }}>{copy.cardTitle}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontSize: 34, fontWeight: 900, letterSpacing: -1 }}>
            <div style={{ display: 'flex', color: C.red }}>{copy.cardFrom}</div>
            <div style={{ display: 'flex', color: C.muted, fontSize: 26 }}>→</div>
            <div style={{ display: 'flex', color: C.green }}>{copy.cardTo}</div>
          </div>
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              alignItems: 'center',
              gap: 6,
              marginTop: 10,
              padding: '6px 12px',
              borderRadius: 999,
              background: C.greenSoft,
              color: C.green,
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            ✓ {copy.plan}
          </div>
        </div>
      </div>

      {/* Alt zolaq */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 76,
          padding: '0 64px',
          background: C.ink,
          color: '#FFFFFF',
        }}
      >
        <div style={{ display: 'flex', fontSize: 24, fontWeight: 800 }}>{DOMAIN}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 21, fontWeight: 600, color: '#CBD5E1' }}>
          {STRIP.map((item, i) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {i > 0 ? <div style={{ width: 6, height: 6, borderRadius: 6, background: C.red }} /> : null}
              <div style={{ display: 'flex' }}>{item}</div>
            </div>
          ))}
        </div>
      </div>
    </div>,
    {
      ...HOME_OG_SIZE,
      ...(fonts.length ? { fonts } : {}),
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
    }
  );
}
