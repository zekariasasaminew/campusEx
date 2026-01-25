import type { SelectHTMLAttributes, ReactNode } from "react";
import styles from "./select.module.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options?: SelectOption[];
  placeholder?: string;
  children?: ReactNode;
}

export function Select({
  label,
  error,
  fullWidth = false,
  options,
  placeholder,
  className = "",
  id,
  children,
  ...props
}: SelectProps) {
  // Validate that exactly one of options or children is provided
  if (options && children) {
    throw new Error(
      "Select: Provide either 'options' prop or 'children', not both.",
    );
  }

  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ""}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`${styles.select} ${error ? styles.error : ""} ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${selectId}-error` : undefined}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
      {error && (
        <span
          id={`${selectId}-error`}
          className={styles.errorText}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
