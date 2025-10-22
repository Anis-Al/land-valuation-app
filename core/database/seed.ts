import { hashPassword } from '@core/utils/password';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {  properties, users } from './schema';
import { dbCredentials } from './config';
import { loadCSVFromFile } from '@core/utils';
import { join } from 'path';
import fs from 'fs/promises';
import { parseBigInt, parseDate, parseLocation } from '@core/processor/utils';
import chunk from 'lodash/chunk';

const SAMPLE_DATA_FOLDER = 'sample-data';
const PROPERTIES_ZILLOW_OREGON = join(SAMPLE_DATA_FOLDER, 'zillow-oregon.csv');

async function addUsers(db: PostgresJsDatabase) {
  const result = await db
    .insert(users)
    .values([
      {
        profile: {
          firstName: process.env.ADMIN_PROFIL
            ? JSON.parse(process.env.ADMIN_PROFIL).firstName
            : 'Admin',
          lastName: process.env.ADMIN_PROFIL
            ? JSON.parse(process.env.ADMIN_PROFIL).lastName
            : 'User',   
        },
        auth: {
          username: process.env.ADMIN_EMAIL || 'admin@gmail.com',
          password: await hashPassword(process.env.ADMIN_PASSWORD || 'admin123)')
        },
      },
    ])
    .returning({ id: users.id });

  return result.map((r) => r.id);
}

async function importProperties(db: PostgresJsDatabase, filepath: string) {
  const props = await loadCSVFromFile(filepath);

  const rows = props.map((p) => ({
    source: p['source'],
    state: p['state'],
    county: p['county'],
    id: p['id'],
    acres: parseFloat(p['acres']),
    lastUpdated: parseDate(p['last_updated']),
    url: p['url'],
    location: parseLocation(p['lng'], p['lat']),
    salesPrice: parseBigInt(p['sales_price']),
    salesDate: parseDate(p['sales_date']),
    addressLine1: p['address_line_1'],
    addressCity: p['address_city'],
    addressState: p['address_state'],
    addressZip: p['address_zip'],
    timestamp: parseDate(p['timestamp']),
  }));

  for (const items of chunk(rows, 100)) {
    await db.insert(properties).values(items);
  }
}

async function addProperties(db: PostgresJsDatabase) {
  const filepaths = [PROPERTIES_ZILLOW_OREGON];

  for (const filepath of filepaths) {
    try {
      await fs.access(filepath);
      await importProperties(db, filepath);
    } catch {
      throw 'failed to import properties';
    }
  }
}



async function main() {
  const db = drizzle({ connection: dbCredentials });
  await db.execute(
    'TRUNCATE sessions,users,land_valuation_requests,properties'
  );
  await addUsers(db);
  await addProperties(db);
  process.exit(0);
}
main();
