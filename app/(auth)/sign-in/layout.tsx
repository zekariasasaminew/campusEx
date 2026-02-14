import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to CampusEx with your Augustana College email.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignInLayout({ children }: { children: ReactNode }) {
  return children;
}
