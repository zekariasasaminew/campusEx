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
-- Update prevent_role_escalation to allow auth syncs
-- =====================================================

-- Update the trigger function to allow email_verified changes from auth syncs
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow admins to change anything
  IF EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;
  
  -- Allow system/trigger updates (when auth.uid() is null, these are from auth sync triggers)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Prevent non-admins from changing their role
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Users cannot change their own role';
  END IF;
  
  -- Prevent non-admins from changing email_verified if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email_verified') THEN
    IF OLD.email_verified IS DISTINCT FROM NEW.email_verified THEN
      RAISE EXCEPTION 'Users cannot change email verification status';
    END IF;
  END IF;
  
  -- Prevent non-admins from changing campus_verified if column exists
  IF EXISTS (SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'campus_verified') THEN
    IF OLD.campus_verified IS DISTINCT FROM NEW.campus_verified THEN
      RAISE EXCEPTION 'Users cannot change campus verification status';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- =====================================================
-- Backfill email_verified for existing users
-- =====================================================

-- Temporarily disable the role escalation trigger to allow backfill
ALTER TABLE public.users DISABLE TRIGGER check_role_escalation;

-- Sync email_verified status from auth.users for all existing users
UPDATE public.users
SET email_verified = (
  SELECT email_confirmed_at IS NOT NULL
  FROM auth.users
  WHERE auth.users.id = public.users.id
);

-- Re-enable the trigger
ALTER TABLE public.users ENABLE TRIGGER check_role_escalation;

-- Add comment for documentation
COMMENT ON COLUMN public.users.email_verified IS 'Automatically synced from auth.users.email_confirmed_at';
