export const colors = {
  navy: '#1A1A2E',
  gold: '#C5A022',
  goldLight: '#FFF8E7',
  red: '#E94560',
  redLight: '#FFF0F3',
  white: '#FFFFFF',
  bg: '#FAFAF8',
  surface: '#F9FAFB',
  text: '#1A1A2E',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  purple: '#8B5CF6',
  purpleLight: '#F5F3FF',
  green: '#059669',
  greenLight: '#ECFDF5',
} as const;

export const fonts = {
  display: '"Playfair Display", serif',
  body: '"DM Sans", sans-serif',
} as const;

export const shadows = {
  soft: '0 14px 40px rgba(15, 23, 42, 0.08)',
  card: '0 20px 46px rgba(22, 33, 62, 0.12)',
  glow: '0 22px 40px rgba(233, 69, 96, 0.2)',
} as const;

export const radius = {
  xl: '24px',
  lg: '18px',
  md: '14px',
} as const;

export type ColorKey = keyof typeof colors;
export type FontKey = keyof typeof fonts;
