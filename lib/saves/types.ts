/**
 * Saves type definitions
 * TypeScript interfaces for listing saves
 */

export interface ListingSave {
  id: string;
  listing_id: string;
  user_id: string;
  created_at: string;
}

export interface SavedListingWithDetails {
  id: string;
  listing_id: string;
  created_at: string;
  listing_title: string;
  listing_price_cents: number | null;
  listing_is_free: boolean;
  listing_image_url: string | null;
  listing_status: string;
}
