import { hashPassword } from '@core/utils/password';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { landValuationRequests, properties, users } from './schema';
import { dbCredentials } from './config';
import type { LandValuationRequestInput } from '@core/lvr';
import { DEFAULT_COLUMN_MAPPING } from '@core/processor';
import { compressCSV, loadCSVFromFile } from '@core/utils';
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

//dev only
const RAW_FILE_BASENAME = 'test-dataset';
const RAW_FILE = join(SAMPLE_DATA_FOLDER, `${RAW_FILE_BASENAME}.csv`);
const OUTPUT_FILE = join(SAMPLE_DATA_FOLDER, `${RAW_FILE_BASENAME}.output.csv`);

async function addLandValuationRequests(
  db: PostgresJsDatabase,
  createdBy: string
) {
  try {
    await fs.access(RAW_FILE);
    await fs.access(OUTPUT_FILE);

    const rawCSVContents = await fs.readFile(RAW_FILE, { encoding: 'utf-8' });

    const rawContents = await compressCSV(rawCSVContents);

    const outputContents = await compressCSV(
      await fs.readFile(OUTPUT_FILE, { encoding: 'utf-8' })
    );

    await db.insert(landValuationRequests).values([
      {
        status: 'Draft',
        fileName: `${RAW_FILE_BASENAME}.csv`,
        fileSize: rawCSVContents.length,
        rawContents,
        createdBy,
        createdAt: new Date(),
      },
      {
        status: 'Complete',
        fileName: `${RAW_FILE_BASENAME}.csv`,
        fileSize: rawCSVContents.length,
        columnMapping: DEFAULT_COLUMN_MAPPING,
        rawContents,
        outputContents,
        createdBy,
        createdAt: new Date(),
        processingAt: new Date(),
        completedAt: new Date(),
      },
    ] as LandValuationRequestInput[]);
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  const db = drizzle({ connection: dbCredentials });
  await db.execute(
    'TRUNCATE sessions,users,land_valuation_requests,properties'
  );
  const [anis] = await addUsers(db);
  await addProperties(db);
  for (let i = 0; i < 5; i++) {
    await addLandValuationRequests(db, anis);
  }
  process.exit(0);
}
main();
