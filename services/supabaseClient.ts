import { createClient } from '@supabase/supabase-js';

// --- CONFIGURATION FOR MOBILE APPS (APPILIX / CAPACITOR) ---
// In mobile wrappers, process.env is often undefined. We must provide direct fallbacks.
// Also, we use a helper to safely access process.env to avoid "ReferenceError: process is not defined".

const getEnv = (key: string, fallback: string): string => {
  try {
    // Check for Vite's import.meta.env (Standard)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
    // Check for process.env (Legacy/Build)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore errors if process or import.meta is missing
  }
  return fallback;
};

// DIRECT KEYS FROM YOUR CONFIGURATION
// These are strictly required for the Android app to connect.
const SUPABASE_URL = getEnv('VITE_SUPABASE_URL', 'https://uxycnqyolufmlyvsbzse.supabase.co');
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4eWNucXlvbHVmbWx5dnNienNlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODYyMDksImV4cCI6MjA4MTI2MjIwOX0.8LHjSU4sF_mzgmuNrVjl9jHsSZz6IMB3v9ZHtfVTslw');

// Initialize Client with specific settings for Mobile WebViews
export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true, // Keep user logged in
        autoRefreshToken: true,
        detectSessionInUrl: false, // Important: Disable this for WebViews to prevent URL parsing errors
        storage: window.localStorage // Explicitly use localStorage
      }
    }) 
  : null;

export const isSupabaseConfigured = () => {
  return !!supabase;
};

/**
 * Pings the database to verify connection
 */
export const checkConnection = async (): Promise<boolean> => {
  if (!supabase) return false;
  try {
    // We use a simple lightweight query
    const { count, error } = await supabase.from('records').select('*', { count: 'exact', head: true });
    
    if (error) {
      console.warn('Supabase connection check failed:', error.message);
      // In some cases, RLS (Row Level Security) might return an error but the connection is actually alive.
      // If the error is 401 (Unauthorized) or similar DB errors, we are actually connected to the server.
      // If the error is Network Error, then we are offline.
      if (error.message && error.message.includes('FetchError')) {
          return false;
      }
      return true; // We reached the server, even if it said "Access Denied", so we are connected.
    }
    return true;
  } catch (e) {
    console.warn('Supabase connection check exception:', e);
    return false;
  }
};