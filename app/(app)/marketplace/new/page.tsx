"use client";

import { useRouter } from "next/navigation";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { submitNewListing } from "@/lib/marketplace/actions";
import type { CreateListingInput } from "@/lib/marketplace/types";
import styles from "./page.module.css";

export default function NewListingPage() {
  const router = useRouter();

  const handleSubmit = async (data: CreateListingInput) => {
    const result = await submitNewListing(data);

    if (result.success) {
      router.push(`/marketplace/${result.data}`);
    } else {
      throw new Error(result.error);
    }
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
