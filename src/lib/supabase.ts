
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

const supabaseUrl = 'https://jrfaoqiosvyfdycfjlwl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpyZmFvcWlvc3Z5ZmR5Y2ZqbHdsIiwicm9lZSI6ImFub24iLCJpYXQiOjE3MDk2NjY4MjQsImV4cCI6MjAyNTI0MjgyNH0.SbqVFCu1y_HSKZKP11rRLFNhLAKjYizCeRrN_PGJYS4';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
