import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;

const getSupabase = (): SupabaseClient => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase configuration is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables via the Settings menu.'
    );
  }
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// Use a Proxy to lazily initialize the Supabase client.
// This prevents the app from crashing on startup if the environment variables are missing.
export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    const instance = getSupabase();
    const value = instance[prop as keyof SupabaseClient];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
});
