"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FiltersBar } from "@/components/marketplace/FiltersBar";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { fetchListings } from "@/lib/marketplace/actions";
import type {
  ListingFilters,
  ListingWithImages,
} from "@/lib/marketplace/types";
import styles from "./page.module.css";

export default function MarketplacePage() {
  const [listings, setListings] = useState<ListingWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ListingFilters>({});

  useEffect(() => {
    loadListings({});
  }, []);

  const loadListings = async (newFilters: ListingFilters) => {
    setLoading(true);
    setFilters(newFilters);

    const result = await fetchListings(newFilters);
    if (result.success) {
      setListings(result.data);
    } else {
      setListings([]);
    }
    setLoading(false);
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

      <FiltersBar filters={filters} onFiltersChange={loadListings} />

      <ListingGrid
        listings={listings}
        isLoading={loading}
      />
    </div>
  );
}
