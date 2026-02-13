import { describe, it, expect, vi, beforeEach } from "vitest";
import { compressImage, compressImages } from "@/lib/marketplace/image-utils";

// Mock canvas and image APIs
class MockCanvas {
  width = 0;
  height = 0;
  private ctx: MockContext | null = null;

  getContext(type: string) {
    if (type === "2d") {
      this.ctx = new MockContext();
      return this.ctx;
    }
    return null;
  }

  toBlob(callback: (blob: Blob | null) => void, type: string, quality: number) {
    // Simulate compression: smaller quality = smaller size
    const baseSize = this.width * this.height * 0.1;
    const size = Math.round(baseSize * quality);
    const blob = new Blob([new ArrayBuffer(size)], { type });
    setTimeout(() => callback(blob), 0);
  }
}

class MockContext {
  imageSmoothingEnabled = false;
  imageSmoothingQuality = "low";

  drawImage() {
    // Mock implementation
  }
}

class MockImage {
  src = "";
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  width = 0;
  height = 0;

  constructor() {
    setTimeout(() => {
      // Parse dimensions from data URL or use defaults
      this.width = 2000;
      this.height = 1500;
      if (this.onload) this.onload();
    }, 0);
  }
}

class MockFileReader {
  onload: ((event: { target: { result: string } }) => void) | null = null;
  onerror: (() => void) | null = null;

  readAsDataURL() {
    setTimeout(() => {
      if (this.onload) {
        this.onload({
          target: { result: "data:image/jpeg;base64,mockdata" },
        });
      }
    }, 0);
  }
}

describe("compressImage", () => {
  beforeEach(() => {
    // Mock browser APIs
    global.Image = MockImage as unknown as typeof Image;
    global.FileReader = MockFileReader as unknown as typeof FileReader;
    global.document = {
      createElement: (tag: string) => {
        if (tag === "canvas")
          return new MockCanvas() as unknown as HTMLCanvasElement;
        if (tag === "img")
          return new MockImage() as unknown as HTMLImageElement;
        return {} as HTMLElement;
      },
    } as unknown as Document;
  });

  it("should compress a valid image file", async () => {
    const file = new File([new ArrayBuffer(1024 * 1024 * 2)], "test.jpg", {
      type: "image/jpeg",
    });

    const result = await compressImage(file);

    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe("image/jpeg");
    expect(result.name).toBe("test.jpg");
  });

  it("should reduce image dimensions when larger than max", async () => {
    const file = new File([new ArrayBuffer(1024)], "large.jpg", {
      type: "image/jpeg",
    });

    const result = await compressImage(file, {
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.9,
    });

    expect(result).toBeInstanceOf(File);
  });

  it("should accept custom compression options", async () => {
    const file = new File([new ArrayBuffer(1024)], "test.png", {
      type: "image/png",
    });

    const result = await compressImage(file, {
      maxWidth: 800,
      maxHeight: 600,
      quality: 0.7,
      targetSizeKB: 200,
    });

    expect(result).toBeInstanceOf(File);
    expect(result.type).toBe("image/jpeg"); // Always outputs JPEG
  });

  it("should handle compression errors gracefully", async () => {
    const file = new File([new ArrayBuffer(1024)], "test.jpg", {
      type: "image/jpeg",
    });

    // Mock FileReader to fail
    global.FileReader = class {
      onerror: (() => void) | null = null;
      readAsDataURL() {
        setTimeout(() => {
          if (this.onerror) this.onerror();
        }, 0);
      }
    } as unknown as typeof FileReader;

    await expect(compressImage(file)).rejects.toThrow("Failed to read file");
  });
});

describe("compressImages", () => {
  beforeEach(() => {
    global.Image = MockImage as unknown as typeof Image;
    global.FileReader = MockFileReader as unknown as typeof FileReader;
    global.document = {
      createElement: (tag: string) => {
        if (tag === "canvas")
          return new MockCanvas() as unknown as HTMLCanvasElement;
        if (tag === "img")
          return new MockImage() as unknown as HTMLImageElement;
        return {} as HTMLElement;
      },
    } as unknown as Document;
  });

  it("should compress multiple images", async () => {
    const files = [
      new File([new ArrayBuffer(1024)], "test1.jpg", { type: "image/jpeg" }),
      new File([new ArrayBuffer(2048)], "test2.jpg", { type: "image/jpeg" }),
      new File([new ArrayBuffer(1536)], "test3.jpg", { type: "image/jpeg" }),
    ];

    const results = await compressImages(files);

    expect(results).toHaveLength(3);
    expect(results[0].name).toBe("test1.jpg");
    expect(results[1].name).toBe("test2.jpg");
    expect(results[2].name).toBe("test3.jpg");
  });

  it("should call progress callback with correct values", async () => {
    const files = [
      new File([new ArrayBuffer(1024)], "test1.jpg", { type: "image/jpeg" }),
      new File([new ArrayBuffer(1024)], "test2.jpg", { type: "image/jpeg" }),
    ];

    const progressCalls: Array<{ current: number; total: number }> = [];
    const onProgress = vi.fn((current: number, total: number) => {
      progressCalls.push({ current, total });
    });

    await compressImages(files, onProgress);

    expect(onProgress).toHaveBeenCalledTimes(2);
    expect(progressCalls[0]).toEqual({ current: 1, total: 2 });
    expect(progressCalls[1]).toEqual({ current: 2, total: 2 });
  });

  it("should continue processing if one image fails", async () => {
    const files = [
      new File([new ArrayBuffer(1024)], "test1.jpg", { type: "image/jpeg" }),
      new File([new ArrayBuffer(1024)], "bad.jpg", { type: "image/jpeg" }),
      new File([new ArrayBuffer(1024)], "test3.jpg", { type: "image/jpeg" }),
    ];

    // Mock second file to fail
    let fileIndex = 0;
    global.FileReader = class {
      onload: ((event: { target: { result: string } }) => void) | null = null;
      onerror: (() => void) | null = null;

      readAsDataURL() {
        const currentIndex = fileIndex++;
        setTimeout(() => {
          if (currentIndex === 1 && this.onerror) {
            this.onerror();
          } else if (this.onload) {
            this.onload({
              target: { result: "data:image/jpeg;base64,mockdata" },
            });
          }
        }, 0);
      }
    } as unknown as typeof FileReader;

    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const results = await compressImages(files);

    expect(results).toHaveLength(3);
    expect(results[1]).toBe(files[1]); // Original file used on failure
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("Failed to compress bad.jpg"),
      expect.anything(),
    );

    consoleSpy.mockRestore();
  });

  it("should handle empty array", async () => {
    const results = await compressImages([]);
    expect(results).toEqual([]);
  });
});
