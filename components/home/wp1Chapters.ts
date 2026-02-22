export const HOME_CHAPTERS = [
  { id: 'hero', label: 'Hero' },
  { id: 'stage-cards', label: 'Stages' },
  { id: 'basla-showcase', label: 'Basla' },
  { id: 'comparison', label: 'Comparison' },
  { id: 'hizlandir-alternating', label: 'Hizlandir' },
  { id: 'boyut-showcase', label: 'Boyut' },
  { id: 'listings-preview', label: 'Listings' },
  { id: 'news-editorial', label: 'News' },
  { id: 'stats-bar', label: 'Stats' },
  { id: 'signup-cta', label: 'Signup' },
] as const;

export type HomeChapterId = (typeof HOME_CHAPTERS)[number]['id'];
