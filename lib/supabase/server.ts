import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase Server variables are missing!");
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return (supabaseUrl && supabaseAnonKey)
    ? createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Silently ignore in case we're in a read-only context
            }
          },
        },
      })
    : null;
}

// For backward compatibility
export async function getSupabaseServer() {
  return await createSupabaseServerClient();
}

// Deprecated: use createSupabaseServerClient or getSupabaseServer instead
export const supabaseServer = null; 