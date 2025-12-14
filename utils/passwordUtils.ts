
import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Bcrypt hash of the password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  const hash = await bcrypt.hash(password, saltRounds);
  return hash;
}

/**
 * Verify a password against a stored bcrypt hash
 * @param password Plain text password to verify
 * @param storedHash Stored password hash
 * @returns True if password matches
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const isMatch = await bcrypt.compare(password, storedHash);
  return isMatch;
}
