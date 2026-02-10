/**
 * Admin queries
 * Database queries for admin moderation
 */

import { createClient } from "@/lib/supabase/server";
import type { ListingReportWithDetails, AdminListingWithDetails } from "./types";

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

export async function getReports(
  status?: "open" | "reviewed" | "action_taken",
): Promise<ListingReportWithDetails[]> {
  const supabase = await createClient();

  let query = supabase
    .from("marketplace_reports")
    .select(
      `
      id,
      listing_id,
      reporter_id,
      details,
      status,
      admin_notes,
      reviewed_at,
      reviewed_by,
      created_at,
      marketplace_listings!inner(title, status, visibility_status),
      users!marketplace_reports_reporter_id_fkey(email)
    `,
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((report) => ({
    id: report.id,
    listing_id: report.listing_id,
    reporter_id: report.reporter_id,
    details: report.details,
    status: report.status as "open" | "reviewed" | "action_taken",
    admin_notes: report.admin_notes,
    reviewed_at: report.reviewed_at,
    reviewed_by: report.reviewed_by,
    created_at: report.created_at,
    listing_title: (report.marketplace_listings as unknown as Record<string, unknown>)
      .title as string,
    listing_status: (report.marketplace_listings as unknown as Record<string, unknown>)
      .status as string,
    listing_visibility_status: (
      report.marketplace_listings as unknown as Record<string, unknown>
    ).visibility_status as string,
    reporter_email: (report.users as unknown as Record<string, unknown>)
      .email as string,
  }));
}

export async function getReportById(
  reportId: string,
): Promise<ListingReportWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketplace_reports")
    .select(
      `
      id,
      listing_id,
      reporter_id,
      details,
      status,
      admin_notes,
      reviewed_at,
      reviewed_by,
      created_at,
      marketplace_listings!inner(title, status, visibility_status),
      users!marketplace_reports_reporter_id_fkey(email)
    `,
    )
    .eq("id", reportId)
    .single();

  if (error) return null;

  return {
    id: data.id,
    listing_id: data.listing_id,
    reporter_id: data.reporter_id,
    details: data.details,
    status: data.status as "open" | "reviewed" | "action_taken",
    admin_notes: data.admin_notes,
    reviewed_at: data.reviewed_at,
    reviewed_by: data.reviewed_by,
    created_at: data.created_at,
    listing_title: (data.marketplace_listings as unknown as Record<string, unknown>)
      .title as string,
    listing_status: (data.marketplace_listings as unknown as Record<string, unknown>)
      .status as string,
    listing_visibility_status: (
      data.marketplace_listings as unknown as Record<string, unknown>
    ).visibility_status as string,
    reporter_email: (data.users as unknown as Record<string, unknown>)
      .email as string,
  };
}

export async function getAllListings(): Promise<AdminListingWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("marketplace_listings")
    .select(
      `
      id,
      title,
      description,
      category,
      condition,
      price_cents,
      is_free,
      location_text,
      status,
      visibility_status,
      hidden_reason,
      created_at,
      updated_at,
      users!marketplace_listings_seller_id_fkey(email, full_name),
      marketplace_listing_images(id, image_path, sort_order)
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((listing) => ({
    id: listing.id,
    title: listing.title,
    description: listing.description,
    category: listing.category,
    condition: listing.condition,
    price_cents: listing.price_cents,
    is_free: listing.is_free,
    location_text: listing.location_text,
    status: listing.status,
    visibility_status: listing.visibility_status,
    hidden_reason: listing.hidden_reason,
    created_at: listing.created_at,
    updated_at: listing.updated_at,
    seller_email: (listing.users as unknown as Record<string, unknown>)
      .email as string,
    seller_name:
      ((listing.users as unknown as Record<string, unknown>)
        .full_name as string) || null,
    images: (
      (listing.marketplace_listing_images as unknown as Array<{
        id: string;
        image_path: string;
        sort_order: number;
      }>) || []
    ).sort((a, b) => a.sort_order - b.sort_order),
  }));
}

