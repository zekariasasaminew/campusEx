"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { VALIDATION_RULES, REPORT_REASONS } from "@/lib/marketplace/constants";
import styles from "./ReportDialog.module.css";

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string, details: string) => Promise<void>;
  listingTitle: string;
}

export function ReportDialog({
  isOpen,
  onClose,
  onSubmit,
  listingTitle,
}: ReportDialogProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!reason || reason.trim().length === 0) {
      setError("Please select a reason");
      return;
    }

    if (details.trim().length === 0) {
      setError("Please provide details about the issue");
      return;
    }

    if (details.length > VALIDATION_RULES.reportDetails.max) {
      setError(
        `Details must not exceed ${VALIDATION_RULES.reportDetails.max} characters`,
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(reason, details);
      setReason("");
      setDetails("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason("");
      setDetails("");
      setError("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Report Listing">
      <form onSubmit={handleSubmit} className={styles.form}>
        <p className={styles.subtitle}>
          Report: <strong>{listingTitle}</strong>
        </p>

        <p className={styles.info}>
          Please describe the issue with this listing. Reports are reviewed by
          moderators.
        </p>

        <div className={styles.field}>
          <label htmlFor="reason" className={styles.label}>
            Reason *
          </label>
          <Select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
            disabled={isSubmitting}
          >
            <option value="">Select a reason...</option>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Provide additional details about the issue..."
          rows={6}
          maxLength={VALIDATION_RULES.reportDetails.max}
          required
          disabled={isSubmitting}
        />

        <div className={styles.charCount}>
          {details.length} / {VALIDATION_RULES.reportDetails.max}
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.actions}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
