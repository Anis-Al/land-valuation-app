import { db, sessions } from '@core/database';
import { eq } from 'drizzle-orm';
import { type CreateSessionInput, type UpdateSessionInput } from './model';

export async function createSession(input: CreateSessionInput) {
  const [{ id }] = await db
    .insert(sessions)
    .values(input)
    .returning({ id: sessions.id });

  return id;
}

export async function findSession(sessionId: string) {
  const result = await db
    .select({
      id: sessions.id,
      data: sessions.data,
    })
    .from(sessions)
    .where(eq(sessions.id, sessionId));

  return result.length > 0 ? result[0] : null;
}

export async function updateSession(
  sessionId: string,
  input: UpdateSessionInput
) {
  await db.update(sessions).set(input).where(eq(sessions.id, sessionId));
}

export async function deleteSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}
