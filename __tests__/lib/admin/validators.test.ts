import { describe, it, expect } from "vitest";
import {
  updateReportStatusSchema,
  hideListingSchema,
  unhideListingSchema,
} from "@/lib/admin/validators";

describe("Admin Validators", () => {
  describe("updateReportStatusSchema", () => {
    it("accepts valid status update", () => {
      const result = updateReportStatusSchema.safeParse({
        report_id: "550e8400-e29b-41d4-a716-446655440000",
        status: "reviewed",
        admin_notes: "No action needed",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid status without admin_notes", () => {
      const result = updateReportStatusSchema.safeParse({
        report_id: "550e8400-e29b-41d4-a716-446655440000",
        status: "action_taken",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid status", () => {
      const result = updateReportStatusSchema.safeParse({
        report_id: "550e8400-e29b-41d4-a716-446655440000",
        status: "invalid_status",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid report_id format", () => {
      const result = updateReportStatusSchema.safeParse({
        report_id: "not-a-uuid",
        status: "reviewed",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("hideListingSchema", () => {
    it("accepts valid hide request with reason", () => {
      const result = hideListingSchema.safeParse({
        listing_id: "550e8400-e29b-41d4-a716-446655440000",
        reason: "Violates community guidelines",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty reason", () => {
      const result = hideListingSchema.safeParse({
        listing_id: "550e8400-e29b-41d4-a716-446655440000",
        reason: "",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid listing_id format", () => {
      const result = hideListingSchema.safeParse({
        listing_id: "not-a-uuid",
        reason: "Spam",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("unhideListingSchema", () => {
    it("accepts valid unhide request", () => {
      const result = unhideListingSchema.safeParse({
        listing_id: "550e8400-e29b-41d4-a716-446655440000",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid listing_id format", () => {
      const result = unhideListingSchema.safeParse({
        listing_id: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });
  });
});
