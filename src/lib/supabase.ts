import { createClient } from '@supabase/supabase-js';

// Fallback values representing the active project
const FALLBACK_URL = 'https://ugvgogigsvcmynpinhtg.supabase.co';
const FALLBACK_KEY = 'sb_publishable_OGph_ONuJ-puNBtvE0An3g_03FTXGgH';

// Get the URL safely. If the environment URL is invalid or is actually a key, use the fallback.
const getSafeUrl = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
  if (envUrl && envUrl.startsWith('https://') && !envUrl.includes('YOUR_')) {
    return envUrl;
  }
  return FALLBACK_URL;
};

// Get the publishable key safely. Only accept modern publishable format.
const getSafeKey = () => {
  const envKey = 
    import.meta.env.VITE_SUPABASE_ANON_KEY || 
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
    import.meta.env.SUPABASE_PUBLISHABLE_KEY || 
    import.meta.env.SUPABASE_ANON_KEY;

  if (envKey && envKey.startsWith('sb_publishable_') && !envKey.includes('YOUR_')) {
    return envKey;
  }
  return FALLBACK_KEY;
};

export const SUPABASE_URL = getSafeUrl();
export const SUPABASE_PUBLISHABLE_KEY = getSafeKey();

// Check configuration validity: Only consider it invalid if we don't have a valid publishable key format
export const isConfigValid = (() => {
  try {
    const rawKey = 
      import.meta.env.VITE_SUPABASE_ANON_KEY || 
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 
      import.meta.env.SUPABASE_PUBLISHABLE_KEY || 
      import.meta.env.SUPABASE_ANON_KEY || 
      FALLBACK_KEY;

    if (!rawKey || rawKey.includes('YOUR_') || !rawKey.startsWith('sb_publishable_')) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
})();

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});
