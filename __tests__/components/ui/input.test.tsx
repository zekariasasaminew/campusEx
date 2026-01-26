import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("should render with placeholder", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("should render with label", () => {
    render(<Input label="Username" />);
    expect(screen.getByText("Username")).toBeInTheDocument();
  });

  it("should update value on change", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole("textbox");
    await user.type(input, "test");

    expect(handleChange).toHaveBeenCalled();
  });

  it("should display error message when error prop is provided", () => {
    render(<Input error="This field is required" />);
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("should apply error styles when error exists", () => {
    const { container } = render(<Input error="Error message" />);
    const input = container.querySelector("input");
    expect(input?.className).toContain("error");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Input disabled />);
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("should accept different types", () => {
    render(<Input type="email" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("type", "email");
  });

  it("should render with value", () => {
    render(<Input value="test value" onChange={() => {}} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input.value).toBe("test value");
  });

  it("should link label to input with htmlFor", () => {
    render(<Input label="Email" id="email-input" />);
    const label = screen.getByText("Email");
    expect(label).toHaveAttribute("for", "email-input");
  });

  it("should accept maxLength attribute", () => {
    render(<Input value="test" maxLength={100} onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("maxlength", "100");
  });
});
