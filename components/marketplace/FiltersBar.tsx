"use client";

import { useState, useEffect, useRef } from "react";
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
  const onFiltersChangeRef = useRef(onFiltersChange);
  const filtersRef = useRef(filters);
  const initialMount = useRef(true);

  // Keep refs up to date
  useEffect(() => {
    onFiltersChangeRef.current = onFiltersChange;
    filtersRef.current = filters;
  });

  // Mark as mounted after first render
  useEffect(() => {
    initialMount.current = false;
  }, []);

  // Debounce search input
  useEffect(() => {
    if (initialMount.current) return; // Skip on initial mount

    const timer = setTimeout(() => {
      if (search !== filtersRef.current.search) {
        onFiltersChangeRef.current({
          ...filtersRef.current,
          search: search || "",
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Debounce price inputs
  useEffect(() => {
    if (initialMount.current) return; // Skip on initial mount

    const timer = setTimeout(() => {
      // Convert dollars to cents for database query with validation
      const parsedMin = priceMin === "" ? null : Number(priceMin);
      const parsedMax = priceMax === "" ? null : Number(priceMax);
      const minValue =
        parsedMin !== null && Number.isFinite(parsedMin)
          ? Math.round(parsedMin * 100)
          : null;
      const maxValue =
        parsedMax !== null && Number.isFinite(parsedMax)
          ? Math.round(parsedMax * 100)
          : null;

      if (
        minValue !== filtersRef.current.priceMin ||
        maxValue !== filtersRef.current.priceMax
      ) {
        onFiltersChangeRef.current({
          ...filtersRef.current,
          priceMin: minValue,
          priceMax: maxValue,
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [priceMin, priceMax]);

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
    onFiltersChangeRef.current({
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
          maxLength={100}
        />
      </div>

      <div className={styles.filters}>
        <Select
          value={filters.category || ""}
          onChange={(e) =>
            onFiltersChangeRef.current({
              ...filtersRef.current,
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
            onFiltersChangeRef.current({
              ...filtersRef.current,
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
            max="10000"
            step="1"
          />
          <span className={styles.priceSeparator}>to</span>
          <Input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            min="0"
            max="10000"
            step="1"
          />
        </div>

        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={filters.freeOnly || false}
            onChange={(e) =>
              onFiltersChangeRef.current({
                ...filtersRef.current,
                freeOnly: e.target.checked,
              })
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
