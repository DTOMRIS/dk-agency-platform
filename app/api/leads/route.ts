/**
 * @file app/api/leads/route.ts
 * @description Lead capture endpoint — saves lead data to DB and sends notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { listingLeads } from '@/lib/db/schema';
import { emailTemplates, sendEmail } from '@/lib/email/templates';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { listingId, listingOwnerId, name, email, phone, message } = body;

    if (!listingId || !name || !email) {
      return NextResponse.json(
        { success: false, error: 'Zəruri məlumat eksik.' },
        { status: 400 },
      );
    }

    if (!dbAvailable || !db) {
      console.log('lead_create_mock', { listingId, name, email });
      return NextResponse.json(
        { success: true, source: 'mock', data: { id: Date.now(), listingId, name } },
        { status: 201 },
      );
    }

    // Save lead to database
    const inserted = await db
      .insert(listingLeads)
      .values({
        listingId: Number(listingId),
        name,
        email,
        phone: phone || null,
        message: message || null,
        status: 'new',
      })
      .returning({ id: listingLeads.id });

    const lead = inserted[0];

    // Send confirmation email to buyer
    const confirmationTemplate = emailTemplates.leadConfirmation(name);
    await sendEmail(email, confirmationTemplate);

    // TODO: Send notification to listing owner
    // await sendEmail(listingOwnerEmail, emailTemplates.newLead(...))

    return NextResponse.json(
      { success: true, source: 'db', data: lead, message: 'Lead kaydə alındı. Təşəkkür edirik!' },
      { status: 201 },
    );
  } catch (error) {
    console.error('[API leads]', error);
    return NextResponse.json(
      { success: false, error: 'Xəta baş verdi.' },
      { status: 500 },
    );
  }
}
