import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { checkIsAdmin } from "@/lib/admin/queries";
import { getAdminReports } from "@/lib/admin/actions";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata = {
  title: "Admin Reports - CampusEx",
  description: "Manage listing reports",
};

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const isAdmin = await checkIsAdmin(user.id);
  if (!isAdmin) {
    redirect("/marketplace");
  }

  const result = await getAdminReports();

  if (!result.success) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Reports</h1>
        </div>
        <div className={styles.error}>Failed to load reports</div>
      </div>
    );
  }

  const reports = result.data;
  const openReports = reports.filter((r) => r.status === "open");
  const reviewedReports = reports.filter((r) => r.status === "reviewed");
  const actionTakenReports = reports.filter((r) => r.status === "action_taken");

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reports</h1>
        <div className={styles.stats}>
          <span className={styles.stat}>
            <strong>{openReports.length}</strong> Open
          </span>
          <span className={styles.stat}>
            <strong>{reviewedReports.length}</strong> Reviewed
          </span>
          <span className={styles.stat}>
            <strong>{actionTakenReports.length}</strong> Actioned
          </span>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className={styles.empty}>
          <h2 className={styles.emptyTitle}>No reports</h2>
          <p className={styles.emptyMessage}>No listing reports to review</p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div className={styles.colListing}>Listing</div>
            <div className={styles.colReporter}>Reporter</div>
            <div className={styles.colReason}>Reason</div>
            <div className={styles.colStatus}>Status</div>
            <div className={styles.colDate}>Date</div>
            <div className={styles.colActions}>Actions</div>
          </div>

          {reports.map((report) => (
            <Link
              key={report.id}
              href={`/admin/reports/${report.id}`}
              className={styles.tableRow}
            >
              <div className={styles.colListing}>
                <div className={styles.listingTitle}>
                  {report.listing_title}
                </div>
                <div className={styles.listingMeta}>
                  {report.listing_visibility_status === "hidden" && (
                    <span className={styles.hiddenBadge}>Hidden</span>
                  )}
                  {report.listing_status === "sold" && (
                    <span className={styles.soldBadge}>Sold</span>
                  )}
                </div>
              </div>

              <div className={styles.colReporter}>{report.reporter_email}</div>

              <div className={styles.colReason}>
                {report.details.slice(0, 100)}
                {report.details.length > 100 ? "..." : ""}
              </div>

              <div className={styles.colStatus}>
                <span
                  className={`${styles.statusBadge} ${styles[report.status]}`}
                >
                  {report.status.replace("_", " ")}
                </span>
              </div>

              <div className={styles.colDate}>
                {new Date(report.created_at).toLocaleDateString()}
              </div>

              <div className={styles.colActions}>
                <span className={styles.viewLink}>View</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
