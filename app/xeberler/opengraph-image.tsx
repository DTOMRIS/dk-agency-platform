import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 56,
          background: 'linear-gradient(140deg, #1f2e4a 0%, #1f5b55 45%, #c14f35 100%)',
          color: '#fff',
        }}
      >
        <div style={{ fontSize: 34, letterSpacing: 1.5 }}>DK Agency Editorial</div>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.06, maxWidth: 920 }}>
          Xeberler: Featured + Most Read + RSS Distribution
        </div>
        <div style={{ fontSize: 30, opacity: 0.9 }}>az | en | ru | tr</div>
      </div>
    ),
    size,
  );
}
