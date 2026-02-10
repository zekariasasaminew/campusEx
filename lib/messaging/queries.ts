/**
 * Messaging queries
 * Database queries for conversations and messages
 */

import { createClient } from "@/lib/supabase/server";
import type { ConversationWithDetails, MessageWithSender } from "./types";

export async function getInboxConversations(
  userId: string,
): Promise<ConversationWithDetails[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      listing_id,
      buyer_id,
      seller_id,
      status,
      created_at,
      updated_at,
      last_message_at,
      marketplace_listings!inner(title, status, marketplace_listing_images(image_path))
    `,
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) throw error;

  if (!data || data.length === 0) return [];

  // Batch fetch all user IDs
  const participantIds = data.map((conv) =>
    conv.buyer_id === userId ? conv.seller_id : conv.buyer_id,
  );
  const uniqueParticipantIds = [...new Set(participantIds)];

  const { data: participants } = await supabase
    .from("users")
    .select("id, display_name")
    .in("id", uniqueParticipantIds);

  const participantMap = new Map(
    participants?.map((p) => [p.id, p.display_name]) || [],
  );

  // Batch fetch all last messages
  const conversationIds = data.map((conv) => conv.id);
  const { data: allMessages } = await supabase
    .from("messages")
    .select("conversation_id, body, created_at")
    .in("conversation_id", conversationIds)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  // Group messages by conversation and get the latest
  const lastMessageMap = new Map<string, string>();

  allMessages?.forEach((msg) => {
    if (!lastMessageMap.has(msg.conversation_id)) {
      lastMessageMap.set(msg.conversation_id, msg.body);
    }
  });

  // Get all messages with IDs for unread counting
  const { data: messagesWithIds } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id")
    .in("conversation_id", conversationIds)
    .neq("sender_id", userId)
    .is("deleted_at", null);

  const unreadMessageIds = messagesWithIds?.map((m) => m.id) || [];

  // Batch fetch read receipts
  let readMessageIds = new Set<string>();
  if (unreadMessageIds.length > 0) {
    const { data: readReceipts } = await supabase
      .from("message_reads")
      .select("message_id")
      .eq("user_id", userId)
      .in("message_id", unreadMessageIds);

    readMessageIds = new Set(readReceipts?.map((r) => r.message_id) || []);
  }

  // Count unread messages per conversation
  const unreadCountMap = new Map<string, number>();
  messagesWithIds?.forEach((msg) => {
    if (!readMessageIds.has(msg.id)) {
      const count = unreadCountMap.get(msg.conversation_id) || 0;
      unreadCountMap.set(msg.conversation_id, count + 1);
    }
  });

  // Build final conversation objects
  const conversations = data.map((conv) => {
    const otherParticipantId =
      conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;

    const listing = conv.marketplace_listings as unknown as Record<string, unknown>;
    const images = (listing.marketplace_listing_images as Array<Record<string, unknown>>) || [];

    return {
      id: conv.id,
      listing_id: conv.listing_id,
      buyer_id: conv.buyer_id,
      seller_id: conv.seller_id,
      status: conv.status as "open" | "closed",
      created_at: conv.created_at,
      updated_at: conv.updated_at,
      last_message_at: conv.last_message_at,
      listing_title: listing.title as string,
      listing_image_url: (images[0]?.image_path as string | null) || null,
      other_participant_id: otherParticipantId,
      other_participant_name: participantMap.get(otherParticipantId) || "User",
      last_message_body: lastMessageMap.get(conv.id) || null,
      unread_count: unreadCountMap.get(conv.id) || 0,
    };
  });

  return conversations;
}

export async function getConversationById(
  conversationId: string,
  userId: string,
): Promise<ConversationWithDetails | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id,
      listing_id,
      buyer_id,
      seller_id,
      status,
      created_at,
      updated_at,
      last_message_at,
      marketplace_listings!inner(title, status, marketplace_listing_images(image_path))
    `,
    )
    .eq("id", conversationId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .single();

  if (error) {
    console.error("getConversationById error:", {
      conversationId,
      userId,
      error,
      data,
    });
    return null;
  }

  const conv = data;
  const otherParticipantId =
    conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;

  const listing = conv.marketplace_listings as unknown as Record<string, unknown>;
  const images = (listing.marketplace_listing_images as Array<Record<string, unknown>>) || [];

  const { data: otherUser } = await supabase
    .from("users")
    .select("display_name")
    .eq("id", otherParticipantId)
    .single();

  const { data: lastMessage } = await supabase
    .from("messages")
    .select("body")
    .eq("conversation_id", conv.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get unread messages count for this conversation
  const { data: unreadMessages } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conv.id)
    .neq("sender_id", userId)
    .is("deleted_at", null);

  // Filter out read messages
  const unreadIds = unreadMessages?.map((m) => m.id) || [];
  let unreadCount = 0;
  if (unreadIds.length > 0) {
    const { data: readReceipts } = await supabase
      .from("message_reads")
      .select("message_id")
      .eq("user_id", userId)
      .in("message_id", unreadIds);

    const readIds = new Set(readReceipts?.map((r) => r.message_id) || []);
    unreadCount = unreadIds.filter((id) => !readIds.has(id)).length;
  }

  return {
    id: conv.id,
    listing_id: conv.listing_id,
    buyer_id: conv.buyer_id,
    seller_id: conv.seller_id,
    status: conv.status as "open" | "closed",
    created_at: conv.created_at,
    updated_at: conv.updated_at,
    last_message_at: conv.last_message_at,
    listing_title: listing.title as string,
    listing_image_url: (images[0]?.image_path as string | null) || null,
    other_participant_id: otherParticipantId,
    other_participant_name: otherUser?.display_name || "User",
    last_message_body: lastMessage?.body || null,
    unread_count: unreadCount || 0,
  };
}

