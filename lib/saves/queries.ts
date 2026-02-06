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
      listings!inner(
        title,
        price_cents,
        is_free,
        status
      ),
      listing_images(image_path)
    `,
    )
    .eq("user_id", userId)
    .eq("listings.visibility_status", "visible")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((save) => ({
    id: save.id,
    listing_id: save.listing_id,
    created_at: save.created_at,
    listing_title: (save.listings as any).title,
    listing_price_cents: (save.listings as any).price_cents,
    listing_is_free: (save.listings as any).is_free,
    listing_status: (save.listings as any).status,
    listing_image_url: (save.listing_images as any[])?.[0]?.image_path || null,
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
