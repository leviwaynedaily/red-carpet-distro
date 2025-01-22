import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nzqdkelbytkvvwdgywja.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cWRrZWxieXRrdnZ3ZGd5d2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0MjQ5MzksImV4cCI6MjA1MzAwMDkzOX0.q91aTkOtF0YvewODoZyehIXYYSuZ_6KdRwRXF84qfho";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const EXPONENTIAL_BACKOFF = 2; // Double the delay for each retry

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: async (url, options) => {
      let lastError;
      let delay = RETRY_DELAY;

      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          console.log(`Supabase: Attempt ${i + 1} to fetch ${url}`);
          
          // Add required headers for authentication
          const response = await fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              'apikey': SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            console.error(`Supabase: HTTP error! status: ${response.status}`);
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          console.log(`Supabase: Successfully fetched ${url} on attempt ${i + 1}`);
          return response;
        } catch (error) {
          console.error(`Supabase: Attempt ${i + 1} failed:`, error);
          lastError = error;
          
          if (i < MAX_RETRIES - 1) {
            console.log(`Supabase: Retrying in ${delay}ms...`);
            await sleep(delay);
            delay *= EXPONENTIAL_BACKOFF; // Exponential backoff
          }
        }
      }

      console.error('Supabase: All retry attempts failed');
      throw lastError;
    }
  }
});

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase
      .from('site_settings')
      .select('storefront_password, admin_password')
      .single();

    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }

    console.log('Supabase connection test successful, found passwords:', !!data?.storefront_password, !!data?.admin_password);
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};