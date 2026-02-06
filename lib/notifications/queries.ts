/**
 * Notifications queries
 * Database queries for notifications
 */

import { createClient } from "@/lib/supabase/server";
import type { Notification } from "./types";

export async function getNotifications(
  userId: string,
  limit?: number,
): Promise<Notification[]> {
  const supabase = await createClient();

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as Notification[];
}

export async function getUnreadCount(userId: string): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .is("read_at", null);

  if (error) throw error;
  return count || 0;
}
