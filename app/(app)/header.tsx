"use client";

import Link from "next/link";
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
          <NotificationBell />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}
