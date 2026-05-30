import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { type PriorityKey, PRIORITY_KEYS, isValidPriorityKey } from '@/lib/data/priorities';

export async function getUserPriorities(userId: number): Promise<PriorityKey[] | null> {
  const [row] = await db.select({ priorities: users.priorities }).from(users).where(eq(users.id, userId));
  if (!row?.priorities) return null;
  return row.priorities.filter(isValidPriorityKey);
}

export async function setUserPriorities(userId: number, keys: PriorityKey[]): Promise<void> {
  if (!Array.isArray(keys) || keys.length < 1 || keys.length > 3) {
    throw new Error('INVALID_COUNT');
  }

  const unique = [...new Set(keys)];
  if (unique.length !== keys.length) {
    throw new Error('DUPLICATE_KEY');
  }

  for (const key of keys) {
    if (!PRIORITY_KEYS.includes(key)) {
      throw new Error('INVALID_KEY');
    }
  }

  await db.update(users).set({ priorities: keys }).where(eq(users.id, userId));
}
