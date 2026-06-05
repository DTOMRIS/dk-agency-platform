'use client';

import { trackEvent } from './yandex-metrica';

export type SektorEventAction =
  | 'view'
  | 'cta_test'
  | 'cta_roi'
  | 'cta_whatsapp'
  | 'lead_submitted'
  | 'faq_open'
  | 'footer_cta_click';

const ICON_ACTION_MAP: Record<string, SektorEventAction> = {
  quiz: 'cta_test',
  calculator: 'cta_roi',
  whatsapp: 'cta_whatsapp',
};

export interface SektorEventParams {
  sektor: string;
  action: SektorEventAction;
  label?: string;
  faqIndex?: number;
}

export function trackSektorEvent({ sektor, action, label, faqIndex }: SektorEventParams): void {
  const eventName = `sektor_${sektor}_${action}`;
  trackEvent(eventName, {
    sektor,
    label,
    faqIndex,
    path: typeof window !== 'undefined' ? window.location.pathname : undefined,
  });
}

export function iconToAction(icon: string): SektorEventAction {
  return ICON_ACTION_MAP[icon] ?? 'cta_test';
}
