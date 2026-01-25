import type { SelectHTMLAttributes } from "react";
import styles from "./select.module.css";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  fullWidth = false,
  options,
  placeholder,
  className = "",
  id,
  ...props
}: SelectProps) {
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
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
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
