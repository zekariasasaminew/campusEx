"use client";

import { useState, useEffect } from "react";
import { toggleListingSave, isListingSaved } from "@/lib/saves/actions";
import styles from "./SaveButton.module.css";

interface SaveButtonProps {
  listingId: string;
  initialSaved?: boolean;
  onToggle?: (isSaved: boolean) => void;
}

export function SaveButton({
  listingId,
  initialSaved = false,
  onToggle,
}: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!initialSaved) {
      isListingSaved(listingId).then((result) => {
        if (result.success) {
          setIsSaved(result.data);
        }
      });
    }
  }, [listingId, initialSaved]);

  const handleToggle = async () => {
    setIsLoading(true);
    const result = await toggleListingSave(listingId);

    if (result.success) {
      setIsSaved(result.data);
      onToggle?.(result.data);
    }

    setIsLoading(false);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isLoading}
      className={`${styles.saveButton} ${isSaved ? styles.saved : ""}`}
      aria-label={isSaved ? "Unsave listing" : "Save listing"}
      title={isSaved ? "Remove from saved" : "Save for later"}
    >
      {isSaved ? (
        <svg
          className={`${styles.icon} ${styles.iconFilled}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ) : (
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      )}
    </button>
  );
}
