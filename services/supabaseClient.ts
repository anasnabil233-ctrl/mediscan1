import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These keys are now hardcoded based on your request.
// In a production environment, it is safer to use environment variables (.env).
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://uxycnqyolufmlyvsbzse.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eWNucXlvbHVmbWx5dnNienNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODYyMDksImV4cCI6MjA4MTI2MjIwOX0.8LHjSU4sF_mzgmuNrVjl9jHsSZz6IMB3v9ZHtfVTslw';

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = () => {
  return !!supabase;
};