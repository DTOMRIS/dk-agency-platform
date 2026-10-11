/**
 * @file listing-tones.ts
 * @purpose Class sets for the listing card, the listing modal and the lead form.
 *          - `v2`: the public pages /ilanlar and /ilanlar/[slug] (cream + ink + one red accent, Inter, 22px cards).
 *          - `panel`: the member panel (/b2b-panel/favoriler) keeps its current look until the panel itself
 *            moves to v2 — these strings are the exact classes the components had before.
 *          One component per job (no parallel card / modal / form); only the look switches.
 */

export type ListingTone = 'panel' | 'v2';

export interface ListingCardTone {
  root: string;
  featured: string;
  title: string;
  pin: string;
  price: string;
  more: string;
}

export interface ListingModalTone {
  sheet: string;
  frame: string;
  thumbActive: string;
  thumb: string;
  infoCard: string;
  code: string;
  title: string;
  pin: string;
  price: string;
  card: string;
  sectionTitle: string;
  field: string;
  fieldLabel: string;
  fieldValue: string;
  ghostButton: string;
}

export interface LeadFormTone {
  card: string;
  title: string;
  body: string;
  input: string;
  submit: string;
}

export const LISTING_CARD_TONES: Record<ListingTone, ListingCardTone> = {
  panel: {
    root: 'group block overflow-hidden rounded-2xl border border-slate-200/80 bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ring-1 ring-slate-100 relative',
    featured: 'text-[var(--dk-gold)]',
    title: 'truncate font-display text-xl font-black text-[var(--dk-navy)]',
    pin: 'h-3.5 w-3.5 text-[var(--dk-gold)]',
    price: 'text-2xl font-black text-[var(--dk-gold)]',
    more: 'inline-flex items-center gap-1.5 text-sm font-bold text-[var(--dk-red)] transition-colors group-hover:text-[var(--dk-red-hover)]',
  },
  v2: {
    root: 'group relative block overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-white text-left transition duration-300 hover:-translate-y-0.5 hover:border-[#0F172A]',
    featured: 'text-[#BE2F47]',
    title: 'truncate text-[19px] font-black leading-tight tracking-[-0.02em] text-[#0F172A]',
    pin: 'h-3.5 w-3.5 text-[#BE2F47]',
    price: 'text-[22px] font-black tracking-[-0.02em] text-[#0F172A] tabular-nums',
    more: 'inline-flex items-center gap-1.5 text-[14px] font-bold text-[#BE2F47] transition-colors group-hover:text-[#0F172A]',
  },
};

export const LISTING_MODAL_TONES: Record<ListingTone, ListingModalTone> = {
  panel: {
    sheet: 'relative h-full overflow-y-auto bg-white md:mx-auto md:h-auto md:max-w-6xl md:rounded-[32px]',
    frame: 'overflow-hidden rounded-[28px] border border-slate-200',
    thumbActive: 'border-[var(--dk-gold)] ring-2 ring-amber-100',
    thumb: 'border-slate-200',
    infoCard: 'rounded-[28px] border border-slate-200 bg-slate-50 p-6',
    code: 'inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-500',
    title: 'font-display text-3xl font-black text-[var(--dk-navy)]',
    pin: 'h-4 w-4 text-[var(--dk-gold)]',
    price: 'text-xl font-black text-[var(--dk-gold)]',
    card: 'rounded-[28px] border border-slate-200 bg-white p-6',
    sectionTitle: 'font-display text-2xl font-black text-[var(--dk-navy)]',
    field: 'rounded-2xl border border-slate-200 bg-slate-50 p-4',
    fieldLabel: 'text-xs font-bold uppercase tracking-[0.18em] text-slate-400',
    fieldValue: 'mt-2 text-sm font-semibold text-slate-700',
    ghostButton:
      'inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]',
  },
  v2: {
    sheet: 'relative h-full overflow-y-auto bg-[#FBF8F3] md:mx-auto md:h-auto md:max-w-6xl md:rounded-[28px]',
    frame: 'overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-white',
    thumbActive: 'border-[#0F172A] ring-2 ring-[#F4B8C3]',
    thumb: 'border-[#E4DCCD]',
    infoCard: 'rounded-[22px] border border-[#E4DCCD] bg-white p-6',
    code: 'inline-flex rounded-full border border-[#E4DCCD] bg-[#FBF8F3] px-3 py-1 text-[11px] font-semibold text-slate-600',
    title: 'text-[28px] font-black leading-tight tracking-[-0.03em] text-[#0F172A]',
    pin: 'h-4 w-4 text-[#BE2F47]',
    price: 'text-xl font-black text-[#0F172A] tabular-nums',
    card: 'rounded-[22px] border border-[#E4DCCD] bg-white p-6',
    sectionTitle: 'text-[20px] font-black tracking-[-0.02em] text-[#0F172A]',
    field: 'rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] p-4',
    fieldLabel: 'text-[11.5px] font-black uppercase tracking-[0.14em] text-slate-500',
    fieldValue: 'mt-2 text-sm font-semibold text-[#0F172A]',
    ghostButton:
      'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-5 py-3 text-sm font-bold text-[#0F172A] transition hover:border-[#0F172A]',
  },
};

export const LEAD_FORM_TONES: Record<ListingTone, LeadFormTone> = {
  panel: {
    card: 'rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm',
    title: 'font-display text-2xl font-black text-[var(--dk-navy)]',
    body: 'mt-1 text-sm text-slate-600',
    input:
      'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--dk-red)] focus:ring-4 focus:ring-rose-100',
    submit:
      'inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-dk-red-strong px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70',
  },
  v2: {
    card: 'rounded-[22px] border border-[#E4DCCD] bg-white p-5 sm:p-6',
    title: 'text-[20px] font-black tracking-[-0.02em] text-[#0F172A]',
    body: 'mt-1 text-[14px] leading-6 text-slate-600',
    input:
      'w-full rounded-2xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-3 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A] focus:bg-white',
    submit:
      'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-dk-red-strong px-5 py-3 text-sm font-bold text-white transition hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:opacity-70',
  },
};
