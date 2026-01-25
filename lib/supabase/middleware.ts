import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const config = getSupabaseConfig();

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          request.cookies.set(name, value);
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/sign-in");
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/marketplace") ||
    request.nextUrl.pathname.startsWith("/profile");

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    const redirectResponse = NextResponse.redirect(url);

    // Preserve auth cookies from supabaseResponse
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectResponse;
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/marketplace";
    const redirectResponse = NextResponse.redirect(url);

    // Preserve auth cookies from supabaseResponse
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectResponse;
  }

  return supabaseResponse;
}
