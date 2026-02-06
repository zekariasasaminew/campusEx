/**
 * Update marketplace_listings foreign key to reference public.users
 * This allows proper joins in queries
 */

-- Drop the old foreign key constraint to auth.users
ALTER TABLE marketplace_listings 
DROP CONSTRAINT IF EXISTS marketplace_listings_seller_id_fkey;

-- Add new foreign key constraint to public.users
ALTER TABLE marketplace_listings
ADD CONSTRAINT marketplace_listings_seller_id_fkey
FOREIGN KEY (seller_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Update marketplace_reports foreign key as well
ALTER TABLE marketplace_reports
DROP CONSTRAINT IF EXISTS marketplace_reports_reporter_id_fkey;

ALTER TABLE marketplace_reports
ADD CONSTRAINT marketplace_reports_reporter_id_fkey
FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;
