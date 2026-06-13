import { ImageResponse } from 'next/og';

export const alt = 'DK Agency — Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Default Open Graph image for the whole app. Pages that set their own
// openGraph.images (blog/news with a cover) override this automatically.
// Concrete hex colors only — ImageResponse/Satori does NOT resolve CSS vars.
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 64,
        background: 'linear-gradient(140deg, #1A1A2E 0%, #25253f 55%, #E94560 140%)',
        color: '#FAFAF8',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 36 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            borderRadius: 16,
            background: '#E94560',
            fontWeight: 800,
            color: '#FFFFFF',
          }}
        >
          DK
        </div>
        <div style={{ letterSpacing: 1, fontWeight: 700 }}>DK Agency</div>
      </div>
      <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.08, maxWidth: 960 }}>
        Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması
      </div>
      <div style={{ fontSize: 30, color: '#C5A022', fontWeight: 600 }}>
        Toolkit · Blog · Sektor Nəbzi · Franchise
      </div>
    </div>,
    size
  );
}
