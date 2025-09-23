import { compare, hash } from 'bcrypt';

const PASSWORD_SALT_ROUNDS = parseInt('3', 10);

export function hashPassword(password: string) {
  return hash(password, PASSWORD_SALT_ROUNDS);
}

export function verifyPassword(password: string, ecryptedPassword: string) {
  return compare(password, ecryptedPassword);
}
