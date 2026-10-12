/**
 * @file create-listing-tones.ts
 * @purpose Class sets for CreateListingForm (the one listing-submit form).
 *          - `v2`: the public page /ilan-ver (cream + ink + one red accent, 22px cards, h-11 inputs).
 *          - `panel`: the member panel (/b2b-panel/yeni-ilan) and admin (/dashboard/ilanlar/yarat) keep their
 *            current look until the panels move to v2 — these strings are the exact classes the form had before.
 *          One form, one behaviour; only the look switches (same approach as listing-tones.ts).
 */

export type CreateListingTone = 'panel' | 'v2';

export interface CreateListingToneSet {
  stack: string;
  card: string;
  successCard: string;
  successIcon: string;
  successTitle: string;
  codePill: string;
  copyButton: string;
  body: string;
  primaryPill: string;
  ghostPill: string;
  // step indicator
  stepCard: string;
  stepList: string;
  stepItem: string;
  stepDot: string;
  stepDone: string;
  stepActive: string;
  stepIdle: string;
  stepTextActive: string;
  stepTextIdle: string;
  stepKicker: string;
  stepName: string;
  toast: string;
  // headings + text
  h2: string;
  lead: string;
  leadLoose: string;
  // step 1
  catGrid: string;
  catCard: string;
  catSelected: string;
  catIdle: string;
  catBadge: string;
  catCheck: string;
  catTitle: string;
  catDesc: string;
  errorLg: string;
  // fields
  fieldGrid: string;
  label: string;
  input: string;
  textarea: string;
  select: string;
  affixWrap: string;
  affixInput: string;
  suffix: string;
  hint: string;
  counter: string;
  errorInline: string;
  error: string;
  sectionRule: string;
  sectionLabel: string;
  sectionHelp: string;
  // step 3
  checkRow: string;
  checkbox: string;
  eqRow: string;
  eqName: string;
  eqSelect: string;
  eqCount: string;
  eqRemove: string;
  addLink: string;
  countChip: string;
  chip: string;
  chipOn: string;
  chipDisabled: string;
  chipIdle: string;
  warning: string;
  // step 4
  dropzone: string;
  dropIcon: string;
  photoCount: string;
  bulkDelete: string;
  imgGrid: string;
  imgCard: string;
  imgCardSelected: string;
  imgCardIdle: string;
  imgFrame: string;
  imgName: string;
  imgSaving: string;
  coverBadge: string;
  miniButton: string;
  miniDanger: string;
  videoBlock: string;
  videoLabel: string;
  videoInput: string;
  videoClear: string;
  videoFrame: string;
  // step 5
  previewShell: string;
  editLink: string;
  previewTitle: string;
  previewPrice: string;
  previewMeta: string;
  previewDesc: string;
  box: string;
  tile: string;
  tileLabel: string;
  tileValue: string;
  conceptTag: string;
  thumb: string;
  thumbCover: string;
  contactList: string;
  emptyValue: string;
  adminBox: string;
  adminTitle: string;
  adminCheck: string;
  submit: string;
  // bottom nav
  navBack: string;
  navNext: string;
}

const PANEL_INPUT =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]';
const PANEL_CARD = 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[32px] sm:p-6';
const PANEL_H2 = 'font-display text-2xl font-black text-[var(--dk-navy)] sm:text-3xl';
const PANEL_SECTION_LABEL = 'text-sm font-black uppercase tracking-[0.18em] text-slate-400';
const PANEL_TILE_LABEL = 'text-xs font-black uppercase tracking-[0.18em] text-slate-400';
const PANEL_ERROR_TEXT = 'font-semibold text-[var(--dk-red)]';

const V2_INPUT =
  'h-11 w-full min-w-0 rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 text-sm text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#0F172A] focus:bg-white';
const V2_CARD = 'rounded-[22px] border border-[#E4DCCD] bg-white p-4 sm:p-6';
const V2_SECTION_LABEL = 'text-[12px] font-black uppercase tracking-[0.14em] text-[#5B6474]';
const V2_LEAD = 'mt-2 text-[14.5px] leading-6 text-[#5B6474]';

