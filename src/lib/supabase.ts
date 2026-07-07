import { createClient } from '@supabase/supabase-js';

// Fallback values representing the active project
const FALLBACK_URL = 'https://ugvgogigsvcmynpinhtg.supabase.co';
const FALLBACK_KEY = 'sb_publishable_OGph_ONuJ-puNBtvE0An3g_03FTXGgH';

// Initialize variables using both VITE_ prefixed and direct environment variables
export const SUPABASE_URL = 
  import.meta.env.VITE_SUPABASE_URL || 
  import.meta.env.SUPABASE_URL || 
  FALLBACK_URL;

export const SUPABASE_PUBLISHABLE_KEY = 
  import.meta.env.VITE_SUPABASE_ANON_KEY || 
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.SUPABASE_PUBLISHABLE_KEY || 
  import.meta.env.SUPABASE_ANON_KEY || 
  FALLBACK_KEY;

// Check configuration validity
export const isConfigValid = (() => {
  try {
    if (!SUPABASE_URL || !SUPABASE_URL.startsWith('https://') || SUPABASE_URL.includes('YOUR_')) {
      return false;
    }
    if (!SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLISHABLE_KEY.includes('YOUR_')) {
      return false;
    }
    // Must be either standard JWT (eyJ) or the modern publishable key format (sb_publishable_)
    if (!SUPABASE_PUBLISHABLE_KEY.startsWith('eyJ') && !SUPABASE_PUBLISHABLE_KEY.startsWith('sb_publishable_')) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
})();

// Initialize the Supabase client safely
const safeUrl = isConfigValid ? SUPABASE_URL : FALLBACK_URL;
const safeKey = isConfigValid ? SUPABASE_PUBLISHABLE_KEY : FALLBACK_KEY;

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
