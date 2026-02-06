/**
 * Notifications server actions
 * Client-callable server actions for notification operations
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { getNotifications, getUnreadCount } from "./queries";
import {
  markNotificationRead as markNotificationReadMutation,
  markAllNotificationsRead as markAllNotificationsReadMutation,
} from "./mutations";
import type { Notification } from "./types";

type Result<T> = { success: true; data: T } | { success: false; error: string };

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function getUserNotifications(
  limit?: number,
): Promise<Result<Notification[]>> {
  try {
    const user = await getCurrentUser();
    const notifications = await getNotifications(user.id, limit);
    return { success: true, data: notifications };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load notifications",
    };
  }
}

export async function getNotificationUnreadCount(): Promise<Result<number>> {
  try {
    const user = await getCurrentUser();
    const count = await getUnreadCount(user.id);
    return { success: true, data: count };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get unread count",
    };
  }
}

export async function markNotificationRead(
  notificationId: string,
): Promise<Result<void>> {
  try {
    const user = await getCurrentUser();
    await markNotificationReadMutation(notificationId, user.id);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark as read",
    };
  }
}

export async function markAllNotificationsRead(): Promise<Result<void>> {
  try {
    const user = await getCurrentUser();
    await markAllNotificationsReadMutation(user.id);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to mark all as read",
    };
  }
}
