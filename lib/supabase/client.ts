import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const hasPlaceholderAnonKey = supabaseAnonKey === "your-anon-public-key";
const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey && !hasPlaceholderAnonKey);

export const supabaseConfigError =
  !supabaseUrl
    ? "Il manque NEXT_PUBLIC_SUPABASE_URL dans .env.local."
    : !supabaseAnonKey || hasPlaceholderAnonKey
      ? "Il manque NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local."
      : "";

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
