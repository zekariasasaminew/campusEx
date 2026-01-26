import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

describe("ConfirmDialog", () => {
  it("should render when open", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(
      <ConfirmDialog
        isOpen={false}
        title="Confirm Action"
        message="Are you sure?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.queryByText("Confirm Action")).not.toBeInTheDocument();
  });

  it("should call onConfirm when confirm button is clicked", async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Sure?"
        onConfirm={handleConfirm}
        onCancel={() => {}}
      />,
    );

    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    await user.click(confirmButton);
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Sure?"
        onConfirm={() => {}}
        onClose={handleClose}
      />,
    );

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should use custom confirm label", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete"
        message="Delete this?"
        confirmLabel="Delete"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("should use custom cancel label", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Confirm"
        message="Sure?"
        cancelLabel="No"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
  });

  it("should apply danger variant to confirm button", () => {
    render(
      <ConfirmDialog
        isOpen={true}
        title="Delete"
        message="Delete this?"
        variant="danger"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    const confirmButton = screen.getByRole("button", { name: /confirm/i });
    expect(confirmButton.className).toContain("danger");
  });
});
