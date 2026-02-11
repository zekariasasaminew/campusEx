/**
 * Admin server actions
 * Client-callable server actions for admin moderation operations
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  checkIsAdmin,
  getReports,
  getReportById,
  getAllListings,
} from "./queries";
import {
  updateReportStatus as updateReportStatusMutation,
  hideListing as hideListingMutation,
  unhideListing as unhideListingMutation,
  deleteListingAsAdmin,
  updateListingAsAdmin,
} from "./mutations";
import {
  updateReportStatusSchema,
  hideListingSchema,
  unhideListingSchema,
  deleteListingSchema,
  updateListingSchema,
} from "./validators";
import type {
  ListingReportWithDetails,
  UpdateReportStatusInput,
  HideListingInput,
  UnhideListingInput,
  DeleteListingInput,
  UpdateListingInput,
  AdminListingWithDetails,
} from "./types";

type Result<T> = { success: true; data: T } | { success: false; error: string };

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

async function requireAdmin() {
  const user = await getCurrentUser();
  const isAdmin = await checkIsAdmin(user.id);
  if (!isAdmin) throw new Error("Admin access required");
  return user;
}

export async function getAdminReports(
  status?: "open" | "reviewed" | "action_taken",
): Promise<Result<ListingReportWithDetails[]>> {
  try {
    await requireAdmin();
    const reports = await getReports(status);
    return { success: true, data: reports };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load reports",
    };
  }
}

export async function getAdminReportById(
  reportId: string,
): Promise<Result<ListingReportWithDetails | null>> {
  try {
    await requireAdmin();
    const report = await getReportById(reportId);
    return { success: true, data: report };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load report",
    };
  }
}

export async function updateReportStatus(
  input: UpdateReportStatusInput,
): Promise<Result<void>> {
  try {
    const validatedInput = updateReportStatusSchema.parse(input);
    const admin = await requireAdmin();
    await updateReportStatusMutation(
      validatedInput.report_id,
      admin.id,
      validatedInput.status,
      validatedInput.admin_notes,
    );
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update report",
    };
  }
}

export async function hideListing(
  input: HideListingInput,
): Promise<Result<void>> {
  try {
    const validatedInput = hideListingSchema.parse(input);
    const admin = await requireAdmin();
    await hideListingMutation(validatedInput.listing_id, admin.id, validatedInput.reason);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to hide listing",
    };
  }
}

export async function unhideListing(
  input: UnhideListingInput,
): Promise<Result<void>> {
  try {
    const validatedInput = unhideListingSchema.parse(input);
    const admin = await requireAdmin();
    await unhideListingMutation(validatedInput.listing_id, admin.id);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to unhide listing",
    };
  }
}

export async function adminDeleteListing(
  input: DeleteListingInput,
): Promise<Result<void>> {
  console.log("🔧 [SERVER] adminDeleteListing called with input:", input);
  try {
    console.log("🔧 [SERVER] Validating input...");
    const validatedInput = deleteListingSchema.parse(input);
    console.log("🔧 [SERVER] Input validated:", validatedInput);
    
    console.log("🔧 [SERVER] Checking admin access...");
    const admin = await requireAdmin();
    console.log("🔧 [SERVER] Admin confirmed:", admin.id);
    
    console.log("🔧 [SERVER] Calling deleteListingAsAdmin...");
    await deleteListingAsAdmin(validatedInput.listing_id, admin.id);
    console.log("🔧 [SERVER] Delete successful!");
    
    return { success: true, data: undefined };
  } catch (error) {
    console.error("🔧 [SERVER] Error in adminDeleteListing:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete listing",
    };
  }
}

export async function adminUpdateListing(
  input: UpdateListingInput,
): Promise<Result<void>> {
  try {
    const validatedInput = updateListingSchema.parse(input);
    const admin = await requireAdmin();
    await updateListingAsAdmin(validatedInput.listing_id, admin.id, {
      title: validatedInput.title,
      description: validatedInput.description,
      category: validatedInput.category,
      condition: validatedInput.condition,
      price_cents: validatedInput.price_cents,
      is_free: validatedInput.is_free,
      location: validatedInput.location,
    });
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update listing",
    };
  }
}

export async function getAdminListings(): Promise<
  Result<AdminListingWithDetails[]>
> {
  try {
    await requireAdmin();
    const listings = await getAllListings();
    return { success: true, data: listings };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load listings",
    };
  }
}


