import isEmpty from 'lodash/isEmpty';
import trim from 'lodash/trim';
import { logger } from './logger';

let p: NodeJS.Process | undefined = undefined;

try {
  p = process;
} catch {
  // Ignore
}

export function requireEnv(
  name: string,
  defaultValue: string = '',
  fail: boolean = false
) {
  if (!p) {
    return defaultValue;
  }

  const value = p.env[name];

  if (isEmpty(value) || typeof value !== 'string' || trim(value).length === 0) {
    if (fail) {
      logger.fatal(`Environment variable ${name} is required`);
      p.exit(1);
    } else {
      logger.warn(`Please set the ${name} environment variable`);
    }

    return defaultValue;
  } else return trim(value);
}

/**
 * Returns a string from an environment variable
 *
 * @param name Name of the environment variable
 * @param defaultValue Default value to return if the environment variable isn't found
 * @returns The environment variable
 */
export function env(name: string, defaultValue: string) {
  if (!p) {
    return defaultValue;
  }

  const value = p.env[name];

  if (isEmpty(value) || typeof value !== 'string' || trim(value).length === 0) {
    logger.warn(`Please set the ${name} environment variable`);

    return defaultValue;
  } else return trim(value);
}

/**
 * Returns a number from an environment variable
 *
 * @param name Name of the environment variable
 * @param defaultValue Default value to return if the environment variable isn't found
 * @returns The environment variable
 */
export function envN(name: string, defaultValue: number) {
  if (!p) {
    return defaultValue;
  }

  const value = p.env[name];

  if (isEmpty(value) || typeof value !== 'string' || trim(value).length === 0) {
    logger.warn(`Please set the ${name} environment variable`);

    return defaultValue;
  } else return parseInt(trim(value), 10);
}

/**
 * Returns a string from an environment variable or fails the process if the variable isn't found
 *
 * @param name Name of the environment variable
 * @returns The environment variable
 */
export function envF(name: string): string {
  if (!p) {
    return '';
  }

  const value = p.env[name];

  if (isEmpty(value) || typeof value !== 'string' || trim(value).length === 0) {
    logger.fatal(`Environment variable ${name} is required`);
    p.exit(1);
    return '';
  } else {
    return trim(value)!;
  }
}

/**
 * Returns a number from an environment variable or fails the process if the variable isn't found
 *
 * @param name Name of the environment variable
 * @returns The environment variable
 */
export function envNF(name: string): number {
  if (!p) {
    return 0;
  }

  const value = p.env[name];

  if (isEmpty(value) || typeof value !== 'string' || trim(value).length === 0) {
    logger.fatal(`Environment variable ${name} is required`);
    p.exit(1);
    return 0;
  } else {
    return parseInt(trim(value));
  }
}
