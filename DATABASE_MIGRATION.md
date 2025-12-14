
# Database Migration: Remove Supabase Auth, Add Bcrypt Password Authentication

## Overview
This migration removes Supabase Auth and adds email and password_hash fields to the users table for custom bcrypt-based authentication.

## SQL Migration Script

Run the following SQL in your Supabase SQL Editor:

```sql
-- Step 1: Add email and password_hash columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Step 2: Make email and password_hash NOT NULL (after data migration if needed)
-- Note: Only run this after ensuring all existing users have email and password_hash
-- ALTER TABLE users ALTER COLUMN email SET NOT NULL;
-- ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;

-- Step 3: Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Step 4: Update RLS policies for users table
-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can register" ON users;

-- Step 5: Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 6: Create new RLS policies
-- Allow anyone to insert (for registration)
CREATE POLICY "Anyone can register" ON users
  FOR INSERT
  WITH CHECK (true);

-- Allow anyone to select (for login verification)
-- Note: password_hash should never be exposed to the client
-- Consider using a Supabase Edge Function for login instead
CREATE POLICY "Anyone can view users" ON users
  FOR SELECT
  USING (true);

-- Allow users to update their own profile
-- Note: In production, you should restrict this to authenticated users only
CREATE POLICY "Anyone can update users" ON users
  FOR UPDATE
  USING (true);

-- Step 7: Add comment to document the change
COMMENT ON TABLE users IS 'Users table with bcrypt password authentication. No longer uses Supabase Auth. Passwords are hashed using bcrypt with 10 salt rounds.';

-- Step 8: Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

## Important Notes

1. **Security Considerations:**
   - The current RLS policies allow anyone to read user data (including password hashes). This is necessary for client-side login verification.
   - For production, consider implementing a Supabase Edge Function to handle login server-side to avoid exposing password hashes.
   - Password hashes are bcrypt hashes with 10 salt rounds, which is secure.

2. **Email Verification:**
   - Email verification is currently disabled in the code (see AuthContext.tsx login function).
   - To enable email verification, uncomment the email verification check in the login function.
   - You'll need to implement an email verification system separately.

3. **Migration of Existing Users:**
   - If you have existing users in the database, you'll need to:
     - Add email addresses for all existing users
     - Either reset passwords or migrate them (if you have access to the old hashes)
     - Set email_verified to true for existing users if needed

4. **Testing:**
   - Test registration with a new user
   - Test login with the newly registered user
   - Verify that password hashing is working correctly
   - Test that invalid passwords are rejected

## Rollback Plan

If you need to rollback this migration:

```sql
-- Remove the new columns
ALTER TABLE users DROP COLUMN IF EXISTS email;
ALTER TABLE users DROP COLUMN IF EXISTS password_hash;

-- Drop the index
DROP INDEX IF EXISTS idx_users_email;

-- Restore original RLS policies (adjust as needed based on your original setup)
-- ... add your original policies here ...
```

## Next Steps

1. Run the SQL migration script in Supabase SQL Editor
2. Test user registration and login
3. Consider implementing server-side authentication using Supabase Edge Functions for better security
4. Implement email verification if needed
5. Update any other parts of your application that depend on Supabase Auth
