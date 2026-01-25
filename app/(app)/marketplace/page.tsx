"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FiltersBar } from "@/components/marketplace/FiltersBar";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { getListings } from "@/lib/marketplace/queries";
import type {
  ListingFilters,
  ListingWithImages,
} from "@/lib/marketplace/types";
import styles from "./page.module.css";

export default function MarketplacePage() {
  const router = useRouter();
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ListingFilters>({});

  useState(() => {
    loadListings({});
  });

  const loadListings = async (newFilters: ListingFilters) => {
    setLoading(true);
    setFilters(newFilters);

    try {
      const result = await getListings(newFilters);
      if (result.success && result.data) {
        setListings(result.data);
      } else {
        setListings([]);
      }
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleListingClick = (id: string) => {
    router.push(`/marketplace/${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Marketplace</h1>
          <p className={styles.subtitle}>Buy and sell items within campus</p>
        </div>
        <Link href="/marketplace/new">
          <Button>Create Listing</Button>
        </Link>
      </div>

      <FiltersBar initialFilters={filters} onFiltersChange={loadListings} />

      <ListingGrid
        listings={listings}
        loading={loading}
        onListingClick={handleListingClick}
      />
    </div>
  );
}
