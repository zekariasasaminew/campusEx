import type { ListingWithImages } from "@/lib/marketplace/types";
import { ListingCard } from "./ListingCard";
import { EmptyState } from "./EmptyState";
import { Spinner } from "@/components/ui/spinner";
import styles from "./ListingGrid.module.css";

interface ListingGridProps {
  listings: ListingWithImages[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function ListingGrid({
  listings,
  isLoading = false,
  emptyMessage = "No listings found",
}: ListingGridProps) {
  if (isLoading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" message="Loading listings..." />
      </div>
    );
  }

  if (listings.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <div className={styles.grid}>
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
