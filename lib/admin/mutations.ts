/**
 * Admin mutations
 * Database mutations for admin moderation
 */

import { createClient } from "@/lib/supabase/server";

export async function updateReportStatus(
  reportId: string,
  adminId: string,
  status: "reviewed" | "action_taken",
  adminNotes?: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("marketplace_reports")
    .update({
      status,
      admin_notes: adminNotes,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq("id", reportId);

  if (error) throw error;

  await logAdminAction(adminId, "update_report_status", "report", reportId, {
    status,
    admin_notes: adminNotes,
  });
}

export async function hideListing(
  listingId: string,
  adminId: string,
  reason: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("marketplace_listings")
    .update({
      visibility_status: "hidden",
      hidden_reason: reason,
      hidden_at: new Date().toISOString(),
    })
    .eq("id", listingId);

  if (error) throw error;

  await logAdminAction(adminId, "hide_listing", "listing", listingId, {
    reason,
  });
}

export async function unhideListing(
  listingId: string,
  adminId: string,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("marketplace_listings")
    .update({
      visibility_status: "visible",
      hidden_reason: null,
      hidden_at: null,
    })
    .eq("id", listingId);

  if (error) throw error;

  await logAdminAction(adminId, "unhide_listing", "listing", listingId, {});
}

async function logAdminAction(
  adminId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("admin_action_log").insert({
    admin_id: adminId,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata,
  });

  if (error) throw error;
}
