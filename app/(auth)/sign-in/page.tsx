"use client";

import { useState, useEffect, type FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

function SignInForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error" | "info";
    isVisible: boolean;
  }>({ message: "", variant: "info", isVisible: false });

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "unauthorized_domain") {
      setToast({
        message: "Only @augustana.edu email addresses are allowed",
        variant: "error",
        isVisible: true,
      });
    } else if (error === "auth_failed") {
      setToast({
        message: "Authentication failed. Please try again.",
        variant: "error",
        isVisible: true,
      });
    }
  }, [searchParams]);

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate Augustana email domain with normalization
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail.endsWith("@augustana.edu")) {
        throw new Error(
          "Only Augustana College email addresses (@augustana.edu) are allowed",
        );
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
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
          Enter your Augustana email to receive a magic link
        </p>
        <form onSubmit={handleSignIn} className={styles.form}>
          <Input
            type="email"
            label="Augustana Email"
            placeholder="you@augustana.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            fullWidth
            disabled={loading}
          />
          <p className={styles.emailNote}>
            🔒 Only @augustana.edu email addresses are allowed
          </p>
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

export default function SignInPage() {
  return (
    <Suspense fallback={<div className={styles.content}>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
