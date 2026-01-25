/**
 * Marketplace validators
 * Client and server-side validation functions
 */

import {
  CATEGORIES,
  CONDITIONS,
  STATUSES,
  VALIDATION_RULES,
  IMAGE_CONSTRAINTS,
  type Category,
  type Condition,
  type Status,
} from "./constants";
import type {
  CreateListingInput,
  UpdateListingInput,
  ReportListingInput,
  ValidationResult,
} from "./types";

// Helper functions

function isValidCategory(value: unknown): value is Category {
  return typeof value === "string" && CATEGORIES.includes(value as Category);
}

function isValidCondition(value: unknown): value is Condition {
  return typeof value === "string" && CONDITIONS.includes(value as Condition);
}

function isValidStatus(value: unknown): value is Status {
  return typeof value === "string" && STATUSES.includes(value as Status);
}

function isValidFileType(file: File): boolean {
  return IMAGE_CONSTRAINTS.allowedTypes.includes(file.type);
}

function isValidFileSize(file: File): boolean {
  return file.size <= IMAGE_CONSTRAINTS.maxSizeBytes;
}

// Price validation logic

export function validatePriceAndFree(
  priceCents: number | null,
  isFree: boolean
): { isValid: boolean; error?: string } {
  if (isFree && priceCents !== null) {
    return {
      isValid: false,
      error: "Price must be empty when item is marked as free",
    };
  }

  if (!isFree && priceCents === null) {
    return {
      isValid: false,
      error: "Price is required when item is not free",
    };
  }

  if (priceCents !== null && (priceCents < 0 || !Number.isInteger(priceCents))) {
    return {
      isValid: false,
      error: "Price must be a non-negative whole number",
    };
  }

  return { isValid: true };
}

// Create listing validation

export function validateCreateListing(
  input: Partial<CreateListingInput>
): ValidationResult {
  const errors: Record<string, string> = {};

  // Title validation
  if (!input.title || typeof input.title !== "string") {
    errors.title = "Title is required";
  } else if (input.title.trim().length < VALIDATION_RULES.title.min) {
    errors.title = `Title must be at least ${VALIDATION_RULES.title.min} characters`;
  } else if (input.title.length > VALIDATION_RULES.title.max) {
    errors.title = `Title must not exceed ${VALIDATION_RULES.title.max} characters`;
  }

  // Description validation
  if (!input.description || typeof input.description !== "string") {
    errors.description = "Description is required";
  } else if (input.description.trim().length < VALIDATION_RULES.description.min) {
    errors.description = `Description must be at least ${VALIDATION_RULES.description.min} characters`;
  } else if (input.description.length > VALIDATION_RULES.description.max) {
    errors.description = `Description must not exceed ${VALIDATION_RULES.description.max} characters`;
  }

  // Category validation
  if (!input.category || !isValidCategory(input.category)) {
    errors.category = "Please select a valid category";
  }

  // Condition validation (optional field, but must be valid if provided)
  if (input.condition !== null && input.condition !== undefined && !isValidCondition(input.condition)) {
    errors.condition = "Please select a valid condition";
  }

  // Location validation (optional)
  if (input.location && input.location.length > VALIDATION_RULES.location.max) {
    errors.location = `Location must not exceed ${VALIDATION_RULES.location.max} characters`;
  }

  // Price validation
  const priceValidation = validatePriceAndFree(
    input.price_cents ?? null,
    input.is_free ?? false
  );
  if (!priceValidation.isValid && priceValidation.error) {
    errors.price = priceValidation.error;
  }

  // Images validation
  if (!input.images || !Array.isArray(input.images)) {
    errors.images = "At least one image is required";
  } else if (input.images.length === 0) {
    errors.images = "At least one image is required";
  } else if (input.images.length > IMAGE_CONSTRAINTS.maxCount) {
    errors.images = `Maximum ${IMAGE_CONSTRAINTS.maxCount} images allowed`;
  } else {
    const invalidTypes = input.images.filter((file) => !isValidFileType(file));
    if (invalidTypes.length > 0) {
      errors.images = `Invalid file type. Allowed: ${IMAGE_CONSTRAINTS.allowedExtensions.join(", ")}`;
    }

    const oversizedFiles = input.images.filter((file) => !isValidFileSize(file));
    if (oversizedFiles.length > 0) {
      errors.images = `File size must not exceed ${IMAGE_CONSTRAINTS.maxSizeBytes / (1024 * 1024)}MB`;
    }
  }

  // Rules agreement validation
  if (!input.agreed_to_rules) {
    errors.rules = "You must agree to the marketplace rules";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Update listing validation

export function validateUpdateListing(
  input: Partial<UpdateListingInput>
): ValidationResult {
  const errors: Record<string, string> = {};

  // Title validation (optional in update)
  if (input.title !== undefined) {
    if (typeof input.title !== "string") {
      errors.title = "Title must be a string";
    } else if (input.title.trim().length < VALIDATION_RULES.title.min) {
      errors.title = `Title must be at least ${VALIDATION_RULES.title.min} characters`;
    } else if (input.title.length > VALIDATION_RULES.title.max) {
      errors.title = `Title must not exceed ${VALIDATION_RULES.title.max} characters`;
    }
  }

  // Description validation (optional in update)
  if (input.description !== undefined) {
    if (typeof input.description !== "string") {
      errors.description = "Description must be a string";
    } else if (input.description.trim().length < VALIDATION_RULES.description.min) {
      errors.description = `Description must be at least ${VALIDATION_RULES.description.min} characters`;
    } else if (input.description.length > VALIDATION_RULES.description.max) {
      errors.description = `Description must not exceed ${VALIDATION_RULES.description.max} characters`;
    }
  }

  // Category validation (optional in update)
  if (input.category !== undefined && !isValidCategory(input.category)) {
    errors.category = "Please select a valid category";
  }

  // Condition validation (optional in update)
  if (input.condition !== undefined && input.condition !== null && !isValidCondition(input.condition)) {
    errors.condition = "Please select a valid condition";
  }

  // Location validation (optional in update)
  if (input.location !== undefined && input.location !== null && input.location.length > VALIDATION_RULES.location.max) {
    errors.location = `Location must not exceed ${VALIDATION_RULES.location.max} characters`;
  }

  // Price validation (if either is updated)
  if (input.price_cents !== undefined || input.is_free !== undefined) {
    const priceValidation = validatePriceAndFree(
      input.price_cents ?? null,
      input.is_free ?? false
    );
    if (!priceValidation.isValid && priceValidation.error) {
      errors.price = priceValidation.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Report validation

export function validateReport(input: Partial<ReportListingInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.listing_id || typeof input.listing_id !== "string") {
    errors.listing_id = "Listing ID is required";
  }

  if (!input.details || typeof input.details !== "string") {
    errors.details = "Report details are required";
  } else if (input.details.trim().length === 0) {
    errors.details = "Report details cannot be empty";
  } else if (input.details.length > VALIDATION_RULES.reportDetails.max) {
    errors.details = `Details must not exceed ${VALIDATION_RULES.reportDetails.max} characters`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
