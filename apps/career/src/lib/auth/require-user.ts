import { redirect } from "next/navigation";

import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function requireUser() {
  if (!hasSupabaseEnv()) redirect("/login?reason=configuration");

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  const email = typeof data?.claims?.email === "string" ? data.claims.email.toLowerCase() : null;
  const allowedEmail = process.env.CAREER_OS_ALLOWED_EMAIL?.trim().toLowerCase();

  if (!userId || (allowedEmail && email !== allowedEmail)) redirect("/login");

  return { supabase, userId };
}
