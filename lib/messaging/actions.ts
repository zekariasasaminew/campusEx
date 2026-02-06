/**
 * Messaging server actions
 * Client-callable server actions for messaging operations
 */

"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getInboxConversations,
  getConversationById,
  getConversationMessages,
  getOrCreateConversation,
  checkConversationAccess,
} from "./queries";
import {
  sendMessage as sendMessageMutation,
  editMessage as editMessageMutation,
  deleteMessage as deleteMessageMutation,
  markConversationRead as markConversationReadMutation,
} from "./mutations";
import {
  createConversationSchema,
  sendMessageSchema,
  editMessageSchema,
  markMessagesReadSchema,
} from "./validators";
import type {
  ConversationWithDetails,
  MessageWithSender,
  CreateConversationInput,
  SendMessageInput,
  EditMessageInput,
  MarkMessagesReadInput,
} from "./types";

type Result<T> = { success: true; data: T } | { success: false; error: string };

async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return user;
}

export async function getInbox(): Promise<Result<ConversationWithDetails[]>> {
  try {
    const user = await getCurrentUser();
    const conversations = await getInboxConversations(user.id);
    return { success: true, data: conversations };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to load inbox",
    };
  }
}

export async function getConversation(
  conversationId: string,
): Promise<
  Result<{
    conversation: Record<string, unknown>;
    messages: MessageWithSender[];
  }>
> {
  try {
    const user = await getCurrentUser();
    const conversation = await getConversationById(conversationId, user.id);
    if (!conversation) {
      return { success: false, error: "Conversation not found" };
    }
    const messages = await getConversationMessages(conversationId, user.id);
    return { success: true, data: { conversation, messages } };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to load conversation",
    };
  }
}

export async function createOrGetConversationForListing(
  input: CreateConversationInput,
): Promise<Result<string>> {
  try {
    const user = await getCurrentUser();
    const validated = createConversationSchema.parse(input);
    const conversationId = await getOrCreateConversation(
      validated.listing_id,
      user.id,
    );
    return { success: true, data: conversationId };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create conversation",
    };
  }
}

export async function sendMessage(
  input: SendMessageInput,
): Promise<Result<void>> {
  try {
    const user = await getCurrentUser();
    const validated = sendMessageSchema.parse(input);

    const hasAccess = await checkConversationAccess(
      validated.conversation_id,
      user.id,
    );
    if (!hasAccess) {
      return { success: false, error: "Not authorized" };
    }

    await sendMessageMutation(
      validated.conversation_id,
      user.id,
      validated.body,
    );
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

export async function editMessage(
  input: EditMessageInput,
): Promise<Result<void>> {
  try {
    const user = await getCurrentUser();
    const validated = editMessageSchema.parse(input);
    await editMessageMutation(validated.message_id, user.id, validated.body);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to edit message",
    };
  }
}

export async function deleteMessage(messageId: string): Promise<Result<void>> {
  try {
    const user = await getCurrentUser();
    await deleteMessageMutation(messageId, user.id);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete message",
    };
  }
}

export async function markConversationRead(
  input: MarkMessagesReadInput,
): Promise<Result<void>> {
  try {
    const user = await getCurrentUser();
    const validated = markMessagesReadSchema.parse(input);
    await markConversationReadMutation(validated.conversation_id, user.id);
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to mark as read",
    };
  }
}
