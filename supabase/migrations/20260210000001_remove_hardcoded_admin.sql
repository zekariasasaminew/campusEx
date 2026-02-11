/**
 * Admin role assignment
 *
 * NOTE:
 *   Do NOT hard-code granting the 'admin' role to a specific email in migrations.
 *   This is environment-specific and can unintentionally grant admin access
 *   to anyone who can claim that email in another environment.
 *
 *   Instead, assign the initial admin user via:
 *     - the Supabase dashboard / SQL console, or
 *     - a controlled seed script that runs only in the intended environment.
 *
 *   This migration replaces the previous hardcoded admin grant to avoid
 *   baking a privileged account into version control.
 */

DO $$
BEGIN
  RAISE NOTICE 'No automatic admin user assigned in migration 20260210_remove_hardcoded_admin. Assign admin manually in the target environment.';
  RAISE NOTICE 'To set admin manually, run in Supabase SQL console:';
  RAISE NOTICE 'UPDATE public.users SET role = ''admin'' WHERE email = ''your-email@augustana.edu'';';
END $$;
