import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nzqdkelbytkvvwdgywja.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56cWRrZWxieXRrdnZ3ZGd5d2phIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc0MjQ5MzksImV4cCI6MjA1MzAwMDkzOX0.q91aTkOtF0YvewODoZyehIXYYSuZ_6KdRwRXF84qfho";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);