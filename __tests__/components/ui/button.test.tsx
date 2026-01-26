import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("should render children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should call onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByText("Click me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>,
    );

    await user.click(screen.getByText("Click me"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should render as disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByText("Click me");
    expect(button).toBeDisabled();
  });

  it("should apply variant styles", () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("danger");
  });

  it("should apply size styles", () => {
    const { container } = render(<Button size="small">Small</Button>);
    const button = container.querySelector("button");
    expect(button?.className).toContain("small");
  });

  it("should support submit type", () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByText("Submit");
    expect(button).toHaveAttribute("type", "submit");
  });

  it("should render as button element", () => {
    render(<Button>Click</Button>);
    const button = screen.getByText("Click");
    expect(button.tagName).toBe("BUTTON");
  });

  it("should pass through className", () => {
    const { container } = render(
      <Button className="custom-class">Button</Button>,
    );
    const button = container.querySelector("button");
    expect(button?.className).toContain("custom-class");
  });
});
