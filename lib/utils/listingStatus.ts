export type ListingWorkflowStatus =
  | 'submitted'
  | 'ai_checked'
  | 'committee_review'
  | 'shortlisted'
  | 'docs_requested'
  | 'showcase_ready'
  | 'rejected';

export const LISTING_STATUSES = {
  submitted: { label: 'Göndərilib', color: 'gray', icon: 'Clock' },
  ai_checked: { label: 'AI Yoxlanılıb', color: 'blue', icon: 'Bot' },
  committee_review: { label: 'İncələnir', color: 'yellow', icon: 'Eye' },
  shortlisted: { label: 'Qısa siyahıda', color: 'purple', icon: 'Star' },
  docs_requested: { label: 'Sənəd İstənib', color: 'orange', icon: 'FileText' },
  showcase_ready: { label: 'Vitrində', color: 'green', icon: 'CheckCircle' },
  rejected: { label: 'Rədd edilib', color: 'red', icon: 'XCircle' },
} satisfies Record<ListingWorkflowStatus, { label: string; color: string; icon: string }>;

export const ALLOWED_TRANSITIONS: Record<ListingWorkflowStatus, ListingWorkflowStatus[]> = {
  submitted: ['committee_review', 'rejected'],
  ai_checked: ['committee_review', 'rejected'],
  committee_review: ['showcase_ready', 'docs_requested', 'shortlisted', 'rejected'],
  shortlisted: ['showcase_ready', 'docs_requested', 'rejected'],
  docs_requested: ['committee_review', 'rejected'],
  showcase_ready: ['rejected'],
  rejected: ['committee_review'],
};

const COLOR_MAP: Record<string, string> = {
  gray: 'bg-slate-100 text-slate-700 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  red: 'bg-rose-50 text-rose-700 border-rose-200',
};

export function getStatusBadge(status: ListingWorkflowStatus) {
  const meta = LISTING_STATUSES[status];
  return {
    label: meta.label,
    icon: meta.icon,
    color: COLOR_MAP[meta.color] ?? COLOR_MAP.gray,
  };
}

export function canTransition(from: ListingWorkflowStatus, to: ListingWorkflowStatus) {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function getAvailableTransitions(from: ListingWorkflowStatus) {
  return ALLOWED_TRANSITIONS[from].map((value) => ({
    value,
    label: LISTING_STATUSES[value].label,
  }));
}
