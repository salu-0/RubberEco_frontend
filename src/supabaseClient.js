import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project details
export const supabaseUrl = 'https://pgltndcmhubrebqgcdsr.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbHRuZGNtaHVicmVicWdjZHNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0NzQ5NjYsImV4cCI6MjA2NzA1MDk2Nn0.SBRLHYSNaMLl5f4QKi1ThACEeYRdG5h88G4fdzQTx_0';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
