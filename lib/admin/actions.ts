/**
 * Admin server actions
 * Client-callable server actions for admin moderation operations
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin, getReports, getReportById } from "./queries";
import {
  updateReportStatus as updateReportStatusMutation,
  hideListing as hideListingMutation,
  unhideListing as unhideListingMutation,
} from "./mutations";
import type {
  ListingReportWithDetails,
  UpdateReportStatusInput,
  HideListingInput,
  UnhideListingInput,
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
    const admin = await requireAdmin();
    await updateReportStatusMutation(
      input.report_id,
      admin.id,
      input.status,
      input.admin_notes,
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
    const admin = await requireAdmin();
    await hideListingMutation(input.listing_id, admin.id, input.reason);
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
    const admin = await requireAdmin();
    await unhideListingMutation(input.listing_id, admin.id);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to unhide listing",
    };
  }
}
