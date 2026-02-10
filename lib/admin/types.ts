/**
 * Admin type definitions
 * TypeScript interfaces for admin moderation
 */

export interface ListingReportWithDetails {
  id: string;
  listing_id: string;
  reporter_id: string;
  details: string;
  status: "open" | "reviewed" | "action_taken";
  admin_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  listing_title: string;
  listing_status: string;
  listing_visibility_status: string;
  reporter_email: string;
}

export interface AdminActionLog {
  id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface UpdateReportStatusInput {
  report_id: string;
  status: "reviewed" | "action_taken";
  admin_notes?: string;
}

export interface HideListingInput {
  listing_id: string;
  reason: string;
}

export interface UnhideListingInput {
  listing_id: string;
}

export interface DeleteListingInput {
  listing_id: string;
}

export interface UpdateListingInput {
  listing_id: string;
  title?: string;
  description?: string;
  category?: string;
  condition?: string | null;
  price_cents?: number | null;
  is_free?: boolean;
  location?: string | null;
}

