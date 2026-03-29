/**
 * Supabase Client — Extraction Model Project
 *
 * Read-only client for querying the A360 Extraction Model Supabase project.
 * Uses the public anon key (safe for browser use with RLS enforced).
 *
 * Project: wvpgmawrizwkmvfnwqfl (A360 Extraction Model)
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wvpgmawrizwkmvfnwqfl.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2cGdtYXdyaXp3a212Zm53cWZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3OTUyNTQsImV4cCI6MjA4NzM3MTI1NH0._72rihlJiCHFs8eiLYgIbqPqvslLRVCyaDMpy51kibc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
