import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseEnv, hasSupabaseEnv } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  const isLoginRoute = request.nextUrl.pathname === "/login";

  if (!hasSupabaseEnv()) {
    return isLoginRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/login?reason=configuration", request.url));
  }

  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  if (!isAuthenticated && !isLoginRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && isLoginRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
