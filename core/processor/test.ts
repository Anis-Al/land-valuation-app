import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { dbCredentials } from '../database/config';
import { join } from 'path';
import { parseBigInt, parseDate, parseLocation } from './utils';
import { properties } from '@core/database';
import chunk from 'lodash/chunk';
import { run } from '.';
import fs from 'fs/promises';
import { dumpCSV, loadCSVFromFile } from '@core/utils';
import {
  DEFAULT_PROCESS_OPTIONS,
  MATCHING_STRATEGIES,
  type LandValuationResult,
} from './model';

const INPUT_FILE = 'test-dataset.csv';
const PROPERTIES_FILE_ZILLOW = 'zillow-oregon.csv';

async function importProperties(db: PostgresJsDatabase, filename: string) {
  const props = await loadCSVFromFile(join('sample-data', filename));

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

async function main() {
  const db = drizzle({ connection: dbCredentials });
  await db.execute('TRUNCATE properties');
  await importProperties(db, PROPERTIES_FILE_ZILLOW);

  const contents = await fs.readFile(join('sample-data', INPUT_FILE), {
    encoding: 'utf8',
  });

  const result = await run(contents, db, DEFAULT_PROCESS_OPTIONS);

  await fs.writeFile(
    join('sample-data', INPUT_FILE.replace(/\.csv$/gi, '.output.csv')),
    dumpCSV(result.output)
  );

  console.log(`Total: ${result.total}`);
  console.log(`Success: ${result.success}`);
  console.log(`Error: ${result.error}`);

  MATCHING_STRATEGIES.forEach((m) =>
    console.log(`Matching Strategy ${m}: ${result.matchingStrategy[m]}`)
  );

  process.exit();
}

main();
