import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "@/lib/utils";
import {
  AUTH_ROUTES,
  isGuestOnlyPath,
  isPublicAuthPath,
  sanitizeNextPath,
} from "@/lib/auth/routes";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;

  if (pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.login;
    return NextResponse.redirect(url);
  }

  if (!hasEnvVars) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getUser.
  let user = null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (!error) {
      user = data.user;
    }
  } catch (cause) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "[auth proxy] Could not reach Supabase. Restart with `npm run dev` " +
          "(sets NODE_TLS_REJECT_UNAUTHORIZED for local TLS issues).",
        cause,
      );
    }
  }

  if (!user && !isPublicAuthPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.login;
    if (pathname !== AUTH_ROUTES.home) {
      url.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(url);
  }

  if (user && isGuestOnlyPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = sanitizeNextPath(request.nextUrl.searchParams.get("next"));
    url.search = "";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
