import type { ListingWithImages } from "@/lib/marketplace/types";
import { getImageUrl } from "@/lib/marketplace/storage";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import styles from "./ListingCard.module.css";

interface ListingCardProps {
  listing: ListingWithImages;
}

export function ListingCard({ listing }: ListingCardProps) {
  const supabase = createClient();
  const primaryImage = listing.images[0];
  const imageUrl = primaryImage
    ? getImageUrl(supabase, primaryImage.storage_path)
    : "/placeholder-image.png";

  const formattedPrice = listing.is_free
    ? "Free"
    : `$${(listing.price_cents! / 100).toFixed(2)}`;

  return (
    <Link href={`/marketplace/${listing.id}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        <img
          src={imageUrl}
          alt={listing.title}
          className={styles.image}
          loading="lazy"
        />
        {listing.status === "sold" && (
          <div className={styles.soldBadge}>Sold</div>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{listing.title}</h3>
        <p className={styles.price}>{formattedPrice}</p>

        <div className={styles.meta}>
          <span className={styles.category}>{listing.category}</span>
          {listing.condition && (
            <>
              <span className={styles.separator}>•</span>
              <span className={styles.condition}>{listing.condition}</span>
            </>
          )}
        </div>

        {listing.location && (
          <p className={styles.location}>{listing.location}</p>
        )}
      </div>
    </Link>
  );
}
