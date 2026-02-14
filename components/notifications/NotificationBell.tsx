"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  getUserNotifications,
  getNotificationUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from "@/lib/notifications/actions";
import type { Notification } from "@/lib/notifications/types";
import styles from "./NotificationBell.module.css";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = useCallback(async () => {
    const result = await getUserNotifications(10);
    if (result.success) {
      setNotifications(result.data);
    }
  }, []);

  const loadUnreadCount = useCallback(async () => {
    const result = await getNotificationUnreadCount();
    if (result.success) {
      setUnreadCount(result.data);
    }
  }, []);

  useEffect(() => {
    const initialTimer = setTimeout(() => {
      void loadUnreadCount();
    }, 0);

    const interval = setInterval(() => {
      void loadUnreadCount();
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [loadUnreadCount]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        void loadNotifications();
      }, 0);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isOpen, loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read_at) {
      await markNotificationRead(notification.id);
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }
    setIsOpen(false);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    setUnreadCount(0);
    await loadNotifications();
  };

  return (
    <div className={styles.bellContainer} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.bellButton}
        aria-label="Notifications"
      >
        <svg
          className={styles.icon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3 className={styles.title}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className={styles.markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className={styles.notificationList}>
            {notifications.length === 0 ? (
              <div className={styles.empty}>
                <p className={styles.emptyMessage}>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))
            )}
          </div>

          <div className={styles.footer}>
            <Link href="/notifications" className={styles.viewAll}>
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const isUnread = !notification.read_at;

  const content = (
    <>
      <h4 className={styles.notificationTitle}>{notification.title}</h4>
      <p className={styles.notificationBody}>{notification.body}</p>
      <time className={styles.notificationTime}>
        {getTimeAgo(notification.created_at)}
      </time>
    </>
  );

  if (notification.href) {
    return (
      <Link
        href={notification.href}
        className={`${styles.notification} ${isUnread ? styles.unread : ""}`}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={`${styles.notification} ${isUnread ? styles.unread : ""}`}
      onClick={onClick}
    >
      {content}
    </button>
  );
}

function getTimeAgo(timestamp: string): string {
  const now = Date.now();
  const date = new Date(timestamp).getTime();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}
