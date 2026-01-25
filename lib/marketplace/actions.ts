/**
 * Client-side helpers for marketplace operations
 * These wrappers handle authentication and provide consistent error handling
 */

"use server";

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseConfig } from "@/lib/supabase/config";
import {
  getListings as getListingsQuery,
  getListingById as getListingByIdQuery,
} from "./queries";
import {
  createListing as createListingMutation,
  updateListing as updateListingMutation,
  markListingAsSold as markListingAsSoldMutation,
  deleteListing as deleteListingMutation,
  reportListing as reportListingMutation,
} from "./mutations";
import { getImageUrl } from "./storage";
import type {
  ListingFilters,
  CreateListingInput,
  UpdateListingInput,
  ListingWithImages,
  ListingDetail,
  MarketplaceListingImage,
} from "./types";

type Result<T> = { success: true; data: T } | { success: false; error: string };

// Helper to create Supabase client with auth
async function getSupabaseWithAuth() {
  const config = getSupabaseConfig();
  const cookieStore = await cookies();

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookies) =>
        cookies.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        ),
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  return { supabase, userId: user.id };
}

// Add image URLs to listing images
function enhanceWithUrls(
  supabase: ReturnType<typeof createServerClient>,
  images: MarketplaceListingImage[],
) {
  return images.map((img) => ({
    ...img,
    image_url: getImageUrl(supabase, img.storage_path),
  }));
}

export async function fetchListings(
  filters: ListingFilters = {},
): Promise<Result<ListingWithImages[]>> {
  try {
    const { supabase } = await getSupabaseWithAuth();
    const result = await getListingsQuery(supabase, filters);

    const enhanced = result.data.map((listing) => ({
      ...listing,
      images: enhanceWithUrls(supabase, listing.images),
    }));

    return { success: true, data: enhanced };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch listings",
    };
  }
}

export async function fetchListingDetail(
  listingId: string,
): Promise<Result<ListingDetail>> {
  try {
    const { supabase, userId } = await getSupabaseWithAuth();
    const listing = await getListingByIdQuery(supabase, listingId, userId);

    if (!listing) {
      return { success: false, error: "Listing not found" };
    }

    const enhanced: ListingDetail = {
      ...listing,
      images: enhanceWithUrls(supabase, listing.images),
      is_owner: listing.is_owner,
      seller: listing.seller,
    };

    return { success: true, data: enhanced };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch listing",
    };
  }
}

export async function submitNewListing(
  input: CreateListingInput,
): Promise<Result<string>> {
  try {
    const { supabase, userId } = await getSupabaseWithAuth();
    const listing = await createListingMutation(supabase, userId, input);
    return { success: true, data: listing.id };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create listing",
    };
  }
}

export async function submitListingUpdate(
  listingId: string,
  input: UpdateListingInput,
): Promise<Result<void>> {
  try {
    const { supabase, userId } = await getSupabaseWithAuth();
    await updateListingMutation(supabase, listingId, userId, input);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update listing",
    };
  }
}

export async function submitMarkAsSold(
  listingId: string,
): Promise<Result<void>> {
  try {
    const { supabase, userId } = await getSupabaseWithAuth();
    await markListingAsSoldMutation(supabase, listingId, userId);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to mark listing as sold",
    };
  }
}

export async function submitDeleteListing(
  listingId: string,
): Promise<Result<void>> {
  try {
    const { supabase, userId } = await getSupabaseWithAuth();
    await deleteListingMutation(supabase, listingId, userId);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete listing",
    };
  }
}

export async function submitReport(
  listingId: string,
  details: string,
): Promise<Result<void>> {
  try {
    const { supabase, userId } = await getSupabaseWithAuth();
    await reportListingMutation(supabase, userId, {
      listing_id: listingId,
      details,
    });
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit report",
    };
  }
}
