import { db, users } from '@core/database';
import { idString } from '@core/utils';
import { eq, sql } from 'drizzle-orm';
import first from 'lodash/first';

export async function findUserByUsername(username: string) {
  const result = await db
    .select({
      id: users.id,
      auth: users.auth,
    })
    .from(users)
    .where(eq(sql`${users.auth}->>'username'`, idString(username)));

  return first(result);
}

export async function findUserById(userId: string) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, idString(userId)));

  return first(result);
}
