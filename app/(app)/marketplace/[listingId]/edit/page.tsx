"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { getListingById } from "@/lib/marketplace/queries";
import { updateListing } from "@/lib/marketplace/mutations";
import type { UpdateListingInput, ListingDetail } from "@/lib/marketplace/types";
import styles from "./page.module.css";

interface EditListingPageProps {
  params: { listingId: string };
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListing();
  }, [params.listingId]);

  const loadListing = async () => {
    setLoading(true);
    const result = await getListingById(params.listingId);
    
    if (result.success && result.data) {
      if (!result.data.isOwner) {
        router.push("/marketplace");
        return;
      }
      setListing(result.data);
    } else {
      router.push("/marketplace");
    }
    
    setLoading(false);
  };

  const handleSubmit = async (data: UpdateListingInput) => {
    const result = await updateListing(params.listingId, data);
    
    if (result.success) {
      router.push(`/marketplace/${params.listingId}`);
      return { success: true };
    }

    return {
      success: false,
      error: result.error || "Failed to update listing",
    };
  };

  const handleCancel = () => {
    router.push(`/marketplace/${params.listingId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Edit Listing</h1>
        <p className={styles.subtitle}>Update your listing details</p>
      </div>

      <ListingForm
        initialData={listing}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </div>
  );
}
