/**
 * Phase Two: Admin moderation tables and policies
 * 
 * Extends listing reports and adds admin action tracking.
 */

-- =====================================================
-- Add role column to users for admin access (MUST BE FIRST)
-- =====================================================

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Index for role checks
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role) WHERE role = 'admin';

-- =====================================================
-- Security: Prevent users from escalating their role
-- =====================================================

-- Drop the existing update policies (both old and new names)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile (restricted)" ON public.users;

-- Create a trigger function to prevent role escalation
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow admins to change anything
  IF EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;
  
  -- Prevent non-admins from changing their role
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Users cannot change their own role';
  END IF;
  
  -- Prevent non-admins from changing email_verified if column exists
  IF (SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'email_verified') IS NOT NULL THEN
    IF OLD.email_verified IS DISTINCT FROM NEW.email_verified THEN
      RAISE EXCEPTION 'Users cannot change email verification status';
    END IF;
  END IF;
  
  -- Prevent non-admins from changing campus_verified if column exists
  IF (SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'campus_verified') IS NOT NULL THEN
    IF OLD.campus_verified IS DISTINCT FROM NEW.campus_verified THEN
      RAISE EXCEPTION 'Users cannot change campus verification status';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS check_role_escalation ON public.users;
CREATE TRIGGER check_role_escalation
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- Create a simple update policy
CREATE POLICY "Users can update own profile (restricted)"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =====================================================
-- Extend listings table for visibility control
-- =====================================================

ALTER TABLE public.marketplace_listings
ADD COLUMN IF NOT EXISTS visibility_status TEXT NOT NULL DEFAULT 'visible' CHECK (visibility_status IN ('visible', 'hidden')),
ADD COLUMN IF NOT EXISTS hidden_reason TEXT,
ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;

-- Index for filtering visible listings
CREATE INDEX IF NOT EXISTS idx_listings_visibility ON public.marketplace_listings(visibility_status, status);

-- =====================================================
-- Extend listing_reports table
-- =====================================================

-- Drop the old status constraint and add new one with updated values
ALTER TABLE public.marketplace_reports
DROP CONSTRAINT IF EXISTS valid_report_status;

ALTER TABLE public.marketplace_reports
ADD CONSTRAINT valid_report_status CHECK (status IN ('open', 'reviewed', 'action_taken'));

ALTER TABLE public.marketplace_reports
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.users(id);

-- Index for admin reports filtering
CREATE INDEX IF NOT EXISTS idx_listing_reports_status ON public.marketplace_reports(status, created_at DESC);

-- =====================================================
-- admin_action_log table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.admin_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for admin action queries
CREATE INDEX IF NOT EXISTS idx_admin_action_log_admin ON public.admin_action_log(admin_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_action_log_target ON public.admin_action_log(target_type, target_id);

-- RLS: Enable row-level security
ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can view action logs
DROP POLICY IF EXISTS "Admins can view action logs" ON public.admin_action_log;
CREATE POLICY "Admins can view action logs"
ON public.admin_action_log FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- RLS: Only admins can insert action logs
DROP POLICY IF EXISTS "Admins can create action logs" ON public.admin_action_log;
CREATE POLICY "Admins can create action logs"
ON public.admin_action_log FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = admin_id
  AND EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- =====================================================
-- Update RLS policies for admin access to reports
-- =====================================================

-- Drop existing listing_reports policies if they exist
DROP POLICY IF EXISTS "Users can view own reports" ON public.marketplace_reports;
DROP POLICY IF EXISTS "Users and admins can view reports" ON public.marketplace_reports;
DROP POLICY IF EXISTS "Users can create reports" ON public.marketplace_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.marketplace_reports;

-- Recreate with admin access
CREATE POLICY "Users and admins can view reports"
ON public.marketplace_reports FOR SELECT
TO authenticated
USING (
  auth.uid() = reporter_id
  OR EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

CREATE POLICY "Users can create reports"
ON public.marketplace_reports FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_id);

-- Admins can update reports
CREATE POLICY "Admins can update reports"
ON public.marketplace_reports FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
