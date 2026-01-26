import { describe, it, expect } from "vitest";
import type {
  MarketplaceListing,
  CreateListingInput,
  UpdateListingInput,
  ReportListingInput,
  ListingFilters,
} from "@/lib/marketplace/types";

describe("Marketplace Types", () => {
  describe("Type definitions", () => {
    it("should allow valid MarketplaceListing structure", () => {
      const listing: MarketplaceListing = {
        id: "123",
        title: "Test Item",
        description: "Test description",
        category: "Books",
        condition: "Good",
        price_cents: 1000,
        is_free: false,
        location_text: "Campus Library",
        status: "active",
        seller_id: "user123",
        created_at: "2026-01-26T00:00:00Z",
        updated_at: "2026-01-26T00:00:00Z",
      };
      expect(listing).toBeDefined();
    });

    it("should allow null for optional fields", () => {
      const listing: MarketplaceListing = {
        id: "123",
        title: "Test Item",
        description: "Test description",
        category: "Books",
        condition: null,
        price_cents: null,
        is_free: true,
        location_text: null,
        status: "active",
        seller_id: "user123",
        created_at: "2026-01-26T00:00:00Z",
        updated_at: "2026-01-26T00:00:00Z",
      };
      expect(listing).toBeDefined();
    });

    it("should allow valid CreateListingInput structure", () => {
      const input: CreateListingInput = {
        title: "Test Item",
        description: "Test description with enough characters",
        category: "Books",
        condition: "Good",
        price_cents: 1000,
        is_free: false,
        location: "Campus Library",
        images: [],
        agreed_to_rules: true,
      };
      expect(input).toBeDefined();
    });

    it("should allow partial UpdateListingInput", () => {
      const update: UpdateListingInput = {
        title: "Updated Title",
      };
      expect(update).toBeDefined();
    });

    it("should allow full UpdateListingInput", () => {
      const update: UpdateListingInput = {
        title: "Updated Title",
        description: "Updated description",
        category: "Electronics",
        condition: "Like New",
        price_cents: 2000,
        is_free: false,
        location: "New Location",
        images_to_add: [],
        images_to_remove: ["img1", "img2"],
      };
      expect(update).toBeDefined();
    });

    it("should allow valid ReportListingInput", () => {
      const report: ReportListingInput = {
        listing_id: "123",
        details: "This listing violates marketplace rules",
      };
      expect(report).toBeDefined();
    });

    it("should allow ListingFilters with all options", () => {
      const filters: ListingFilters = {
        status: "active",
        category: "Books",
        condition: "Good",
        priceMin: 0,
        priceMax: 5000,
        freeOnly: false,
        search: "textbook",
      };
      expect(filters).toBeDefined();
    });

    it("should allow empty ListingFilters", () => {
      const filters: ListingFilters = {};
      expect(filters).toBeDefined();
    });

    it("should allow null values in ListingFilters", () => {
      const filters: ListingFilters = {
        category: null,
        condition: null,
        priceMin: null,
        priceMax: null,
      };
      expect(filters).toBeDefined();
    });
  });
});
