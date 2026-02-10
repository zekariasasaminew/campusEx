/**
 * Saves queries
 * Database queries for listing saves
 */

import { createClient } from "@/lib/supabase/server";
import type { SavedListingWithDetails } from "./types";

export async function getSavedListings(
  userId: string,
): Promise<SavedListingWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listing_saves")
    .select(
      `
      id,
      listing_id,
      created_at,
      marketplace_listings!inner(
        title,
        price_cents,
        is_free,
        status,
        visibility_status
      )
    `,
    )
    .eq("user_id", userId)
    .eq("marketplace_listings.visibility_status", "visible")
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Get images separately to avoid query failures
  const listingIds = data?.map((save) => save.listing_id) || [];
  let images: Record<string, string> = {};

  if (listingIds.length > 0) {
    const { data: imageData } = await supabase
      .from("marketplace_listing_images")
      .select("listing_id, image_path")
      .in("listing_id", listingIds)
      .order("position", { ascending: true });

    if (imageData) {
      // Get first image for each listing
      imageData.forEach((img) => {
        if (!images[img.listing_id]) {
          images[img.listing_id] = img.image_path;
        }
      });
    }
  }

  return (data || []).map((save) => ({
    id: save.id,
    listing_id: save.listing_id,
    created_at: save.created_at,
    listing_title: (
      save.marketplace_listings as unknown as Record<string, unknown>
    ).title as string,
    listing_price_cents: (
      save.marketplace_listings as unknown as Record<string, unknown>
    ).price_cents as number,
    listing_is_free: (
      save.marketplace_listings as unknown as Record<string, unknown>
    ).is_free as boolean,
    listing_status: (
      save.marketplace_listings as unknown as Record<string, unknown>
    ).status as string,
    listing_image_url: images[save.listing_id] || null,
  }));
}

export async function checkIfSaved(
  listingId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("listing_saves")
    .select("id")
    .eq("listing_id", listingId)
    .eq("user_id", userId)
    .maybeSingle();

  return !!data;
}
