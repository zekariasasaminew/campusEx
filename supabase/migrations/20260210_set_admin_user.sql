/**
 * Set specific user as admin
 * 
 * Grants admin role to zekariasasaminew22@augustana.edu
 */

-- Temporarily disable the role escalation trigger
ALTER TABLE public.users DISABLE TRIGGER check_role_escalation;

-- Set user as admin by email
UPDATE public.users
SET role = 'admin'
WHERE email = 'zekariasasaminew22@augustana.edu';

-- Re-enable the trigger
ALTER TABLE public.users ENABLE TRIGGER check_role_escalation;

-- Verify the change
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM public.users
  WHERE email = 'zekariasasaminew22@augustana.edu' AND role = 'admin';
  
  IF admin_count = 1 THEN
    RAISE NOTICE 'Successfully granted admin role to zekariasasaminew22@augustana.edu';
  ELSE
    RAISE WARNING 'Failed to grant admin role - user may not exist yet';
  END IF;
END $$;
