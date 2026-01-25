/**
 * Create marketplace tables with RLS policies
 * 
 * Tables:
 * - marketplace_listings: Core listing data
 * - marketplace_listing_images: Multiple images per listing
 * - marketplace_reports: User reports on listings
 * 
 * Phase One: Listings only, no payments, no messaging
 */

-- =====================================================
-- marketplace_listings table
-- =====================================================

CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NULL,
  is_free BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  location_text TEXT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_price CHECK (
    (is_free = true AND price_cents IS NULL) OR 
    (is_free = false AND price_cents IS NOT NULL AND price_cents >= 0)
  ),
  CONSTRAINT valid_status CHECK (status IN ('active', 'sold', 'removed'))
);

-- Indexes for performance
CREATE INDEX idx_marketplace_listings_created_at ON marketplace_listings(created_at DESC);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX idx_marketplace_listings_seller_id ON marketplace_listings(seller_id);

-- Trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketplace_listing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function on UPDATE
CREATE TRIGGER trigger_update_marketplace_listing_updated_at
BEFORE UPDATE ON marketplace_listings
FOR EACH ROW
EXECUTE FUNCTION update_marketplace_listing_updated_at();

-- RLS: Enable row-level security
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can view active and sold listings
CREATE POLICY "Authenticated users can view active and sold listings"
ON marketplace_listings FOR SELECT
TO authenticated
USING (status IN ('active', 'sold'));

-- RLS: Users can view their own listings regardless of status
CREATE POLICY "Users can view their own listings"
ON marketplace_listings FOR SELECT
TO authenticated
USING (auth.uid() = seller_id);

-- RLS: Authenticated users can insert listings for themselves
CREATE POLICY "Authenticated users can create listings"
ON marketplace_listings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = seller_id);

-- RLS: Users can update only their own listings
CREATE POLICY "Users can update their own listings"
ON marketplace_listings FOR UPDATE
TO authenticated
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- RLS: Users can delete only their own listings
CREATE POLICY "Users can delete their own listings"
ON marketplace_listings FOR DELETE
TO authenticated
USING (auth.uid() = seller_id);

-- =====================================================
-- marketplace_listing_images table
-- =====================================================

CREATE TABLE IF NOT EXISTS marketplace_listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching images by listing
CREATE INDEX idx_marketplace_listing_images_listing_id ON marketplace_listing_images(listing_id, sort_order);

-- RLS: Enable row-level security
ALTER TABLE marketplace_listing_images ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can view images for active/sold listings
CREATE POLICY "Authenticated users can view listing images"
ON marketplace_listing_images FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM marketplace_listings
    WHERE marketplace_listings.id = listing_id
    AND marketplace_listings.status IN ('active', 'sold')
  )
);

-- RLS: Users can insert images for their own listings
CREATE POLICY "Users can add images to their listings"
ON marketplace_listing_images FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM marketplace_listings
    WHERE marketplace_listings.id = listing_id
    AND marketplace_listings.seller_id = auth.uid()
  )
);

-- RLS: Users can update images on their own listings
CREATE POLICY "Users can update images on their listings"
ON marketplace_listing_images FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM marketplace_listings
    WHERE marketplace_listings.id = listing_id
    AND marketplace_listings.seller_id = auth.uid()
  )
);

-- RLS: Users can delete images from their own listings
CREATE POLICY "Users can delete images from their listings"
ON marketplace_listing_images FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM marketplace_listings
    WHERE marketplace_listings.id = listing_id
    AND marketplace_listings.seller_id = auth.uid()
  )
);

-- =====================================================
-- marketplace_reports table
-- =====================================================

CREATE TABLE IF NOT EXISTS marketplace_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  details TEXT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_report_status CHECK (status IN ('open', 'reviewed', 'resolved'))
);

-- Index for admin queries (future use)
CREATE INDEX idx_marketplace_reports_status ON marketplace_reports(status, created_at DESC);
CREATE INDEX idx_marketplace_reports_listing_id ON marketplace_reports(listing_id);

-- RLS: Enable row-level security
ALTER TABLE marketplace_reports ENABLE ROW LEVEL SECURITY;

-- RLS: Authenticated users can submit reports
CREATE POLICY "Authenticated users can submit reports"
ON marketplace_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- RLS: Users can view only their own reports (Phase One)
CREATE POLICY "Users can view their own reports"
ON marketplace_reports FOR SELECT
TO authenticated
USING (auth.uid() = reporter_id);

-- Note: Admin access for reports will be added in a future phase
