import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.campus-ex.com";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CampusEx | Campus Exchange Marketplace",
    template: "%s | CampusEx",
  },
  description:
    "CampusEx is the campus exchange marketplace for Augustana College students to buy, sell, and discover campus items safely.",
  keywords: [
    "CampusEx",
    "Campus Exchange",
    "campus ex",
    "camousex",
    "Augustana College marketplace",
    "student marketplace",
    "college marketplace",
    "buy and sell on campus",
    "campus classifieds",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "CampusEx | Campus Exchange Marketplace",
    description:
      "Buy and sell with your campus community on CampusEx, the student marketplace for Augustana College.",
    siteName: "CampusEx",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusEx | Campus Exchange Marketplace",
    description:
      "CampusEx helps Augustana College students buy and sell trusted campus listings.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CampusEx",
  alternateName: "Campus Exchange",
  url: siteUrl,
  description:
    "CampusEx is a campus marketplace for students to buy and sell items within their college community.",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/marketplace?query={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
  publisher: {
    "@type": "Organization",
    name: "CampusEx",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteStructuredData),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const stored = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const theme = stored || (prefersDark ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} ${inter.variable}`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
