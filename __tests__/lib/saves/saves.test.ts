import { describe, it, expect, vi, beforeEach } from "vitest";
import { toggleListingSave } from "@/lib/saves/mutations";
import { getSavedListings, checkIfSaved } from "@/lib/saves/queries";

// Mock the Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

describe("Saves Mutations", () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  function createMockSupabase() {
    const mockChain = {
      from: vi.fn(),
      select: vi.fn(),
      insert: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      maybeSingle: vi.fn(),
    };
    // Set up the chain to return itself
    mockChain.from.mockImplementation(() => mockChain);
    mockChain.select.mockImplementation(() => mockChain);
    mockChain.eq.mockImplementation(() => mockChain);
    mockChain.delete.mockImplementation(() => mockChain);
    mockChain.insert.mockImplementation(() => mockChain);
    return mockChain;
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
  });

  describe("toggleListingSave", () => {
    it("should create a save when listing is not saved", async () => {
      mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });

      const result = await toggleListingSave(
        "550e8400-e29b-41d4-a716-446655440000",
        "user-123",
      );

      expect(result).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("listing_saves");
    });

    it("should throw error when insert fails", async () => {
      mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });
      mockSupabase.insert.mockImplementationOnce(() => ({
        error: new Error("Insert failed"),
      }));

      await expect(
        toggleListingSave("550e8400-e29b-41d4-a716-446655440000", "user-123"),
      ).rejects.toThrow("Insert failed");
    });
  });
});

describe("Saves Queries", () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  function createMockSupabase() {
    return {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    };
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
  });

  describe("getSavedListings", () => {
    it("should return saved listings for a user", async () => {
      const mockData = [
        {
          id: "save-1",
          listing_id: "listing-1",
          created_at: "2026-01-01T00:00:00Z",
          marketplace_listings: {
            title: "Test Listing",
            price_cents: 1000,
            is_free: false,
            status: "active",
          },
          marketplace_listing_images: [{ image_path: "/images/test.jpg" }],
        },
      ];

      const mockImageData = [
        { listing_id: "listing-1", image_path: "/images/test.jpg" },
      ];

      // Mock first query (saves)
      mockSupabase.order.mockResolvedValueOnce({ data: mockData, error: null });
      // Mock second query (images)
      mockSupabase.order.mockResolvedValueOnce({
        data: mockImageData,
        error: null,
      });

      const result = await getSavedListings("user-123");

      expect(result).toEqual([
        {
          id: "save-1",
          listing_id: "listing-1",
          created_at: "2026-01-01T00:00:00Z",
          listing_title: "Test Listing",
          listing_price_cents: 1000,
          listing_is_free: false,
          listing_status: "active",
          listing_image_url: "/images/test.jpg",
        },
      ]);
    });

    it("should return empty array when no saves", async () => {
      mockSupabase.order.mockResolvedValue({ data: [], error: null });

      const result = await getSavedListings("user-123");

      expect(result).toEqual([]);
    });

    it("should handle null listing images", async () => {
      const mockData = [
        {
          id: "save-1",
          listing_id: "listing-1",
          created_at: "2026-01-01T00:00:00Z",
          marketplace_listings: {
            title: "Test Listing",
            price_cents: 1000,
            is_free: false,
            status: "active",
          },
          marketplace_listing_images: [],
        },
      ];

      // Mock first query (saves)
      mockSupabase.order.mockResolvedValueOnce({ data: mockData, error: null });
      // Mock second query (images) returning no images
      mockSupabase.order.mockResolvedValueOnce({ data: [], error: null });

      const result = await getSavedListings("user-123");

      expect(result[0].listing_image_url).toBe(null);
    });

    it("should throw error when query fails", async () => {
      mockSupabase.order.mockResolvedValue({
        data: null,
        error: new Error("Query failed"),
      });

      await expect(getSavedListings("user-123")).rejects.toThrow(
        "Query failed",
      );
    });
  });

  describe("checkIfSaved", () => {
    it("should return true when listing is saved", async () => {
      mockSupabase.maybeSingle.mockResolvedValue({
        data: { id: "save-123" },
        error: null,
      });

      const result = await checkIfSaved("listing-123", "user-123");

      expect(result).toBe(true);
      expect(mockSupabase.eq).toHaveBeenCalledWith("listing_id", "listing-123");
      expect(mockSupabase.eq).toHaveBeenCalledWith("user_id", "user-123");
    });

    it("should return false when listing is not saved", async () => {
      mockSupabase.maybeSingle.mockResolvedValue({ data: null, error: null });

      const result = await checkIfSaved("listing-123", "user-123");

      expect(result).toBe(false);
    });
  });
});
