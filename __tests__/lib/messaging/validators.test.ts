import { describe, it, expect } from "vitest";
import {
  sendMessageSchema,
  editMessageSchema,
  createConversationSchema,
} from "@/lib/messaging/validators";

describe("Messaging Validators", () => {
  describe("sendMessageSchema", () => {
    it("accepts valid message body", () => {
      const result = sendMessageSchema.safeParse({
        conversation_id: "550e8400-e29b-41d4-a716-446655440000",
        body: "Hello! Is this still available?",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty body", () => {
      const result = sendMessageSchema.safeParse({
        conversation_id: "550e8400-e29b-41d4-a716-446655440000",
        body: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects body over 2000 characters", () => {
      const result = sendMessageSchema.safeParse({
        conversation_id: "550e8400-e29b-41d4-a716-446655440000",
        body: "a".repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it("accepts body at 2000 character limit", () => {
      const result = sendMessageSchema.safeParse({
        conversation_id: "550e8400-e29b-41d4-a716-446655440000",
        body: "a".repeat(2000),
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid conversation_id format", () => {
      const result = sendMessageSchema.safeParse({
        conversation_id: "not-a-uuid",
        body: "Hello",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("editMessageSchema", () => {
    it("accepts valid message edit", () => {
      const result = editMessageSchema.safeParse({
        message_id: "550e8400-e29b-41d4-a716-446655440000",
        body: "Updated message content",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty body", () => {
      const result = editMessageSchema.safeParse({
        message_id: "550e8400-e29b-41d4-a716-446655440000",
        body: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects body over 2000 characters", () => {
      const result = editMessageSchema.safeParse({
        message_id: "550e8400-e29b-41d4-a716-446655440000",
        body: "a".repeat(2001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createConversationSchema", () => {
    it("accepts valid listing_id", () => {
      const result = createConversationSchema.safeParse({
        listing_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid listing_id format", () => {
      const result = createConversationSchema.safeParse({
        listing_id: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing listing_id", () => {
      const result = createConversationSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
