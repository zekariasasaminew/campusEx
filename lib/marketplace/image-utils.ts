/**
 * Image compression utilities for marketplace listings
 * Compresses images client-side before upload to improve performance
 * and prevent timeouts on mobile devices
 */

export interface CompressionOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  targetSizeKB?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  targetSizeKB: 500,
};

/**
 * Compress an image file to reduce size
 * Returns a new File object with compressed image data
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {},
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = document.createElement("img");

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > opts.maxWidth || height > opts.maxHeight) {
            const ratio = Math.min(
              opts.maxWidth / width,
              opts.maxHeight / height,
            );
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Draw image with high quality
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, 0, 0, width, height);

          // Try to compress to target size
          let quality = opts.quality;
          let attempt = 0;
          const maxAttempts = 3;

          const tryCompress = () => {
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to compress image"));
                  return;
                }

                // If we have a target size and we're over it, try again with lower quality
                if (
                  opts.targetSizeKB &&
                  blob.size > opts.targetSizeKB * 1024 &&
                  attempt < maxAttempts
                ) {
                  attempt++;
                  quality *= 0.8; // Reduce quality by 20%
                  tryCompress();
                  return;
                }

                // Create new File from blob
                const compressedFile = new File([blob], file.name, {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });

                resolve(compressedFile);
              },
              "image/jpeg",
              quality,
            );
          };

          tryCompress();
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  files: File[],
  onProgress?: (current: number, total: number) => void,
): Promise<File[]> {
  const compressed: File[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const compressedFile = await compressImage(files[i]);
      compressed.push(compressedFile);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      // If compression fails, use original file
      console.warn(
        `Failed to compress ${files[i].name}, using original:`,
        error,
      );
      compressed.push(files[i]);
      onProgress?.(i + 1, files.length);
    }
  }

  return compressed;
}
