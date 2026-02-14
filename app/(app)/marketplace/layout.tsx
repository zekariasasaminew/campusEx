import type { Metadata } from "next";
import type { ReactNode } from "react";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.campus-ex.com";

export const metadata: Metadata = {
  title: "Marketplace",
  description:
    "Browse CampusEx listings to buy and sell textbooks, dorm essentials, electronics, and more at Augustana College.",
  keywords: [
    "CampusEx marketplace",
    "Campus Exchange marketplace",
    "Augustana College buy sell",
    "student marketplace listings",
    "campus classifieds",
  ],
  alternates: {
    canonical: "/marketplace",
  },
  openGraph: {
    title: "CampusEx Marketplace",
    description:
      "Find trusted student listings on CampusEx, the campus exchange marketplace for Augustana College.",
    url: `${siteUrl}/marketplace`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusEx Marketplace",
    description:
      "Shop and post student listings on CampusEx, Augustana College's campus exchange.",
  },
};

export default function MarketplaceLayout({ children }: { children: ReactNode }) {
  return children;
}
