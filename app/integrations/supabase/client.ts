import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://oqvwvrenktaasmzlckeh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdnd2cmVua3RhYXNtemxja2VoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MTAxNTgsImV4cCI6MjA4MDA4NjE1OH0.LQfFIRd42FGjtMBRJyXxwIJEMrGTIeb6LXLYTSt6ZYc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
