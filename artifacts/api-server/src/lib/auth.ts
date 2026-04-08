import { pbkdf2Sync, randomBytes } from 'crypto';

export function generateSalt(): string {
  return randomBytes(16).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
  return pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, salt: string, hash: string): boolean {
  return hashPassword(password, salt) === hash;
}

export function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

export const SESSION_TTL_HOURS = 24 * 7; // 7 days
