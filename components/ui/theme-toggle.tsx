"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import styles from "./theme-toggle.module.css";

export function ThemeToggle() {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const rootTheme = document.documentElement.getAttribute("data-theme");
    if (rootTheme === "dark" || rootTheme === "light") {
      return rootTheme;
    }

    const stored = localStorage.getItem("theme") as "light" | "dark" | null;
    if (stored) {
      return stored;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={styles.toggle}
      aria-label={
        isHydrated
          ? `Switch to ${theme === "light" ? "dark" : "light"} mode`
          : "Toggle theme"
      }
      title={
        isHydrated
          ? `Switch to ${theme === "light" ? "dark" : "light"} mode`
          : "Toggle theme"
      }
    >
      {isHydrated ? (
        theme === "light" ? (
          <Moon size={20} />
        ) : (
          <Sun size={20} />
        )
      ) : (
        <Moon size={20} />
      )}
    </button>
  );
}
