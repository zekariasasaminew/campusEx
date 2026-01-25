/**
 * Marketplace type definitions
 * TypeScript interfaces for all marketplace entities
 */

import type { Category, Condition, Status } from "./constants";

// Database table types (matching schema)

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: Category;
  condition: Condition | null;
  price_cents: number | null;
  is_free: boolean;
  location_text: string | null;
  status: Status;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceListingImage {
  id: string;
  listing_id: string;
  image_path: string;
  sort_order: number;
  created_at: string;
  image_url?: string; // Added client-side for enhanced responses
}

export interface MarketplaceReport {
  id: string;
  listing_id: string;
  reporter_id: string;
  details: string;
  created_at: string;
}

// Composite types for queries

export interface ListingWithImages extends MarketplaceListing {
  images: MarketplaceListingImage[];
  image_count?: number;
  price?: number; // Computed: price_cents / 100
  location?: string | null; // Mapped from location_text for client use
}

export interface ListingDetail extends ListingWithImages {
  is_owner: boolean;
  seller: { email: string }; // Seller info for display
}

// Form types

export interface CreateListingInput {
  title: string;
  description: string;
  category: Category;
  condition: Condition | null;
  price_cents: number | null;
  is_free: boolean;
  location: string | null;
  images: File[];
  agreed_to_rules: boolean;
}

export interface UpdateListingInput {
  title?: string;
  description?: string;
  category?: Category;
  condition?: Condition | null;
  price_cents?: number | null;
  is_free?: boolean;
  location?: string | null;
  images_to_add?: File[];
  images_to_remove?: string[]; // image IDs
}

export interface ReportListingInput {
  listing_id: string;
  details: string;
}

// Filter types

export interface ListingFilters {
  status?: Status;
  category?: Category | null;
  condition?: Condition | null;
  priceMin?: number | null;
  priceMax?: number | null;
  freeOnly?: boolean;
  search?: string;
}

// Response types

export interface PaginatedListings {
  data: ListingWithImages[];
  count: number;
  hasMore: boolean;
}

export interface UploadedImage {
  image_path: string;
  sort_order: number;
}

// Validation result type

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
