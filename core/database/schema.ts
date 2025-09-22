import type { UserAuth, UserProfile } from '@core/user';
import { sql } from 'drizzle-orm';
import {
  pgTable,
  jsonb,
  uuid,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    deleted: timestamp('deleted'),
    profile: jsonb('profile').notNull().$type<UserProfile>(),
    auth: jsonb('auth').notNull().$type<UserAuth>(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
  },
  () => [uniqueIndex('users_username_key').on(sql`(auth->>'username')`)]
);
export const sessions = pgTable('sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  expires: timestamp('expires'),
  data: jsonb('data'),
  createdAt: timestamp('created_at').defaultNow(),
});
