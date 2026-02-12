"use client";

import { useState, useEffect, type FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import styles from "./page.module.css";

function SignInForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
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
          shouldCreateUser: true,
        },
      });

      if (error) {
        // Handle timeout errors gracefully - email might still arrive
        if (
          error.message?.includes("timeout") ||
          error.message?.includes("504")
        ) {
          setOtpSent(true);
          setToast({
            message:
              "Email is being sent (this may take a moment). Check your inbox.",
            variant: "info",
            isVisible: true,
          });
          return;
        }
        throw error;
      }

      setOtpSent(true);
      setToast({
        message: "Check your email for the verification code",
        variant: "success",
        isVisible: true,
      });
    } catch (error) {
      setToast({
        message: error instanceof Error ? error.message : "Failed to send code",
        variant: "error",
        isVisible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      // Validate domain before making auth call
      if (!normalizedEmail.endsWith("@augustana.edu")) {
        throw new Error("Only @augustana.edu email addresses are allowed");
      }

      const supabase = createClient();

      const { data, error } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: otp,
        type: "magiclink",
      });

      if (error) throw error;

      // Double-check email domain after authentication
      if (data?.user?.email) {
        const userEmail = data.user.email.trim().toLowerCase();
        if (!userEmail.endsWith("@augustana.edu")) {
          await supabase.auth.signOut();
          throw new Error("Only @augustana.edu email addresses are allowed");
        }
      }

      // Redirect to marketplace on success
      router.push("/marketplace");
    } catch (error) {
      setToast({
        message:
          error instanceof Error ? error.message : "Invalid or expired code",
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
        <h1 className={styles.title}>Sign in to CampusEx</h1>
        {!otpSent ? (
          <>
            <p className={styles.description}>
              Enter your Augustana email to receive a verification code
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
                Only @augustana.edu email addresses are allowed
              </p>
              <Button type="submit" fullWidth disabled={loading || !email}>
                {loading ? "Sending..." : "Send verification code"}
              </Button>
            </form>
          </>
        ) : (
          <>
            <p className={styles.description}>Enter the code sent to {email}</p>
            <form onSubmit={handleVerifyOtp} className={styles.form}>
              <Input
                type="text"
                label="Verification Code"
                placeholder="00000000"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setOtp(value);
                }}
                required
                fullWidth
                disabled={loading}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <Button
                type="submit"
                fullWidth
                disabled={loading || otp.length < 6}
              >
                {loading ? "Verifying..." : "Verify code"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                fullWidth
                onClick={() => {
                  setOtpSent(false);
                  setOtp("");
                }}
                disabled={loading}
              >
                Use a different email
              </Button>
            </form>
          </>
        )}
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
