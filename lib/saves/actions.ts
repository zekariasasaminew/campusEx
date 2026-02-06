/**
 * Saves server actions
 * Client-callable server actions for listing save operations
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import { getSavedListings, checkIfSaved } from "./queries";
import { toggleListingSave as toggleListingSaveMutation } from "./mutations";
import type { SavedListingWithDetails } from "./types";

type Result<T> = { success: true; data: T } | { success: false; error: string };

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function getSaved(): Promise<Result<SavedListingWithDetails[]>> {
  try {
    const user = await getCurrentUser();
    const saved = await getSavedListings(user.id);
    return { success: true, data: saved };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to load saved listings",
    };
  }
}

export async function toggleListingSave(
  listingId: string,
): Promise<Result<boolean>> {
  try {
    const user = await getCurrentUser();
    const isSaved = await toggleListingSaveMutation(listingId, user.id);
    return { success: true, data: isSaved };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to save listing",
    };
  }
}

export async function isListingSaved(
  listingId: string,
): Promise<Result<boolean>> {
  try {
    const user = await getCurrentUser();
    const saved = await checkIfSaved(listingId, user.id);
    return { success: true, data: saved };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to check save status",
    };
  }
}
