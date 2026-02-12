/**
 * Phase Two: Listing saves table and policies
 * 
 * Allows users to save/favorite listings for later viewing.
 */

-- =====================================================
-- listing_saves table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.listing_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_listing_save UNIQUE (listing_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_listing_saves_user ON public.listing_saves(user_id, created_at DESC);
CREATE INDEX idx_listing_saves_listing ON public.listing_saves(listing_id);

-- RLS: Enable row-level security
ALTER TABLE public.listing_saves ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own saves
CREATE POLICY "Users can view own saves"
ON public.listing_saves FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS: Users can create their own saves
CREATE POLICY "Users can create own saves"
ON public.listing_saves FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS: Users can delete their own saves
CREATE POLICY "Users can delete own saves"
ON public.listing_saves FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
