/**
 * Fix: Sync email_verified from auth.users to public.users
 * 
 * Supabase's auth.users has email_confirmed_at which indicates verification.
 * This migration syncs it to public.users.email_verified.
 */

-- =====================================================
-- Update trigger functions to sync email_verified
-- =====================================================

-- Update handle_new_user to include email verification status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, email_verified)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update handle_user_update to sync email verification status
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users
  SET 
    email = NEW.email,
    full_name = NEW.raw_user_meta_data->>'full_name',
    avatar_url = NEW.raw_user_meta_data->>'avatar_url',
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Backfill email_verified for existing users
-- =====================================================

-- Sync email_verified status from auth.users for all existing users
UPDATE public.users
SET email_verified = (
  SELECT email_confirmed_at IS NOT NULL
  FROM auth.users
  WHERE auth.users.id = public.users.id
);

-- Add comment for documentation
COMMENT ON COLUMN public.users.email_verified IS 'Automatically synced from auth.users.email_confirmed_at';
