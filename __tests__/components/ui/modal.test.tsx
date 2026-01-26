import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "@/components/ui/modal";

describe("Modal", () => {
  it("should render children when open", () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>,
    );
    expect(screen.getByText("Modal Content")).toBeInTheDocument();
  });

  it("should not render when closed", () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Modal Content</div>
      </Modal>,
    );
    expect(screen.queryByText("Modal Content")).not.toBeInTheDocument();
  });

  it("should render title when provided", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </Modal>,
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
  });

  it("should call onClose when overlay is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>,
    );

    const overlay = container.querySelector('[class*="overlay"]');
    if (overlay) {
      await user.click(overlay);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it("should call onClose when close button is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test">
        <div>Content</div>
      </Modal>,
    );

    const closeButton = screen.getByRole("button", { name: /close/i });
    await user.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("should not close when modal content is clicked", async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <div>Content</div>
      </Modal>,
    );

    const content = screen.getByText("Content");
    await user.click(content);
    expect(handleClose).not.toHaveBeenCalled();
  });
});
