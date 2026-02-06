import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  uploadListingImages,
  deleteListingImages,
  getImageUrl,
  getImageUrls,
} from "@/lib/marketplace/storage";
import { IMAGE_CONSTRAINTS } from "@/lib/marketplace/constants";

describe("Marketplace Storage", () => {
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  function createMockSupabase() {
    return {
      storage: {
        from: vi.fn().mockReturnThis(),
        upload: vi.fn(),
        remove: vi.fn(),
        getPublicUrl: vi.fn(),
      },
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      insert: vi.fn(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn(),
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = createMockSupabase();
  });

  describe("uploadListingImages", () => {
    const createMockFile = (name: string, type = "image/jpeg"): File => {
      return new File(["content"], name, { type });
    };

    it("should upload images successfully", async () => {
      const mockImages = [
        createMockFile("test1.jpg"),
        createMockFile("test2.png"),
      ];

      mockSupabase.storage.upload.mockResolvedValue({ error: null });
      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await uploadListingImages(
        mockSupabase as never,
        "listing-123",
        "user-123",
        mockImages,
      );

      expect(result).toHaveLength(2);
      expect(result[0].sort_order).toBe(0);
      expect(result[1].sort_order).toBe(1);
      expect(mockSupabase.storage.upload).toHaveBeenCalledTimes(2);
      expect(mockSupabase.insert).toHaveBeenCalledTimes(2);
    });

    it("should throw error when no images provided", async () => {
      await expect(
        uploadListingImages(
          mockSupabase as never,
          "listing-123",
          "user-123",
          [],
        ),
      ).rejects.toThrow("At least one image is required");
    });

    it("should throw error when too many images", async () => {
      const tooManyImages = Array.from(
        { length: IMAGE_CONSTRAINTS.maxCount + 1 },
        (_, i) => createMockFile(`test${i}.jpg`),
      );

      await expect(
        uploadListingImages(
          mockSupabase as never,
          "listing-123",
          "user-123",
          tooManyImages,
        ),
      ).rejects.toThrow(`Maximum ${IMAGE_CONSTRAINTS.maxCount} images allowed`);
    });

    it("should handle upload errors gracefully", async () => {
      const mockImages = [
        createMockFile("test1.jpg"),
        createMockFile("test2.jpg"),
      ];

      mockSupabase.storage.upload
        .mockResolvedValueOnce({ error: new Error("Upload failed") })
        .mockResolvedValueOnce({ error: null });

      mockSupabase.insert.mockResolvedValue({ error: null });

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      const result = await uploadListingImages(
        mockSupabase as never,
        "listing-123",
        "user-123",
        mockImages,
      );

      expect(result).toHaveLength(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Some images failed to upload"),
      );

      consoleWarnSpy.mockRestore();
    });

    it("should cleanup storage when database insert fails", async () => {
      const mockImages = [createMockFile("test.jpg")];

      mockSupabase.storage.upload.mockResolvedValue({ error: null });
      mockSupabase.insert.mockResolvedValue({
        error: new Error("DB insert failed"),
      });
      mockSupabase.storage.remove.mockResolvedValue({ error: null });

      await expect(
        uploadListingImages(
          mockSupabase as never,
          "listing-123",
          "user-123",
          mockImages,
        ),
      ).rejects.toThrow("All image uploads failed");

      expect(mockSupabase.storage.remove).toHaveBeenCalled();
    });

    it("should sanitize file extensions", async () => {
      const mockImages = [createMockFile("test.invalidext123")];

      mockSupabase.storage.upload.mockResolvedValue({ error: null });
      mockSupabase.insert.mockResolvedValue({ error: null });

      const result = await uploadListingImages(
        mockSupabase as never,
        "listing-123",
        "user-123",
        mockImages,
      );

      expect(result[0].image_path).toMatch(/\.jpg$/);
    });
  });

  describe("deleteListingImages", () => {
    it("should delete images successfully", async () => {
      const mockImageData = [
        { image_path: "path/to/image1.jpg" },
        { image_path: "path/to/image2.jpg" },
      ];

      mockSupabase.in.mockResolvedValueOnce({
        data: mockImageData,
        error: null,
      });
      mockSupabase.in.mockResolvedValueOnce({ error: null });
      mockSupabase.storage.remove.mockResolvedValue({ error: null });

      await deleteListingImages(mockSupabase as never, "listing-123", [
        "img-1",
        "img-2",
      ]);

      expect(mockSupabase.delete).toHaveBeenCalled();
      expect(mockSupabase.storage.remove).toHaveBeenCalledWith([
        "path/to/image1.jpg",
        "path/to/image2.jpg",
      ]);
    });

    it("should do nothing when no image IDs provided", async () => {
      await deleteListingImages(mockSupabase as never, "listing-123", []);

      expect(mockSupabase.delete).not.toHaveBeenCalled();
      expect(mockSupabase.storage.remove).not.toHaveBeenCalled();
    });

    it("should throw error when database delete fails", async () => {
      mockSupabase.in.mockResolvedValueOnce({ data: [], error: null });
      mockSupabase.in.mockResolvedValueOnce({
        error: new Error("Delete failed"),
      });

      await expect(
        deleteListingImages(mockSupabase as never, "listing-123", ["img-1"]),
      ).rejects.toThrow("Failed to delete image records");
    });

    it("should continue even if storage deletion fails", async () => {
      const mockImageData = [{ image_path: "path/to/image.jpg" }];

      mockSupabase.in.mockResolvedValueOnce({
        data: mockImageData,
        error: null,
      });
      mockSupabase.in.mockResolvedValueOnce({ error: null });
      mockSupabase.storage.remove.mockRejectedValue(
        new Error("Storage delete failed"),
      );

      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {});

      await deleteListingImages(mockSupabase as never, "listing-123", [
        "img-1",
      ]);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Failed to delete some images from storage"),
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("getImageUrl", () => {
    it("should return public URL for valid storage path", () => {
      mockSupabase.storage.getPublicUrl.mockReturnValue({
        data: { publicUrl: "https://example.com/image.jpg" },
      });

      const result = getImageUrl(mockSupabase as never, "path/to/image.jpg");

      expect(result).toBe("https://example.com/image.jpg");
      expect(mockSupabase.storage.from).toHaveBeenCalledWith(
        "marketplace-images",
      );
    });

    it("should return placeholder for null path", () => {
      const result = getImageUrl(mockSupabase as never, null);

      expect(result).toBe("/placeholder-image.png");
      expect(mockSupabase.storage.getPublicUrl).not.toHaveBeenCalled();
    });

    it("should return placeholder for undefined path", () => {
      const result = getImageUrl(mockSupabase as never, undefined);

      expect(result).toBe("/placeholder-image.png");
    });

    it("should return placeholder for empty path", () => {
      const result = getImageUrl(mockSupabase as never, "");

      expect(result).toBe("/placeholder-image.png");
    });
  });

  describe("getImageUrls", () => {
    it("should return public URLs for multiple paths", () => {
      mockSupabase.storage.getPublicUrl
        .mockReturnValueOnce({
          data: { publicUrl: "https://example.com/image1.jpg" },
        })
        .mockReturnValueOnce({
          data: { publicUrl: "https://example.com/image2.jpg" },
        });

      const result = getImageUrls(mockSupabase as never, [
        "path/to/image1.jpg",
        "path/to/image2.jpg",
      ]);

      expect(result).toEqual([
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg",
      ]);
    });

    it("should return empty array for empty input", () => {
      const result = getImageUrls(mockSupabase as never, []);

      expect(result).toEqual([]);
    });
  });
});
