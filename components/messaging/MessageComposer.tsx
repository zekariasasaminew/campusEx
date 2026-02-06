"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import styles from "./MessageComposer.module.css";

interface MessageComposerProps {
  onSend: (body: string) => Promise<void>;
  disabled?: boolean;
}

const MAX_LENGTH = 2000;

export function MessageComposer({ onSend, disabled }: MessageComposerProps) {
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!body.trim() || body.length > MAX_LENGTH || isSending) return;

    setIsSending(true);
    try {
      await onSend(body.trim());
      setBody("");
    } finally {
      setIsSending(false);
    }
  };

  const charCount = body.length;
  const isOverLimit = charCount > MAX_LENGTH;
  const isNearLimit = charCount > MAX_LENGTH * 0.9;

  return (
    <div className={styles.composer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputWrapper}>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your message..."
            disabled={disabled || isSending}
            className={styles.textarea}
            aria-label="Message"
          />
          <div
            className={`${styles.charCount} ${
              isOverLimit ? styles.error : isNearLimit ? styles.warning : ""
            }`}
          >
            {charCount} / {MAX_LENGTH}
          </div>
        </div>

        <Button
          type="submit"
          disabled={!body.trim() || isOverLimit || disabled || isSending}
          className={styles.sendButton}
        >
          {isSending ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
