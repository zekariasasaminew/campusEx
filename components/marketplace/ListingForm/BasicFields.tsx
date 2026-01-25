import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { CATEGORIES, CONDITIONS, VALIDATION_RULES } from "@/lib/marketplace/constants";
import type { Category, Condition } from "@/lib/marketplace/constants";
import styles from "./BasicFields.module.css";

interface BasicFieldsProps {
  title: string;
  description: string;
  category?: Category;
  condition?: Condition | null;
  location: string;
  errors: Record<string, string>;
  onChange: (field: string, value: string | Category | Condition | null) => void;
}

export function BasicFields({
  title,
  description,
  category,
  condition,
  location,
  errors,
  onChange,
}: BasicFieldsProps) {
  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Basic Information</h3>

      <div className={styles.field}>
        <label htmlFor="title" className={styles.label}>
          Title <span className={styles.required}>*</span>
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="e.g., Used calculus textbook"
          maxLength={VALIDATION_RULES.title.max}
          required
        />
        {errors.title && <div className={styles.error}>{errors.title}</div>}
        <div className={styles.hint}>
          {title.length} / {VALIDATION_RULES.title.max}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description <span className={styles.required}>*</span>
        </label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Describe the item's condition, features, and any important details"
          rows={6}
          maxLength={VALIDATION_RULES.description.max}
          required
        />
        {errors.description && (
          <div className={styles.error}>{errors.description}</div>
        )}
        <div className={styles.hint}>
          {description.length} / {VALIDATION_RULES.description.max}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label htmlFor="category" className={styles.label}>
            Category <span className={styles.required}>*</span>
          </label>
          <Select
            id="category"
            value={category || ""}
            onChange={(e) =>
              onChange("category", e.target.value as Category)
            }
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          {errors.category && (
            <div className={styles.error}>{errors.category}</div>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="condition" className={styles.label}>
            Condition
          </label>
          <Select
            id="condition"
            value={condition || ""}
            onChange={(e) =>
              onChange(
                "condition",
                e.target.value ? (e.target.value as Condition) : null
              )
            }
          >
            <option value="">Not specified</option>
            {CONDITIONS.map((cond) => (
              <option key={cond} value={cond}>
                {cond}
              </option>
            ))}
          </Select>
          {errors.condition && (
            <div className={styles.error}>{errors.condition}</div>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="location" className={styles.label}>
          Location
        </label>
        <Input
          id="location"
          value={location}
          onChange={(e) => onChange("location", e.target.value)}
          placeholder="e.g., Main Library, Dorm Building A"
          maxLength={VALIDATION_RULES.location.max}
        />
        {errors.location && (
          <div className={styles.error}>{errors.location}</div>
        )}
        <div className={styles.hint}>Where on campus to meet</div>
      </div>
    </div>
  );
}
