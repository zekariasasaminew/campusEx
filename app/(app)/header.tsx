"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { ProfileMenu } from "@/components/ui/profile-menu";
import styles from "./header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/marketplace" className={styles.logo}>
          CampusEx
        </Link>
        <div className={styles.actions}>
          <ThemeToggle />
          <button
            onClick={() =>
              window.open(
                "https://forms.google.com/YOUR_FORM_ID", // Replace with your Google Form URL
                "_blank",
                "noopener,noreferrer",
              )
            }
            className={styles.feedbackButton}
            aria-label="Send Feedback"
            title="Send Feedback"
          >
            <MessageSquare size={20} />
          </button>
          <NotificationBell />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
