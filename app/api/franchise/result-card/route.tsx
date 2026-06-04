import { ImageResponse } from 'next/og';
import { type NextRequest } from 'next/server';

export const runtime = 'edge';

const verdictColors: Record<string, { bg: string; text: string }> = {
  good: { bg: '#059669', text: '#ffffff' },
  mid: { bg: '#d97706', text: '#ffffff' },
  bad: { bg: '#dc2626', text: '#ffffff' },
};

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get('type') || 'readiness';
  const score = Math.max(0, Math.min(100, Number(searchParams.get('score')) || 0));
  const verdict = searchParams.get('verdict') || '';
  const locale = searchParams.get('locale') || 'az';

  const titles: Record<string, Record<string, string>> = {
    readiness: { az: 'Franchise Hazırlıq Testi', en: 'Franchise Readiness Test', ru: 'Тест готовности к франшизе', tr: 'Franchise Hazırlık Testi' },
    buyer: { az: 'Franchise Alıcı Çek-listi', en: 'Franchise Buyer Checklist', ru: 'Чек-лист покупателя франшизы', tr: 'Franchise Alıcı Kontrol Listesi' },
  };

  const title = titles[type]?.[locale] || titles.readiness.az;
  const ringColor = score >= 70 ? '#C5A022' : score >= 40 ? '#d97706' : '#E94560';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#C5A022', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontSize: '20px', fontWeight: 800 }}>
            DK
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ color: '#ffffff', fontSize: '22px', fontWeight: 700 }}>DK Agency</span>
            <span style={{ color: '#C5A022', fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase' as const }}>USTALIĞIN NİŞANI</span>
          </div>
        </div>

        {/* Title */}
        <div style={{ color: '#94a3b8', fontSize: '18px', fontWeight: 600, letterSpacing: '4px', textTransform: 'uppercase' as const, marginBottom: '24px' }}>
          {title}
        </div>

        {/* Score circle */}
        <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <svg width="200" height="200" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="85" fill="none" stroke="#334155" strokeWidth="14" />
            <circle
              cx="100" cy="100" r="85" fill="none"
              stroke={ringColor} strokeWidth="14" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 85}`}
              strokeDashoffset={`${2 * Math.PI * 85 * (1 - score / 100)}`}
              transform="rotate(-90 100 100)"
            />
          </svg>
          <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: '64px', fontWeight: 800 }}>
            {score}
          </div>
        </div>

        {/* Verdict */}
        {verdict && (
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '16px', textAlign: 'center', maxWidth: '600px' }}>
            {verdict}
          </div>
        )}

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#64748b', fontSize: '16px' }}>dkagency.com.tr/franchise</span>
          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#475569' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#C5A022', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#0f172a' }}>
              ✓
            </div>
            <span style={{ color: '#C5A022', fontSize: '14px', fontWeight: 600 }}>ŞEDD</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
