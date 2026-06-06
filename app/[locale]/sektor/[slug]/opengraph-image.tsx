import { ImageResponse } from 'next/og';

import { getSektorConfig } from '@/lib/data/sektorConfigs';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FALLBACK = {
  title: 'Sektor Beledcileri | DK Agency',
  subtitle: 'HoReCa sektorlari ucun pulsuz aletler',
  badges: ['OTA', 'Food Cost', 'ROI'],
};

interface OgParams {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function OpenGraphImage({ params }: OgParams) {
  const { slug } = await params;
  const config = getSektorConfig(slug);
  const og = config?.og ?? FALLBACK;

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 56,
        background: 'linear-gradient(135deg, #1A1A2E 0%, #16213e 60%, #0f3460 100%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: '#C5A022',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#1A1A2E',
            fontSize: 18,
            fontWeight: 800,
          }}
        >
          DK
        </div>
        <div
          style={{
            color: '#C5A022',
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: 3,
            textTransform: 'uppercase' as const,
          }}
        >
          DK Agency
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div
          style={{
            color: '#ffffff',
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.15,
            maxWidth: 900,
          }}
        >
          {og.title}
        </div>
        <div style={{ color: '#94a3b8', fontSize: 24 }}>{og.subtitle}</div>
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        {og.badges.slice(0, 3).map((label) => (
          <div
            key={label}
            style={{
              background: 'rgba(197,160,34,0.15)',
              border: '1px solid rgba(197,160,34,0.4)',
              borderRadius: 999,
              padding: '8px 22px',
              color: '#C5A022',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    size
  );
}
