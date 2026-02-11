import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserNotifications } from "@/lib/notifications/actions";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Notifications - CampusEx",
  description: "Your notifications",
};

export default async function NotificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const result = await getUserNotifications();

  if (!result.success) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Notifications</h1>
        </div>
        <div className={styles.error}>Failed to load notifications</div>
      </div>
    );
  }

  const notifications = result.data;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>No notifications</h2>
          <p className={styles.emptyMessage}>
            You will be notified about messages and important updates
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map((notification) => {
            const isUnread = !notification.read_at;

            const content = (
              <div className={styles.notificationContent}>
                <h3 className={styles.notificationTitle}>
                  {notification.title}
                </h3>
                <p className={styles.notificationBody}>{notification.body}</p>
                <time className={styles.notificationTime}>
                  {new Date(notification.created_at).toLocaleString()}
                </time>
              </div>
            );

            if (notification.href) {
              return (
                <Link
                  key={notification.id}
                  href={notification.href}
                  className={`${styles.notification} ${isUnread ? styles.unread : ""}`}
                >
                  {content}
                </Link>
              );
            }

            return (
              <div
                key={notification.id}
                className={`${styles.notification} ${isUnread ? styles.unread : ""}`}
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
