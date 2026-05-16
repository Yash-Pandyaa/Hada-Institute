import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (request: NextRequest) => {
  // Create an unmodified response template
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!supabaseUrl || !anonKey) {
    return { supabase: null, response: supabaseResponse };
  }

  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },

      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set({ name, value, ...options });
        });
        
        supabaseResponse = NextResponse.next({
          request,
        });
        
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set({ name, value, ...options });
        });
      },
    },
  });

  return { supabase, response: supabaseResponse };
};

// 1. Core middleware function required by Next.js to intercept requests
export async function middleware(request: NextRequest) {
  const { response } = createClient(request);
  return response;
}

// 2. Config matcher to explicitly skip NextAuth API and core static paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth API endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
