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
      <div className={styles.icon}>📦</div>
      <p className={styles.message}>{message || "Nothing to show"}</p>
      {action && (
        <a href={action.href} className={styles.action}>
          {action.label}
        </a>
      )}
    </div>
  );
}
