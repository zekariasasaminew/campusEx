# Phase Two Migration Guide

Quick reference for applying Phase Two database changes to your Supabase project.

## Prerequisites

- Supabase CLI installed (`npm install -g supabase`)
- Linked to your Supabase project (`supabase link --project-ref your-project-ref`)
- **Phase One migrations must be applied first** (see below)

## Step 1: Apply Phase One Migrations (Required)

Phase Two depends on tables from Phase One. Apply these first:

```bash
# 1. Storage buckets for images
npx supabase migration up --file 20260119_marketplace_storage.sql

# 2. Core marketplace tables (listings, listing_images, listing_reports)
npx supabase migration up --file 20260119_marketplace_tables.sql

# 3. Users table
npx supabase migration up --file 20260126_users_table.sql

# 4. Update listing foreign key
npx supabase migration up --file 20260126_update_listing_fk.sql
```

**Or apply all Phase One migrations at once:**

```bash
npx supabase db push
```

Then verify Phase One tables exist:

```sql
-- Should all return rows
SELECT * FROM users LIMIT 1;
SELECT * FROM marketplace_listings LIMIT 1;
SELECT * FROM marketplace_listing_images LIMIT 1;
SELECT * FROM marketplace_reports LIMIT 1;
```

## Step 2: Apply Phase Two Migrations

Once Phase One is complete, apply Phase Two migrations:

```bash
# 1. Messaging infrastructure
npx supabase migration up --file 20260126_phase_two_messaging.sql

# 2. Saved listings
npx supabase migration up --file 20260126_phase_two_saves.sql

# 3. Notifications
npx supabase migration up --file 20260126_phase_two_notifications.sql

# 4. User profile extensions
npx supabase migration up --file 20260126_phase_two_user_profile.sql

# 5. Admin moderation
npx supabase migration up --file 20260126_phase_two_admin.sql
```

**Or if you haven't run any migrations yet, apply everything:**

```bash
npx supabase db push
```

## Post-Migration Setup

### 1. Create Admin User

Run in Supabase SQL Editor:

```sql
-- Replace with your admin email
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### 2. Verify Tables Created

Check that these tables exist:
- `conversations`
- `messages`
- `message_reads`
- `listing_saves`
- `notifications`
- `admin_action_log`

And these columns added to existing tables:
- `users`: `display_name`, `grad_year`, `bio`, `preferred_meeting_spot`, `email_verified`, `campus_verified`, `role`
- `listings`: `visibility_status`
- `listing_reports`: `status`, `admin_notes`, `reviewed_by`, `reviewed_at`

### 3. Test RLS Policies

As a regular user:
```sql
-- Should return conversations you participate in only
SELECT * FROM conversations;

-- Should return your saves only
SELECT * FROM listing_saves;

-- Should return your notifications only
SELECT * FROM notifications;

-- Should fail (not admin)
SELECT * FROM admin_action_log;
```

As an admin user:
```sql
-- Should succeed
SELECT * FROM admin_action_log;

-- Should see all reports
SELECT * FROM marketplace_reports;
```

### 4. Verify Triggers

Send a test message and check that a notification is auto-created:

```sql
-- Check trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_message_notification';

-- After sending a message, verify notification created
SELECT * FROM notifications WHERE type = 'new_message';
```

## Rollback (if needed)

```bash
# Rollback last migration
npx supabase migration down

# Or manually drop tables (DANGER: data loss)
```

```sql
DROP TABLE IF EXISTS admin_action_log CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS message_reads CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;
DROP TABLE IF EXISTS listing_saves CASCADE;

ALTER TABLE users 
  DROP COLUMN IF EXISTS display_name,
  DROP COLUMN IF EXISTS grad_year,
  DROP COLUMN IF EXISTS bio,
  DROP COLUMN IF EXISTS preferred_meeting_spot,
  DROP COLUMN IF EXISTS email_verified,
  DROP COLUMN IF EXISTS campus_verified,
  DROP COLUMN IF EXISTS role;

ALTER TABLE listings 
  DROP COLUMN IF EXISTS visibility_status;

ALTER TABLE marketplace_reports
  DROP COLUMN IF EXISTS status,
  DROP COLUMN IF EXISTS admin_notes,
  DROP COLUMN IF EXISTS reviewed_by,
  DROP COLUMN IF EXISTS reviewed_at;
```

## Common Issues

### Issue: "relation 'public.listings' does not exist" or similar
**Solution**: Phase One migrations not applied. Run Step 1 first (see above).

### Issue: "relation already exists"
**Solution**: Migration already applied. Check `supabase_migrations` table.

### Issue: "permission denied"
**Solution**: Ensure RLS is enabled but you're connected as service role for migrations.

### Issue: "column does not exist" after deployment
**Solution**: Hard refresh frontend (`Ctrl+Shift+R`) to clear cached JS bundles.

### Issue: Admin pages show 403
**Solution**: Update `users.role = 'admin'` for your test user.

## Verification Checklist

- [ ] All 5 migrations applied without errors
- [ ] At least one admin user created
- [ ] Can send/receive messages
- [ ] Can save/unsave listings
- [ ] Notifications appear on new messages
- [ ] Profile edit page saves successfully
- [ ] Admin can view reports and hide listings
- [ ] Non-admin cannot access admin pages
- [ ] Hidden listings don't appear in browse

## Next Steps

1. Test all features in development
2. Run test suite: `npm test`
3. Deploy to production
4. Monitor for RLS policy issues in Supabase logs
5. Set up admin users in production environment
