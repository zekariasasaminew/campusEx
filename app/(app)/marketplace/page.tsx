import styles from "./page.module.css";

export default function MarketplacePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Marketplace</h1>
      <p className={styles.description}>
        Campus exclusive marketplace coming soon.
      </p>
    </div>
  );
}
