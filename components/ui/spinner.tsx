import styles from "./spinner.module.css";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
  className?: string;
}

export function Spinner({
  size = "md",
  message,
  className = "",
}: SpinnerProps) {
  return (
    <div className={`${styles.container} ${className}`} role="status">
      <div
        className={`${styles.spinner} ${styles[size]}`}
        aria-label="Loading"
        aria-live="polite"
      />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
