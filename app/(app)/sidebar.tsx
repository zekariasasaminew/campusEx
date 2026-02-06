"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  User,
  LogOut,
  MessageSquare,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import styles from "./sidebar.module.css";

const navigation = [
  { name: "Marketplace", href: "/marketplace", icon: ShoppingBag },
  { name: "Inbox", href: "/inbox", icon: MessageSquare },
  { name: "Saved", href: "/saved", icon: Bookmark },
  { name: "Profile", href: "/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h1 className={styles.logo}>Campus Ex</h1>
      </div>
      <nav className={styles.nav}>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      <div className={styles.footer}>
        <Button
          variant="ghost"
          fullWidth
          onClick={handleSignOut}
          className={styles.signOutButton}
        >
          <LogOut size={20} />
          <span>Sign out</span>
        </Button>
      </div>
    </aside>
  );
}
