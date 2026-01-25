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
    <div className={`${styles.container} ${className}`}>
      <div
        className={`${styles.spinner} ${styles[size]}`}
        aria-label="Loading"
      />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
}
