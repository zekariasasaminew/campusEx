"use client";

import { useState } from "react";
import type { CreateListingInput } from "@/lib/marketplace/types";
import type { Category, Condition } from "@/lib/marketplace/constants";
import { BasicFields } from "./BasicFields";
import { ImageUpload } from "./ImageUpload";
import { PriceFields } from "./PriceFields";
import { RulesCheckbox } from "./RulesCheckbox";
import { Button } from "@/components/ui/button";
import { validateCreateListing } from "@/lib/marketplace/validators";
import styles from "./ListingForm.module.css";

interface ListingFormProps {
  onSubmit: (input: CreateListingInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function ListingForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: ListingFormProps) {
  const [formData, setFormData] = useState<Partial<CreateListingInput>>({
    title: "",
    description: "",
    category: undefined,
    condition: undefined,
    is_free: false,
    price_cents: null,
    location: "",
    images: [],
    agreed_to_rules: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = validateCreateListing(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(formData as CreateListingInput);
    } catch (error) {
      setErrors({
        submit: error instanceof Error ? error.message : "Failed to create listing",
      });
    }
  };

  const updateField = <K extends keyof CreateListingInput>(
    field: K,
    value: CreateListingInput[K]
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

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <BasicFields
        title={formData.title || ""}
        description={formData.description || ""}
        category={formData.category}
        condition={formData.condition}
        location={formData.location || ""}
        errors={errors}
        onChange={(field, value) => updateField(field as keyof CreateListingInput, value)}
      />

      <ImageUpload
        images={formData.images || []}
        error={errors.images}
        onChange={(images) => updateField("images", images)}
      />

      <PriceFields
        isFree={formData.is_free || false}
        priceCents={formData.price_cents}
        error={errors.price}
        onIsFreeChange={(isFree) => {
          updateField("is_free", isFree);
          if (isFree) {
            updateField("price_cents", null);
          }
        }}
        onPriceChange={(priceCents) => updateField("price_cents", priceCents)}
      />

      <RulesCheckbox
        agreed={formData.agreed_to_rules || false}
        error={errors.rules}
        onChange={(agreed) => updateField("agreed_to_rules", agreed)}
      />

      {errors.submit && <div className={styles.submitError}>{errors.submit}</div>}

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
          {isSubmitting ? "Creating..." : "Create Listing"}
        </Button>
      </div>
    </form>
  );
}
