import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "@/components/ui/spinner";

describe("Spinner", () => {
  it("should render without message", () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('[class*="spinner"]');
    expect(spinner).toBeInTheDocument();
  });

  it("should render with message", () => {
    render(<Spinner message="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should apply size prop", () => {
    const { container } = render(<Spinner size="large" />);
    const spinner = container.querySelector('[class*="spinner"]');
    expect(spinner?.className).toContain("large");
  });

  it("should have aria-label for accessibility", () => {
    const { container } = render(<Spinner />);
    const spinner = container.querySelector('[aria-label="Loading"]');
    expect(spinner).toBeInTheDocument();
  });
});
