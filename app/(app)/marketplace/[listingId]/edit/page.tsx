"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ListingForm } from "@/components/marketplace/ListingForm";
import { Spinner } from "@/components/ui/spinner";
import {
  fetchListingDetail,
  submitListingUpdate,
} from "@/lib/marketplace/actions";
import type {
  CreateListingInput,
  UpdateListingInput,
  ListingDetail,
} from "@/lib/marketplace/types";
import styles from "./page.module.css";

interface EditListingPageProps {
  params: Promise<{ listingId: string }>;
}

export default function EditListingPage({ params }: EditListingPageProps) {
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [listingId, setListingId] = useState<string>("");

  const loadListing = useCallback(async () => {
    setLoading(true);
    const { listingId: id } = await params;
    setListingId(id);
    const result = await fetchListingDetail(id);

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
  }, [params, router]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const handleSubmit = async (data: CreateListingInput) => {
    if (isSubmitting) return; // Prevent double submission

    setIsSubmitting(true);
    try {
      // Convert CreateListingInput to UpdateListingInput
      // Extract imagesToRemove if present (added by form component)
      const imagesToRemove = (data as any).imagesToRemove as
        | string[]
        | undefined;

      const updateData: UpdateListingInput = {
        title: data.title,
        description: data.description,
        category: data.category,
        condition: data.condition,
        price_cents: data.price_cents,
        is_free: data.is_free,
        location: data.location,
        images_to_add: data.images.length > 0 ? data.images : undefined,
        images_to_remove:
          imagesToRemove && imagesToRemove.length > 0
            ? imagesToRemove
            : undefined,
      };

      const result = await submitListingUpdate(listingId, updateData);

      if (result.success) {
        router.push(`/marketplace/${listingId}`);
      } else {
        throw new Error(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/marketplace/${listingId}`);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <Spinner size="lg" message="Loading listing..." />
        </div>
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
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
