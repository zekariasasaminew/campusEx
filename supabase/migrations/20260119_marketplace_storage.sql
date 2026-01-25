/**
 * Create marketplace-images storage bucket with RLS policies
 * 
 * This migration sets up the storage bucket for marketplace listing images.
 * - Bucket is public (anyone can view images if they have the URL)
 * - Upload is restricted to authenticated users
 * - Deletion is restricted to listing owners (enforced in server actions)
 * - Users can upload 1-5 images per listing
 * 
 * Storage path convention: marketplace/{userId}/{listingId}/{fileName}
 */

-- Create the marketplace-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketplace-images', 'marketplace-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload images
-- Note: Server actions enforce that users can only upload for their own listings
CREATE POLICY "Authenticated users can upload marketplace images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'marketplace-images' AND
  -- Path must start with marketplace/{auth.uid()}/
  (storage.foldername(name))[1] = 'marketplace' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Allow authenticated users to update/replace their uploaded images
CREATE POLICY "Authenticated users can update their marketplace images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'marketplace-images' AND
  (storage.foldername(name))[1] = 'marketplace' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Allow authenticated users to delete their images
CREATE POLICY "Authenticated users can delete their marketplace images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'marketplace-images' AND
  (storage.foldername(name))[1] = 'marketplace' AND
  (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy: Allow anyone to view marketplace images (public bucket)
CREATE POLICY "Anyone can view marketplace images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'marketplace-images');
