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

ALTER TABLE public.marketplace_reports
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'action_taken')),
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
CREATE INDEX idx_admin_action_log_admin ON public.admin_action_log(admin_id, created_at DESC);
CREATE INDEX idx_admin_action_log_target ON public.admin_action_log(target_type, target_id);

-- RLS: Enable row-level security
ALTER TABLE public.admin_action_log ENABLE ROW LEVEL SECURITY;

-- RLS: Only admins can view action logs
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
DROP POLICY IF EXISTS "Users can create reports" ON public.marketplace_reports;

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
