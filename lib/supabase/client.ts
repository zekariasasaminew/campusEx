"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;

  const config = getSupabaseConfig();
  client = createBrowserClient(config.url, config.anonKey, {
    auth: {
      // Use implicit flow for magic links - secure because tokens are:
      // - Single-use (can't be replayed)
      // - Time-limited (expire in minutes)
      // - Email-verified (attacker needs email access)
      // PKCE would require same browser (localStorage dependency)
      flowType: "implicit",
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return client;
}
