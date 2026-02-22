export const dkHomeTokens = {
  color: {
    ink: '#0f172a',
    inkSoft: '#475569',
    gold: '#c5a022',
    red: '#e94560',
    mist: '#edf3f6',
    navy: '#16213e',
    teal: '#1f5b55',
    paper: '#ffffff',
    line: '#d8e2ea',
  },
  shadow: {
    soft: '0 14px 40px rgba(15, 23, 42, 0.08)',
    card: '0 20px 46px rgba(22, 33, 62, 0.12)',
    glow: '0 22px 40px rgba(233, 69, 96, 0.2)',
  },
  radius: {
    xl: '24px',
    lg: '18px',
    md: '14px',
  },
  container: {
    max: '1180px',
    sectionY: 'clamp(2.5rem, 5vw, 4.6rem)',
    sectionX: 'clamp(1rem, 2.4vw, 1.5rem)',
  },
} as const;

export type DkHomeTokens = typeof dkHomeTokens;
