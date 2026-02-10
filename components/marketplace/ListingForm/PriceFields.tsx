import { Input } from "@/components/ui/input";
import { VALIDATION_RULES } from "@/lib/marketplace/constants";
import styles from "./PriceFields.module.css";

interface PriceFieldsProps {
  isFree: boolean;
  price: string;
  errors: Record<string, string>;
  onChange: (field: "is_free" | "price", value: boolean | string) => void;
}

export function PriceFields({
  isFree,
  price,
  errors,
  onChange,
}: PriceFieldsProps) {
  return (
    <div className={styles.section}>
      <div>
        <h3 className={styles.sectionTitle}>Pricing</h3>
        <p className={styles.hint}>Set your price or offer for free</p>
      </div>

      <div className={styles.checkboxField}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isFree}
            onChange={(e) => onChange("is_free", e.target.checked)}
          />
          <span>Free item</span>
        </label>
      </div>

      {!isFree && (
        <div className={styles.field}>
          <label htmlFor="price" className={styles.label}>
            Price <span className={styles.required}>*</span>
          </label>
          <div className={styles.priceInput}>
            <span className={styles.currencySymbol}>$</span>
            <Input
              id="price"
              type="number"
              value={price}
              onChange={(e) => onChange("price", e.target.value)}
              placeholder="0.00"
              min="0.01"
              max={VALIDATION_RULES.priceFilter.max.toString()}
              step="0.01"
              required={!isFree}
            />
          </div>
          {errors.price && <div className={styles.error}>{errors.price}</div>}
          <div className={styles.hint}>
            Maximum ${VALIDATION_RULES.priceFilter.max.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
