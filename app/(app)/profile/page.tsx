import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import styles from "./page.module.css";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <Link href="/profile/edit">
          <Button variant="secondary">Edit Profile</Button>
        </Link>
      </div>

      <div className={styles.card}>
        <div className={styles.field}>
          <p className={styles.label}>Email</p>
          <p className={styles.value}>{user.email}</p>
        </div>

        <div className={styles.field}>
          <p className={styles.label}>Display Name</p>
          <p className={styles.value}>{profile?.display_name || "Not set"}</p>
        </div>

        {profile?.grad_year && (
          <div className={styles.field}>
            <p className={styles.label}>Graduation Year</p>
            <p className={styles.value}>{profile.grad_year}</p>
          </div>
        )}

        {profile?.bio && (
          <div className={styles.field}>
            <p className={styles.label}>Bio</p>
            <p className={styles.value}>{profile.bio}</p>
          </div>
        )}

        {profile?.preferred_meeting_spot && (
          <div className={styles.field}>
            <p className={styles.label}>Preferred Meeting Spot</p>
            <p className={styles.value}>{profile.preferred_meeting_spot}</p>
          </div>
        )}

        <div className={styles.field}>
          <p className={styles.label}>Account Status</p>
          <div className={styles.badges}>
            {profile?.email_verified && (
              <span className={styles.badge}>✓ Email Verified</span>
            )}
            {profile?.campus_verified && (
              <span className={styles.badge}>✓ Campus Verified</span>
            )}
            {!profile?.email_verified && !profile?.campus_verified && (
              <span className={styles.unverified}>No verifications</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
