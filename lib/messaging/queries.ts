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
      listings!inner(title, status),
      listing_images(image_path)
    `,
    )
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("last_message_at", { ascending: false, nullsFirst: false });

  if (error) throw error;

  const conversations = await Promise.all(
    (data || []).map(async (conv) => {
      const otherParticipantId =
        conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;

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

      const { count: unreadCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .neq("sender_id", userId)
        .is("deleted_at", null)
        .not(
          "id",
          "in",
          `(SELECT message_id FROM message_reads WHERE user_id = '${userId}')`,
        );

      return {
        id: conv.id,
        listing_id: conv.listing_id,
        buyer_id: conv.buyer_id,
        seller_id: conv.seller_id,
        status: conv.status as "open" | "closed",
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        last_message_at: conv.last_message_at,
        listing_title: (conv.listings as unknown as Record<string, unknown>)
          .title as string,
        listing_image_url:
          ((
            conv.listing_images as unknown as Array<Record<string, unknown>>
          )?.[0]?.image_path as string | null) || null,
        other_participant_id: otherParticipantId,
        other_participant_name: otherUser?.display_name || "User",
        last_message_body: lastMessage?.body || null,
        unread_count: unreadCount || 0,
      };
    }),
  );

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
      listings!inner(title, status),
      listing_images(image_path)
    `,
    )
    .eq("id", conversationId)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .single();

  if (error) return null;

  const conv = data;
  const otherParticipantId =
    conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;

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

  const { count: unreadCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("conversation_id", conv.id)
    .neq("sender_id", userId)
    .is("deleted_at", null)
    .not(
      "id",
      "in",
      `(SELECT message_id FROM message_reads WHERE user_id = '${userId}')`,
    );

  return {
    id: conv.id,
    listing_id: conv.listing_id,
    buyer_id: conv.buyer_id,
    seller_id: conv.seller_id,
    status: conv.status as "open" | "closed",
    created_at: conv.created_at,
    updated_at: conv.updated_at,
    last_message_at: conv.last_message_at,
    listing_title: (conv.listings as unknown as Record<string, unknown>)
      .title as string,
    listing_image_url:
      ((conv.listing_images as unknown as Array<Record<string, unknown>>)?.[0]
        ?.image_path as string | null) || null,
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

  const messages = await Promise.all(
    (data || []).map(async (msg) => {
      const { data: readReceipt } = await supabase
        .from("message_reads")
        .select("id")
        .eq("message_id", msg.id)
        .eq("user_id", userId)
        .maybeSingle();

      return {
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
        is_read: !!readReceipt,
      };
    }),
  );

  return messages;
}

export async function getOrCreateConversation(
  listingId: string,
  buyerId: string,
): Promise<string> {
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("seller_id, status")
    .eq("id", listingId)
    .single();

  if (!listing) throw new Error("Listing not found");
  if (listing.seller_id === buyerId)
    throw new Error("Cannot message own listing");

  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .eq("seller_id", listing.seller_id)
    .maybeSingle();

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

  if (error) throw error;
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
