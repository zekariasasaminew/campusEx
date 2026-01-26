import { describe, it, expect } from "vitest";
import {
  CATEGORIES,
  CONDITIONS,
  STATUSES,
  VALIDATION_RULES,
  IMAGE_CONSTRAINTS,
  PLACEHOLDER_IMAGE_PATH,
} from "@/lib/marketplace/constants";

describe("Marketplace Constants", () => {
  describe("CATEGORIES", () => {
    it("should contain all expected categories", () => {
      expect(CATEGORIES).toContain("Books");
      expect(CATEGORIES).toContain("Electronics");
      expect(CATEGORIES).toContain("Furniture");
      expect(CATEGORIES).toContain("Clothing");
      expect(CATEGORIES).toContain("Tickets");
      expect(CATEGORIES).toContain("Services");
      expect(CATEGORIES).toContain("Other");
    });

    it("should have at least 7 categories", () => {
      expect(CATEGORIES.length).toBeGreaterThanOrEqual(7);
    });

    it("should not contain duplicates", () => {
      const unique = new Set(CATEGORIES);
      expect(unique.size).toBe(CATEGORIES.length);
    });
  });

  describe("CONDITIONS", () => {
    it("should contain all condition levels", () => {
      expect(CONDITIONS).toContain("New");
      expect(CONDITIONS).toContain("Like New");
      expect(CONDITIONS).toContain("Good");
      expect(CONDITIONS).toContain("Fair");
      expect(CONDITIONS).toContain("Parts");
    });

    it("should have exactly 5 condition levels", () => {
      expect(CONDITIONS.length).toBe(5);
    });
  });

  describe("STATUSES", () => {
    it("should contain active and sold statuses", () => {
      expect(STATUSES).toContain("active");
      expect(STATUSES).toContain("sold");
    });
  });

  describe("VALIDATION_RULES", () => {
    it("should have title rules with min and max", () => {
      expect(VALIDATION_RULES.title.min).toBe(3);
      expect(VALIDATION_RULES.title.max).toBe(100);
    });

    it("should have description rules with min and max", () => {
      expect(VALIDATION_RULES.description.min).toBe(10);
      expect(VALIDATION_RULES.description.max).toBe(2000);
    });

    it("should have location max length", () => {
      expect(VALIDATION_RULES.location.max).toBe(100);
    });

    it("should have report details max length", () => {
      expect(VALIDATION_RULES.reportDetails.max).toBe(500);
    });

    it("should have reasonable constraints", () => {
      expect(VALIDATION_RULES.title.min).toBeLessThan(
        VALIDATION_RULES.title.max,
      );
      expect(VALIDATION_RULES.description.min).toBeLessThan(
        VALIDATION_RULES.description.max,
      );
    });
  });

  describe("IMAGE_CONSTRAINTS", () => {
    it("should have max count of 5", () => {
      expect(IMAGE_CONSTRAINTS.maxCount).toBe(5);
    });

    it("should have 5MB max size", () => {
      expect(IMAGE_CONSTRAINTS.maxSizeBytes).toBe(5 * 1024 * 1024);
    });

    it("should allow common image types", () => {
      expect(IMAGE_CONSTRAINTS.allowedTypes).toContain("image/jpeg");
      expect(IMAGE_CONSTRAINTS.allowedTypes).toContain("image/png");
      expect(IMAGE_CONSTRAINTS.allowedTypes).toContain("image/webp");
    });

    it("should have matching extensions and types", () => {
      expect(IMAGE_CONSTRAINTS.allowedExtensions).toContain(".jpg");
      expect(IMAGE_CONSTRAINTS.allowedExtensions).toContain(".jpeg");
      expect(IMAGE_CONSTRAINTS.allowedExtensions).toContain(".png");
      expect(IMAGE_CONSTRAINTS.allowedExtensions).toContain(".webp");
    });
  });

  describe("PLACEHOLDER_IMAGE_PATH", () => {
    it("should be a valid path string", () => {
      expect(typeof PLACEHOLDER_IMAGE_PATH).toBe("string");
      expect(PLACEHOLDER_IMAGE_PATH.length).toBeGreaterThan(0);
    });
  });
});
