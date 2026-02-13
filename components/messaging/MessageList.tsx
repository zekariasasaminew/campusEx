"use client";

import { useEffect, useRef } from "react";
import type { MessageWithSender } from "@/lib/messaging/types";
import styles from "./MessageList.module.css";

interface MessageListProps {
  messages: MessageWithSender[];
  currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    // Only auto-scroll if new messages were added, not on initial load or polling updates
    if (messages.length > prevMessageCountRef.current) {
      // Check if user is near bottom before auto-scrolling
      const container = containerRef.current;
      if (container) {
        const isNearBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight <
          100;
        if (isNearBottom) {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    } else if (prevMessageCountRef.current === 0 && messages.length > 0) {
      // Initial load - scroll to bottom
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyMessage}>
          No messages yet. Start the conversation!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.messageList} ref={containerRef}>
      {messages.map((message) => (
        <MessageItem
          key={message.id}
          message={message}
          isSent={message.sender_id === currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

interface MessageItemProps {
  message: MessageWithSender;
  isSent: boolean;
}

function MessageItem({ message, isSent }: MessageItemProps) {
  const isDeleted = !!message.deleted_at;
  const isEdited = !!message.edited_at;

  return (
    <div
      className={`${styles.message} ${isSent ? styles.sent : styles.received}`}
    >
      <div
        className={`${styles.messageContent} ${isDeleted ? styles.deleted : ""}`}
      >
        <p className={styles.messageText}>
          {isDeleted ? "Message deleted" : message.body}
        </p>
      </div>

      <div className={styles.messageMeta}>
        {!isSent && (
          <span className={styles.senderName}>{message.sender_name}</span>
        )}
        <span className={styles.timestamp}>
          {formatTimestamp(message.created_at)}
        </span>
        {isEdited && !isDeleted && (
          <span className={styles.edited}>(edited)</span>
        )}
      </div>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isYesterday) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
