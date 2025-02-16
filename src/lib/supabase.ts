
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types';

const supabaseUrl = 'https://swlqrejfgvmjajhtoall.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3bHFyZWpmZ3ZtamFqaHRvYWxsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2NjQ0MzEsImV4cCI6MjA1NTI0MDQzMX0.KwgS5p8khqz2Cgii8CMB5GDWgGw3luKZSytkFqsiZAU';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
