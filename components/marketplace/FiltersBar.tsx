"use client";

import { useState } from "react";
import { CATEGORIES, CONDITIONS, type Category, type Condition } from "@/lib/marketplace/constants";
import type { ListingFilters } from "@/lib/marketplace/types";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import styles from "./FiltersBar.module.css";

interface FiltersBarProps {
  filters: ListingFilters;
  onFiltersChange: (filters: ListingFilters) => void;
}

export function FiltersBar({ filters, onFiltersChange }: FiltersBarProps) {
  const [search, setSearch] = useState(filters.search || "");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ ...filters, search });
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
        <Input
          type="search"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <Button type="submit">Search</Button>
      </form>

      <div className={styles.filters}>
        <Select
          value={filters.category || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              category: e.target.value ? (e.target.value as Category) : null,
            })
          }
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>

        <Select
          value={filters.condition || ""}
          onChange={(e) =>
            onFiltersChange({
              ...filters,
              condition: e.target.value ? (e.target.value as Condition) : null,
            })
          }
        >
          <option value="">Any Condition</option>
          {CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>
              {cond}
            </option>
          ))}
        </Select>

        <div className={styles.priceRange}>
          <Input
            type="number"
            placeholder="Min price"
            value={filters.priceMin ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                priceMin: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            min="0"
            step="1"
          />
          <span className={styles.priceSeparator}>to</span>
          <Input
            type="number"
            placeholder="Max price"
            value={filters.priceMax ?? ""}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                priceMax: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            min="0"
            step="1"
          />
        </div>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={filters.freeOnly || false}
            onChange={(e) =>
              onFiltersChange({ ...filters, freeOnly: e.target.checked })
            }
          />
          <span>Free items only</span>
        </label>

        {(filters.category ||
          filters.condition ||
          filters.priceMin ||
          filters.priceMax ||
          filters.freeOnly ||
          filters.search) && (
          <Button
            variant="secondary"
            onClick={() =>
              onFiltersChange({
                status: "active",
                category: null,
                condition: null,
                priceMin: null,
                priceMax: null,
                freeOnly: false,
                search: "",
              })
            }
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
