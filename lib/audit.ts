import { db } from '@/lib/db';
import { adminAuditLogs } from '@/lib/db/schema';

export type AuditAction =
  | 'member.created'
  | 'member.role_changed'
  | 'member.deleted'
  | 'member.password_reset';

interface WriteAuditParams {
  adminId: number;
  adminEmail: string;
  action: AuditAction;
  targetUserId?: number;
  targetEmail?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Write immutable audit log entry.
 * OWASP 2025: never log passwords, tokens, or credentials in metadata.
 * Fire-and-forget: audit failure should not block the main operation.
 */
export async function writeAuditLog(params: WriteAuditParams): Promise<void> {
  if (!db) return;
  try {
    await db.insert(adminAuditLogs).values({
      adminId: params.adminId,
      adminEmail: params.adminEmail,
      action: params.action,
      targetUserId: params.targetUserId ?? null,
      targetEmail: params.targetEmail ?? null,
      metadata: params.metadata ?? null,
    });
  } catch (err) {
    // Audit write failure must not crash the main operation
    console.error('[audit] Failed to write audit log:', err);
  }
}
