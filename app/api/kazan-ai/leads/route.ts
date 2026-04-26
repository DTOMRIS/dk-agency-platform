import { NextRequest, NextResponse } from 'next/server';
import { canAccessNewsAdmin } from '@/lib/news/admin-access';
import {
  createKazanLead,
  detectKazanIntent,
  getKazanLeads,
  normalizeBusinessType,
  normalizeIntent,
  normalizeStatus,
  updateKazanLead,
  type KazanLeadConversation,
} from '@/lib/repositories/kazanLeadRepository';
import { buildWhatsappLink } from '@/lib/utils/whatsapp';

type LeadPostBody = {
  name?: string;
  phone?: string;
  email?: string;
  businessType?: string;
  conversationContext?: KazanLeadConversation;
  intent?: string;
};

type LeadPatchBody = {
  id?: string;
  whatsappHandoff?: boolean;
  meetingRequested?: boolean;
  status?: string;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function normalizeConversation(value: unknown): KazanLeadConversation {
  if (!Array.isArray(value)) return [];
  return value
    .filter((message) => message && typeof message === 'object')
    .map((message) => {
      const item = message as { role?: unknown; content?: unknown };
      const role = item.role === 'assistant' ? 'assistant' : 'user';
      return {
        role,
        content: cleanText(item.content, 1000),
      };
    })
    .filter((message) => message.content)
    .slice(-3);
}

function lastUserMessages(messages: KazanLeadConversation) {
  return messages
    .filter((message) => message.role === 'user')
    .map((message) => message.content)
    .slice(-3)
    .reverse();
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as LeadPostBody;
    const name = cleanText(body.name, 150);
    const phone = cleanText(body.phone, 30);
    const email = cleanText(body.email, 255);
    const conversationContext = normalizeConversation(body.conversationContext);
    const intentSeed = cleanText(body.intent, 50) || conversationContext.map((message) => message.content).join(' ');

    if (!name || !phone) {
      return NextResponse.json({ error: 'Ad və telefon məcburidir.' }, { status: 400 });
    }

    const businessType = normalizeBusinessType(cleanText(body.businessType, 50));
    const intent = cleanText(body.intent, 50) ? normalizeIntent(cleanText(body.intent, 50)) : detectKazanIntent(intentSeed);

    const lead = await createKazanLead({
      name,
      phone,
      email: email || undefined,
      businessType,
      conversationContext,
      intent,
    });

    // Admin notification (fire-and-forget)
    import('@/lib/email/templates').then(({ emailTemplates, sendEmail }) => {
      const adminEmail = process.env.ADMIN_EMAIL || 'info@dkagency.az';
      sendEmail(adminEmail, emailTemplates.kazanLeadAdmin(name, phone, businessType, intent)).catch(() => {});
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      data: lead,
      whatsappUrl: buildWhatsappLink(lead, lastUserMessages(conversationContext)),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'KAZAN lead yaradılmadı.',
        details: String(error),
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as LeadPatchBody;
    const id = cleanText(body.id, 80);
    if (!id) {
      return NextResponse.json({ error: 'Lead id məcburidir.' }, { status: 400 });
    }

    const lead = await updateKazanLead({
      id,
      whatsappHandoff: typeof body.whatsappHandoff === 'boolean' ? body.whatsappHandoff : undefined,
      meetingRequested: typeof body.meetingRequested === 'boolean' ? body.meetingRequested : undefined,
      status: body.status ? normalizeStatus(body.status) : undefined,
    });

    return NextResponse.json({ success: true, data: lead });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'KAZAN lead yenilənmədi.',
        details: String(error),
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const auth = await canAccessNewsAdmin(request);
  if (!auth.allowed) {
    return NextResponse.json({ error: 'Admin giriş tələb olunur.' }, { status: 401 });
  }

  const leads = await getKazanLeads({
    status: request.nextUrl.searchParams.get('status'),
    intent: request.nextUrl.searchParams.get('intent'),
    businessType: request.nextUrl.searchParams.get('businessType'),
  });

  return NextResponse.json({ success: true, data: leads });
}
