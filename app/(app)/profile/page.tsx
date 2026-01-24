import { createClient } from "@/lib/supabase/server";
import styles from "./page.module.css";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile</h1>
      <div className={styles.info}>
        <p className={styles.label}>Email</p>
        <p className={styles.value}>{user?.email}</p>
      </div>
    </div>
  );
}
