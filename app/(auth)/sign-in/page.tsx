"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error" | "info";
    isVisible: boolean;
  }>({ message: "", variant: "info", isVisible: false });
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/marketplace`,
        },
      });

      if (error) throw error;

      setToast({
        message: "Check your email for the login link",
        variant: "success",
        isVisible: true,
      });
      setEmail("");
    } catch (error) {
      setToast({
        message:
          error instanceof Error ? error.message : "Failed to send login link",
        variant: "error",
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles.content}>
        <h1 className={styles.title}>Sign in to Campus Ex</h1>
        <p className={styles.description}>
          Enter your email to receive a magic link
        </p>
        <form onSubmit={handleSignIn} className={styles.form}>
          <Input
            type="email"
            label="Email"
            placeholder="you@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            disabled={loading}
          />
          <Button type="submit" fullWidth disabled={loading || !email}>
            {loading ? "Sending..." : "Send magic link"}
          </Button>
        </form>
      </div>
      <Toast
        message={toast.message}
        variant={toast.variant}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </>
  );
}
