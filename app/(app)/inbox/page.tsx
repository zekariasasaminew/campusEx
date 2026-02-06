import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getInbox } from "@/lib/messaging/actions";
import { ConversationList } from "@/components/messaging/ConversationList";
import styles from "./page.module.css";

export const metadata = {
  title: "Inbox - Campus Exchange",
  description: "View your messages",
};

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const result = await getInbox();

  if (!result.success) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Inbox</h1>
          <p className={styles.subtitle}>Your conversations</p>
        </div>
        <div className={styles.card}>
          <div className={styles.loading}>
            Failed to load inbox. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inbox</h1>
        <p className={styles.subtitle}>Your conversations</p>
      </div>

      <div className={styles.card}>
        <ConversationList conversations={result.data} />
      </div>
    </div>
  );
}
