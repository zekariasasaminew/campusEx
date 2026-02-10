"use client";

import Image from "next/image";
import Link from "next/link";
import { PLACEHOLDER_IMAGE_PATH } from "@/lib/marketplace/constants";
import { getImageUrl } from "@/lib/marketplace/storage";
import { createClient } from "@/lib/supabase/client";
import type { ConversationWithDetails } from "@/lib/messaging/types";
import styles from "./ConversationList.module.css";

interface ConversationListProps {
  conversations: ConversationWithDetails[];
}

export function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className={styles.empty}>
        <h2 className={styles.emptyTitle}>No conversations yet</h2>
        <p className={styles.emptyMessage}>
          Start a conversation by contacting a seller from a listing
        </p>
      </div>
    );
  }

  return (
    <div className={styles.conversationList}>
      {conversations.map((conversation) => (
        <ConversationRow key={conversation.id} conversation={conversation} />
      ))}
    </div>
  );
}

interface ConversationRowProps {
  conversation: ConversationWithDetails;
}

function ConversationRow({ conversation }: ConversationRowProps) {
  const supabase = createClient();
  const imageUrl = conversation.listing_image_url
    ? getImageUrl(supabase, conversation.listing_image_url)
    : PLACEHOLDER_IMAGE_PATH;

  const timeAgo = getTimeAgo(conversation.last_message_at);

  return (
    <Link href={`/inbox/${conversation.id}`} className={styles.conversationRow}>
      <div className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={conversation.listing_title}
          fill
          className={styles.image}
          sizes="56px"
        />
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{conversation.listing_title}</h3>
          {timeAgo && <span className={styles.time}>{timeAgo}</span>}
        </div>

        <p className={styles.participant}>
          {conversation.other_participant_name}
        </p>

        {conversation.last_message_body && (
          <p className={styles.lastMessage}>{conversation.last_message_body}</p>
        )}

        <div className={styles.footer}>
          <div />
          {conversation.unread_count > 0 && (
            <span className={styles.unread}>{conversation.unread_count}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

function getTimeAgo(timestamp: string | null): string | null {
  if (!timestamp) return null;

  const now = Date.now();
  const date = new Date(timestamp).getTime();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
