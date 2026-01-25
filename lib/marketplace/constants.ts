/**
 * Marketplace domain constants
 * Defines all enums, constraints, and business rules for the marketplace
 */

// Categories available for listings
export const CATEGORIES = [
  "Books",
  "Furniture",
  "Electronics",
  "Tickets",
  "Clothing",
  "Services",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Item condition options
export const CONDITIONS = [
  "New",
  "Like New",
  "Good",
  "Fair",
  "Parts",
] as const;

export type Condition = (typeof CONDITIONS)[number];

// Listing status options
export const STATUSES = ["active", "sold", "removed"] as const;

export type Status = (typeof STATUSES)[number];

// Image constraints
export const IMAGE_CONSTRAINTS = {
  maxCount: 5,
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
} as const;

// Storage path template
export const STORAGE_PATH_TEMPLATE = "marketplace/{userId}/{listingId}/{fileName}";

// Validation constraints
export const VALIDATION_RULES = {
  title: { min: 3, max: 100 },
  description: { min: 10, max: 2000 },
  location: { max: 100 },
  reportDetails: { max: 500 },
} as const;

// Prohibited items for the rules checkbox
export const PROHIBITED_ITEMS = [
  "Weapons or ammunition",
  "Illegal drugs or substances",
  "Stolen goods",
  "Counterfeit items",
  "Live animals",
  "Alcohol or tobacco (unless permitted by campus policy)",
  "Academic dishonesty materials (e.g., completed assignments)",
] as const;

// Safety note for sellers
export const SAFETY_NOTE =
  "Meet in public campus locations. Never share financial information beyond the transaction. Report suspicious activity.";

// Default filter values
export const DEFAULT_FILTERS = {
  status: "active" as Status,
  category: null,
  condition: null,
  priceMin: null,
  priceMax: null,
  freeOnly: false,
  search: "",
} as const;
