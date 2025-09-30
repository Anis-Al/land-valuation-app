import { hashPassword } from '@core/utils/password';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { users } from './schema';
import { dbCredentials } from './config';

async function addUsers(db: PostgresJsDatabase) {
  const result = await db
    .insert(users)
    .values([
      {
        profile: {
          firstName: 'Anis',
          lastName: 'Alim',
        },
        auth: {
          username: 'anis.al@gmail.com',
          password: await hashPassword('anis'),
        },
      },
    ])
    .returning({ id: users.id });

  return result;
}
async function main() {
  const db = drizzle({ connection: dbCredentials });
  await db.execute(
    'TRUNCATE sessions,users,land_valuation_requests,properties'
  );
  await addUsers(db);
  process.exit(0);
}
main();
