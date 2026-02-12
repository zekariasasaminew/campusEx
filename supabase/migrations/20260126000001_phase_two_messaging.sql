/**
 * Phase Two: Messaging tables and policies
 * 
 * Creates conversations, messages, and message_reads tables
 * with proper RLS policies for secure in-app communication.
 */

-- =====================================================
-- conversations table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ,
  CONSTRAINT unique_conversation UNIQUE (listing_id, buyer_id, seller_id)
);

-- Indexes for performance
CREATE INDEX idx_conversations_buyer ON public.conversations(buyer_id, last_message_at DESC NULLS LAST);
CREATE INDEX idx_conversations_seller ON public.conversations(seller_id, last_message_at DESC NULLS LAST);
CREATE INDEX idx_conversations_listing ON public.conversations(listing_id);
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC NULLS LAST);

-- RLS: Enable row-level security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view conversations they participate in
CREATE POLICY "Users can view own conversations"
ON public.conversations FOR SELECT
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS: Users can create conversations as buyer
CREATE POLICY "Buyers can create conversations"
ON public.conversations FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = buyer_id);

-- RLS: Participants can update conversation status
CREATE POLICY "Participants can update conversations"
ON public.conversations FOR UPDATE
TO authenticated
USING (auth.uid() = buyer_id OR auth.uid() = seller_id)
WITH CHECK (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- =====================================================
-- messages table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) > 0 AND char_length(body) <= 2000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);

-- RLS: Enable row-level security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view messages in their conversations
CREATE POLICY "Users can view messages in own conversations"
ON public.messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- RLS: Participants can insert messages
CREATE POLICY "Participants can create messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM public.conversations
    WHERE conversations.id = messages.conversation_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- RLS: Senders can update their own messages within 10 minutes
CREATE POLICY "Senders can edit own recent messages"
ON public.messages FOR UPDATE
TO authenticated
USING (
  auth.uid() = sender_id
  AND deleted_at IS NULL
  AND created_at > (now() - INTERVAL '10 minutes')
)
WITH CHECK (
  auth.uid() = sender_id
  AND (edited_at IS NOT NULL OR deleted_at IS NOT NULL)
);

-- =====================================================
-- message_reads table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_message_read UNIQUE (message_id, user_id)
);

-- Index for performance
CREATE INDEX idx_message_reads_user ON public.message_reads(user_id);
CREATE INDEX idx_message_reads_message ON public.message_reads(message_id);

-- RLS: Enable row-level security
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- RLS: Users can view their own read receipts
CREATE POLICY "Users can view own read receipts"
ON public.message_reads FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- RLS: Users can mark messages as read
CREATE POLICY "Users can mark messages as read"
ON public.message_reads FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.messages
    JOIN public.conversations ON conversations.id = messages.conversation_id
    WHERE messages.id = message_reads.message_id
    AND (conversations.buyer_id = auth.uid() OR conversations.seller_id = auth.uid())
  )
);

-- =====================================================
-- Trigger to update conversation last_message_at
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_at = NEW.created_at,
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

CREATE TRIGGER on_message_created
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();
