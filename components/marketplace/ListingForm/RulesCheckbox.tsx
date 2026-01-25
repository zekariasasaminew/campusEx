import { PROHIBITED_ITEMS, SAFETY_NOTE } from "@/lib/marketplace/constants";
import styles from "./RulesCheckbox.module.css";

interface RulesCheckboxProps {
  checked: boolean;
  error?: string;
  onChange: (checked: boolean) => void;
}

export function RulesCheckbox({ checked, error, onChange }: RulesCheckboxProps) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Listing Rules</h3>

      <div className={styles.rules}>
        <div className={styles.ruleBlock}>
          <h4 className={styles.ruleTitle}>Prohibited Items</h4>
          <ul className={styles.list}>
            {PROHIBITED_ITEMS.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>

        <div className={styles.ruleBlock}>
          <p className={styles.safetyNote}>
            <strong>Safety:</strong> {SAFETY_NOTE}
          </p>
        </div>
      </div>

      <div className={styles.checkboxField}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            required
          />
          <span>
            I confirm this listing follows all rules and does not include
            prohibited items <span className={styles.required}>*</span>
          </span>
        </label>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}