export const CREATE_LISTING_TONES: Record<CreateListingTone, CreateListingToneSet> = {
  panel: {
    stack: 'space-y-8',
    card: PANEL_CARD,
    successCard: 'rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-[32px] sm:p-8',
    successIcon: 'mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600',
    successTitle: 'mt-5 font-display text-2xl font-black text-[var(--dk-navy)] sm:text-4xl',
    codePill: 'mt-5 inline-flex items-center gap-3 rounded-full bg-slate-50 px-5 py-3 text-lg font-black text-[var(--dk-navy)]',
    copyButton:
      'rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]',
    body: 'mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500',
    primaryPill: 'rounded-full bg-dk-red-strong px-6 py-3 text-sm font-bold text-white',
    ghostPill: 'rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700',
    stepCard: PANEL_CARD,
    stepList: 'flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-5 md:gap-4 md:overflow-visible md:pb-0',
    stepItem: 'flex min-w-[170px] items-center gap-3 md:min-w-0',
    stepDot: 'flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black',
    stepDone: 'border-emerald-200 bg-emerald-50 text-emerald-600',
    stepActive: 'border-amber-300 bg-amber-50 text-[var(--dk-gold)]',
    stepIdle: 'border-slate-200 bg-slate-50 text-slate-400',
    stepTextActive: 'text-[var(--dk-navy)]',
    stepTextIdle: 'text-slate-500',
    stepKicker: 'text-xs font-black uppercase tracking-[0.18em]',
    stepName: 'text-sm font-semibold',
    toast: 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700',
    h2: PANEL_H2,
    lead: 'mt-2 text-sm text-slate-500',
    leadLoose: 'mt-2 text-sm leading-7 text-slate-500',
    catGrid: 'mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    catCard: 'rounded-2xl border bg-white p-4 text-left transition sm:rounded-[28px] sm:p-5',
    catSelected: 'border-[var(--dk-gold)] shadow-lg shadow-amber-100',
    catIdle: 'border-slate-200 hover:border-[var(--dk-gold)] hover:shadow-md',
    catBadge: 'inline-flex rounded-2xl px-3 py-2 text-xs font-bold',
    catCheck: 'inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600',
    catTitle: 'mt-4 font-display text-xl font-black text-[var(--dk-navy)] sm:text-2xl',
    catDesc: 'mt-2 text-sm leading-7 text-slate-500',
    errorLg: `mt-4 text-sm ${PANEL_ERROR_TEXT}`,
    fieldGrid: 'grid gap-5 md:grid-cols-2',
    label: 'mb-2 block text-sm font-bold text-slate-700',
    input: PANEL_INPUT,
    textarea: PANEL_INPUT,
    select: PANEL_INPUT,
    affixWrap: 'flex min-w-0 items-center rounded-2xl border border-slate-200 bg-white',
    affixInput: 'min-w-0 w-full rounded-2xl bg-transparent px-4 py-3 text-sm text-slate-900 outline-none',
    suffix: 'shrink-0 whitespace-nowrap px-3 text-sm font-bold text-slate-500 sm:px-4',
    hint: 'text-slate-400',
    counter: 'font-semibold text-slate-500',
    errorInline: PANEL_ERROR_TEXT,
    error: `mt-2 text-sm ${PANEL_ERROR_TEXT}`,
    sectionRule: 'border-t border-slate-200 pt-5',
    sectionLabel: PANEL_SECTION_LABEL,
    sectionHelp: 'mt-1 text-sm text-slate-500',
    checkRow:
      'flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700',
    checkbox: 'h-4 w-4 rounded border-slate-300 text-[var(--dk-red)]',
    eqRow: 'flex items-center gap-3',
    eqName: 'flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--dk-gold)]',
    eqSelect: 'rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none',
    eqCount: 'w-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--dk-gold)]',
    eqRemove: 'text-slate-400 hover:text-red-500',
    addLink: 'inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--dk-gold)] hover:text-amber-600',
    countChip: 'rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500',
    chip: 'rounded-full border px-3 py-2 text-sm font-bold transition sm:px-4',
    chipOn: 'border-amber-300 bg-amber-50 text-amber-800',
    chipDisabled: 'border-slate-100 bg-slate-50 text-slate-300',
    chipIdle: 'border-slate-200 bg-white text-slate-700 hover:border-amber-300',
    warning:
      'flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800',
    dropzone:
      'mt-6 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-600 sm:flex-row sm:rounded-[28px] sm:px-6 sm:py-10',
    dropIcon: 'h-5 w-5 text-[var(--dk-gold)]',
    photoCount: 'text-sm font-semibold text-slate-500',
    bulkDelete: 'inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white',
    imgGrid: 'mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3',
    imgCard: 'rounded-[24px] border bg-white p-4 shadow-sm',
    imgCardSelected: 'border-rose-300 ring-2 ring-rose-100',
    imgCardIdle: 'border-slate-200',
    imgFrame: 'relative overflow-hidden rounded-2xl bg-slate-100',
    imgName: 'mt-3 text-sm font-semibold text-slate-700',
    imgSaving: 'mt-1 text-xs font-semibold text-emerald-600',
    coverBadge: 'rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-[var(--dk-gold)]',
    miniButton: 'rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600',
    miniDanger: 'rounded-full border border-rose-200 px-3 py-1 text-xs font-bold text-[var(--dk-red)]',
    videoBlock: 'mt-8 border-t border-slate-200 pt-6',
    videoLabel: 'flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-slate-400',
    videoInput:
      'flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]',
    videoClear: 'rounded-2xl border border-slate-200 px-3 text-slate-400 hover:text-slate-700',
    videoFrame: 'mt-4 overflow-hidden rounded-2xl border border-slate-200',
    previewShell: 'mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white sm:rounded-[28px]',
    editLink: 'inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[var(--dk-red)]',
    previewTitle: PANEL_H2,
    previewPrice: 'mt-3 text-xl font-black text-[var(--dk-gold)] sm:text-2xl',
    previewMeta: 'mt-3 text-sm text-slate-500',
    previewDesc: 'mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600',
    box: 'rounded-2xl border border-slate-200 bg-slate-50 p-4',
    tile: 'rounded-2xl bg-white p-4 text-sm',
    tileLabel: PANEL_TILE_LABEL,
    tileValue: 'mt-2 font-semibold text-slate-700',
    conceptTag: 'rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800',
    thumb: 'overflow-hidden rounded-2xl border border-slate-200 bg-white',
    thumbCover: 'px-2 py-1 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--dk-gold)]',
    contactList: 'mt-3 space-y-2 text-sm text-slate-600',
    emptyValue: 'italic text-slate-400',
    adminBox: 'mt-8 rounded-2xl border border-amber-200 bg-amber-50/50 p-5',
    adminTitle: 'flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-amber-700',
    adminCheck: 'flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700',
    submit:
      'mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-dk-red-strong px-6 py-4 text-sm font-bold text-white disabled:opacity-60',
    navBack:
      'min-w-0 rounded-full border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 disabled:opacity-40 sm:px-5',
    navNext: 'min-w-0 rounded-full bg-dk-red-strong px-4 py-3 text-sm font-bold text-white sm:px-5',
  },
  v2: {
    stack: 'space-y-5',
    card: V2_CARD,
    successCard: 'rounded-[22px] border border-[#E4DCCD] bg-white px-4 py-8 sm:p-10',
    successIcon:
      'mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#E4DCCD] bg-[#FBF8F3] text-emerald-700',
    successTitle: 'mt-5 text-[28px] font-black leading-tight tracking-[-0.03em] text-[#0F172A] sm:text-[36px]',
    codePill:
      'mt-5 inline-flex max-w-full items-center gap-3 rounded-full border border-[#E4DCCD] bg-[#FBF8F3] px-5 py-2.5 text-lg font-black tabular-nums text-[#0F172A]',
    copyButton:
      'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E4DCCD] bg-white text-slate-600 transition hover:border-[#0F172A] hover:text-[#0F172A]',
    body: 'mx-auto mt-5 max-w-2xl text-[15px] leading-7 text-[#5B6474]',
    primaryPill:
      'inline-flex min-h-11 items-center justify-center rounded-full bg-dk-red-strong px-6 text-sm font-bold text-white transition hover:bg-dk-red-deep',
    ghostPill:
      'inline-flex min-h-11 items-center justify-center rounded-full border border-[#E4DCCD] bg-white px-6 text-sm font-bold text-[#0F172A] transition hover:border-[#0F172A]',
    stepCard: 'rounded-[22px] border border-[#E4DCCD] bg-white p-4 sm:p-5',
    stepList: 'grid grid-cols-5 gap-2 md:gap-4',
    stepItem: 'flex min-w-0 items-center justify-center gap-3 md:justify-start',
    stepDot:
      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-black tabular-nums md:h-10 md:w-10',
    stepDone: 'border-[#0F172A] bg-[#0F172A] text-white',
    stepActive: 'border-dk-red-strong bg-dk-red-strong text-white',
    stepIdle: 'border-[#E4DCCD] bg-[#FBF8F3] text-slate-500',
    stepTextActive: 'hidden min-w-0 text-[#0F172A] md:block',
    stepTextIdle: 'hidden min-w-0 text-[#5B6474] md:block',
    stepKicker: 'text-[11px] font-black uppercase tracking-[0.14em]',
    stepName: 'truncate text-sm font-bold',
    toast: 'rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800',
    h2: 'text-[22px] font-black leading-tight tracking-[-0.02em] text-[#0F172A] sm:text-[26px]',
    lead: V2_LEAD,
    leadLoose: V2_LEAD,
    catGrid: 'mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
    catCard: 'min-w-0 rounded-[18px] border p-4 text-left transition sm:p-5',
    catSelected: 'border-[#0F172A] bg-[#FBF8F3] ring-1 ring-[#0F172A]',
    catIdle: 'border-[#E4DCCD] bg-white hover:border-[#0F172A]',
    catBadge: 'inline-flex rounded-full px-3 py-1 text-xs font-bold',
    catCheck: 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-white',
    catTitle: 'mt-4 text-[18px] font-black leading-tight tracking-[-0.02em] text-[#0F172A]',
    catDesc: 'mt-2 text-sm leading-6 text-[#5B6474]',
    errorLg: 'mt-4 text-sm font-semibold text-[#BE2F47]',
    fieldGrid: 'grid gap-4 md:grid-cols-2 md:gap-5',
    label: 'mb-1.5 block text-[13.5px] font-bold text-[#0F172A]',
    input: V2_INPUT,
    textarea:
      'w-full min-w-0 rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-3 text-sm leading-6 text-[#0F172A] outline-none transition placeholder:text-slate-400 focus:border-[#0F172A] focus:bg-white',
    select: V2_INPUT,
    affixWrap:
      'flex h-11 min-w-0 items-center rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] transition focus-within:border-[#0F172A] focus-within:bg-white',
    affixInput: 'h-full min-w-0 w-full rounded-xl bg-transparent px-4 text-sm text-[#0F172A] outline-none placeholder:text-slate-400',
    suffix: 'shrink-0 whitespace-nowrap px-3 text-sm font-bold text-[#5B6474] sm:px-4',
    hint: 'text-slate-500',
    counter: 'font-semibold tabular-nums text-[#5B6474]',
    errorInline: 'font-semibold text-[#BE2F47]',
    error: 'mt-1.5 text-sm font-semibold text-[#BE2F47]',
    sectionRule: 'border-t border-[#EFE9DE] pt-5',
    sectionLabel: V2_SECTION_LABEL,
    sectionHelp: 'mt-1 text-sm leading-6 text-[#5B6474]',
    checkRow:
      'flex min-h-11 items-center gap-3 rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-2.5 text-sm font-semibold text-[#0F172A]',
    checkbox: 'h-4 w-4 shrink-0 rounded border-slate-300 accent-[#0F172A]',
    eqRow: 'flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3',
    eqName:
      'h-11 min-w-0 basis-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-3 text-sm text-[#0F172A] outline-none focus:border-[#0F172A] focus:bg-white sm:basis-auto sm:flex-1',
    eqSelect:
      'h-11 min-w-0 flex-1 rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-3 text-sm text-[#0F172A] outline-none focus:border-[#0F172A] sm:flex-none',
    eqCount:
      'h-11 w-20 shrink-0 rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-3 text-sm text-[#0F172A] outline-none focus:border-[#0F172A] focus:bg-white',
    eqRemove:
      'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-[#FBF8F3] hover:text-[#BE2F47]',
    addLink: 'inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-[#BE2F47] transition hover:text-[#0F172A]',
    countChip:
      'self-start rounded-full border border-[#E4DCCD] bg-[#FBF8F3] px-3 py-1 text-xs font-bold tabular-nums text-[#5B6474] sm:self-auto',
    chip: 'min-h-10 rounded-full border px-3.5 py-2 text-sm font-bold transition sm:px-4',
    chipOn: 'border-[#0F172A] bg-[#0F172A] text-white',
    chipDisabled: 'cursor-not-allowed border-[#EFE9DE] bg-[#FBF8F3] text-slate-400',
    chipIdle: 'border-[#E4DCCD] bg-white text-[#0F172A] hover:border-[#0F172A]',
    warning:
      'flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900',
    dropzone:
      'mt-5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[18px] border border-dashed border-[#D8CDB8] bg-[#FBF8F3] px-4 py-8 text-center text-sm font-bold text-[#0F172A] transition hover:border-[#0F172A] sm:flex-row sm:px-6 sm:py-10',
    dropIcon: 'h-5 w-5 text-[#BE2F47]',
    photoCount: 'text-sm font-semibold tabular-nums text-[#5B6474]',
    bulkDelete:
      'inline-flex min-h-10 items-center gap-2 rounded-full border border-[#BE2F47] bg-white px-4 text-xs font-bold text-[#BE2F47] transition hover:bg-[#BE2F47] hover:text-white',
    imgGrid: 'mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3',
    imgCard: 'min-w-0 rounded-[18px] border bg-white p-3 sm:p-4',
    imgCardSelected: 'border-[#BE2F47] ring-2 ring-[#F4B8C3]',
    imgCardIdle: 'border-[#E4DCCD]',
    imgFrame: 'relative overflow-hidden rounded-xl bg-[#EFE9DE]',
    imgName: 'mt-3 truncate text-sm font-semibold text-[#0F172A]',
    imgSaving: 'mt-1 text-xs font-semibold text-emerald-700',
    coverBadge: 'rounded-full bg-[#0F172A] px-3 py-1.5 text-xs font-bold text-white',
    miniButton:
      'min-h-9 rounded-full border border-[#E4DCCD] bg-white px-3 py-1.5 text-xs font-bold text-[#0F172A] transition hover:border-[#0F172A]',
    miniDanger:
      'min-h-9 rounded-full border border-[#F4B8C3] bg-white px-3 py-1.5 text-xs font-bold text-[#BE2F47] transition hover:border-[#BE2F47]',
    videoBlock: 'mt-8 border-t border-[#EFE9DE] pt-6',
    videoLabel: `flex items-center gap-2 ${V2_SECTION_LABEL}`,
    videoInput: `${V2_INPUT} flex-1`,
    videoClear:
      'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E4DCCD] bg-white text-slate-500 transition hover:border-[#0F172A] hover:text-[#0F172A]',
    videoFrame: 'mt-4 overflow-hidden rounded-[18px] border border-[#E4DCCD]',
    previewShell: 'mt-5 overflow-hidden rounded-[18px] border border-[#E4DCCD] bg-white',
    editLink: 'inline-flex min-h-10 items-center gap-2 text-sm font-bold text-[#5B6474] transition hover:text-[#BE2F47]',
    previewTitle: 'break-words text-[24px] font-black leading-tight tracking-[-0.03em] text-[#0F172A] sm:text-[30px]',
    previewPrice: 'mt-3 text-xl font-black tabular-nums text-[#0F172A] sm:text-2xl',
    previewMeta: 'mt-3 text-sm text-[#5B6474]',
    previewDesc: 'mt-5 break-words rounded-xl border border-[#EFE9DE] bg-[#FBF8F3] p-4 text-sm leading-7 text-[#0F172A]',
    box: 'min-w-0 rounded-[18px] border border-[#EFE9DE] bg-[#FBF8F3] p-4',
    tile: 'min-w-0 rounded-xl border border-[#EFE9DE] bg-white p-3.5 text-sm',
    tileLabel: 'text-[11px] font-black uppercase tracking-[0.14em] text-[#5B6474]',
    tileValue: 'mt-1.5 break-words font-semibold text-[#0F172A]',
    conceptTag: 'rounded-full border border-[#E4DCCD] bg-white px-3 py-1 text-xs font-bold text-[#0F172A]',
    thumb: 'overflow-hidden rounded-xl border border-[#E4DCCD] bg-white',
    thumbCover: 'px-2 py-1 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#BE2F47]',
    contactList: 'mt-3 space-y-2 break-words text-sm text-[#5B6474]',
    emptyValue: 'italic text-slate-500',
    adminBox: 'mt-8 rounded-[18px] border border-[#E4DCCD] bg-[#FBF8F3] p-4 sm:p-5',
    adminTitle: `flex items-center gap-2 ${V2_SECTION_LABEL}`,
    adminCheck:
      'flex min-h-11 items-center gap-3 rounded-xl border border-[#E4DCCD] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A]',
    submit:
      'mt-8 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-dk-red-strong px-6 py-3 text-[15px] font-bold text-white transition hover:bg-dk-red-deep disabled:opacity-60',
    navBack:
      'inline-flex min-h-11 min-w-0 items-center rounded-full border border-[#E4DCCD] bg-white px-5 text-sm font-bold text-[#0F172A] transition hover:border-[#0F172A] disabled:opacity-40',
    navNext:
      'inline-flex min-h-11 min-w-0 items-center rounded-full bg-dk-red-strong px-6 text-sm font-bold text-white transition hover:bg-dk-red-deep',
  },
};
