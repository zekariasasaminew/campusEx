import { describe, it, expect } from "vitest";
import {
  createMessageSchema,
  editMessageSchema,
  createConversationForListingSchema,
} from "@/lib/messaging/validators";

describe("Messaging Validators", () => {
  describe("createMessageSchema", () => {
    it("accepts valid message content", () => {
      const result = createMessageSchema.safeParse({
        conversation_id: "550e8400-e29b-41d4-a716-446655440000",
        content: "Hello! Is this still available?",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty content", () => {
      const result = createMessageSchema.safeParse({
        conversation_id: "550e8400-e29b-41d4-a716-446655440000",
        content: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects content over 2000 characters", () => {
      const result = createMessageSchema.safeParse({
        conversation_id: "550e8400-e29b-41d4-a716-446655440000",
        content: "a".repeat(2001),
      });
      expect(result.success).toBe(false);
    });

    it("accepts content at 2000 character limit", () => {
      const result = createMessageSchema.safeParse({
        conversation_id: "550e8400-e29b-41d4-a716-446655440000",
        content: "a".repeat(2000),
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid conversation_id format", () => {
      const result = createMessageSchema.safeParse({
        conversation_id: "not-a-uuid",
        content: "Hello",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("editMessageSchema", () => {
    it("accepts valid message edit", () => {
      const result = editMessageSchema.safeParse({
        message_id: "550e8400-e29b-41d4-a716-446655440000",
        content: "Updated message content",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty content", () => {
      const result = editMessageSchema.safeParse({
        message_id: "550e8400-e29b-41d4-a716-446655440000",
        content: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects content over 2000 characters", () => {
      const result = editMessageSchema.safeParse({
        message_id: "550e8400-e29b-41d4-a716-446655440000",
        content: "a".repeat(2001),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createConversationForListingSchema", () => {
    it("accepts valid listing_id", () => {
      const result = createConversationForListingSchema.safeParse({
        listing_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid listing_id format", () => {
      const result = createConversationForListingSchema.safeParse({
        listing_id: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects missing listing_id", () => {
      const result = createConversationForListingSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
