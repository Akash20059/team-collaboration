import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://dsmdfwrhvzxdvysepsvm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzbWRmd3Jodnp4ZHZ5c2Vwc3ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MjMzODUsImV4cCI6MjA5MjQ5OTM4NX0.YA8To7p7QGJB6RqrgXelUkv9MLsW1hkAAE5FKJL4iWo";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
