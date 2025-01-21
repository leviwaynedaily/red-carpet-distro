import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fwsdoiaodphgyeteafbq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3c2RvaWFvZHBoZ3lldGVhZmJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxODU0MDQsImV4cCI6MjA1MDc2MTQwNH0.a8CgvDuAerprMDVKxrp-qdSaJ5aDpdT6F1EusYrtbMc";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  }
});

// Add error handling for failed fetches
supabase.from('site_settings').select('*').single()
  .then(({ data, error }) => {
    if (error) {
      console.error('Error fetching site settings:', error);
      if (error.message === 'Failed to fetch') {
        console.error('Network error - please check your connection and CORS settings');
      }
    }
  });