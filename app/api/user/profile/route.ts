import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, memberProfiles } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { getServerMemberSession } from '@/lib/members/server-session';

async function resolveUserId(email: string): Promise<number | null> {
  if (!db) return null;
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return row?.id ?? null;
}

async function resolveMemberProfile(email: string) {
  if (!db) return null;
  const [row] = await db
    .select()
    .from(memberProfiles)
    .where(and(eq(memberProfiles.email, email), isNull(memberProfiles.deletedAt)));
  return row ?? null;
}

function generateSlug(company: string, id: number): string {
  const base = company
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  return `${base}-${id}`;
}

export async function GET() {
  const session = await getServerMemberSession();
  if (!session.loggedIn || !session.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await resolveUserId(session.email);
  if (!userId || !db) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      company: users.company,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId));

  const memberProfile = await resolveMemberProfile(session.email);

  // Real profile-completion %: filled fields / total. Single source of truth so
  // the sidebar bar reflects DB data instead of a hardcoded value.
  const COMPLETION_FIELDS = [
    'company',
    'sector',
    'description',
    'voen',
    'logoUrl',
    'authorizedPerson',
    'position',
    'contactPhone',
    'whatsapp',
    'website',
    'city',
    'district',
    'streetAddress',
    'bio',
    'instagram',
    'linkedin',
  ] as const;
  let profileCompletion = 0;
  if (memberProfile) {
    const mp = memberProfile as Record<string, unknown>;
    const filled = COMPLETION_FIELDS.filter((key) => {
      const value = mp[key];
      return typeof value === 'string' ? value.trim().length > 0 : Boolean(value);
    }).length;
    profileCompletion = Math.round((filled / COMPLETION_FIELDS.length) * 100);
  }

  return NextResponse.json({
    profileCompletion,
    profile: user,
    memberProfile: memberProfile
      ? {
          id: memberProfile.id,
          company: memberProfile.company,
          sector: memberProfile.sector,
          description: memberProfile.description,
          voen: memberProfile.voen,
          logoUrl: memberProfile.logoUrl,
          authorizedPerson: memberProfile.authorizedPerson,
          position: memberProfile.position,
          contactPhone: memberProfile.contactPhone,
          whatsapp: memberProfile.whatsapp,
          website: memberProfile.website,
          city: memberProfile.city,
          district: memberProfile.district,
          streetAddress: memberProfile.streetAddress,
          bio: memberProfile.bio,
          instagram: memberProfile.instagram,
          linkedin: memberProfile.linkedin,
          language: memberProfile.language,
          visibilitySettings: memberProfile.visibilitySettings,
          approvalStatus: memberProfile.approvalStatus,
          rejectionReason: memberProfile.rejectionReason,
          slug: memberProfile.slug,
        }
      : null,
  });
}

const PROFILE_FIELDS = [
  'company',
  'sector',
  'description',
  'voen',
  'logoUrl',
  'authorizedPerson',
  'position',
  'contactPhone',
  'whatsapp',
  'website',
  'city',
  'district',
  'streetAddress',
  'bio',
  'instagram',
  'linkedin',
  'language',
  'visibilitySettings',
] as const;

export async function PATCH(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || !session.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
  }

  const body = await request.json();

  // Update users table (basic fields)
  const userUpdates: Record<string, unknown> = {};
  for (const key of ['name', 'phone', 'company']) {
    if (body[key] !== undefined) {
      userUpdates[key] = String(body[key]).trim() || null;
    }
  }
  if (Object.keys(userUpdates).length > 0) {
    userUpdates.updatedAt = new Date();
    const userId = await resolveUserId(session.email);
    if (userId) {
      await db.update(users).set(userUpdates).where(eq(users.id, userId));
    }
  }

  // Update memberProfiles table (extended fields)
  const profileUpdates: Record<string, unknown> = {};
  for (const key of PROFILE_FIELDS) {
    if (body[key] !== undefined) {
      if (key === 'visibilitySettings') {
        profileUpdates[key] = body[key];
      } else {
        profileUpdates[key] = typeof body[key] === 'string' ? body[key].trim() || null : body[key];
      }
    }
  }

  if (Object.keys(profileUpdates).length > 0) {
    const existing = await resolveMemberProfile(session.email);

    if (existing) {
      profileUpdates.updatedAt = new Date();

      // If submitting for review: change status draft→submitted
      if (body.submitForReview && existing.approvalStatus === 'draft') {
        profileUpdates.approvalStatus = 'submitted';
      }
      // If profile was rejected and user re-edits, reset to draft
      if (existing.approvalStatus === 'rejected') {
        profileUpdates.approvalStatus = 'draft';
      }

      // Auto-generate slug if company is set and slug is empty
      if (profileUpdates.company && !existing.slug) {
        profileUpdates.slug = generateSlug(String(profileUpdates.company), existing.id);
      }

      await db.update(memberProfiles).set(profileUpdates).where(eq(memberProfiles.id, existing.id));
    } else {
      // Create new memberProfile row if not exists
      const newProfile = {
        email: session.email,
        fullName: body.name || session.name || null,
        ...profileUpdates,
        approvalStatus: body.submitForReview ? 'submitted' : 'draft',
      };
      const [inserted] = await db
        .insert(memberProfiles)
        .values(newProfile)
        .returning({ id: memberProfiles.id });
      if (inserted && profileUpdates.company) {
        const slug = generateSlug(String(profileUpdates.company), inserted.id);
        await db.update(memberProfiles).set({ slug }).where(eq(memberProfiles.id, inserted.id));
      }
    }
  }

  // Handle explicit submit action
  if (body.submitForReview && Object.keys(profileUpdates).length === 0) {
    const existing = await resolveMemberProfile(session.email);
    if (
      existing &&
      (existing.approvalStatus === 'draft' || existing.approvalStatus === 'rejected')
    ) {
      await db
        .update(memberProfiles)
        .set({ approvalStatus: 'submitted', updatedAt: new Date() })
        .where(eq(memberProfiles.id, existing.id));
    }
  }

  return NextResponse.json({ ok: true });
}
