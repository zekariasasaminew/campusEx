import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Select } from "@/components/ui/select";

describe("Select", () => {
  const options = [
    { value: "option1", label: "Option 1" },
    { value: "option2", label: "Option 2" },
    { value: "option3", label: "Option 3" },
  ];

  it("should render with label", () => {
    render(<Select label="Choose option" options={options} />);
    expect(screen.getByText("Choose option")).toBeInTheDocument();
  });

  it("should render all options", () => {
    render(<Select options={options} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
  });

  it("should call onChange when option is selected", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Select options={options} onChange={handleChange} />);

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "option2");

    expect(handleChange).toHaveBeenCalled();
  });

  it("should display selected value", () => {
    render(<Select options={options} value="option2" onChange={() => {}} />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select.value).toBe("option2");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Select options={options} disabled />);
    const select = screen.getByRole("combobox");
    expect(select).toBeDisabled();
  });

  it("should display error message when error prop is provided", () => {
    render(<Select options={options} error="Please select an option" />);
    expect(screen.getByText("Please select an option")).toBeInTheDocument();
  });

  it("should apply error styles when error exists", () => {
    const { container } = render(
      <Select options={options} error="Error message" />,
    );
    const select = container.querySelector("select");
    expect(select?.className).toContain("error");
  });

  it("should render placeholder option when provided", () => {
    render(<Select options={options} placeholder="Select an option" />);
    expect(screen.getByText("Select an option")).toBeInTheDocument();
  });

  it("should have empty value for placeholder option", () => {
    const { container } = render(
      <Select options={options} placeholder="Select an option" />,
    );
    const placeholderOption = container.querySelector('option[value=""]');
    expect(placeholderOption).toBeInTheDocument();
  });
});
