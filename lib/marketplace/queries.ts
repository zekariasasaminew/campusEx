/**
 * Marketplace read operations (queries)
 * All database queries for browsing, searching, and fetching listings
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ListingWithImages,
  ListingDetail,
  ListingFilters,
  MarketplaceListingImage,
} from "./types";
import { DEFAULT_FILTERS } from "./constants";

/**
 * Get listings with filters, search, and pagination
 */
export async function getListings(
  supabase: SupabaseClient,
  filters: ListingFilters = {},
  page: number = 1,
  limit: number = 20,
): Promise<{ data: ListingWithImages[]; count: number }> {
  const {
    status = DEFAULT_FILTERS.status,
    category,
    condition,
    priceMin,
    priceMax,
    freeOnly,
    search,
  } = filters;

  let query = supabase
    .from("marketplace_listings")
    .select("*, images:marketplace_listing_images(*)", { count: "exact" });

  // Status filter (default to active only)
  query = query.eq("status", status);

  // Category filter
  if (category) {
    query = query.eq("category", category);
  }

  // Condition filter
  if (condition) {
    query = query.eq("condition", condition);
  }

  // Price filters
  if (freeOnly) {
    query = query.eq("is_free", true);
  } else {
    if (priceMin !== null && priceMin !== undefined) {
      query = query.eq("is_free", false).gte("price_cents", priceMin);
    }
    if (priceMax !== null && priceMax !== undefined) {
      query = query.eq("is_free", false).lte("price_cents", priceMax);
    }
  }

  // Search filter (ilike on title and description)
  if (search && search.trim().length > 0) {
    const searchTerm = `%${search.trim()}%`;
    query = query.or(
      `title.ilike.${searchTerm},description.ilike.${searchTerm}`,
    );
  }

  // Order by newest first
  query = query.order("created_at", { ascending: false });

  // Pagination
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch listings: ${error.message}`);
  }

  const enhanced = ((data as any[]) || []).map((listing) => ({
    ...listing,
    location: listing.location_text || null,
    price: listing.price_cents ? listing.price_cents / 100 : undefined,
    images: listing.images || [],
  })) as ListingWithImages[];

  return {
    data: enhanced,
    count: count || 0,
  };
}

/**
 * Get a single listing by ID with ownership check
 */
export async function getListingById(
  supabase: SupabaseClient,
  listingId: string,
  userId: string | null,
): Promise<ListingDetail | null> {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select(
      "*, images:marketplace_listing_images(*), seller:users!seller_id(email)",
    )
    .eq("id", listingId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch listing: ${error.message}`);
  }

  const listing = data as any;
  const isOwner = userId ? listing.seller_id === userId : false;

  return {
    ...listing,
    location: listing.location_text || null,
    price: listing.price_cents ? listing.price_cents / 100 : undefined,
    is_owner: isOwner,
    seller: listing.seller,
    images: listing.images || [],
  } as ListingDetail;
}

/**
 * Get images for a specific listing
 */
export async function getListingImages(
  supabase: SupabaseClient,
  listingId: string,
): Promise<MarketplaceListingImage[]> {
  const { data, error } = await supabase
    .from("marketplace_listing_images")
    .select("*")
    .eq("listing_id", listingId)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch images: ${error.message}`);
  }

  return data || [];
}

/**
 * Get listings by seller
 */
export async function getListingsBySeller(
  supabase: SupabaseClient,
  sellerId: string,
  limit: number = 10,
): Promise<ListingWithImages[]> {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("*, images:marketplace_listing_images(*)")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch seller listings: ${error.message}`);
  }

  return (data as ListingWithImages[]) || [];
}

/**
 * Check if user is the owner of a listing
 */
export async function checkListingOwnership(
  supabase: SupabaseClient,
  listingId: string,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from("marketplace_listings")
    .select("seller_id")
    .eq("id", listingId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.seller_id === userId;
}
