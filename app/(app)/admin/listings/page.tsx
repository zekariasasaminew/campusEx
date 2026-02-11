import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/admin/queries";
import { getAdminListings } from "@/lib/admin/actions";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Admin Listings - CampusEx",
  description: "Manage all marketplace listings",
};

export default async function AdminListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = await checkIsAdmin(user.id);
  if (!isAdmin) {
    redirect("/marketplace");
  }

  const result = await getAdminListings();

  if (!result.success) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Listings</h1>
        </div>
        <div className={styles.error}>Failed to load listings</div>
      </div>
    );
  }

  const listings = result.data;
  const activeListings = listings.filter((l) => l.status === "active");
  const soldListings = listings.filter((l) => l.status === "sold");
  const hiddenListings = listings.filter(
    (l) => l.visibility_status === "hidden",
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Listings</h1>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <strong>{activeListings.length}</strong> Active
          </span>
          <span className={styles.stat}>
            <strong>{soldListings.length}</strong> Sold
          </span>
          <span className={styles.stat}>
            <strong>{hiddenListings.length}</strong> Hidden
          </span>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>No listings</h2>
          <p className={styles.emptyMessage}>No listings to manage</p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.colTitle}>Title</div>
            <div className={styles.colSeller}>Seller</div>
            <div className={styles.colCategory}>Category</div>
            <div className={styles.colPrice}>Price</div>
            <div className={styles.colStatus}>Status</div>
            <div className={styles.colDate}>Created</div>
            <div className={styles.colActions}>Actions</div>
          </div>

          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/admin/listings/${listing.id}`}
              className={styles.tableRow}
            >
              <div className={styles.colTitle}>
                <div className={styles.listingTitle}>{listing.title}</div>
                {listing.visibility_status === "hidden" && (
                  <div className={styles.hiddenBadge}>
                    Hidden: {listing.hidden_reason || "No reason"}
                  </div>
                )}
              </div>

              <div className={styles.colSeller}>
                <div className={styles.sellerName}>
                  {listing.seller_name || "No name"}
                </div>
                <div className={styles.sellerEmail}>{listing.seller_email}</div>
              </div>

              <div className={styles.colCategory}>{listing.category}</div>

              <div className={styles.colPrice}>
                {listing.is_free
                  ? "Free"
                  : listing.price_cents != null
                    ? `$${(listing.price_cents / 100).toFixed(2)}`
                    : "N/A"}
              </div>

              <div className={styles.colStatus}>
                <span
                  className={`${styles.statusBadge} ${styles[listing.status]}`}
                >
                  {listing.status}
                </span>
              </div>

              <div className={styles.colDate}>
                {new Date(listing.created_at).toLocaleDateString()}
              </div>

              <div className={styles.colActions}>
                <span className={styles.viewLink}>Manage</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