export async function getConversationMessages(
  conversationId: string,
  userId: string,
): Promise<MessageWithSender[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      conversation_id,
      sender_id,
      body,
      created_at,
      edited_at,
      deleted_at,
      users!inner(display_name, avatar_url)
    `,
    )
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  if (!data || data.length === 0) return [];

  // Batch fetch read receipts for all messages
  const messageIds = data.map((msg) => msg.id);
  const { data: readReceipts } = await supabase
    .from("message_reads")
    .select("message_id")
    .eq("user_id", userId)
    .in("message_id", messageIds);

  const readMessageIds = new Set(readReceipts?.map((r) => r.message_id) || []);

  const messages = data.map((msg) => ({
    id: msg.id,
    conversation_id: msg.conversation_id,
    sender_id: msg.sender_id,
    body: msg.body,
    created_at: msg.created_at,
    edited_at: msg.edited_at,
    deleted_at: msg.deleted_at,
    sender_name:
      ((msg.users as unknown as Record<string, unknown>)
        .display_name as string) || "User",
    sender_avatar_url:
      ((msg.users as unknown as Record<string, unknown>).avatar_url as
        | string
        | null) || null,
    is_read: readMessageIds.has(msg.id),
  }));

  return messages;
}

export async function getOrCreateConversation(
  listingId: string,
  buyerId: string,
): Promise<string> {
  const supabase = await createClient();

  const { data: listing, error: listingError } = await supabase
    .from("marketplace_listings")
    .select("seller_id, status")
    .eq("id", listingId)
    .single();

  if (listingError) {
    console.error("getOrCreateConversation - listing fetch error:", {
      listingId,
      buyerId,
      error: listingError,
    });
  }

  if (!listing) throw new Error("Listing not found");
  if (listing.seller_id === buyerId)
    throw new Error("Cannot message own listing");

  const { data: existing, error: existingError } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", listing.seller_id)
    .maybeSingle();

  if (existingError) {
    console.error("getOrCreateConversation - existing check error:", {
      listingId,
      buyerId,
      sellerId: listing.seller_id,
      error: existingError,
    });
  }

  if (existing) return existing.id;

  const { data: newConv, error } = await supabase
    .from("conversations")
    .insert({
      listing_id: listingId,
      buyer_id: buyerId,
      seller_id: listing.seller_id,
    })
    .select("id")
    .single();

  if (error) {
    console.error("getOrCreateConversation - insert error:", {
      listingId,
      buyerId,
      sellerId: listing.seller_id,
      error,
    });
    throw error;
  }
  return newConv.id;
}

export async function checkConversationAccess(
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .maybeSingle();

  return !!data;
}
