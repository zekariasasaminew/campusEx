import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSaved,
  toggleListingSave,
  isListingSaved,
} from "@/lib/saves/actions";

// Mock the Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

// Mock the queries and mutations
vi.mock("@/lib/saves/queries", () => ({
  getSavedListings: vi.fn(),
  checkIfSaved: vi.fn(),
}));

vi.mock("@/lib/saves/mutations", () => ({
  toggleListingSave: vi.fn(),
}));

describe("Saves Actions", () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  function createMockSupabase() {
    return {
      auth: {
        getUser: vi.fn(),
      },
    };
  }

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
    const { createClient } = await import("@/lib/supabase/server");
    vi.mocked(createClient).mockResolvedValue(mockSupabase as never);
  });

  describe("getSaved", () => {
    it("should return saved listings for authenticated user", async () => {
      const mockUser = { id: "user-123" };
      const mockSavedListings = [
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
      ];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { getSavedListings } = await import("@/lib/saves/queries");
      vi.mocked(getSavedListings).mockResolvedValue(mockSavedListings);

      const result = await getSaved();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(mockSavedListings);
      }
    });

    it("should return error when user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getSaved();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Not authenticated");
      }
    });

    it("should return error when query fails", async () => {
      const mockUser = { id: "user-123" };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { getSavedListings } = await import("@/lib/saves/queries");
      vi.mocked(getSavedListings).mockRejectedValue(new Error("Query failed"));

      const result = await getSaved();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Query failed");
      }
    });
  });

  describe("toggleListingSave", () => {
    it("should toggle save for authenticated user", async () => {
      const mockUser = { id: "user-123" };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { toggleListingSave: toggleMutation } =
        await import("@/lib/saves/mutations");
      vi.mocked(toggleMutation).mockResolvedValue(true);

      const result = await toggleListingSave("listing-123");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
      expect(toggleMutation).toHaveBeenCalledWith("listing-123", "user-123");
    });

    it("should return error when user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await toggleListingSave("listing-123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Not authenticated");
      }
    });

    it("should return error when mutation fails", async () => {
      const mockUser = { id: "user-123" };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { toggleListingSave: toggleMutation } =
        await import("@/lib/saves/mutations");
      vi.mocked(toggleMutation).mockRejectedValue(new Error("Mutation failed"));

      const result = await toggleListingSave("listing-123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Mutation failed");
      }
    });
  });

  describe("isListingSaved", () => {
    it("should check if listing is saved for authenticated user", async () => {
      const mockUser = { id: "user-123" };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { checkIfSaved } = await import("@/lib/saves/queries");
      vi.mocked(checkIfSaved).mockResolvedValue(true);

      const result = await isListingSaved("listing-123");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(true);
      }
      expect(checkIfSaved).toHaveBeenCalledWith("listing-123", "user-123");
    });

    it("should return error when user is not authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await isListingSaved("listing-123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Not authenticated");
      }
    });

    it("should return error when query fails", async () => {
      const mockUser = { id: "user-123" };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const { checkIfSaved } = await import("@/lib/saves/queries");
      vi.mocked(checkIfSaved).mockRejectedValue(new Error("Query failed"));

      const result = await isListingSaved("listing-123");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Query failed");
      }
    });
  });
});
