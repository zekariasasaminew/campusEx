/**
 * Admin queries
 * Database queries for admin moderation
 */

import { createClient } from "@/lib/supabase/server";
import type { ListingReportWithDetails } from "./types";

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
    .from("listing_reports")
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
      listings!inner(title, status, visibility_status),
      users!listing_reports_reporter_id_fkey(email)
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
    listing_title: (report.listings as Record<string, unknown>).title as string,
    listing_status: (report.listings as Record<string, unknown>)
      .status as string,
    listing_visibility_status: (report.listings as Record<string, unknown>)
      .visibility_status as string,
    reporter_email: (report.users as Record<string, unknown>).email as string,
  }));
}

export async function getReportById(
  reportId: string,
): Promise<ListingReportWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listing_reports")
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
      listings!inner(title, status, visibility_status),
      users!listing_reports_reporter_id_fkey(email)
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
    listing_title: (data.listings as Record<string, unknown>).title as string,
    listing_status: (data.listings as Record<string, unknown>).status as string,
    listing_visibility_status: (data.listings as Record<string, unknown>)
      .visibility_status as string,
    reporter_email: (data.users as Record<string, unknown>).email as string,
  };
}
