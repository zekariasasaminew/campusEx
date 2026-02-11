/**
 * Admin mutations
 * Database mutations for admin moderation
 */

import { createClient, createServiceClient } from "@/lib/supabase/server";

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

export async function deleteListingAsAdmin(
  listingId: string,
  adminId: string,
): Promise<void> {
  // Use service role client to bypass RLS for admin operations
  const supabase = createServiceClient();

  // Get image paths before deletion
  const { data: images } = await supabase
    .from("marketplace_listing_images")
    .select("image_path")
    .eq("listing_id", listingId);

  // Delete listing (cascades to images via DB)
  const { error } = await supabase
    .from("marketplace_listings")
    .delete()
    .eq("id", listingId);

  if (error) throw error;

  // Attempt to delete images from storage (best effort)
  if (images && images.length > 0) {
    try {
      const paths = images.map((img) => img.image_path);
      await supabase.storage.from("marketplace-images").remove(paths);
    } catch {
      console.warn(`Failed to delete images for listing ${listingId}`);
    }
  }

  await logAdminAction(adminId, "delete_listing", "listing", listingId, {});
}

export async function updateListingAsAdmin(
  listingId: string,
  adminId: string,
  updates: {
    title?: string;
    description?: string;
    category?: string;
    condition?: string | null;
    price_cents?: number | null;
    is_free?: boolean;
    location?: string | null;
  },
): Promise<void> {
  // Use service role client to bypass RLS
  const supabase = createServiceClient();

  const updateData: Record<string, unknown> = {};
  if (updates.title !== undefined) updateData.title = updates.title.trim();
  if (updates.description !== undefined)
    updateData.description = updates.description.trim();
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.condition !== undefined) updateData.condition = updates.condition;
  if (updates.price_cents !== undefined)
    updateData.price_cents = updates.price_cents;
  if (updates.is_free !== undefined) updateData.is_free = updates.is_free;
  if (updates.location !== undefined)
    updateData.location_text = updates.location?.trim() || null;

  // Guard against empty updates
  if (Object.keys(updateData).length === 0) {
    throw new Error("At least one field must be provided for update");
  }

  const { error } = await supabase
    .from("marketplace_listings")
    .update(updateData)
    .eq("id", listingId);

  if (error) throw error;

  await logAdminAction(adminId, "update_listing", "listing", listingId, {
    updates,
  });
}
