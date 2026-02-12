/**
 * Phase Two: Notifications table and policies
 * 
 * System-generated notifications for key events.
 */

-- =====================================================
-- notifications table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  href TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, read_at) WHERE read_at IS NULL;

-- RLS: Enable row-level security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS: Users can update their own notifications (mark as read)
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Trigger to create notification on new message
-- =====================================================

CREATE OR REPLACE FUNCTION public.notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id UUID;
  sender_name TEXT;
  listing_title TEXT;
BEGIN
  -- Determine recipient (the other participant)
  SELECT 
    CASE 
      WHEN c.buyer_id = NEW.sender_id THEN c.seller_id
      ELSE c.buyer_id
    END INTO recipient_id
  FROM public.conversations c
  WHERE c.id = NEW.conversation_id;

  -- Get sender name and listing title
  SELECT u.full_name, l.title INTO sender_name, listing_title
  FROM public.users u
  JOIN public.conversations c ON c.id = NEW.conversation_id
  JOIN public.marketplace_listings l ON l.id = c.listing_id
  WHERE u.id = NEW.sender_id;

  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, body, href)
  VALUES (
    recipient_id,
    'new_message',
    'New message',
    COALESCE(sender_name, 'Someone') || ' sent you a message about "' || listing_title || '"',
    '/inbox/' || NEW.conversation_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

DROP TRIGGER IF EXISTS on_message_notification ON public.messages;
CREATE TRIGGER on_message_notification
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_new_message();
