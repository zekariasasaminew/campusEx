/**
 * Messaging type definitions
 * TypeScript interfaces for conversations and messages
 */

// Database table types

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  status: "open" | "closed";
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  edited_at: string | null;
  deleted_at: string | null;
}

export interface MessageRead {
  id: string;
  message_id: string;
  user_id: string;
  read_at: string;
}

// Composite types for queries

export interface ConversationWithDetails extends Conversation {
  listing_title: string;
  listing_image_url: string | null;
  other_participant_id: string;
  other_participant_name: string;
  last_message_body: string | null;
  unread_count: number;
}

export interface MessageWithSender extends Message {
  sender_name: string;
  sender_avatar_url: string | null;
  is_read: boolean;
}

// Input types

export interface CreateConversationInput {
  listing_id: string;
}

export interface SendMessageInput {
  conversation_id: string;
  body: string;
}

export interface EditMessageInput {
  message_id: string;
  body: string;
}

export interface MarkMessagesReadInput {
  conversation_id: string;
}
