import { createClient } from "@/lib/supabase/server";

// Server Actions don't get `user` passed down from the page — each one needs
// its own auth check. Throws if there's no session, which Next.js surfaces
// as an error boundary rather than silently doing nothing.
export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}
