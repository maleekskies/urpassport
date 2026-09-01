import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/database.types";

// Use this in Client Components ("use client" files) — e.g. the login form.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
