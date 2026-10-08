import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { loadGoogleFont } from '@/lib/og/load-google-font';

export const alt = 'DK Agency — HoReCa İdarəetmə, KAZAN AI & Biznes Ekosistemi';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

const TITLE_1 = 'HoReCa İdarəetmə,';
const TITLE_2 = 'KAZAN AI & Biznes Ekosistemi';
const PILLS = ['KAZAN AI', '18+ Alət', 'Ekspert Bloq', 'Sektor Nəbzi'];
const FOOT = '40 illik təcrübə · Azərbaycan HoReCa sektoru üçün';
const DOMAIN = 'dkagency.com.tr';

// Saytın ümumi Open Graph şəkli (WhatsApp/Telegram/Facebook link önizləməsi). Öz şəkli olan
// səhifələr (bloq/xəbər) bunu avtomatik əvəz edir. Satori CSS dəyişənlərini oxumur — yalnız hex.
// TASK-0510: əvvəl «DK» yazılı qırmızı kvadrat və yüklənməmiş şrift (qalın başlıq düz çıxırdı) idi;
// indi real loqo (public/images/logo-mobil.png) + Playfair/DM Sans. Şrift yüklənməsə build
// yıxılmasın deyə standart şriftə düşür.
export default async function OpenGraphImage() {
  const logo = await readFile(path.join(process.cwd(), 'public/images/logo-mobil.png'));
  const logoSrc = `data:image/png;base64,${logo.toString('base64')}`;

  const sansText = ['DK Agency', ...PILLS, FOOT, DOMAIN].join(' ');
  let fonts: { name: string; data: ArrayBuffer; weight: 400 | 700 | 800; style: 'normal' }[] = [];
  try {
    const [playfair, sans, sansBold] = await Promise.all([
      loadGoogleFont('Playfair+Display', 800, `${TITLE_1} ${TITLE_2}`),
      loadGoogleFont('DM+Sans', 400, sansText),
      loadGoogleFont('DM+Sans', 700, sansText),
    ]);
    fonts = [
      { name: 'Playfair', data: playfair, weight: 800, style: 'normal' },
      { name: 'DMSans', data: sans, weight: 400, style: 'normal' },
      { name: 'DMSans', data: sansBold, weight: 700, style: 'normal' },
    ];
  } catch {
    fonts = [];
  }
  const display = fonts.length ? 'Playfair' : 'serif';
  const body = fonts.length ? 'DMSans' : 'sans-serif';

  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px 64px',
        background: 'linear-gradient(135deg, #12122A 0%, #1A1A2E 55%, #3A1F35 100%)',
        color: '#FAFAF8',
        fontFamily: body,
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -160,
          top: -160,
          width: 520,
          height: 520,
          borderRadius: 520,
          background: 'radial-gradient(circle, rgba(233,69,96,0.45) 0%, rgba(233,69,96,0) 70%)',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <img src={logoSrc} width={72} height={72} style={{ borderRadius: 18, background: '#FFFFFF' }} alt="" />
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 0.5 }}>DK Agency</div>
        </div>
        <div style={{ fontSize: 24, color: '#C5A022', fontWeight: 700 }}>{DOMAIN}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', fontFamily: display, fontWeight: 800 }}>
        <div style={{ fontSize: 66, lineHeight: 1.08 }}>{TITLE_1}</div>
        <div style={{ fontSize: 66, lineHeight: 1.08, color: '#F06A82' }}>{TITLE_2}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {PILLS.map((pill) => (
            <div
              key={pill}
              style={{
                display: 'flex',
                padding: '10px 20px',
                borderRadius: 999,
                border: '2px solid rgba(197,160,34,0.6)',
                color: '#F3E3A8',
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              {pill}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 24, color: '#B8B8C8' }}>{FOOT}</div>
      </div>
    </div>,
    { ...size, fonts }
  );
}
