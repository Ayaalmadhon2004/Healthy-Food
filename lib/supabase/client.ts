"use client";

import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let clientPromise: Promise<SupabaseClient> | null = null;

/**
 * The browser Supabase client, created on first use.
 *
 * `@supabase/ssr` + `supabase-js` are ~55 kB gzipped. Importing them statically
 * from the navbar put them in the first-load bundle of every page, even for
 * visitors who never sign in. Loading them here, from an idle callback or an
 * event handler, keeps them out of the critical path.
 */
export function getSupabase(): Promise<SupabaseClient> {
  clientPromise ??= import("@supabase/ssr").then(({ createBrowserClient }) =>
    createBrowserClient(supabaseUrl, supabaseAnonKey),
  );
  return clientPromise;
}
