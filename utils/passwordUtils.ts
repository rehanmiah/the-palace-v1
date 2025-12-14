
import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Bcrypt hash of the password
 */
export async function hashPassword(password: string): Promise<string> {
  // Ensure password is a string and not empty
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  // Trim any whitespace
  const trimmedPassword = password.trim();
  
  if (trimmedPassword.length === 0) {
    throw new Error('Password cannot be empty');
  }

  try {
    const saltRounds = 10;
    // Generate salt and hash in one step
    const hash = await bcrypt.hash(trimmedPassword, saltRounds);
    return hash;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Verify a password against a stored bcrypt hash
 * @param password Plain text password to verify
 * @param storedHash Stored password hash
 * @returns True if password matches
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Ensure both password and hash are strings
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  if (!storedHash || typeof storedHash !== 'string') {
    throw new Error('Stored hash must be a non-empty string');
  }

  try {
    const isMatch = await bcrypt.compare(password.trim(), storedHash);
    return isMatch;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}
