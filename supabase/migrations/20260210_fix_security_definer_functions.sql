/**
 * Fix: Add search_path to SECURITY DEFINER functions
 * 
 * This migration addresses security vulnerabilities in SECURITY DEFINER functions
 * by setting a fixed search_path to prevent search-path hijacking attacks.
 * 
 * Changes:
 * 1. Add search_path to handle_new_user function
 * 2. Add search_path to handle_user_update function
 * 3. Fix prevent_role_escalation to use pg_trigger_depth() instead of auth.uid() IS NULL
 * 4. Improve backfill query to use JOIN pattern
 */

-- =====================================================
-- Fix handle_new_user with search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
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
$$;

-- =====================================================
-- Fix handle_user_update with search_path
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
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
$$;

-- =====================================================
-- Fix prevent_role_escalation with proper trigger check
-- =====================================================
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Allow admins to change anything
  IF EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;
  
  -- Allow only nested trigger updates (e.g., from auth sync triggers)
  -- pg_trigger_depth() > 1 means this is being called from another trigger
  IF auth.uid() IS NULL AND pg_trigger_depth() > 1 THEN
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
$$;

-- =====================================================
-- Fix backfill query with JOIN pattern
-- =====================================================

-- Temporarily disable the role escalation trigger to allow backfill
ALTER TABLE public.users DISABLE TRIGGER IF EXISTS check_role_escalation;

-- Sync email_verified status using JOIN pattern to avoid NULL issues
UPDATE public.users AS u
SET email_verified = COALESCE(au.email_confirmed_at IS NOT NULL, false)
FROM auth.users AS au
WHERE au.id = u.id;

-- Re-enable the trigger
ALTER TABLE public.users ENABLE TRIGGER IF EXISTS check_role_escalation;

COMMENT ON FUNCTION public.handle_new_user() IS 'SECURITY DEFINER function with search_path set to prevent hijacking';
COMMENT ON FUNCTION public.handle_user_update() IS 'SECURITY DEFINER function with search_path set to prevent hijacking';
COMMENT ON FUNCTION public.prevent_role_escalation() IS 'SECURITY DEFINER function with search_path set and proper trigger depth check';
