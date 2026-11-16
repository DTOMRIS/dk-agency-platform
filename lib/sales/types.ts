import type { SalesFollowup } from './followup';
export type SalesLead = {
  id: string; name: string; phone: string; email: string | null; businessType: string; intent: string; status: string;
  conversationContext: Array<{ role: string; content: string }> | null;
  notes: Array<{ at: string; text: string }> | null; leadScore: number | null;
  createdAt: string; whatsappHandoff: boolean; meetingRequested: boolean; sales: SalesFollowup;
};
