import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const origin = requestUrl.origin;

  if (code) {
    // Handle PKCE flow (if any OAuth providers use it)
    const cookieStore = await cookies();
    const config = getSupabaseConfig();

    const supabase = createServerClient(config.url, config.anonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    });

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`);
    }

    // Validate email domain after authentication
    if (data?.user?.email) {
      const normalizedEmail = data.user.email.trim().toLowerCase();
      if (!normalizedEmail.endsWith("@augustana.edu")) {
        // Sign out the user immediately
        await supabase.auth.signOut();
        // Redirect to sign-in with error
        return NextResponse.redirect(
          `${origin}/sign-in?error=unauthorized_domain`,
        );
      }
    }
  } else if (token_hash && type) {
    // Handle implicit flow (magic links)
    const cookieStore = await cookies();
    const config = getSupabaseConfig();

    const supabase = createServerClient(config.url, config.anonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookies) =>
          cookies.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          ),
      },
    });

    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as
        | "signup"
        | "invite"
        | "magiclink"
        | "recovery"
        | "email_change"
        | "email",
    });

    if (error) {
      return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`);
    }

    // Validate email domain after authentication
    if (data?.user?.email) {
      const normalizedEmail = data.user.email.trim().toLowerCase();
      if (!normalizedEmail.endsWith("@augustana.edu")) {
        // Sign out the user immediately
        await supabase.auth.signOut();
        // Redirect to sign-in with error
        return NextResponse.redirect(
          `${origin}/sign-in?error=unauthorized_domain`,
        );
      }
    }
  }

  // Redirect to marketplace after successful auth
  return NextResponse.redirect(`${origin}/marketplace`);
}
