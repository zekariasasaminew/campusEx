/**
 * Admin validators
 * Zod schemas for validating admin moderation inputs
 */

import { z } from "zod";
import {
  CATEGORIES,
  CONDITIONS,
  VALIDATION_RULES,
} from "@/lib/marketplace/constants";

export const updateReportStatusSchema = z.object({
  report_id: z.string().uuid("Invalid report ID"),
  status: z.enum(["reviewed", "action_taken"], {
    message: "Status must be 'reviewed' or 'action_taken'",
  }),
  admin_notes: z.string().trim().optional(),
});

export const hideListingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
  reason: z.string().trim().min(1, "Reason is required"),
});

export const unhideListingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
});

export const deleteListingSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
});

export const updateListingSchema = z
  .object({
    listing_id: z.string().uuid("Invalid listing ID"),
    title: z
      .string()
      .trim()
      .min(VALIDATION_RULES.title.min)
      .max(VALIDATION_RULES.title.max)
      .optional(),
    description: z
      .string()
      .trim()
      .min(VALIDATION_RULES.description.min)
      .max(VALIDATION_RULES.description.max)
      .optional(),
    category: z.enum(CATEGORIES as unknown as [string, ...string[]]).optional(),
    condition: z
      .enum(CONDITIONS as unknown as [string, ...string[]])
      .nullable()
      .optional(),
    price_cents: z.number().int().min(0).nullable().optional(),
    is_free: z.boolean().optional(),
    location: z
      .string()
      .trim()
      .max(VALIDATION_RULES.location.max)
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // If is_free is true, price_cents must be null
      if (
        data.is_free === true &&
        data.price_cents !== null &&
        data.price_cents !== undefined
      ) {
        return false;
      }
      // If is_free is false, price_cents should not be null (but this is less strict for updates)
      return true;
    },
    {
      message: "Price must be empty when item is marked as free",
      path: ["price_cents"],
    },
  );
