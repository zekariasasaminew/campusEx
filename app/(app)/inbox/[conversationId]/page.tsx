"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getConversation,
  sendMessage,
  markConversationRead,
} from "@/lib/messaging/actions";
import { MessageList } from "@/components/messaging/MessageList";
import { MessageComposer } from "@/components/messaging/MessageComposer";
import { Spinner } from "@/components/ui/spinner";
import type {
  ConversationWithDetails,
  MessageWithSender,
} from "@/lib/messaging/types";
import styles from "./page.module.css";

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>;
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const router = useRouter();
  const { conversationId } = use(params);
  const [conversation, setConversation] =
    useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversation = useCallback(async () => {
    if (!conversationId) return;

    const result = await getConversation(conversationId);

    if (result.success) {
      setConversation(result.data.conversation);
      setMessages(result.data.messages);
      setCurrentUserId(result.data.currentUserId);
      setError(null);
    } else {
      setError(result.error);
    }

    setIsLoading(false);
  }, [conversationId]);

  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    await markConversationRead({ conversation_id: conversationId });
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId) return;

    loadConversation();
    markAsRead();

    const interval = setInterval(loadConversation, 5000);
    return () => clearInterval(interval);
  }, [conversationId, loadConversation, markAsRead]);

  const handleSendMessage = useCallback(
    async (body: string) => {
      if (!conversationId) return;

      const result = await sendMessage({
        conversation_id: conversationId,
        body,
      });

      if (result.success) {
        await loadConversation();
      }
    },
    [conversationId, loadConversation],
  );

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <Spinner />
          </div>
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.error}>
            {error || "Conversation not found"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <button
            type="button"
            onClick={() => router.push("/inbox")}
            className={styles.backButton}
            aria-label="Back to inbox"
          >
            <svg
              className={styles.backIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>

          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              <Link href={`/marketplace/${conversation.listing_id}`}>
                {conversation.listing_title || "Listing"}
              </Link>
            </h1>
            <p className={styles.subtitle}>
              {conversation.other_participant_name || "User"}
            </p>
          </div>
        </div>

        <div className={styles.messages}>
          <MessageList messages={messages} currentUserId={currentUserId} />
        </div>

        <MessageComposer onSend={handleSendMessage} />
      </div>
    </div>
  );
}
