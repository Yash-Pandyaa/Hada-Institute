import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

function getSupabaseAnonKey() {
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const key = anon ?? publishable;
  if (!key) {
    throw new Error(
      "Missing Supabase anon key env var. Set NEXT_PUBLIC_SUPABASE_ANON_KEY (preferred) or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    );
  }

  return key;
}

export const createClient = () => {
  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase URL env var. Set NEXT_PUBLIC_SUPABASE_URL.",
    );
  }

  return createBrowserClient(supabaseUrl, getSupabaseAnonKey());
};
