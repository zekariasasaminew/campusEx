/**
 * Admin validators
 * Zod schemas for validating admin moderation inputs
 */

import { z } from "zod";

export const updateReportStatusSchema = z.object({
  report_id: z.string().uuid("Invalid report ID"),
  status: z.enum(["reviewed", "action_taken"], {
    message: "Status must be 'reviewed' or 'action_taken'",
  }),
  admin_notes: z.string().optional(),
});

export const hideListingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
  reason: z.string().min(1, "Reason is required"),
});

export const unhideListingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
});

export const deleteListingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
});

export const updateListingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(2000).optional(),
  category: z.string().optional(),
  condition: z.string().nullable().optional(),
  price_cents: z.number().int().min(0).nullable().optional(),
  is_free: z.boolean().optional(),
  location: z.string().nullable().optional(),
});
