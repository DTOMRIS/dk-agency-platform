import { ImageResponse } from 'next/og';
import { getSektorConfig } from '@/lib/data/sektorConfigs';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const SLUG_TITLES: Record<string, string> = {
  'qonaq-evi': 'Qonaq Evi & Pansiyon ucun OTA Beledcisi',
  'otel': 'Otel Sektoru ucun Tam Beledci',
  'restoran': 'Restoran Sektoru ucun Tam Beledci',
  'kafe': 'Kafe Sektoru ucun Tam Beledci',
};

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const config = getSektorConfig(slug);

  const title = SLUG_TITLES[slug] ?? 'DK Agency Sektor Beledcisi';
  const tools = config?.tools.slice(0, 3) ?? [];

  const TOOL_LABELS: Record<string, string> = {
    '/toolkit/ota-hazirlig-testi': 'OTA Test',
    '/toolkit/otel-hazirlig-testi': 'Otel Hazirliq Testi',
    '/toolkit/qonaq-evi-roi-kalkulyatoru': 'ROI Kalkulyator',
    '/toolkit/whatsapp-template-paketi': 'WhatsApp Sablonlar',
    '/toolkit/food-cost': 'Food Cost',
    '/toolkit/menu-matrix': 'Menyu Matrisi',
    '/toolkit/pnl': 'P&L Hesabat',
    '/toolkit/basabas': 'Basabas Noqtesi',
    '/toolkit/delivery-calc': 'Delivery Calc',
    '/toolkit/staff-retention': 'Staff Retention',
  };

  const badges = tools.map((t) => TOOL_LABELS[t.href] ?? t.href.split('/').pop() ?? '');

  return new ImageResponse(
    (
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
              maxWidth: 850,
            }}
          >
            {title}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 24 }}>
            Pulsuz aletler ve ekspert destek
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {badges.map((label) => (
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
      </div>
    ),
    size,
  );
}
