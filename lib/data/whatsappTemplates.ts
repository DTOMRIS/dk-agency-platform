/** WhatsApp Template Paketi — SSOT with freemium tier */

export type TemplateTier = 'free' | 'gated';
export type TemplateCategory = 'arrival' | 'pricing' | 'checkInOut' | 'review' | 'loyalty' | 'inquiry';

export type TemplateScenario = {
  id: string;
  category: TemplateCategory;
  tier: TemplateTier;
  titleKey: string;
  descriptionKey: string;
  copyKey: string;
  requiredVars: string[];
};

export const WHATSAPP_TEMPLATES: TemplateScenario[] = [
  { id: 'first-arrival', category: 'arrival', tier: 'free', titleKey: 'whatsappTemplates.scenarios.firstArrival.title', descriptionKey: 'whatsappTemplates.scenarios.firstArrival.description', copyKey: 'whatsappTemplates.scenarios.firstArrival.copy', requiredVars: ['hostName', 'guestName', 'checkInDate', 'wifiPassword'] },
  { id: 'check-in-instructions', category: 'checkInOut', tier: 'free', titleKey: 'whatsappTemplates.scenarios.checkInInstructions.title', descriptionKey: 'whatsappTemplates.scenarios.checkInInstructions.description', copyKey: 'whatsappTemplates.scenarios.checkInInstructions.copy', requiredVars: ['checkInTime', 'keyLocation', 'wifiPassword', 'breakfastTime'] },
  { id: 'positive-review-thanks', category: 'review', tier: 'free', titleKey: 'whatsappTemplates.scenarios.positiveReviewThanks.title', descriptionKey: 'whatsappTemplates.scenarios.positiveReviewThanks.description', copyKey: 'whatsappTemplates.scenarios.positiveReviewThanks.copy', requiredVars: ['guestName', 'specificMoment'] },
  { id: 'direct-booking-offer', category: 'pricing', tier: 'gated', titleKey: 'whatsappTemplates.scenarios.directBookingOffer.title', descriptionKey: 'whatsappTemplates.scenarios.directBookingOffer.description', copyKey: 'whatsappTemplates.scenarios.directBookingOffer.copy', requiredVars: ['guestName', 'bookingPrice', 'directPrice', 'discountPercent'] },
  { id: 'negative-review-response', category: 'review', tier: 'gated', titleKey: 'whatsappTemplates.scenarios.negativeReviewResponse.title', descriptionKey: 'whatsappTemplates.scenarios.negativeReviewResponse.description', copyKey: 'whatsappTemplates.scenarios.negativeReviewResponse.copy', requiredVars: ['guestName', 'specificIssue'] },
  { id: 'seasonal-promo', category: 'pricing', tier: 'gated', titleKey: 'whatsappTemplates.scenarios.seasonalPromo.title', descriptionKey: 'whatsappTemplates.scenarios.seasonalPromo.description', copyKey: 'whatsappTemplates.scenarios.seasonalPromo.copy', requiredVars: ['seasonName', 'discountPercent', 'validUntilDate'] },
  { id: 'price-inquiry-response', category: 'inquiry', tier: 'gated', titleKey: 'whatsappTemplates.scenarios.priceInquiry.title', descriptionKey: 'whatsappTemplates.scenarios.priceInquiry.description', copyKey: 'whatsappTemplates.scenarios.priceInquiry.copy', requiredVars: ['nightlyPrice', 'includesBreakfast'] },
  { id: 'availability-inquiry', category: 'inquiry', tier: 'gated', titleKey: 'whatsappTemplates.scenarios.availabilityInquiry.title', descriptionKey: 'whatsappTemplates.scenarios.availabilityInquiry.description', copyKey: 'whatsappTemplates.scenarios.availabilityInquiry.copy', requiredVars: [] },
  { id: 'check-out-reminder', category: 'checkInOut', tier: 'gated', titleKey: 'whatsappTemplates.scenarios.checkOutReminder.title', descriptionKey: 'whatsappTemplates.scenarios.checkOutReminder.description', copyKey: 'whatsappTemplates.scenarios.checkOutReminder.copy', requiredVars: ['guestName', 'checkOutTime'] },
  { id: 'loyalty-vip-offer', category: 'loyalty', tier: 'gated', titleKey: 'whatsappTemplates.scenarios.loyaltyVipOffer.title', descriptionKey: 'whatsappTemplates.scenarios.loyaltyVipOffer.description', copyKey: 'whatsappTemplates.scenarios.loyaltyVipOffer.copy', requiredVars: ['guestName', 'loyaltyTier', 'specialDiscount'] },
];

export function getFreeTemplates() { return WHATSAPP_TEMPLATES.filter(t => t.tier === 'free'); }
export function getGatedTemplates() { return WHATSAPP_TEMPLATES.filter(t => t.tier === 'gated'); }

export function substituteTemplateVars(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const v = vars[key];
    return v !== undefined ? String(v) : `{{${key}}}`;
  });
}
