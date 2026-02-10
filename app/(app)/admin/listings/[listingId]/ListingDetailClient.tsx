"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminDeleteListing, adminUpdateListing } from "@/lib/admin/actions";
import type { AdminListingWithDetails } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import styles from "./page.module.css";
import { CATEGORIES, CONDITIONS } from "@/lib/marketplace/constants";

interface ListingDetailClientProps {
  listing: AdminListingWithDetails;
}

export default function ListingDetailClient({
  listing,
}: ListingDetailClientProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: listing.title,
    description: listing.description,
    category: listing.category,
    condition: listing.condition || "",
    price_cents: listing.price_cents,
    is_free: listing.is_free,
    location: listing.location_text || "",
  });

  const handleSave = useCallback(async () => {
    setError(null);
    setIsSaving(true);

    const result = await adminUpdateListing({
      listing_id: listing.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      condition: formData.condition || null,
      price_cents: formData.price_cents,
      is_free: formData.is_free,
      location: formData.location || null,
    });

    setIsSaving(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    setIsEditing(false);
    router.refresh();
  }, [formData, listing.id, router]);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    setError(null);

    const result = await adminDeleteListing({ listing_id: listing.id });

    if (!result.success) {
      setError(result.error);
      setIsDeleting(false);
      setShowDeleteDialog(false);
      return;
    }

    router.push("/admin/listings");
    router.refresh();
  }, [listing.id, router]);

  const handleCancel = useCallback(() => {
    setFormData({
      title: listing.title,
      description: listing.description,
      category: listing.category,
      condition: listing.condition || "",
      price_cents: listing.price_cents,
      is_free: listing.is_free,
      location: listing.location_text || "",
    });
    setIsEditing(false);
    setError(null);
  }, [listing]);

  useEffect(() => {
    if (formData.is_free) {
      setFormData((prev) => ({ ...prev, price_cents: null }));
    }
  }, [formData.is_free]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Manage Listing</h1>
        <div className={styles.actions}>
          {!isEditing ? (
            <>
              <Button onClick={() => setIsEditing(true)} variant="primary">
                Edit Listing
              </Button>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="danger"
              >
                Delete Listing
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleCancel} variant="secondary">
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="primary"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          )}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Listing Details</h2>

          <div className={styles.field}>
            <label className={styles.label}>Title</label>
            {isEditing ? (
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                maxLength={100}
              />
            ) : (
              <p className={styles.value}>{listing.title}</p>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            {isEditing ? (
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={6}
                maxLength={2000}
              />
            ) : (
              <p className={styles.value}>{listing.description}</p>
            )}
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Category</label>
              {isEditing ? (
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Select>
              ) : (
                <p className={styles.value}>{listing.category}</p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Condition</label>
              {isEditing ? (
                <Select
                  value={formData.condition}
                  onChange={(e) =>
                    setFormData({ ...formData, condition: e.target.value })
                  }
                >
                  <option value="">Select condition</option>
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </Select>
              ) : (
                <p className={styles.value}>{listing.condition || "N/A"}</p>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>
                <input
                  type="checkbox"
                  checked={formData.is_free}
                  onChange={(e) =>
                    setFormData({ ...formData, is_free: e.target.checked })
                  }
                  disabled={!isEditing}
                />
                Free Item
              </label>
            </div>

            {!formData.is_free && (
              <div className={styles.field}>
                <label className={styles.label}>Price (cents)</label>
                {isEditing ? (
                  <Input
                    type="number"
                    value={formData.price_cents || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price_cents: e.target.value
                          ? parseInt(e.target.value, 10)
                          : null,
                      })
                    }
                    min={0}
                  />
                ) : (
                  <p className={styles.value}>
                    {listing.price_cents
                      ? `$${(listing.price_cents / 100).toFixed(2)}`
                      : "N/A"}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Location</label>
            {isEditing ? (
              <Input
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Optional"
              />
            ) : (
              <p className={styles.value}>{listing.location_text || "N/A"}</p>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Metadata</h2>

          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <p className={styles.value}>{listing.status}</p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Visibility</label>
            <p className={styles.value}>{listing.visibility_status}</p>
          </div>

          {listing.hidden_reason && (
            <div className={styles.field}>
              <label className={styles.label}>Hidden Reason</label>
              <p className={styles.value}>{listing.hidden_reason}</p>
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label}>Seller</label>
            <p className={styles.value}>
              {listing.seller_name || "No name"} ({listing.seller_email})
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Created</label>
            <p className={styles.value}>
              {new Date(listing.created_at).toLocaleString()}
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Updated</label>
            <p className={styles.value}>
              {new Date(listing.updated_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </div>
  );
}
