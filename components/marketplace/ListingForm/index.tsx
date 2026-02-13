"use client";

import { useState } from "react";
import type {
  CreateListingInput,
  ListingDetail,
} from "@/lib/marketplace/types";
import type { Category, Condition } from "@/lib/marketplace/constants";
import { BasicFields } from "./BasicFields";
import { ImageUpload } from "./ImageUpload";
import { PriceFields } from "./PriceFields";
import { RulesCheckbox } from "./RulesCheckbox";
import { Button } from "@/components/ui/button";
import { validateCreateListing } from "@/lib/marketplace/validators";
import styles from "./ListingForm.module.css";

export type ListingFormSubmitInput = CreateListingInput & {
  imagesToRemove?: string[];
};

interface ListingFormProps {
  onSubmit: (input: ListingFormSubmitInput) => Promise<void>;
  onCancel: () => void;
  initialData?: ListingDetail;
  isSubmitting?: boolean;
}

export function ListingForm({
  onSubmit,
  onCancel,
  initialData,
  isSubmitting = false,
}: ListingFormProps) {
  const [formData, setFormData] = useState<Partial<CreateListingInput>>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    category: initialData?.category,
    condition: initialData?.condition || undefined,
    is_free: initialData?.is_free || false,
    price_cents: initialData?.price_cents || null,
    location: initialData?.location || "",
    images: [],
    agreed_to_rules: false,
  });
  const [existingImages, setExistingImages] = useState<
    Array<{ id: string; url: string }>
  >(
    initialData?.images?.map((img) => ({
      id: img.id,
      url: img.image_url || "",
    })) || [],
  );
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateCreateListing(formData);
    if (!validation.isValid) {
      // Filter out only the "at least one image required" error in edit mode
      const filteredErrors = { ...validation.errors };

      if (
        initialData &&
        filteredErrors.images === "At least one image is required"
      ) {
        // In edit mode, check total image count including existing
        const totalImages =
          existingImages.length + (formData.images?.length || 0);
        if (totalImages > 0) {
          // We have at least one image (existing or new), remove only this specific error
          delete filteredErrors.images;
        }
      }

      if (Object.keys(filteredErrors).length > 0) {
        setErrors(filteredErrors);
        return;
      }
    }

    try {
      // Pass form data with removed images info
      const submitData: ListingFormSubmitInput = {
        ...(formData as CreateListingInput),
        imagesToRemove,
      };
      await onSubmit(submitData);
    } catch (error) {
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to create listing",
      });
    }
  };

  const updateField = <K extends keyof CreateListingInput>(
    field: K,
    value: CreateListingInput[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleRemoveExistingImage = (imageId: string) => {
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
    setImagesToRemove((prev) => [...prev, imageId]);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <BasicFields
        title={formData.title || ""}
        description={formData.description || ""}
        category={formData.category}
        condition={formData.condition}
        location={formData.location || ""}
        errors={errors}
        onChange={(
          field: string,
          value: string | Category | Condition | null,
        ) => updateField(field as keyof CreateListingInput, value)}
      />

      <ImageUpload
        images={formData.images || []}
        existingImages={existingImages}
        errors={errors}
        onChange={(images: File[]) => updateField("images", images)}
        onRemoveExisting={handleRemoveExistingImage}
      />

      <PriceFields
        isFree={formData.is_free || false}
        price={
          formData.price_cents !== null && formData.price_cents !== undefined
            ? String(formData.price_cents / 100)
            : ""
        }
        errors={errors}
        onChange={(field: "is_free" | "price", value: boolean | string) => {
          if (field === "is_free") {
            updateField("is_free", value as boolean);
            if (value) updateField("price_cents", null);
          } else {
            const dollars = parseFloat(value as string);
            const cents = Math.round(dollars * 100);
            updateField("price_cents", isNaN(cents) ? null : cents);
          }
        }}
      />

      <RulesCheckbox
        checked={formData.agreed_to_rules || false}
        error={errors.agreed_to_rules}
        onChange={(agreed: boolean) => updateField("agreed_to_rules", agreed)}
      />

      {errors.submit && (
        <div className={styles.submitError}>{errors.submit}</div>
      )}

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? initialData
              ? "Updating..."
              : "Creating..."
            : initialData
              ? "Update Listing"
              : "Create Listing"}
        </Button>
      </div>
    </form>
  );
}
