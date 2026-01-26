import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ListingCard } from "@/components/marketplace/ListingCard";
import type { ListingWithImages } from "@/lib/marketplace/types";

// Mock Next.js components
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    <img alt={alt} src={src} />
  ),
}));

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({}),
}));

describe("ListingCard", () => {
  const baseListing: ListingWithImages = {
    id: "123",
    title: "Test Book",
    description: "A great textbook for sale",
    category: "Books",
    condition: "Good",
    price_cents: 2500,
    is_free: false,
    location_text: "Campus Library",
    status: "active",
    seller_id: "user123",
    created_at: "2026-01-26T00:00:00Z",
    updated_at: "2026-01-26T00:00:00Z",
    images: [],
  };

  it("should render listing title", () => {
    render(<ListingCard listing={baseListing} />);
    expect(screen.getByText("Test Book")).toBeInTheDocument();
  });

  it("should display formatted price for paid items", () => {
    render(<ListingCard listing={baseListing} />);
    expect(screen.getByText("$25.00")).toBeInTheDocument();
  });

  it("should display Free for free items", () => {
    const freeListing = { ...baseListing, is_free: true, price_cents: null };
    render(<ListingCard listing={freeListing} />);
    expect(screen.getByText("Free")).toBeInTheDocument();
  });

  it("should display category chip", () => {
    render(<ListingCard listing={baseListing} />);
    expect(screen.getByText("Books")).toBeInTheDocument();
  });

  it("should display condition chip when present", () => {
    render(<ListingCard listing={baseListing} />);
    expect(screen.getByText("Good")).toBeInTheDocument();
  });

  it("should not display condition chip when null", () => {
    const listingWithoutCondition = { ...baseListing, condition: null };
    render(<ListingCard listing={listingWithoutCondition} />);
    const chips = screen.getAllByText(/Books|Good/);
    expect(chips).toHaveLength(1);
  });

  it("should display location when present", () => {
    const listingWithLocation = {
      ...baseListing,
      location: "Campus Library",
    };
    render(<ListingCard listing={listingWithLocation} />);
    expect(screen.getByText("Campus Library")).toBeInTheDocument();
  });

  it("should not display location when null", () => {
    const listingWithoutLocation = { ...baseListing, location_text: null };
    render(<ListingCard listing={listingWithoutLocation} />);
    expect(screen.queryByText("Campus Library")).not.toBeInTheDocument();
  });

  it("should show sold badge for sold items", () => {
    const soldListing = { ...baseListing, status: "sold" as const };
    render(<ListingCard listing={soldListing} />);
    expect(screen.getByText("Sold")).toBeInTheDocument();
  });

  it("should not show sold badge for active items", () => {
    render(<ListingCard listing={baseListing} />);
    expect(screen.queryByText("Sold")).not.toBeInTheDocument();
  });

  it("should link to detail page", () => {
    const { container } = render(<ListingCard listing={baseListing} />);
    const link = container.querySelector('a[href="/marketplace/123"]');
    expect(link).toBeInTheDocument();
  });

  it("should render image with title as alt text", () => {
    render(<ListingCard listing={baseListing} />);
    const image = screen.getByAltText("Test Book");
    expect(image).toBeInTheDocument();
  });

  it("should handle price of zero", () => {
    const freePriceListing = {
      ...baseListing,
      price_cents: 0,
      is_free: false,
    };
    render(<ListingCard listing={freePriceListing} />);
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("should handle large prices correctly", () => {
    const expensiveListing = { ...baseListing, price_cents: 999999 };
    render(<ListingCard listing={expensiveListing} />);
    expect(screen.getByText("$9999.99")).toBeInTheDocument();
  });
});
