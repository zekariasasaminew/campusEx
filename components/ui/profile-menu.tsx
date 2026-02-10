"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { User, Shield, LogOut, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { checkCurrentUserIsAdmin } from "@/lib/admin/client-actions";
import styles from "./profile-menu.module.css";

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    checkCurrentUserIsAdmin().then(setIsAdmin);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/sign-in");
  };

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.trigger}
        aria-label="Profile menu"
        aria-expanded={isOpen}
      >
        <User size={20} />
        <ChevronDown size={16} className={styles.chevron} />
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <Link
            href="/profile"
            className={styles.menuItem}
            onClick={() => setIsOpen(false)}
          >
            <User size={18} />
            <span>Profile</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin/reports"
              className={styles.menuItem}
              onClick={() => setIsOpen(false)}
            >
              <Shield size={18} />
              <span>Admin Reports</span>
            </Link>
          )}

          <div className={styles.divider} />

          <button
            onClick={() => {
              setIsOpen(false);
              handleSignOut();
            }}
            className={styles.menuItem}
          >
            <LogOut size={18} />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}
