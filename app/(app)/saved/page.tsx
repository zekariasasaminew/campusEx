import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSaved } from "@/lib/saves/actions";
import { getImageUrl } from "@/lib/marketplace/storage";
import { PLACEHOLDER_IMAGE_PATH } from "@/lib/marketplace/constants";
import Link from "next/link";
import Image from "next/image";
import { SaveButton } from "@/components/saves/SaveButton";
import styles from "./page.module.css";

export const metadata = {
  title: "Saved - Campus Exchange",
  description: "Your saved listings",
};

export default async function SavedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const result = await getSaved();

  if (!result.success) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Saved</h1>
        </div>
        <div className={styles.error}>Failed to load saved listings</div>
      </div>
    );
  }

  const savedListings = result.data;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Saved</h1>
        <p className={styles.subtitle}>
          {savedListings.length}{" "}
          {savedListings.length === 1 ? "listing" : "listings"}
        </p>
      </div>

      {savedListings.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>No saved listings yet</h2>
          <p className={styles.emptyMessage}>
            Save listings you are interested in to easily find them later
          </p>
          <Link href="/marketplace" className={styles.browseLink}>
            Browse marketplace
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {savedListings.map((saved) => {
            const imageUrl = saved.listing_image_url
              ? getImageUrl(supabase, saved.listing_image_url)
              : PLACEHOLDER_IMAGE_PATH;

            const formattedPrice = saved.listing_is_free
              ? "Free"
              : saved.listing_price_cents != null
                ? `$${(saved.listing_price_cents / 100).toFixed(2)}`
                : "Price not available";

            return (
              <div key={saved.id} className={styles.card}>
                <Link
                  href={`/marketplace/${saved.listing_id}`}
                  className={styles.cardLink}
                >
                  <div className={styles.imageWrapper}>
                    <Image
                      src={imageUrl}
                      alt={saved.listing_title}
                      fill
                      className={styles.image}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {saved.listing_status === "sold" && (
                      <div className={styles.soldBadge}>Sold</div>
                    )}
                  </div>

                  <div className={styles.content}>
                    <h3 className={styles.listingTitle}>
                      {saved.listing_title}
                    </h3>
                    <p
                      className={`${styles.price} ${saved.listing_is_free ? styles.free : ""}`}
                    >
                      {formattedPrice}
                    </p>
                  </div>
                </Link>

                <div className={styles.actions}>
                  <SaveButton
                    listingId={saved.listing_id}
                    initialSaved={true}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
