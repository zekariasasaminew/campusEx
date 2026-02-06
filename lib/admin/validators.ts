/**
 * Admin validators
 * Zod schemas for validating admin action inputs
 */

import { z } from "zod";

export const updateReportStatusSchema = z.object({
  report_id: z.string().uuid("Invalid report ID"),
  status: z.enum(["pending", "reviewed", "action_taken", "dismissed"], {
    errorMap: () => ({ message: "Invalid status" }),
  }),
  admin_notes: z.string().optional(),
});

export const hideListingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
  reason: z.string().min(1, "Reason cannot be empty"),
});

export const unhideListingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
});
