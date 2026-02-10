# Campus Exchange - Phase Two Features

Production-grade implementation of messaging, saves, notifications, user profiles, and admin moderation.

## Implemented Features

### 1. In-App Messaging

**Purpose**: Direct communication between buyers and sellers.

**Database Tables**:

- `conversations`: Links buyer, seller, and listing
- `messages`: Individual messages with edit/delete tracking
- `message_reads`: Tracks read status per user

**Key Features**:

- One conversation per buyer-seller-listing combination
- 2000 character limit per message
- 10-minute edit window
- Rate limiting: 10 messages per minute per user
- Real-time unread counts
- Auto-scroll to latest messages

**Security (RLS)**:

- Users can only view conversations they participate in
- Only message author can edit/delete within time window
- Conversation participants: buyer, seller, or listing owner

**Files**:

- Migration: `supabase/migrations/20260126_phase_two_messaging.sql`
- Backend: `lib/messaging/`
- Components: `components/messaging/`
- Pages: `app/(app)/inbox/`, `app/(app)/inbox/[conversationId]/`

### 2. Saved Listings

**Purpose**: Allow users to bookmark listings for later.

**Database Tables**:

- `listing_saves`: User-listing bookmark relationship

**Key Features**:

- Toggle save state with optimistic UI
- Saved listings page shows all bookmarked items
- Heart icon (filled/unfilled) indicates save status

**Security (RLS)**:

- Users can only view/modify their own saves
- Unique constraint prevents duplicate saves

**Files**:

- Migration: `supabase/migrations/20260126_phase_two_saves.sql`
- Backend: `lib/saves/`
- Component: `components/saves/SaveButton.tsx`
- Page: `app/(app)/saved/`

### 3. User Profiles

**Purpose**: Display name, grad year, bio, and trust signals.

**Database Changes**:

- `users.display_name`: Public display name (required, max 50 chars)
- `users.grad_year`: Graduation year (optional integer)
- `users.bio`: Short bio (optional, max 280 chars)
- `users.preferred_meeting_spot`: Safe meeting location (optional, max 80 chars)
- `users.email_verified`: Email verification badge
- `users.campus_verified`: Campus verification badge

**Key Features**:

- Profile view shows all fields and verification badges
- Profile edit page for updating display name, grad year, bio, meeting spot
- Backfilled display_name from full_name or email on migration

**Files**:

- Migration: `supabase/migrations/20260126_phase_two_user_profile.sql`
- Pages: `app/(app)/profile/`, `app/(app)/profile/edit/`

### 4. Notifications

**Purpose**: Alert users to new messages and key events.

**Database Tables**:

- `notifications`: System-generated alerts

**Key Features**:

- Auto-create notification on new message
- Notification bell with unread count (polling every 30s)
- Dropdown shows latest 10 notifications
- Click to mark individual or all as read
- Links to relevant pages (inbox, listing detail)

**Security (RLS)**:

- Users can only view their own notifications

**Files**:

- Migration: `supabase/migrations/20260126_phase_two_notifications.sql`
- Backend: `lib/notifications/`
- Component: `components/notifications/NotificationBell.tsx`
- Page: `app/(app)/notifications/`

### 5. Admin Moderation

**Purpose**: Content safety and user protection.

**Database Changes**:

- `marketplace_listings.visibility_status`: 'visible' or 'hidden'
- `marketplace_reports.status`: 'open', 'reviewed', or 'action_taken'
- `marketplace_reports.admin_notes`: Private admin notes
- `marketplace_reports.reviewed_by`: Admin who reviewed
- `users.role`: 'user' or 'admin'
- `admin_action_log`: Audit trail for admin actions

**Key Features**:

- Admin-only reports dashboard
- Hide/unhide listings with reason
- Update report status with notes
- Action logging for accountability
- Hidden listings filtered from browse view

**Security (RLS)**:

- All admin tables check `users.role = 'admin'`
- Regular users cannot view admin tables
- Hidden listings not shown to non-owners

**Files**:

- Migration: `supabase/migrations/20260126_phase_two_admin.sql`
- Backend: `lib/admin/`
- Pages: `app/(app)/admin/reports/`, `app/(app)/admin/reports/[reportId]/`

