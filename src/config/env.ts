/**
 * Environment Configuration
 * Manages all environment variables and app configuration
 */

export const env = {
  // Hardcode mode - when true, uses mock data instead of Supabase
  hardcode: import.meta.env.VITE_HARDCODE !== 'false', // Default to true

  // Supabase configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  },

  // Platform configuration
  platformCommission: Number(import.meta.env.VITE_PLATFORM_COMMISSION) || 15,
  currency: import.meta.env.VITE_CURRENCY || 'INR',

  // Debug mode
  debug: import.meta.env.VITE_DEBUG === 'true',
} as const;

/**
 * Check if Supabase is properly configured
 */
export const isSupabaseConfigured = (): boolean => {
  if (env.hardcode) {
    return false; // In hardcode mode, Supabase is not used
  }
  return Boolean(env.supabase.url && env.supabase.anonKey);
};

/**
 * Get configuration mode message
 */
export const getConfigMessage = (): string => {
  if (env.hardcode) {
    return '🔧 Running in MOCK DATA mode - No Supabase connection required';
  }
  if (isSupabaseConfigured()) {
    return '✅ Connected to Supabase database';
  }
  return '⚠️ Supabase not configured - Please check your .env.local file';
};
