/**
 * Notification validators
 * Zod schemas for validating notification inputs
 */

import { z } from "zod";

export const updateNotificationSchema = z.object({
  notification_id: z.string().uuid("Invalid notification ID"),
});

export const markAllNotificationsReadSchema = z.object({});
