import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error(
      "Missing Supabase URL env var. Set NEXT_PUBLIC_SUPABASE_URL.",
    );
  }

  return createServerClient(supabaseUrl, getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },

      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Ignore if called from Server Component
        }
      },
    },
  });
}
