import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SaveButton } from "@/components/saves/SaveButton";
import * as savesActions from "@/lib/saves/actions";

vi.mock("@/lib/saves/actions", () => ({
  toggleListingSave: vi.fn(),
  isListingSaved: vi.fn(),
}));

describe("SaveButton", () => {
  beforeEach(() => {
    vi.mocked(savesActions.isListingSaved).mockResolvedValue({
      success: true,
      data: false,
    });
  });

  it("renders with unfilled heart when not saved", () => {
    render(
      <SaveButton
        listingId="550e8400-e29b-41d4-a716-446655440000"
        initialSaved={false}
      />,
    );
    const button = screen.getByRole("button", { name: /save listing/i });
    expect(button).toBeInTheDocument();
  });

  it("renders with filled heart when saved", () => {
    render(
      <SaveButton
        listingId="550e8400-e29b-41d4-a716-446655440000"
        initialSaved={true}
      />,
    );
    const button = screen.getByRole("button", { name: /unsave listing/i });
    expect(button).toBeInTheDocument();
  });

  it("has accessible label", () => {
    render(
      <SaveButton
        listingId="550e8400-e29b-41d4-a716-446655440000"
        initialSaved={true}
      />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAccessibleName();
  });
});
