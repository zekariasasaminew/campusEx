"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Toast } from "@/components/ui/toast";
import styles from "./page.module.css";

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [bio, setBio] = useState("");
  const [preferredMeetingSpot, setPreferredMeetingSpot] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profile) {
      setDisplayName(profile.display_name || "");
      setGradYear(profile.grad_year?.toString() || "");
      setBio(profile.bio || "");
      setPreferredMeetingSpot(profile.preferred_meeting_spot || "");
    }

    setIsLoading(false);
  };

  const handleSave = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setIsSaving(true);

    const updates: Record<string, any> = {
      display_name: displayName.trim(),
      grad_year: gradYear ? parseInt(gradYear) : null,
      bio: bio.trim() || null,
      preferred_meeting_spot: preferredMeetingSpot.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      setToast({
        message: "Failed to update profile",
        variant: "error",
      });
    } else {
      setToast({
        message: "Profile updated successfully",
        variant: "success",
      });
      setTimeout(() => router.push("/profile"), 1000);
    }

    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Profile</h1>
      </div>

      <div className={styles.card}>
        <div className={styles.field}>
          <label htmlFor="displayName" className={styles.label}>
            Display Name *
          </label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            maxLength={50}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="gradYear" className={styles.label}>
            Graduation Year
          </label>
          <Input
            id="gradYear"
            type="number"
            value={gradYear}
            onChange={(e) => setGradYear(e.target.value)}
            placeholder="2026"
            min="2020"
            max="2030"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="bio" className={styles.label}>
            Bio (max 280 characters)
          </label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell others about yourself"
            maxLength={280}
            rows={4}
          />
          <div className={styles.charCount}>{bio.length} / 280</div>
        </div>

        <div className={styles.field}>
          <label htmlFor="meetingSpot" className={styles.label}>
            Preferred Meeting Spot (max 80 characters)
          </label>
          <Input
            id="meetingSpot"
            value={preferredMeetingSpot}
            onChange={(e) => setPreferredMeetingSpot(e.target.value)}
            placeholder="e.g., Student Center"
            maxLength={80}
          />
        </div>

        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => router.push("/profile")}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !displayName.trim()}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
