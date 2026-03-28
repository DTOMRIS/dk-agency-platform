export const colors = {
  navy: 'var(--dk-navy)',
  gold: 'var(--dk-gold)',
  goldLight: 'color-mix(in srgb, var(--dk-gold) 12%, white)',
  red: 'var(--dk-red)',
  redLight: 'color-mix(in srgb, var(--dk-red) 10%, white)',
  white: 'var(--dk-paper-strong)',
  bg: 'var(--dk-paper)',
  surface: 'color-mix(in srgb, var(--dk-paper) 45%, white)',
  text: 'var(--dk-navy)',
  textMuted: 'color-mix(in srgb, var(--dk-navy) 65%, white)',
  textLight: 'color-mix(in srgb, var(--dk-navy) 45%, white)',
  border: 'color-mix(in srgb, var(--dk-border-soft) 78%, white)',
  borderLight: 'color-mix(in srgb, var(--dk-border-soft) 55%, white)',
  purple: 'var(--dk-purple)',
  purpleLight: 'color-mix(in srgb, var(--dk-purple) 12%, white)',
  green: 'var(--dk-success)',
  greenLight: 'color-mix(in srgb, var(--dk-success) 10%, white)',
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
