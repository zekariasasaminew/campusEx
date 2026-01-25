"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ReportDialog } from "@/components/marketplace/ReportDialog";
import {
  fetchListingDetail,
  submitMarkAsSold,
  submitDeleteListing,
  submitReport,
} from "@/lib/marketplace/actions";
import type { ListingDetail } from "@/lib/marketplace/types";
import styles from "./page.module.css";

interface ListingDetailPageProps {
  params: { listingId: string };
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const router = useRouter();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadListing();
  }, [params.listingId]);

  const loadListing = async () => {
    setLoading(true);
    const result = await fetchListingDetail(params.listingId);
    
    if (result.success) {
      setListing(result.data);
    } else {
      setListing(null);
    }
    
    setLoading(false);
  };

  const handleMarkAsSold = async () => {
    if (!listing) return;

    const result = await submitMarkAsSold(listing.id);
    if (result.success) {
      loadListing();
    }
  };

  const handleDelete = async () => {
    if (!listing || !confirm("Are you sure you want to delete this listing?"))
      return;

    const result = await submitDeleteListing(listing.id);
    if (result.success) {
      router.push("/marketplace");
    }
  };

  const handleReport = async (details: string) => {
    if (!listing) return;
    
    const result = await submitReport(listing.id, details);
    if (result.success) {
      setShowReportDialog(false);
      alert("Report submitted successfully");
    } else {
      throw new Error(result.error);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
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
                  className={`${styles.thumbnail} ${
                    index === selectedImageIndex ? styles.active : ""
                  }`}
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
          </div>

          <div className={styles.meta}>
            {listing.category && (
              <span className={styles.metaItem}>{listing.category}</span>
            )}
            {listing.condition && (
              <span className={styles.metaItem}>{listing.condition}</span>
            )}
            {listing.location && (
              <span className={styles.metaItem}>{listing.location}</span>
            )}
          </div>

          <div className={styles.description}>
            <h2>Description</h2>
            <p>{listing.description}</p>
          </div>

          <div className={styles.seller}>
            <h2>Seller</h2>
            <p>{listing.seller.email}</p>
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
                <Button variant="ghost" onClick={handleDelete}>
                  Delete
                </Button>
              </>
            ) : (
              <Button variant="secondary" onClick={() => setShowReportDialog(true)}>
                Report Listing
              </Button>
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
    </div>
  );
}
