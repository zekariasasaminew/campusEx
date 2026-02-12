"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;

  const config = getSupabaseConfig();
  client = createBrowserClient(config.url, config.anonKey);

  return client;
}
