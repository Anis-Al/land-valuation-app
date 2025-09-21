import { drizzle } from 'drizzle-orm/postgres-js';
import { dbCredentials } from './config';

export const db = drizzle({ connection: dbCredentials });
