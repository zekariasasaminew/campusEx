import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FiltersBar } from "@/components/marketplace/FiltersBar";
import type { ListingFilters } from "@/lib/marketplace/types";

describe("FiltersBar", () => {
  const mockOnFiltersChange = vi.fn();

  const defaultFilters: ListingFilters = {
    status: "active",
    category: null,
    condition: null,
    priceMin: null,
    priceMax: null,
    freeOnly: false,
    search: "",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render search input", () => {
    render(
      <FiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );
    expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
  });

  it("should render category filter", () => {
    render(
      <FiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );
    expect(screen.getByText(/all categories/i)).toBeInTheDocument();
  });

  it("should render condition filter", () => {
    render(
      <FiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );
    expect(screen.getByText(/any condition/i)).toBeInTheDocument();
  });

  it("should render price inputs", () => {
    render(
      <FiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );
    expect(screen.getByPlaceholderText(/min/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/max/i)).toBeInTheDocument();
  });

  it("should render free only checkbox", () => {
    render(
      <FiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );
    expect(screen.getByLabelText(/free items only/i)).toBeInTheDocument();
  });

  it("should show clear filters button when filters are active", () => {
    const activeFilters = { ...defaultFilters, category: "Books" as const };
    render(
      <FiltersBar
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );
    expect(screen.getByText(/clear filters/i)).toBeInTheDocument();
  });

  it("should not show clear filters button when no filters active", () => {
    render(
      <FiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );
    expect(screen.queryByText(/clear filters/i)).not.toBeInTheDocument();
  });

  it("should update search filter on input", async () => {
    const user = userEvent.setup();
    render(
      <FiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );

    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, "textbook");

    // Wait for debounce
    await vi.waitFor(
      () => {
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({ search: "textbook" }),
        );
      },
      { timeout: 600 },
    );
  });

  it("should update free only filter on checkbox change", async () => {
    const user = userEvent.setup();
    render(
      <FiltersBar
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );

    const checkbox = screen.getByLabelText(/free items only/i);
    await user.click(checkbox);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ freeOnly: true }),
    );
  });

  it("should clear all filters on clear button click", async () => {
    const user = userEvent.setup();
    const activeFilters: ListingFilters = {
      ...defaultFilters,
      category: "Books",
      search: "test",
      freeOnly: true,
    };

    render(
      <FiltersBar
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
      />,
    );

    const clearButton = screen.getByText(/clear filters/i);
    await user.click(clearButton);

    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      status: "active",
      category: null,
      condition: null,
      priceMin: null,
      priceMax: null,
      freeOnly: false,
      search: "",
    });
  });

  it("should display current search value", () => {
    const filtersWithSearch = { ...defaultFilters, search: "laptop" };
    render(
      <FiltersBar
        filters={filtersWithSearch}
        onFiltersChange={mockOnFiltersChange}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      /search/i,
    ) as HTMLInputElement;
    expect(searchInput.value).toBe("laptop");
  });

  it("should display current price values", () => {
    const filtersWithPrice = {
      ...defaultFilters,
      priceMin: 10,
      priceMax: 50,
    };
    render(
      <FiltersBar
        filters={filtersWithPrice}
        onFiltersChange={mockOnFiltersChange}
      />,
    );

    const minInput = screen.getByPlaceholderText(/min/i) as HTMLInputElement;
    const maxInput = screen.getByPlaceholderText(/max/i) as HTMLInputElement;

    expect(minInput.value).toBe("10");
    expect(maxInput.value).toBe("50");
  });
});
