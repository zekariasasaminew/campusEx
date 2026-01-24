import type { TextareaHTMLAttributes } from "react";
import styles from "./textarea.module.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  fullWidth = false,
  className = "",
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`${styles.container} ${fullWidth ? styles.fullWidth : ""}`}>
      {label && (
        <label htmlFor={textareaId} className={styles.label}>
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`${styles.textarea} ${error ? styles.error : ""} ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${textareaId}-error` : undefined}
        {...props}
      />
      {error && (
        <span
          id={`${textareaId}-error`}
          className={styles.errorText}
          role="alert"
        >
          {error}
        </span>
      )}
    </div>
  );
}
