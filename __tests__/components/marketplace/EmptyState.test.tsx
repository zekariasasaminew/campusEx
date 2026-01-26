import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/marketplace/EmptyState";

describe("EmptyState", () => {
  it("should render default message", () => {
    render(<EmptyState />);
    expect(screen.getByText(/nothing to show/i)).toBeInTheDocument();
  });

  it("should render custom message", () => {
    render(<EmptyState message="No items match your search" />);
    expect(screen.getByText("No items match your search")).toBeInTheDocument();
  });

  it("should render action button when provided", () => {
    render(<EmptyState action={{ label: "Create Listing", href: "/new" }} />);
    const button = screen.getByText("Create Listing");
    expect(button).toBeInTheDocument();
  });

  it("should not render action button when not provided", () => {
    render(<EmptyState />);
    const links = screen.queryAllByRole("link");
    expect(links).toHaveLength(0);
  });

  it("should link to correct href", () => {
    const { container } = render(
      <EmptyState action={{ label: "Browse All", href: "/marketplace" }} />,
    );
    const link = container.querySelector('a[href="/marketplace"]');
    expect(link).toBeInTheDocument();
  });
});
