import { createClient } from '@supabase/supabase-js';

// Fallback values
const FALLBACK_URL = 'https://ugvgogigsvcmynpinhtg.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVndmdvZ2lnc3ZjbXlucGluaHRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4ODQwNTUsImV4cCI6MjAzMjQ1OTk0OH0.ThisIsNotARealKeyJustToPreventCrash'; // This is a fake key but structured as JWT so createClient won't crash the entire app

let url = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
let key = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_KEY;

// Ensure key is somewhat valid looking for Supabase
if (!key.startsWith('eyJ') && !key.startsWith('sb_publishable_')) {
  console.error("Invalid Supabase Key. Using dummy key to prevent crash.");
  key = FALLBACK_KEY;
}

try {
  new URL(url);
} catch (e) {
  url = FALLBACK_URL;
}

export const supabase = createClient(url, key);
