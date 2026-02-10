/**
 * Admin client actions
 * Client-callable server actions for admin checks
 */

"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkCurrentUserIsAdmin(): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return false;

    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    return data?.role === "admin";
  } catch {
    return false;
  }
}
