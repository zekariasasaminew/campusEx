/**
 * Messaging validators
 * Zod schemas for validating messaging inputs
 */

import { z } from "zod";

export const createConversationSchema = z.object({
  listing_id: z.string().uuid("Invalid listing ID"),
});

// Alias for backward compatibility
export const createConversationForListingSchema = createConversationSchema;

export const createMessageSchema = z.object({
  conversation_id: z.string().uuid("Invalid conversation ID"),
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be 2000 characters or less")
    .trim(),
});

export const sendMessageSchema = z.object({
  conversation_id: z.string().uuid("Invalid conversation ID"),
  body: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be 2000 characters or less")
    .trim(),
});

export const editMessageSchema = z.object({
  message_id: z.string().uuid("Invalid message ID"),
  body: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message must be 2000 characters or less")
    .trim(),
});

export const markMessagesReadSchema = z.object({
  conversation_id: z.string().uuid("Invalid conversation ID"),
});
