import { LAND_VALUATION_REQUEST_STATUSES } from '@core/lvr/model';
import type { UserAuth, UserProfile } from '@core/user';
import { sql } from 'drizzle-orm';
import {
  pgTable,
  jsonb,
  uuid,
  timestamp,
  uniqueIndex,
  customType,
  bigint,
  doublePrecision,
  geometry,
  index,
  varchar,
  pgEnum,
  integer,
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

export const properties = pgTable(
  'properties',
  {
    source: varchar('source', { length: 50 }),
    state: varchar('state', { length: 50 }),
    county: varchar('county', { length: 50 }),
    id: varchar('id', { length: 50 }),
    acres: doublePrecision('acres'),
    lastUpdated: timestamp('lastUpdated'),
    url: varchar('url', { length: 1024 }),
    location: geometry('location', { type: 'point', srid: 4326 }),
    salesPrice: bigint('sales_price', { mode: 'bigint' }),
    salesDate: timestamp('sales_date'),
    addressLine1: varchar('address_line_1', { length: 512 }),
    addressCity: varchar('address_city', { length: 50 }),
    addressState: varchar('address_state', { length: 50 }),
    addressZip: varchar('address_zip', { length: 10 }),
    timestamp: timestamp('timestamp'),
  },
  (t) => [index('properties_location_ids').using('gist', t.location)]
);

const blob = customType<{
  data: Buffer;
  default: false;
}>({
  dataType() {
    return 'bytea';
  },
});
export const status = pgEnum('status', LAND_VALUATION_REQUEST_STATUSES);

export const landValuationRequests = pgTable('land_valuation_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: status('status').notNull().default('Draft'),
  fileName: varchar('file_name', { length: 1024 }),
  fileSize: integer('file_size'),
  columnMapping: jsonb('column_mapping'),
  result: jsonb('result'),
  rawContents: blob('raw_contents'),
  outputContents: blob('output_contents'),
  refinedContents: blob('refined_contents'),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  processingAt: timestamp('processing_at'),
  completedAt: timestamp('completed_at'),
});
