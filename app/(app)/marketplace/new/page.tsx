"use client";

import { useRouter } from "next/navigation";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { createListing } from "@/lib/marketplace/mutations";
import type { CreateListingInput } from "@/lib/marketplace/types";
import styles from "./page.module.css";

export default function NewListingPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateListingInput) => {
    const result = await createListing(data);

    if (result.success && result.data) {
      router.push(`/marketplace/${result.data.id}`);
      return { success: true };
    }

    return {
      success: false,
      error: result.error || "Failed to create listing",
    };
  };

  const handleCancel = () => {
    router.push("/marketplace");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create Listing</h1>
        <p className={styles.subtitle}>
          Share items you want to sell or give away
        </p>
      </div>

      <ListingForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  );
}
