/**
 * Messaging mutations
 * Database mutations for conversations and messages
 */

import { createClient } from "@/lib/supabase/server";
import type { Message } from "./types";

const MESSAGE_RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW_MINUTES = 1;

export async function sendMessage(
  conversationId: string,
  senderId: string,
  body: string,
): Promise<Message> {
  const supabase = await createClient();

  await checkMessageRateLimit(conversationId, senderId);

  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      body,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export async function editMessage(
  messageId: string,
  userId: string,
  body: string,
): Promise<Message> {
  const supabase = await createClient();

  const { data: message } = await supabase
    .from("messages")
    .select("sender_id, created_at")
    .eq("id", messageId)
    .single();

  if (!message) throw new Error("Message not found");
  if (message.sender_id !== userId)
    throw new Error("Not authorized to edit this message");

  const editWindow = 10 * 60 * 1000;
  const messageAge = Date.now() - new Date(message.created_at).getTime();
  if (messageAge > editWindow) throw new Error("Edit window expired");

  const { data, error } = await supabase
    .from("messages")
    .update({ body, edited_at: new Date().toISOString() })
    .eq("id", messageId)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export async function deleteMessage(
  messageId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient();

  const { data: message } = await supabase
    .from("messages")
    .select("sender_id")
    .eq("id", messageId)
    .single();

  if (!message) throw new Error("Message not found");
  if (message.sender_id !== userId)
    throw new Error("Not authorized to delete this message");

  const { error } = await supabase
    .from("messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", messageId);

  if (error) throw error;
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId)
    .is("deleted_at", null);

  if (!messages || messages.length === 0) return;

  const reads = messages.map((msg) => ({
    message_id: msg.id,
    user_id: userId,
  }));

  await supabase.from("message_reads").upsert(reads, {
    onConflict: "message_id,user_id",
    ignoreDuplicates: true,
  });
}

async function checkMessageRateLimit(
  conversationId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient();

  const windowStart = new Date(
    Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();

  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("conversation_id", conversationId)
    .eq("sender_id", userId)
    .gte("created_at", windowStart);

  if ((count || 0) >= MESSAGE_RATE_LIMIT) {
    throw new Error(
      `Rate limit exceeded. Maximum ${MESSAGE_RATE_LIMIT} messages per minute.`,
    );
  }
}
