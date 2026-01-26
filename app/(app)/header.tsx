"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import styles from "./header.module.css";

export function Header() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/marketplace" className={styles.logo}>
          Campus Ex
        </Link>
        <div className={styles.actions}>
          <ThemeToggle />
          <Link href="/profile" className={styles.profileButton}>
            <User size={20} />
          </Link>
          <button onClick={handleSignOut} className={styles.signOutButton}>
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}
