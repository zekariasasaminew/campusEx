/**
 * Phase Two: User profile extensions
 * 
 * Adds display name, bio, graduation year, and verification fields.
 */

-- =====================================================
-- Extend users table with Phase Two profile fields
-- =====================================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS display_name TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS grad_year INTEGER,
ADD COLUMN IF NOT EXISTS bio TEXT CHECK (char_length(bio) <= 280),
ADD COLUMN IF NOT EXISTS preferred_meeting_spot TEXT CHECK (char_length(preferred_meeting_spot) <= 80),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS campus_verified BOOLEAN NOT NULL DEFAULT false;

-- Backfill display_name from full_name or email
UPDATE public.users
SET display_name = COALESCE(full_name, split_part(email, '@', 1))
WHERE display_name = '';

-- Create index for display_name searches
CREATE INDEX IF NOT EXISTS idx_users_display_name ON public.users(display_name);
