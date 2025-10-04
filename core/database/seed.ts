import { hashPassword } from '@core/utils/password';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { landValuationRequests, users } from './schema';
import { dbCredentials } from './config';
import type { LandValuationRequestInput } from '@core/lvr';
import { DEFAULT_COLUMN_MAPPING } from '@core/processor';
import { compressCSV } from '@core/utils';
import { join } from 'path';
import fs from 'fs/promises';

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

//dev only
const RAW_FILE_BASENAME = 'test-dataset';
const SAMPLE_DATA_FOLDER = 'sample-data';
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
        fileName: `${RAW_FILE_BASENAME}.output.csv`,
        fileSize: outputContents.length,
        columnMapping: DEFAULT_COLUMN_MAPPING,
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
  await addLandValuationRequests(db, anis);
  process.exit(0);
}
main();