## Integration Points

### Header

- Added `NotificationBell` component between theme toggle and profile icon

### Sidebar

- Added "Inbox" link with `MessageSquare` icon
- Added "Saved" link with `Bookmark` icon
- Added "Admin Reports" link (admin-only, runtime check)

### Listing Detail

- "Contact Seller" button creates/opens conversation
- `SaveButton` in header for bookmarking
- Disabled when listing is sold or user is owner

### Marketplace Browse

- Updated query to filter `visibility_status = 'visible'`
- Hidden listings don't appear in search results

## RLS Security Model

**Threat Model Assumptions**:

1. Users are authenticated students (via Supabase auth)
2. Malicious users may attempt to:
   - Read other users' conversations
   - Modify other users' saves
   - View admin reports without permission
   - Hide listings without admin role

**Mitigation Strategies**:

1. **Conversations**: RLS checks `buyer_id`, `seller_id`, or `listing.owner_id`
2. **Messages**: RLS checks conversation participation
3. **Saves**: RLS checks `user_id = auth.uid()`
4. **Notifications**: RLS checks `user_id = auth.uid()`
5. **Admin tables**: RLS checks `EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')`
6. **Visibility**: Hidden listings filtered in queries

**Rate Limiting**:

- Messages: 10 per minute per user (enforced in `sendMessage` action)
- Future: Consider rate limiting saves, notifications, reports

## Performance Considerations

**Indexes Added**:

- `conversations`: (listing_id, buyer_id), (buyer_id), (seller_id), (last_message_at DESC)
- `messages`: (conversation_id, created_at DESC), (sender_id)
- `message_reads`: (conversation_id, user_id), (user_id)
- `listing_saves`: (user_id, created_at DESC), (listing_id)
- `notifications`: (user_id, created_at DESC), (user_id, is_read)
- `admin_action_log`: (admin_user_id), (created_at DESC)

**Query Optimizations**:

- Inbox query uses `last_message_at DESC` index
- Notifications query uses composite (user_id, is_read) index
- Saved listings query uses (user_id, created_at DESC) index

**Polling Strategy**:

- Notifications: 30s interval (reasonable for non-critical alerts)
- Inbox: 5s interval on conversation detail page (better UX for active chats)
- Consider WebSocket upgrade for real-time messaging in future

## Testing

**Unit Tests** (28 new tests):

- `__tests__/lib/messaging/validators.test.ts`: Message content validation
- `__tests__/lib/notifications/validators.test.ts`: Notification updates
- `__tests__/lib/admin/validators.test.ts`: Admin action validation
- `__tests__/components/saves/SaveButton.test.tsx`: Save button rendering

**Test Coverage Focus**:

- Input validation (Zod schemas)
- Edge cases (empty content, character limits, UUID validation)
- Accessibility (aria-labels, button roles)

**Manual Testing Checklist**:

- [ ] Send message and verify notification created
- [ ] Toggle save and verify database update
- [ ] Edit message within 10-minute window
- [ ] Verify rate limiting (send 11 messages quickly)
- [ ] Admin hide listing and verify not in browse
- [ ] Non-admin cannot access admin pages
- [ ] Profile edit saves correctly

## Developer Setup

**Prerequisites**:

- Supabase project with migrations applied
- At least one user with `role = 'admin'` for testing admin features

**Local Development**:

```bash
# Run migrations
npx supabase migration up

# Create admin user (run in Supabase SQL editor)
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

# Start dev server
npm run dev
```

**Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Future Enhancements

**Near-Term**:

- WebSocket for real-time messaging (eliminate polling)
- Image attachments in messages
- Typing indicators
- Message reactions

**Long-Term**:

- Block/report users (not just listings)
- Email digest for unread messages
- Push notifications (mobile)
- Advanced admin analytics dashboard

## Code Quality Standards

All Phase Two code follows repository standards:

- No file over 300 lines
- Functions under 40 lines
- Explicit TypeScript types
- Input validation with Zod
- RLS policies on all tables
- Accessible UI components
- CSS Modules with design tokens
- Server Actions pattern
- Tests for critical paths
