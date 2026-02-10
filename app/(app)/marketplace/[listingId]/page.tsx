"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { ReportDialog } from "@/components/marketplace/ReportDialog";
import { SaveButton } from "@/components/saves/SaveButton";
import {
  fetchListingDetail,
  submitMarkAsSold,
  submitDeleteListing,
  submitReport,
} from "@/lib/marketplace/actions";
import { createOrGetConversationForListing } from "@/lib/messaging/actions";
import type { ListingDetail } from "@/lib/marketplace/types";
import styles from "./page.module.css";

interface ListingDetailPageProps {
  params: Promise<{ listingId: string }>;
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isContactingSeller, setIsContactingSeller] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    variant: "success" | "error";
  } | null>(null);

  const loadListing = useCallback(async () => {
    setLoading(true);
    const { listingId } = await params;
    const result = await fetchListingDetail(listingId);

    if (result.success) {
      setListing(result.data);
    } else {
      setListing(null);
    }

    setLoading(false);
  }, [params]);

  useEffect(() => {
    loadListing();
  }, [loadListing]);

  const handleMarkAsSold = async () => {
    if (!listing) return;

    const result = await submitMarkAsSold(listing.id);
    if (result.success) {
      loadListing();
      setToast({ message: "Listing marked as sold", variant: "success" });
    } else {
      setToast({
        message: result.error || "Failed to mark as sold",
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    if (!listing) return;

    const result = await submitDeleteListing(listing.id);
    if (result.success) {
      router.push("/marketplace");
    } else {
      setToast({
        message: result.error || "Failed to delete listing",
        variant: "error",
      });
    }
  };

  const handleReport = async (reason: string, details: string) => {
    if (!listing) return;

    const result = await submitReport(listing.id, reason, details);
    if (result.success) {
      setShowReportDialog(false);
      setToast({
        message: "Report submitted successfully",
        variant: "success",
      });
    } else {
      throw new Error(result.error);
    }
  };

  const handleContactSeller = async () => {
    if (!listing) return;

    setIsContactingSeller(true);
    const result = await createOrGetConversationForListing({
      listing_id: listing.id,
    });

    if (result.success) {
      router.push(`/inbox/${result.data}`);
    } else {
      setToast({
        message: result.error || "Failed to start conversation",
        variant: "error",
      });
      setIsContactingSeller(false);
    }
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
    return (
      <div className={styles.container}>
        <div className={styles.notFound}>
          <h1>Listing not found</h1>
          <Link href="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentImage =
    listing.images[selectedImageIndex]?.image_url || "/placeholder.png";

  return (
    <div className={styles.container}>
      <div className={styles.breadcrumb}>
        <Link href="/marketplace">Marketplace</Link>
        <span>/</span>
        <span>{listing.title}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            <Image
              src={currentImage}
              alt={listing.title}
              fill
              className={styles.image}
            />
            {listing.status === "sold" && (
              <div className={styles.soldBadge}>Sold</div>
            )}
          </div>

          {listing.images.length > 1 && (
            <div className={styles.thumbnails}>
              {listing.images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <Image
                    src={img.image_url || ""}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className={styles.thumbnailImage}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.details}>
          <div className={styles.header}>
            <h1 className={styles.title}>{listing.title}</h1>
            <div className={styles.price}>
              {listing.is_free ? "Free" : `$${listing.price?.toFixed(2)}`}
            </div>
            <SaveButton listingId={listing.id} />
          </div>

          <div className={styles.meta}>
            {listing.category && (
              <span className={styles.chip}>{listing.category}</span>
            )}
            {listing.condition && (
              <span className={styles.chip}>{listing.condition}</span>
            )}
            {listing.location && (
              <span className={styles.chip}>{listing.location}</span>
            )}
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Description</h2>
            <p className={styles.sectionContent}>{listing.description}</p>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Seller</h2>
            <p className={styles.sectionContent}>
              {listing.seller.full_name || listing.seller.email}
            </p>
          </div>

          <div className={styles.actions}>
            {listing.is_owner ? (
              <>
                {listing.status === "active" && (
                  <>
                    <Link href={`/marketplace/${listing.id}/edit`}>
                      <Button variant="secondary">Edit Listing</Button>
                    </Link>
                    <Button onClick={handleMarkAsSold}>Mark as Sold</Button>
                  </>
                )}
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  Delete Listing
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleContactSeller}
                  disabled={isContactingSeller || listing.status === "sold"}
                >
                  {isContactingSeller
                    ? "Starting conversation..."
                    : "Contact Seller"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowReportDialog(true)}
                >
                  Report Listing
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {showReportDialog && (
        <ReportDialog
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
          onSubmit={handleReport}
          listingTitle={listing.title}
        />
      )}

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Listing"
        message="Are you sure you want to delete this listing? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
      />

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
