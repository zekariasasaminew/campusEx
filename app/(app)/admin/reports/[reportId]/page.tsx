"use client";

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getAdminReportById,
  updateReportStatus,
  hideListing,
  unhideListing,
} from "@/lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Spinner } from "@/components/ui/spinner";
import type { ListingReportWithDetails } from "@/lib/admin/types";
import styles from "./page.module.css";

interface ReportDetailPageProps {
  params: Promise<{ reportId: string }>;
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const router = useRouter();
  const { reportId } = use(params);
  const [report, setReport] = useState<ListingReportWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [hideReason, setHideReason] = useState("");
  const [showHideDialog, setShowHideDialog] = useState(false);
  const [showUnhideDialog, setShowUnhideDialog] = useState(false);

  const loadReport = useCallback(async () => {
    if (!reportId) return;

    const result = await getAdminReportById(reportId);

    if (result.success && result.data) {
      setReport(result.data);
      setAdminNotes(result.data.admin_notes || "");
    }

    setIsLoading(false);
  }, [reportId]);

  useEffect(() => {
    if (!reportId) return;

    const timer = window.setTimeout(() => {
      void loadReport();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [reportId, loadReport]);

  const handleMarkReviewed = useCallback(async () => {
    if (!reportId) return;

    const result = await updateReportStatus({
      report_id: reportId,
      status: "reviewed",
      admin_notes: adminNotes,
    });

    if (result.success) {
      loadReport();
    }
  }, [reportId, adminNotes, loadReport]);

  const handleMarkActionTaken = useCallback(async () => {
    if (!reportId) return;

    const result = await updateReportStatus({
      report_id: reportId,
      status: "action_taken",
      admin_notes: adminNotes,
    });

    if (result.success) {
      loadReport();
    }
  }, [reportId, adminNotes, loadReport]);

  const handleHideListing = useCallback(async () => {
    if (!report || !hideReason.trim()) return;

    const result = await hideListing({
      listing_id: report.listing_id,
      reason: hideReason,
    });

    if (result.success) {
      await handleMarkActionTaken();
      setShowHideDialog(false);
      setHideReason("");
      loadReport();
    }
  }, [report, hideReason, handleMarkActionTaken, loadReport]);

  const handleUnhideListing = useCallback(async () => {
    if (!report) return;

    const result = await unhideListing({
      listing_id: report.listing_id,
    });

    if (result.success) {
      loadReport();
    }
  }, [report, loadReport]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <Spinner />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>Report not found</div>
      </div>
    );
  }

  const isHidden = report.listing_visibility_status === "hidden";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          type="button"
          onClick={() => router.push("/admin/reports")}
          className={styles.backButton}
        >
          ← Back to reports
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.section}>
          <h1 className={styles.title}>Report Details</h1>

          <div className={styles.field}>
            <label className={styles.label}>Listing</label>
            <div>
              <Link
                href={`/marketplace/${report.listing_id}`}
                className={styles.listingLink}
              >
                {report.listing_title}
              </Link>
              {isHidden && <span className={styles.hiddenBadge}>Hidden</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Reporter</label>
            <div>{report.reporter_email}</div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Report Details</label>
            <div className={styles.reportDetails}>{report.details}</div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Status</label>
            <div>
              <span
                className={`${styles.statusBadge} ${styles[report.status]}`}
              >
                {report.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Reported</label>
            <div>{new Date(report.created_at).toLocaleString()}</div>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Admin Actions</h2>

          <div className={styles.field}>
            <label htmlFor="adminNotes" className={styles.label}>
              Admin Notes
            </label>
            <Textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this report"
              rows={4}
            />
          </div>

          <div className={styles.actions}>
            <Button
              onClick={handleMarkReviewed}
              variant="secondary"
              disabled={report.status === "reviewed"}
            >
              Mark as Reviewed
            </Button>

            <Button
              onClick={handleMarkActionTaken}
              variant="secondary"
              disabled={report.status === "action_taken"}
            >
              Mark as Action Taken
            </Button>

            {!isHidden ? (
              <Button
                onClick={() => setShowHideDialog(true)}
                variant="destructive"
              >
                Hide Listing
              </Button>
            ) : (
              <Button onClick={() => setShowUnhideDialog(true)}>
                Unhide Listing
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showHideDialog}
        onClose={() => {
          setShowHideDialog(false);
          setHideReason("");
        }}
        onConfirm={handleHideListing}
        title="Hide Listing"
        message="Please provide a reason for hiding this listing:"
        confirmLabel="Hide Listing"
        variant="destructive"
      >
        <div className={styles.field}>
          <label htmlFor="hideReason" className={styles.label}>
            Reason for hiding
          </label>
          <Textarea
            id="hideReason"
            value={hideReason}
            onChange={(e) => setHideReason(e.target.value)}
            placeholder="Explain why this listing is being hidden"
            rows={3}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        isOpen={showUnhideDialog}
        onClose={() => setShowUnhideDialog(false)}
        onConfirm={handleUnhideListing}
        title="Unhide Listing"
        message="Are you sure you want to make this listing visible again?"
        confirmLabel="Unhide Listing"
      />
    </div>
  );
}
