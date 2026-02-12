"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;

  const config = getSupabaseConfig();
  client = createBrowserClient(config.url, config.anonKey, {
    auth: {
      // Use implicit flow for magic links to work across browsers
      // PKCE stores code_verifier in localStorage which fails cross-browser
      flowType: "implicit",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return client;
}
