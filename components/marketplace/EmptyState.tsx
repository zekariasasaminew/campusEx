import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  message?: string;
  action?: {
    label: string;
    href: string;
  };
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <svg
        className={styles.icon}
        width="64"
        height="64"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 7h-9" />
        <path d="M14 17H5" />
        <circle cx="17" cy="17" r="3" />
        <circle cx="7" cy="7" r="3" />
      </svg>
      <p className={styles.message}>{message || "No listings found"}</p>
      {action && (
        <a href={action.href} className={styles.action}>
          {action.label}
        </a>
      )}
    </div>
  );
}
