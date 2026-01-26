"use client";

import { useState, useEffect } from "react";
import {
  CATEGORIES,
  CONDITIONS,
  type Category,
  type Condition,
} from "@/lib/marketplace/constants";
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
  const [priceMin, setPriceMin] = useState(filters.priceMin?.toString() || "");
  const [priceMax, setPriceMax] = useState(filters.priceMax?.toString() || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        onFiltersChange({ ...filters, search: search || "" });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search, filters, onFiltersChange]);

  // Debounce price inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      const minValue = priceMin ? parseInt(priceMin) : null;
      const maxValue = priceMax ? parseInt(priceMax) : null;

      if (minValue !== filters.priceMin || maxValue !== filters.priceMax) {
        onFiltersChange({
          ...filters,
          priceMin: minValue,
          priceMax: maxValue,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [priceMin, priceMax, filters, onFiltersChange]);

  const hasActiveFilters =
    filters.category ||
    filters.condition ||
    filters.priceMin ||
    filters.priceMax ||
    filters.freeOnly ||
    filters.search;

  const handleClearFilters = () => {
    setSearch("");
    setPriceMin("");
    setPriceMax("");
    onFiltersChange({
      status: "active",
      category: null,
      condition: null,
      priceMin: null,
      priceMax: null,
      freeOnly: false,
      search: "",
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.searchRow}>
        <Input
          type="search"
          placeholder="Search listings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

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
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            min="0"
            step="1"
          />
          <span className={styles.priceSeparator}>to</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
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

        {hasActiveFilters && (
          <Button variant="secondary" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
