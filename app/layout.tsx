import type { Metadata, ReactNode } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Campus Ex - Student Marketplace",
  description: "Exclusive marketplace for campus students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
