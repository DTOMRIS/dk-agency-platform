'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'system-ui' }}>
          <h2>Xəta baş verdi</h2>
          <p style={{ color: '#666' }}>Texniki komanda məlumatlandırıldı.</p>
          <button
            onClick={reset}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Yenidən cəhd et
          </button>
        </div>
      </body>
    </html>
  );
}
