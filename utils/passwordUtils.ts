
import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Bcrypt hash of the password
 */
export async function hashPassword(password: string): Promise<string> {
  console.log('[passwordUtils] Starting password hash...');
  
  // Ensure password is a string and not empty
  if (!password || typeof password !== 'string') {
    console.error('[passwordUtils] Invalid password type:', typeof password);
    throw new Error('Password must be a non-empty string');
  }

  // Trim any whitespace
  const trimmedPassword = password.trim();
  
  if (trimmedPassword.length === 0) {
    console.error('[passwordUtils] Password is empty after trimming');
    throw new Error('Password cannot be empty');
  }

  console.log('[passwordUtils] Password validation passed, length:', trimmedPassword.length);

  try {
    const saltRounds = 10;
    console.log('[passwordUtils] Generating salt first...');
    
    // Generate salt first
    const salt = await bcrypt.genSalt(saltRounds);
    console.log('[passwordUtils] Salt generated successfully');
    
    // Then hash the password with the salt
    console.log('[passwordUtils] Hashing password with salt...');
    const hash = await bcrypt.hash(trimmedPassword, salt);
    
    console.log('[passwordUtils] Hash generated successfully');
    console.log('[passwordUtils] Hash length:', hash?.length);
    console.log('[passwordUtils] Hash starts with $2a$ or $2b$:', hash?.startsWith('$2a$') || hash?.startsWith('$2b$'));
    
    // Validate the hash format
    if (!hash || typeof hash !== 'string') {
      console.error('[passwordUtils] Invalid hash generated - not a string');
      throw new Error('Failed to generate valid password hash');
    }
    
    if (hash.length < 50) {
      console.error('[passwordUtils] Hash too short:', hash.length);
      throw new Error('Generated hash is invalid (too short)');
    }
    
    // Bcrypt hashes should start with $2a$, $2b$, or $2y$
    if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$') && !hash.startsWith('$2y$')) {
      console.error('[passwordUtils] Hash has invalid format prefix');
      throw new Error('Generated hash has invalid format');
    }
    
    console.log('[passwordUtils] Hash validation passed');
    return hash;
  } catch (error: any) {
    console.error('[passwordUtils] Error during hashing:', error);
    console.error('[passwordUtils] Error name:', error?.name);
    console.error('[passwordUtils] Error message:', error?.message);
    console.error('[passwordUtils] Error stack:', error?.stack);
    
    // Check if bcrypt is properly loaded
    if (!bcrypt || !bcrypt.genSalt || !bcrypt.hash) {
      console.error('[passwordUtils] bcrypt module not properly loaded');
      throw new Error('Password hashing library not available. Please restart the app.');
    }
    
    // If it's already our custom error, re-throw it
    if (error.message?.includes('Failed to generate') || 
        error.message?.includes('invalid format') ||
        error.message?.includes('too short') ||
        error.message?.includes('not available')) {
      throw error;
    }
    
    // Otherwise, wrap it in a generic error
    throw new Error('Failed to hash password: ' + (error?.message || 'Unknown error'));
  }
}

/**
 * Verify a password against a stored bcrypt hash
 * @param password Plain text password to verify
 * @param storedHash Stored password hash
 * @returns True if password matches
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  console.log('[passwordUtils] Starting password verification...');
  
  // Ensure both password and hash are strings
  if (!password || typeof password !== 'string') {
    console.error('[passwordUtils] Invalid password for verification');
    throw new Error('Password must be a non-empty string');
  }

  if (!storedHash || typeof storedHash !== 'string') {
    console.error('[passwordUtils] Invalid stored hash for verification');
    throw new Error('Stored hash must be a non-empty string');
  }

  try {
    const isMatch = await bcrypt.compare(password.trim(), storedHash);
    console.log('[passwordUtils] Password verification result:', isMatch);
    return isMatch;
  } catch (error: any) {
    console.error('[passwordUtils] Error verifying password:', error);
    console.error('[passwordUtils] Error message:', error?.message);
    return false;
  }
}
