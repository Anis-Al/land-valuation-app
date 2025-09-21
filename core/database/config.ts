import { envF, envNF } from '@core/utils';

const DB_USER = envF('DB_USER');
const DB_PASSWORD = envF('DB_PASSWORD');
const DB_DATABASE = envF('DB_DATABASE');
const DB_HOST = envF('DB_HOST');
const DB_PORT = envNF('DB_PORT');

export const dbCredentials = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
};
