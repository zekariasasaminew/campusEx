import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Listing Details",
  description:
    "View detailed item information, pricing, and seller details on CampusEx marketplace listings.",
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    title: "CampusEx Listing",
    description:
      "Explore listing details and connect with student sellers on CampusEx.",
    type: "article",
  },
};

export default function ListingLayout({ children }: { children: ReactNode }) {
  return children;
}
