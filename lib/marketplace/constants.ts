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
export const CONDITIONS = ["New", "Like New", "Good", "Fair", "Parts"] as const;

export type Condition = (typeof CONDITIONS)[number];

// Listing status options
export const STATUSES = ["active", "sold", "removed"] as const;

export type Status = (typeof STATUSES)[number];

// Image constraints
export const IMAGE_CONSTRAINTS = {
  maxCount: 5,
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
} as const;

// Storage path template
export const STORAGE_PATH_TEMPLATE =
  "marketplace/{userId}/{listingId}/{fileName}";

// Placeholder image - 1x1 gray pixel data URL for Next.js Image component
export const PLACEHOLDER_IMAGE_PATH =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

// Report reason options
export const REPORT_REASONS = [
  "Prohibited Item",
  "Scam or Fraud",
  "Inappropriate Content",
  "Misleading Information",
  "Duplicate Listing",
  "Other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

// Validation constraints
export const VALIDATION_RULES = {
  title: { min: 3, max: 100 },
  description: { min: 10, max: 2000 },
  location: { max: 100 },
  reportDetails: { max: 500 },
  searchQuery: { max: 100 },
  priceFilter: { min: 0, max: 10000 }, // Max $10,000 for campus marketplace
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
