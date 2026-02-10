import { describe, it, expect } from "vitest";
import {
  updateNotificationSchema,
  markAllNotificationsReadSchema,
} from "@/lib/notifications/validators";

describe("Notification Validators", () => {
  describe("updateNotificationSchema", () => {
    it("accepts valid notification update", () => {
      const result = updateNotificationSchema.safeParse({
        notification_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid notification_id format", () => {
      const result = updateNotificationSchema.safeParse({
        notification_id: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing notification_id", () => {
      const result = updateNotificationSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe("markAllNotificationsReadSchema", () => {
    it("accepts empty object", () => {
      const result = markAllNotificationsReadSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });
});
