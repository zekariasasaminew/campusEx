/**
 * Marketplace storage operations
 * Handles image uploads and deletions in Supabase Storage
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { SuploadedImage } from "./types";
import { IMAGE_CONSTRAINTS, PLACEHOLDER_IMAGE_PATH } from "./constants";

/**
 * Upload images for a listing
 */
export async function uploadListingImages(
  supabase: SupabaseClient,
  listingId: string,
  userId: string,
  images: File[],
): Promise<UploadedImage[]> {
  if (images.length === 0) {
    throw new Error("At least one image is required");
  }

  if (images.length > IMAGE_CONSTRAINTS.maxCount) {
    throw new Error(`Maximum ${IMAGE_CONSTRAINTS.maxCount} images allowed`);
  }

  const uploadedImages: UploadedImage[] = [];
  const errors: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const file = images[i];
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    // Extract file extension safely, generate secure name without user input
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExtension = /^[a-z0-9]{2,5}$/.test(extension) ? extension : "jpg";
    const fileName = `${timestamp}-${randomSuffix}.${safeExtension}`;
    const storagePath = `marketplace/${userId}/${listingId}/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from("marketplace-images")
        .upload(storagePath, file, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        errors.push(`Failed to upload ${file.name}: ${uploadError.message}`);
        continue;
      }

      // Insert image record
      const { error: dbError } = await supabase
        .from("marketplace_listing_images")
        .insert({
          listing_id: listingId,
          image_path: storagePath,
          sort_order: i,
        });

      if (dbError) {
        // Cleanup uploaded file
        await supabase.storage.from("marketplace-images").remove([storagePath]);
        errors.push(
          `Failed to save image record for ${file.name}: ${dbError.message}`,
        );
        continue;
      }

      uploadedImages.push({
        image_path: storagePath,
        sort_order: i,
      });
    } catch (error) {
      errors.push(`Unexpected error uploading ${file.name}: ${error}`);
    }
  }

  if (errors.length > 0 && uploadedImages.length === 0) {
    throw new Error(`All image uploads failed: ${errors.join("; ")}`);
  }

  if (errors.length > 0) {
    console.warn(`Some images failed to upload: ${errors.join("; ")}`);
  }

  return uploadedImages;
}

/**
 * Delete specific images by their IDs
 */
export async function deleteListingImages(
  supabase: SupabaseClient,
  listingId: string,
  imageIds: string[],
): Promise<void> {
  if (imageIds.length === 0) return;

  // Get storage paths before deletion
  const { data: images } = await supabase
    .from("marketplace_listing_images")
    .select("image_path")
    .eq("listing_id", listingId)
    .in("id", imageIds);

  // Delete from database
  const { error: dbError } = await supabase
    .from("marketplace_listing_images")
    .delete()
    .eq("listing_id", listingId)
    .in("id", imageIds);

  if (dbError) {
    throw new Error(`Failed to delete image records: ${dbError.message}`);
  }

  // Delete from storage (best effort)
  if (images && images.length > 0) {
    try {
      const paths = images.map((img) => img.image_path);
      await supabase.storage.from("marketplace-images").remove(paths);
    } catch {
      console.warn(
        `Failed to delete some images from storage for listing ${listingId}`,
      );
    }
  }
}

/**
 * Get public URL for an image
 */
export function getImageUrl(
  supabase: SupabaseClient,
  storagePath: string | null | undefined,
): string {
  if (!storagePath) {
    return "/placeholder-image.png";
  }

  const { data } = supabase.storage
    .from("marketplace-images")
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

/**
 * Get public URLs for multiple images
 */
export function getImageUrls(
  supabase: SupabaseClient,
  storagePaths: string[],
): string[] {
  return storagePaths.map((path) => getImageUrl(supabase, path));
}
