/**
 * Marketplace write operations (mutations)
 * All database mutations for creating, updating, and deleting listings
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  MarketplaceListing,
  CreateListingInput,
  UpdateListingInput,
  ReportListingInput,
} from "./types";
import {
  validateCreateListing,
  validateUpdateListing,
  validateReport,
} from "./validators";
import { uploadListingImages, deleteListingImages } from "./storage";

/**
 * Create a new listing with images
 */
export async function createListing(
  supabase: SupabaseClient,
  userId: string,
  input: CreateListingInput,
): Promise<MarketplaceListing> {
  // Validate input
  const validation = validateCreateListing(input);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors).join(", "));
  }

  // Insert listing
  const { data: listing, error: listingError } = await supabase
    .from("marketplace_listings")
    .insert({
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      condition: input.condition,
      price_cents: input.price_cents,
      is_free: input.is_free,
      location_text: input.location?.trim() || null,
      status: "active",
      seller_id: userId,
    })
    .select()
    .single();

  if (listingError) {
    throw new Error(`Failed to create listing: ${listingError.message}`);
  }

  // Upload images
  try {
    await uploadListingImages(supabase, listing.id, userId, input.images);
  } catch (error) {
    // Rollback: delete the listing if image upload fails
    await supabase.from("marketplace_listings").delete().eq("id", listing.id);
    throw error;
  }

  return listing as MarketplaceListing;
}

/**
 * Update an existing listing
 */
export async function updateListing(
  supabase: SupabaseClient,
  listingId: string,
  userId: string,
  input: UpdateListingInput,
): Promise<MarketplaceListing> {
  // Validate input
  const validation = validateUpdateListing(input);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors).join(", "));
  }

  // Check ownership
  const { data: existing } = await supabase
    .from("marketplace_listings")
    .select("seller_id")
    .eq("id", listingId)
    .single();

  if (!existing || existing.seller_id !== userId) {
    throw new Error("Listing not found or access denied");
  }

  // Build update object
  const updates: Partial<MarketplaceListing> = {};
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined)
    updates.description = input.description.trim();
  if (input.category !== undefined) updates.category = input.category;
  if (input.condition !== undefined) updates.condition = input.condition;
  if (input.price_cents !== undefined) updates.price_cents = input.price_cents;
  if (input.is_free !== undefined) updates.is_free = input.is_free;
  if (input.location !== undefined)
    updates.location_text = input.location?.trim() || null;

  // Update listing
  const { data: listing, error } = await supabase
    .from("marketplace_listings")
    .update(updates)
    .eq("id", listingId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update listing: ${error.message}`);
  }

  // Handle image updates
  if (input.images_to_remove && input.images_to_remove.length > 0) {
    await deleteListingImages(supabase, listingId, input.images_to_remove);
  }

  if (input.images_to_add && input.images_to_add.length > 0) {
    await uploadListingImages(supabase, listingId, userId, input.images_to_add);
  }

  return listing as MarketplaceListing;
}

/**
 * Mark a listing as sold
 */
export async function markListingAsSold(
  supabase: SupabaseClient,
  listingId: string,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from("marketplace_listings")
    .update({ status: "sold" })
    .eq("id", listingId)
    .eq("seller_id", userId);

  if (error) {
    throw new Error(`Failed to mark listing as sold: ${error.message}`);
  }
}

/**
 * Delete a listing and its images
 */
export async function deleteListing(
  supabase: SupabaseClient,
  listingId: string,
  userId: string,
): Promise<void> {
  // Check ownership
  const { data: existing } = await supabase
    .from("marketplace_listings")
    .select("seller_id")
    .eq("id", listingId)
    .single();

  if (!existing || existing.seller_id !== userId) {
    throw new Error("Listing not found or access denied");
  }

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

  if (error) {
    throw new Error(`Failed to delete listing: ${error.message}`);
  }

  // Attempt to delete images from storage (best effort)
  if (images && images.length > 0) {
    const paths = images.map((img) => img.image_path);
    try {
      await supabase.storage.from("marketplace-images").remove(paths);
    } catch (error) {
      console.warn(
        `Failed to delete listing images from storage: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

/**
 * Report a listing
 */
export async function reportListing(
  supabase: SupabaseClient,
  userId: string,
  input: ReportListingInput,
): Promise<void> {
  // Validate input
  const validation = validateReport(input);
  if (!validation.isValid) {
    throw new Error(Object.values(validation.errors).join(", "));
  }

  const { error } = await supabase.from("marketplace_reports").insert({
    listing_id: input.listing_id,
    reporter_id: userId,
    reason: input.reason.trim(),
    details: input.details.trim(),
  });

  if (error) {
    throw new Error(`Failed to submit report: ${error.message}`);
  }
}
