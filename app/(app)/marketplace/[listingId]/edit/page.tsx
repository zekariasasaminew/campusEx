"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ListingForm } from "@/components/marketplace/ListingForm";
import {
  fetchListingDetail,
  submitListingUpdate,
} from "@/lib/marketplace/actions";
import type {
  UpdateListingInput,
  ListingDetail,
} from "@/lib/marketplace/types";
import styles from "./page.module.css";

interface EditListingPageProps {
  params: { listingId: string };
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadListing = useCallback(async () => {
    setLoading(true);
    const result = await fetchListingDetail(params.listingId);

    if (result.success) {
      if (!result.data.is_owner) {
        router.push("/marketplace");
        return;
      }
      setListing(result.data);
    } else {
      router.push("/marketplace");
    }

    setLoading(false);
  }, [params.listingId, router]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const handleSubmit = async (data: UpdateListingInput) => {
    const result = await submitListingUpdate(params.listingId, data);

    if (result.success) {
      router.push(`/marketplace/${params.listingId}`);
    } else {
      throw new Error(result.error);
    }
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
