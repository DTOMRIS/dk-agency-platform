export type HomeSectionId =
  | 'hero'
  | 'stages'
  | 'basla'
  | 'comparison'
  | 'hizlandir'
  | 'boyut'
  | 'listings'
  | 'news'
  | 'stats'
  | 'signup';

export const homeSections: { id: HomeSectionId; label: string }[] = [
  { id: 'hero', label: 'Overview' },
  { id: 'stages', label: 'Stages' },
  { id: 'basla', label: 'Basla' },
  { id: 'comparison', label: 'Compare' },
  { id: 'hizlandir', label: 'Hizlandir' },
  { id: 'boyut', label: 'Boyut' },
  { id: 'listings', label: 'Listings' },
  { id: 'news', label: 'Newsroom' },
  { id: 'stats', label: 'Stats' },
  { id: 'signup', label: 'Signup' },
];
